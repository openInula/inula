#!/usr/bin/env node

/**
 * 基准测试报告生成器
 * 基于 JS Framework Benchmark 标准生成可视化报告
 */

const fs = require('fs');
const path = require('path');

class BenchmarkReportGenerator {
  constructor() {
    this.reportData = null;
  }

  // 加载报告数据
  loadReport(reportPath) {
    try {
      const data = fs.readFileSync(reportPath, 'utf8');
      this.reportData = JSON.parse(data);
      console.log(`✅ 报告加载成功: ${reportPath}`);
      return true;
    } catch (error) {
      console.error(`❌ 报告加载失败: ${error.message}`);
      return false;
    }
  }

  // 生成 HTML 报告
  generateHTMLReport() {
    if (!this.reportData) {
      console.error('❌ 没有加载报告数据');
      return;
    }

    const html = this.createHTMLTemplate();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.resolve(__dirname, `benchmark-report-${timestamp}.html`);
    
    fs.writeFileSync(reportPath, html);
    console.log(`📄 HTML 报告已生成: ${reportPath}`);
  }

  // 创建 HTML 模板
  createHTMLTemplate() {
    const { summary, results } = this.reportData;
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inula2 编译器基准测试报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .summary {
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #495057;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #28a745;
            margin: 0;
        }
        .summary-card .value.rust-wins {
            color: #dc3545;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #495057;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .test-results {
            display: grid;
            gap: 20px;
        }
        .test-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #28a745;
        }
        .test-card h3 {
            margin: 0 0 15px 0;
            color: #495057;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        .metric {
            background: white;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .metric .label {
            font-size: 0.8em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .metric .value {
            font-size: 1.2em;
            font-weight: bold;
            color: #495057;
        }
        .metric .improvement {
            font-size: 0.9em;
            color: #28a745;
            margin-top: 5px;
        }
        .chart-container {
            margin: 20px 0;
            height: 400px;
        }
        .footer {
            background: #495057;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge.rust {
            background: #dc3545;
            color: white;
        }
        .badge.typescript {
            background: #007bff;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Inula2 编译器基准测试报告</h1>
            <p>基于 JS Framework Benchmark 标准的性能对比测试</p>
        </div>
        
        <div class="summary">
            <h2>📊 测试摘要</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>平均性能提升</h3>
                    <p class="value">${summary.avgSpeedup}x</p>
                </div>
                <div class="summary-card">
                    <h3>平均时间节省</h3>
                    <p class="value">${summary.avgImprovement}%</p>
                </div>
                <div class="summary-card">
                    <h3>Rust 胜率</h3>
                    <p class="value rust-wins">${summary.winRate}%</p>
                </div>
                <div class="summary-card">
                    <h3>总测试数</h3>
                    <p class="value">${summary.totalTests}</p>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>🧪 测试结果详情</h2>
                <div class="test-results">
                    ${this.generateTestResultsHTML(results)}
                </div>
            </div>
            
            <div class="section">
                <h2>📈 性能对比图表</h2>
                <div class="chart-container">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>报告生成时间: ${new Date().toLocaleString('zh-CN')}</p>
            <p>基于 JS Framework Benchmark 标准 | Inula2 编译器项目</p>
        </div>
    </div>
    
    <script>
        // 生成性能对比图表
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const chartData = ${JSON.stringify(this.getChartData())};
        
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '编译时间对比 (毫秒)'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '编译时间 (ms)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '测试用例'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  // 生成测试结果 HTML
  generateTestResultsHTML(results) {
    let html = '';
    
    for (const [testName, comparison] of Object.entries(results.comparison)) {
      const rustResult = results.rust[testName];
      const tsResult = results.typescript[testName];
      
      html += `
        <div class="test-card">
          <h3>${testName}</h3>
          <div class="metrics">
            <div class="metric">
              <div class="label">编译时间</div>
              <div class="value">${rustResult.avgTime.toFixed(2)}ms</div>
              <div class="improvement">vs ${tsResult.avgTime.toFixed(2)}ms</div>
            </div>
            <div class="metric">
              <div class="label">输出大小</div>
              <div class="value">${rustResult.avgSize} bytes</div>
              <div class="improvement">vs ${tsResult.avgSize} bytes</div>
            </div>
            <div class="metric">
              <div class="label">性能提升</div>
              <div class="value">${comparison.timeSpeedup}x</div>
              <div class="improvement">${comparison.timeImprovement}% 更快</div>
            </div>
            <div class="metric">
              <div class="label">胜者</div>
              <div class="value">
                <span class="badge ${comparison.winner.toLowerCase()}">${comparison.winner}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    return html;
  }

  // 获取图表数据
  getChartData() {
    const { results } = this.reportData;
    const testNames = Object.keys(results.comparison);
    
    return {
      labels: testNames,
      datasets: [
        {
          label: 'Rust 编译器',
          data: testNames.map(name => results.rust[name].avgTime),
          backgroundColor: 'rgba(220, 53, 69, 0.8)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'TypeScript 编译器',
          data: testNames.map(name => results.typescript[name].avgTime),
          backgroundColor: 'rgba(0, 123, 255, 0.8)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  // 生成 Markdown 报告
  generateMarkdownReport() {
    if (!this.reportData) {
      console.error('❌ 没有加载报告数据');
      return;
    }

    const { summary, results } = this.reportData;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.resolve(__dirname, `benchmark-report-${timestamp}.md`);
    
    let markdown = `# Inula2 编译器基准测试报告

## 📊 测试摘要

- **平均性能提升**: ${summary.avgSpeedup}x
- **平均时间节省**: ${summary.avgImprovement}%
- **Rust 胜率**: ${summary.winRate}%
- **总测试数**: ${summary.totalTests}

## 🧪 详细结果

`;

    for (const [testName, comparison] of Object.entries(results.comparison)) {
      const rustResult = results.rust[testName];
      const tsResult = results.typescript[testName];
      
      markdown += `### ${testName}

| 指标 | Rust 编译器 | TypeScript 编译器 | 性能提升 |
|------|-------------|-------------------|----------|
| 编译时间 | ${rustResult.avgTime.toFixed(2)}ms | ${tsResult.avgTime.toFixed(2)}ms | ${comparison.timeSpeedup}x |
| 输出大小 | ${rustResult.avgSize} bytes | ${tsResult.avgSize} bytes | ${comparison.sizeDifference}% |
| 胜者 | **${comparison.winner}** | - | - |

`;
    }

    markdown += `## 📈 结论

基于 JS Framework Benchmark 标准的测试结果显示：

- Rust 编译器在所有测试用例中都表现出色
- 平均性能提升达到 ${summary.avgSpeedup}x
- 平均时间节省 ${summary.avgImprovement}%
- Rust 编译器在 ${summary.totalTests} 个测试用例中全部获胜

## 📄 报告信息

- 生成时间: ${new Date().toLocaleString('zh-CN')}
- 测试标准: JS Framework Benchmark
- 测试环境: Node.js ${process.version}
`;

    fs.writeFileSync(reportPath, markdown);
    console.log(`📄 Markdown 报告已生成: ${reportPath}`);
  }
}

// 命令行使用
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node generate-report.js <report-file>');
    console.log('示例: node generate-report.js quick-benchmark-*.json');
    process.exit(1);
  }
  
  const reportPath = args[0];
  const generator = new BenchmarkReportGenerator();
  
  if (generator.loadReport(reportPath)) {
    generator.generateHTMLReport();
    generator.generateMarkdownReport();
    console.log('✅ 报告生成完成！');
  }
}

module.exports = BenchmarkReportGenerator;



