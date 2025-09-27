/**
 * Example for analyzing multiple websites in batch
 */

import { 
  MenuAnalysisEngine, 
  createDefaultConfig, 
  createMenuConfig,
  mergeConfigs,
  MenuFunctionality
} from '../src';
import * as fs from 'fs-extra';
import * as path from 'path';

interface AnalysisTarget {
  name: string;
  baseUrl: string;
  menuSelectors?: string[];
  excludePatterns?: string[];
  loginConfig?: any;
  maxDepth?: number;
}

async function batchAnalysis() {
  try {
    console.log('📦 Starting batch menu analysis...');

    // Define multiple sites to analyze
    const targets: AnalysisTarget[] = [
      {
        name: 'main-website',
        baseUrl: 'https://example.com',
        menuSelectors: ['nav a', '.menu a'],
        maxDepth: 2
      },
      {
        name: 'admin-panel',
        baseUrl: 'https://admin.example.com',
        menuSelectors: ['.admin-sidebar a', '.nav a'],
        excludePatterns: ['logout', 'help', 'profile'],
        maxDepth: 3,
        loginConfig: {
          loginUrl: 'https://admin.example.com/login',
          usernameSelector: 'input[name="username"]',
          passwordSelector: 'input[name="password"]',
          submitSelector: 'button[type="submit"]',
          username: process.env.ADMIN_USERNAME || 'admin',
          password: process.env.ADMIN_PASSWORD || 'password'
        }
      },
      {
        name: 'user-portal',
        baseUrl: 'https://portal.example.com',
        menuSelectors: ['.user-nav a', '.sidebar a'],
        maxDepth: 2
      }
    ];

    const allResults: Array<{
      target: string;
      results: MenuFunctionality[];
      stats: any;
    }> = [];

    // Base configuration
    const baseConfig = createDefaultConfig();
    baseConfig.llm.apiKey = process.env.OPENAI_API_KEY || 'your-api-key-here';
    baseConfig.crawler.concurrency = 2;
    baseConfig.crawler.delay = 2000;

    // Analyze each target
    for (const target of targets) {
      console.log(`\n🎯 Analyzing: ${target.name} (${target.baseUrl})`);

      try {
        // Create menu configuration for this target
        const menuConfig = createMenuConfig(target.baseUrl);
        
        if (target.menuSelectors) {
          menuConfig.menuSelectors = target.menuSelectors;
        }
        if (target.excludePatterns) {
          menuConfig.excludePatterns = target.excludePatterns;
        }
        if (target.maxDepth) {
          menuConfig.maxDepth = target.maxDepth;
        }
        if (target.loginConfig) {
          menuConfig.loginConfig = target.loginConfig;
        }

        // Configure output for this target
        const targetConfig = mergeConfigs(baseConfig, {
          output: {
            ...baseConfig.output,
            outputPath: `./examples/results/batch/${target.name}`,
            format: 'json' as const
          },
          crawler: {
            ...baseConfig.crawler,
            ...menuConfig
          }
        });

        // Run analysis
        const engine = new MenuAnalysisEngine(targetConfig);
        const results = await engine.analyze();

        // Calculate statistics
        const stats = calculateStats(results);
        
        allResults.push({
          target: target.name,
          results,
          stats
        });

        console.log(`✅ ${target.name}: ${results.length} menus analyzed`);
        
        // Small delay between targets
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.error(`❌ Failed to analyze ${target.name}:`, error);
        // Continue with next target
      }
    }

    // Generate combined report
    await generateBatchReport(allResults);

    console.log('\n🎉 Batch analysis completed!');
    console.log(`📊 Total sites analyzed: ${allResults.length}`);
    console.log(`📁 Results saved to: ./examples/results/batch/`);

  } catch (error) {
    console.error('❌ Batch analysis failed:', error);
    process.exit(1);
  }
}

function calculateStats(results: MenuFunctionality[]) {
  const stats = {
    totalMenus: results.length,
    averageConfidence: 0,
    functionalityTypes: {} as Record<string, number>,
    businessScopes: {} as Record<string, number>,
    highConfidenceMenus: 0
  };

  if (results.length === 0) return stats;

  // Calculate average confidence
  stats.averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

  // Count high confidence menus (> 0.8)
  stats.highConfidenceMenus = results.filter(r => r.confidence > 0.8).length;

  // Group by functionality types
  results.forEach(result => {
    const type = result.primaryFunction;
    stats.functionalityTypes[type] = (stats.functionalityTypes[type] || 0) + 1;

    const scope = result.businessScope;
    stats.businessScopes[scope] = (stats.businessScopes[scope] || 0) + 1;
  });

  return stats;
}

async function generateBatchReport(allResults: Array<{ target: string; results: MenuFunctionality[]; stats: any }>) {
  const reportPath = './examples/results/batch/batch-report.md';
  await fs.ensureDir(path.dirname(reportPath));

  let report = '# 批量菜单分析报告\n\n';
  report += `生成时间: ${new Date().toLocaleString()}\n\n`;

  // Summary table
  report += '## 概览\n\n';
  report += '| 网站 | 菜单数量 | 平均置信度 | 高置信度菜单 |\n';
  report += '|------|----------|------------|-------------|\n';

  allResults.forEach(({ target, results, stats }) => {
    report += `| ${target} | ${stats.totalMenus} | ${(stats.averageConfidence * 100).toFixed(1)}% | ${stats.highConfidenceMenus} |\n`;
  });

  // Detailed analysis for each site
  report += '\n## 详细分析\n\n';

  allResults.forEach(({ target, results, stats }) => {
    report += `### ${target}\n\n`;
    report += `- **总菜单数**: ${stats.totalMenus}\n`;
    report += `- **平均置信度**: ${(stats.averageConfidence * 100).toFixed(1)}%\n`;
    report += `- **高置信度菜单**: ${stats.highConfidenceMenus}\n\n`;

    // Top functionality types
    const topTypes = Object.entries(stats.functionalityTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    if (topTypes.length > 0) {
      report += '**主要功能类型**:\n';
      topTypes.forEach(([type, count]) => {
        report += `- ${type}: ${count}个\n`;
      });
      report += '\n';
    }

    // Sample high-confidence menus
    const highConfidenceMenus = results
      .filter(r => r.confidence > 0.8)
      .slice(0, 3);

    if (highConfidenceMenus.length > 0) {
      report += '**示例高质量分析**:\n';
      highConfidenceMenus.forEach(menu => {
        report += `- **${menu.menuName}**: ${menu.primaryFunction} (置信度: ${(menu.confidence * 100).toFixed(1)}%)\n`;
      });
      report += '\n';
    }

    report += '---\n\n';
  });

  await fs.writeFile(reportPath, report);
  console.log(`📋 Batch report generated: ${reportPath}`);
}

// Run the example
if (require.main === module) {
  batchAnalysis();
}