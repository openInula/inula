'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const os = require('os');
const chalk = require('chalk');
const pkg = require('../package.json');
const { runTransforms } = require('./runner/runner');
const { loadConfig } = require('./config/config-loader');

function collectList(value, previous) {
  const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
  return previous ? previous.concat(parts) : parts;
}

async function main(argv) {
  const program = new Command();

  program
    .name('inula-migrate')
    .description('Migrate React 17/18 code to OpenInula 2.0 syntax (codemod-based)')
    .version(pkg.version)
    .argument('<paths...>', 'Files or directories to process')
    .option('-p, --parser <name>', 'Source parser: babel|ts|tsx (default: auto)', 'auto')
    .option('-w, --write', 'Write changes to files (default dry-run)')
    .option('-r, --recursive', 'Recursively process directories', true)
    .option('-e, --extensions <list>', 'Comma-separated extensions', 'js,jsx,ts,tsx')
    .option('-i, --ignore <glob>', 'Ignore glob (can be repeated)', collectList, [])
    .option('-t, --transform <rules>', 'Comma-separated rule ids to run (default: all)')
    .option('--report <path>', 'Write JSON report to file')
    .option('--report-format <fmt>', 'Report format: json|md', 'json')
    .option('--config <file>', 'Config file path (.inularc.*)')
    .option('--concurrency <n>', 'Concurrency (default: CPU cores)', String(os.cpus().length))
    .option('--fail-on-warn', 'Exit with non-zero code when warnings exist')
    .option('--no-prettier', 'Skip formatting with Prettier')
    .option('-q, --quiet', 'Reduce console output')
    .option('-v, --verbose', 'Verbose logging')
    .action(async (paths, options) => {
      const resolvedPaths = paths.map((p) => path.resolve(process.cwd(), p));
      const start = Date.now();
      try {
        // 加载配置文件并合并 CLI 选项
        // 检查用户是否明确指定了某些选项
        const argv = process.argv.join(' ');
        const prettierSpecified = argv.includes('--no-prettier');
        const recursiveSpecified = argv.includes('--recursive') || argv.includes('--no-recursive');
        
        const cliOptions = {
          write: options.write ? Boolean(options.write) : undefined,
          recursive: recursiveSpecified ? options.recursive !== false : undefined,
          extensions: options.extensions ? options.extensions.split(',').map((s) => s.trim()) : undefined,
          ignore: options.ignore || undefined,
          transform: options.transform,
          report: options.report ? path.resolve(process.cwd(), options.report) : undefined,
          reportFormat: options.reportFormat,
          config: options.config,
          concurrency: options.concurrency ? Number(options.concurrency) : undefined,
          parser: options.parser,
          failOnWarn: options.failOnWarn ? Boolean(options.failOnWarn) : undefined,
          prettier: prettierSpecified ? Boolean(options.prettier) : undefined,
          quiet: options.quiet ? Boolean(options.quiet) : undefined,
          verbose: options.verbose ? Boolean(options.verbose) : undefined,
        };
        
        const config = loadConfig(cliOptions, process.cwd());
        
        if (config.verbose) {
          console.log(chalk.dim('Loaded configuration:'));
          console.log(chalk.dim(JSON.stringify(config, null, 2)));
        }
        
        const result = await runTransforms({
          inputPaths: resolvedPaths,
          write: config.write,
          recursive: config.recursive,
          extensions: config.extensions,
          ignore: config.ignore,
          transform: config.transform,
          reportPath: config.report,
          reportFormat: config.reportFormat,
          configPath: config._meta.configPath,
          concurrency: config.concurrency,
          parser: config.parser,
          failOnWarn: config.failOnWarn,
          prettier: config.prettier,
          quiet: config.quiet,
          verbose: config.verbose,
        });

        const elapsed = ((Date.now() - start) / 1000).toFixed(2);
        if (!config.quiet) {
          console.log(
            chalk.green(
              `\nCompleted in ${elapsed}s — processed ${result.summary.filesProcessed} files, changed ${result.summary.filesChanged}.`
            )
          );
        }

        if (config.failOnWarn && result.summary.warnings > 0) {
          process.exitCode = 2;
        } else if (result.summary.errors > 0) {
          process.exitCode = 1;
        } else {
          process.exitCode = 0;
        }
      } catch (err) {
        console.error(chalk.red('\n❌ Migration failed:'), err.message || err);
        
        // 提供回滚指引
        const { getCacheInfo } = require('./utils/cache-manager');
        const cacheInfo = getCacheInfo(process.cwd());
        
        if (cacheInfo.exists && cacheInfo.fileCount > 0) {
          console.log(chalk.yellow('\n🔄 Recovery options:'));
          console.log(chalk.dim('  • Run'), chalk.cyan('inula-rollback'), chalk.dim('to restore original files'));
          console.log(chalk.dim('  • Run'), chalk.cyan('inula-rollback --info'), chalk.dim('to see cached files'));
          console.log(chalk.dim('  • Run'), chalk.cyan('inula-rollback --clear'), chalk.dim('to clear cache without restoring'));
        } else {
          console.log(chalk.yellow('\n💡 Tips:'));
          console.log(chalk.dim('  • Make sure you have a clean git working directory before running migrations'));
          console.log(chalk.dim('  • Consider running without --write first to preview changes'));
        }
        
        if (config.verbose && err.stack) {
          console.log(chalk.dim('\nStack trace:'));
          console.log(chalk.dim(err.stack));
        }
        
        process.exitCode = 1;
      }
    });

  await program.parseAsync(argv);
}

if (require.main === module) {
  main(process.argv);
}

module.exports = { main };

