'use strict';

const path = require('path');
const fs = require('fs');
const fg = require('fast-glob');
// Minimal concurrency limiter to avoid ESM/CJS interop issues
function createLimit(maxConcurrency) {
  const concurrency = Math.max(1, Number(maxConcurrency) || 1);
  let activeCount = 0;
  const queue = [];
  const next = () => {
    if (activeCount >= concurrency) return;
    const task = queue.shift();
    if (!task) return;
    activeCount += 1;
    Promise.resolve()
      .then(task.fn)
      .then(task.resolve, task.reject)
      .finally(() => {
        activeCount -= 1;
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      if (activeCount < concurrency) next();
    });
}
const diff = require('diff');
const chalk = require('chalk');
const prettier = require('prettier');
const { runJscodeshiftTransforms } = require('../runner/transform-executor');
const { getGitignorePatterns, mergeIgnorePatterns } = require('../utils/gitignore-parser');
const { backupFile, getCacheInfo } = require('../utils/cache-manager');

async function scanFiles(inputPaths, { recursive, extensions, ignore }) {
  const patterns = [];
  const exts = extensions.map((e) => (e.startsWith('.') ? e.slice(1) : e)).join(',');
  for (const p of inputPaths) {
    const stat = fs.existsSync(p) ? fs.statSync(p) : null;
    if (!stat) continue;
    if (stat.isDirectory()) {
      if (recursive) {
        patterns.push(`${p.replace(/\\/g, '/')}/**/*.{${exts}}`);
      } else {
        patterns.push(`${p.replace(/\\/g, '/')}/*.{${exts}}`);
      }
    } else {
      patterns.push(p.replace(/\\/g, '/'));
    }
  }
  const files = await fg(patterns, { ignore, dot: false, onlyFiles: true, unique: true });
  return files;
}

function computeUnifiedDiff(oldStr, newStr, filePath) {
  return diff.createTwoFilesPatch(filePath, filePath, oldStr, newStr, '', '', {
    context: 3,
  });
}

async function maybeFormat(source, filePath) {
  try {
    const config = await prettier.resolveConfig(filePath).catch(() => null);
    return prettier.format(source, {
      ...(config || {}),
      filepath: filePath,
    });
  } catch {
    return source;
  }
}

async function runTransforms(options) {
  const {
    inputPaths,
    write,
    recursive,
    extensions,
    ignore,
    transform,
    reportPath,
    reportFormat,
    configPath,
    concurrency,
    parser,
    failOnWarn,
    prettier: usePrettier,
    quiet,
    verbose,
  } = options;

  // 合并 gitignore 和用户指定的 ignore 模式
  const projectRoot = process.cwd();
  const gitignorePatterns = getGitignorePatterns(projectRoot);
  const finalIgnorePatterns = mergeIgnorePatterns(gitignorePatterns, ignore);
  
  if (verbose) {
    console.log(chalk.dim(`Gitignore patterns: ${gitignorePatterns.length} patterns`));
    console.log(chalk.dim(`Total ignore patterns: ${finalIgnorePatterns.length} patterns`));
  }

  const files = await scanFiles(inputPaths, { recursive, extensions, ignore: finalIgnorePatterns });
  const limiter = createLimit(concurrency || 1);

  const report = {
    version: '0.1.0',
    runAt: new Date().toISOString(),
    summary: {
      filesProcessed: 0,
      filesChanged: 0,
      errors: 0,
      warnings: 0,
      rules: {},
    },
    files: [],
  };

  const jobs = files.map((filePath) =>
    limiter(async () => {
      const abs = path.resolve(filePath);
      let src = fs.readFileSync(abs, 'utf8');
      let transformed = src;
      let appliedRules = [];
      let warnings = [];
      let errors = [];
      let backupPath = null;
      
      try {
        const execResult = await runJscodeshiftTransforms({
          filePath: abs,
          source: src,
          onlyRules: transform ? transform.split(',').map((s) => s.trim()) : null,
          parser,
          verbose,
        });
        transformed = execResult.source;
        appliedRules = execResult.appliedRules;
        warnings = execResult.warnings || [];
      } catch (e) {
        errors.push({ message: String(e && e.message ? e.message : e) });
      }

      if (usePrettier !== false) {
        transformed = await maybeFormat(transformed, abs);
      }

      const changed = transformed !== src;
      const fileDiff = changed ? computeUnifiedDiff(src, transformed, abs) : '';

      if (write && changed) {
        // 在写入前备份原文件
        backupPath = backupFile(abs, projectRoot);
        if (backupPath && verbose) {
          console.log(chalk.dim(`Backed up: ${abs}`));
        }
        
        try {
          fs.writeFileSync(abs, transformed, 'utf8');
        } catch (writeError) {
          const errorMsg = `Failed to write file: ${writeError.message}`;
          errors.push({ message: errorMsg, code: 'WRITE_ERROR' });
          
          // 如果写入失败且有备份，提供恢复建议
          if (backupPath) {
            errors.push({ 
              message: `Backup available at: ${backupPath}`, 
              code: 'BACKUP_AVAILABLE' 
            });
          }
          
          if (verbose) {
            console.error(chalk.red(`Write error for ${abs}: ${writeError.message}`));
          }
        }
      }

      if (!quiet && changed) {
        const header = chalk.cyan(`\nFile: ${abs}`);
        process.stdout.write(`${header}\n`);
        process.stdout.write(fileDiff + '\n');
      }

      report.summary.filesProcessed += 1;
      if (changed) report.summary.filesChanged += 1;
      report.summary.errors += errors.length;
      report.summary.warnings += warnings.length;
      for (const r of appliedRules) {
        report.summary.rules[r.id] = (report.summary.rules[r.id] || 0) + r.count;
      }
      report.files.push({
        path: abs,
        changed,
        diff: changed ? fileDiff : '',
        appliedRules,
        warnings,
        errors,
        backupPath: backupPath || null,
      });
    })
  );

  await Promise.all(jobs);

  // 显示错误和警告汇总
  if (!quiet && (report.summary.errors > 0 || report.summary.warnings > 0)) {
    console.log(chalk.yellow('\n📊 Summary:'));
    
    if (report.summary.errors > 0) {
      console.log(chalk.red(`  ❌ Errors: ${report.summary.errors}`));
      
      // 显示前几个错误
      const errorFiles = report.files.filter(f => f.errors.length > 0).slice(0, 3);
      for (const file of errorFiles) {
        console.log(chalk.dim(`    • ${path.relative(projectRoot, file.path)}`));
        for (const error of file.errors.slice(0, 2)) {
          console.log(chalk.dim(`      - ${error.message}`));
        }
      }
      
      if (report.files.filter(f => f.errors.length > 0).length > 3) {
        console.log(chalk.dim(`    ... and ${report.files.filter(f => f.errors.length > 0).length - 3} more files with errors`));
      }
    }
    
    if (report.summary.warnings > 0) {
      console.log(chalk.yellow(`  ⚠️  Warnings: ${report.summary.warnings}`));
      
      // 显示前几个警告
      const warnFiles = report.files.filter(f => f.warnings.length > 0).slice(0, 3);
      for (const file of warnFiles) {
        console.log(chalk.dim(`    • ${path.relative(projectRoot, file.path)}`));
        for (const warning of file.warnings.slice(0, 2)) {
          console.log(chalk.dim(`      - ${warning.message}`));
        }
      }
      
      if (report.files.filter(f => f.warnings.length > 0).length > 3) {
        console.log(chalk.dim(`    ... and ${report.files.filter(f => f.warnings.length > 0).length - 3} more files with warnings`));
      }
    }
    
    console.log(chalk.dim('\n💡 Use --verbose for detailed error information'));
    if (reportPath) {
      console.log(chalk.dim(`📄 Full report saved to: ${reportPath}`));
    }
  }

  if (reportPath && reportFormat === 'json') {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  }

  return report;
}

module.exports = { runTransforms };

