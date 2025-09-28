#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置参数
const CONFIG = {
  WARMUP_RUNS: 5,
  MEASUREMENT_RUNS: 5,
  BENCHMARK_TYPES: [
    { name: 'create rows', cpuSlowdown: 1, warmupRuns: 5 },
    { name: 'replace all rows', cpuSlowdown: 1, warmupRuns: 5 },
    { name: 'partial update', cpuSlowdown: 4, warmupRuns: 3 },
    { name: 'select row', cpuSlowdown: 4, warmupRuns: 5 },
    { name: 'swap rows', cpuSlowdown: 4, warmupRuns: 5 },
    { name: 'remove row', cpuSlowdown: 2, warmupRuns: 5 },
    { name: 'create many rows', cpuSlowdown: 1, warmupRuns: 5 },
    { name: 'append rows to large table', cpuSlowdown: 1, warmupRuns: 5 },
    { name: 'clear rows', cpuSlowdown: 4, warmupRuns: 5 }
  ],
  ROW_COUNTS: {
    small: 1000,
    large: 10000
  }
};

// 创建临时文件目录
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

// 生成不同规模的测试组件代码
function generateTestComponent(benchmarkType, rowCount) {
  switch (benchmarkType) {
    case 'create rows':
      return generateCreateRowsComponent(rowCount);
    case 'replace all rows':
      return generateReplaceAllRowsComponent(rowCount);
    case 'partial update':
      return generatePartialUpdateComponent(rowCount);
    case 'select row':
      return generateSelectRowComponent(rowCount);
    case 'swap rows':
      return generateSwapRowsComponent(rowCount);
    case 'remove row':
      return generateRemoveRowComponent(rowCount);
    case 'create many rows':
      return generateCreateManyRowsComponent(rowCount);
    case 'append rows to large table':
      return generateAppendRowsComponent(rowCount);
    case 'clear rows':
      return generateClearRowsComponent(rowCount);
    default:
      throw new Error(`Unknown benchmark type: ${benchmarkType}`);
  }
}

// 生成创建行组件代码
function generateCreateRowsComponent(rowCount) {
  let items = '';
  for (let i = 0; i < rowCount; i++) {
    const item = `{ id: ${i}, label: 'Item ${i}', value: ${Math.random()} }`;
    items += i === 0 ? item : `, ${item}`;
  }

  return `
import { useState } from 'inula';

function CreateRowsComponent() {
  const [items] = useState([${items}]);
  
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Label</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.label}</td>
            <td>{item.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
`;
}

// 生成替换所有行组件代码
function generateReplaceAllRowsComponent(rowCount) {
  return `
import { useState } from 'inula';

function ReplaceAllRowsComponent() {
  const [items, setItems] = useState(Array.from({ length: ${rowCount} }, (_, i) => ({
    id: i,
    label: 'Item ' + i,
    value: Math.random()
  })));
  const [counter, setCounter] = useState(0);
  
  const replaceAllRows = () => {
    setCounter(c => c + 1);
    setItems(Array.from({ length: ${rowCount} }, (_, i) => ({
      id: i,
      label: 'Updated Item ' + i + ' (counter: ' + (counter + 1) + ')',
      value: Math.random()
    })));
  };
  
  return (
    <div>
      <button onClick={replaceAllRows}>替换所有行</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

// 生成部分更新组件代码
function generatePartialUpdateComponent(rowCount) {
  return `
import { useState } from 'inula';

function PartialUpdateComponent() {
  const [items, setItems] = useState(Array.from({ length: ${rowCount} }, (_, i) => ({
    id: i,
    label: 'Item ' + i,
    value: Math.random()
  })));
  
  const updateEveryTenthRow = () => {
    setItems(items.map(item => {
      if (item.id % 10 === 0) {
        return { ...item, value: Math.random() };
      }
      return item;
    }));
  };
  
  return (
    <div>
      <button onClick={updateEveryTenthRow}>部分更新</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

// 生成选择行组件代码
function generateSelectRowComponent(rowCount) {
  return `
import { useState } from 'inula';

function SelectRowComponent() {
  const [items] = useState(Array.from({ length: ${rowCount} }, (_, i) => ({
    id: i,
    label: 'Item ' + i,
    value: Math.random()
  })));
  const [selectedId, setSelectedId] = useState(null);
  
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Label</th>
          <th>Value</th>
          <th>Select</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id} className={selectedId === item.id ? 'selected' : ''}>
            <td>{item.id}</td>
            <td>{item.label}</td>
            <td>{item.value}</td>
            <td>
              <button onClick={() => setSelectedId(item.id)}>
                选择
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
`;
}

// 生成交换行组件代码
function generateSwapRowsComponent(rowCount) {
  return `
import { useState } from 'inula';

function SwapRowsComponent() {
  const [items, setItems] = useState(Array.from({ length: ${rowCount} }, (_, i) => ({
    id: i,
    label: 'Item ' + i,
    value: Math.random()
  })));
  
  const swapRows = () => {
    if (items.length < 2) return;
    const newItems = [...items];
    [newItems[0], newItems[1]] = [newItems[1], newItems[0]];
    setItems(newItems);
  };
  
  return (
    <div>
      <button onClick={swapRows}>交换前两行</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

// 生成删除行组件代码
function generateRemoveRowComponent(rowCount) {
  return `
import { useState } from 'inula';

function RemoveRowComponent() {
  const [items, setItems] = useState(Array.from({ length: ${rowCount} }, (_, i) => ({
    id: i,
    label: 'Item ' + i,
    value: Math.random()
  })));
  
  const removeFirstRow = () => {
    if (items.length > 0) {
      setItems(items.slice(1));
    }
  };
  
  return (
    <div>
      <button onClick={removeFirstRow}>删除第一行</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

// 生成创建多行组件代码
function generateCreateManyRowsComponent(rowCount) {
  return `
import { useState } from 'inula';

function CreateManyRowsComponent() {
  const [items, setItems] = useState([]);
  const [showItems, setShowItems] = useState(false);
  
  const createRows = () => {
    setItems(Array.from({ length: ${rowCount} }, (_, i) => ({
      id: i,
      label: 'Item ' + i,
      value: Math.random()
    })));
    setShowItems(true);
  };
  
  return (
    <div>
      <button onClick={createRows}>创建 ${rowCount} 行</button>
      {showItems && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Label</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.label}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
`;
}

// 生成追加行到大型表格组件代码
function generateAppendRowsComponent(rowCount) {
  return `
import { useState } from 'inula';

function AppendRowsComponent() {
  const [items, setItems] = useState(Array.from({ length: ${Math.floor(rowCount / 2)} }, (_, i) => ({
    id: i,
    label: 'Initial Item ' + i,
    value: Math.random()
  })));
  const [nextId, setNextId] = useState(${Math.floor(rowCount / 2)});
  
  const appendRows = () => {
    const newItems = Array.from({ length: ${Math.ceil(rowCount / 2)} }, (_, i) => ({
      id: nextId + i,
      label: 'Appended Item ' + (nextId + i),
      value: Math.random()
    }));
    setItems([...items, ...newItems]);
    setNextId(nextId + ${Math.ceil(rowCount / 2)});
  };
  
  return (
    <div>
      <button onClick={appendRows}>追加 ${Math.ceil(rowCount / 2)} 行</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

// 生成清除行组件代码
function generateClearRowsComponent(rowCount) {
  return `
import { useState } from 'inula';

function ClearRowsComponent() {
  const [items, setItems] = useState(Array.from({ length: ${rowCount} }, (_, i) => ({
    id: i,
    label: 'Item ' + i,
    value: Math.random()
  })));
  
  const clearRows = () => {
    setItems([]);
  };
  
  const reset = () => {
    setItems(Array.from({ length: ${rowCount} }, (_, i) => ({
      id: i,
      label: 'Item ' + i,
      value: Math.random()
    })));
  };
  
  return (
    <div>
      <button onClick={clearRows}>清除所有行</button>
      <button onClick={reset}>重置</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

// 执行Rust编译器并测量性能
function runCompiler(code) {
  // 写入临时文件
  const tempFilePath = path.join(TEMP_DIR, `test-component-${Date.now()}.jsx`);
  fs.writeFileSync(tempFilePath, code);
  
  try {
    // 测量内存使用
    const startMemory = process.memoryUsage().rss;
    
    // 测量执行时间
    const startTime = Date.now();
    
    // 执行Rust编译器
    const result = spawnSync('cargo', [
      'run',
      '--release',
      '--bin', 'rust_compiler_runner',
      '--features=node_interface',
      '--',
      'generateJsCompatibleJson'
    ], {
      input: code,
      encoding: 'utf-8'
    });
    
    const endTime = Date.now();
    const endMemory = process.memoryUsage().rss;
    
    // 计算使用的内存
    const memoryUsed = (endMemory - startMemory) / (1024 * 1024); // MB
    const duration = endTime - startTime; // ms
    
    if (result.status !== 0) {
      throw new Error(`Compilation failed: ${result.stderr}`);
    }
    
    return {
      duration,
      memoryUsed,
      output: result.stdout
    };
  } finally {
    // 清理临时文件
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (err) {
      console.warn(`Failed to delete temp file: ${err.message}`);
    }
  }
}

// 计算统计数据
function calculateStatistics(measurements) {
  if (measurements.length === 0) {
    return {
      mean: 0,
      median: 0,
      confidence95: 0,
      min: 0,
      max: 0
    };
  }
  
  // 排序
  const sorted = [...measurements].sort((a, b) => a - b);
  
  // 计算平均值
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / sorted.length;
  
  // 计算中位数
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 
    : sorted[Math.floor(sorted.length / 2)];
  
  // 计算标准差
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);
  
  // 计算95%置信区间 (1.96 * stdDev / sqrt(n))
  const confidence95 = sorted.length > 1 
    ? (1.96 * stdDev) / Math.sqrt(sorted.length) 
    : 0;
  
  return {
    mean,
    median,
    confidence95,
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}

// 运行单个基准测试
async function runBenchmark(benchmarkType, rowCount) {
  console.log(`Running benchmark: ${benchmarkType} (${rowCount} rows)`);
  
  // 生成测试组件
  const componentCode = generateTestComponent(benchmarkType, rowCount);
  
  // 进行预热运行
  const benchmarkConfig = CONFIG.BENCHMARK_TYPES.find(b => b.name === benchmarkType);
  const warmupRuns = benchmarkConfig ? benchmarkConfig.warmupRuns : CONFIG.WARMUP_RUNS;
  
  console.log(`Warming up ${warmupRuns} times...`);
  for (let i = 0; i < warmupRuns; i++) {
    try {
      runCompiler(componentCode);
    } catch (err) {
      console.error(`Warmup run ${i + 1} failed:`, err.message);
    }
  }
  
  // 进行正式测量
  const measurements = [];
  console.log(`Measuring ${CONFIG.MEASUREMENT_RUNS} times...`);
  for (let i = 0; i < CONFIG.MEASUREMENT_RUNS; i++) {
    try {
      const result = runCompiler(componentCode);
      measurements.push({
        duration: result.duration,
        memoryUsed: result.memoryUsed
      });
      console.log(`Run ${i + 1}: ${result.duration}ms, ${result.memoryUsed.toFixed(2)}MB`);
    } catch (err) {
      console.error(`Measurement run ${i + 1} failed:`, err.message);
    }
  }
  
  // 如果没有成功的测量结果，则抛出错误
  if (measurements.length === 0) {
    throw new Error(`No successful measurements for ${benchmarkType}`);
  }
  
  // 计算统计数据
  const durationStats = calculateStatistics(measurements.map(m => m.duration));
  const memoryStats = calculateStatistics(measurements.map(m => m.memoryUsed));
  
  return {
    type: benchmarkType,
    rowCount,
    duration: durationStats,
    memory: memoryStats
  };
}

// 运行所有基准测试
async function runAllBenchmarks() {
  console.log('=== 开始基准测试 ===');
  console.log(`测试配置: ${CONFIG.MEASUREMENT_RUNS}次测量, ${CONFIG.WARMUP_RUNS}次预热`);
  
  const allResults = [];
  
  // 测试小型数据集
  console.log('\n=== 测试小型数据集 (1000行) ===');
  for (const benchmark of CONFIG.BENCHMARK_TYPES) {
    try {
      const result = await runBenchmark(benchmark.name, CONFIG.ROW_COUNTS.small);
      allResults.push(result);
    } catch (err) {
      console.error(`测试 ${benchmark.name} 失败:`, err.message);
    }
  }
  
  // 测试大型数据集
  console.log('\n=== 测试大型数据集 (10000行) ===');
  for (const benchmark of CONFIG.BENCHMARK_TYPES) {
    try {
      const result = await runBenchmark(benchmark.name, CONFIG.ROW_COUNTS.large);
      allResults.push(result);
    } catch (err) {
      console.error(`测试 ${benchmark.name} 失败:`, err.message);
    }
  }
  
  // 生成报告
  generateReport(allResults);
  
  console.log('\n=== 基准测试完成 ===');
}

// 生成报告
function generateReport(results) {
  // 生成文本报告
  console.log('\n=== 基准测试结果摘要 ===');
  results.forEach(result => {
    console.log(`\n测试场景: ${result.type} (${result.rowCount}行)`);
    console.log(`  平均耗时: ${result.duration.mean.toFixed(2)}ms`);
    console.log(`  95%置信区间: ±${result.duration.confidence95.toFixed(2)}ms`);
    console.log(`  最小耗时: ${result.duration.min.toFixed(2)}ms`);
    console.log(`  最大耗时: ${result.duration.max.toFixed(2)}ms`);
    console.log(`  平均内存: ${result.memory.mean.toFixed(2)}MB`);
  });
  
  // 生成HTML报告
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inula编译器基准测试报告</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    .summary {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #3498db;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #e9f5f9;
    }
  </style>
</head>
<body>
  <h1>Inula编译器基准测试报告</h1>
  <div class="summary">
    <p>此报告基于 ${results.length} 项测试场景，每项场景执行 ${CONFIG.MEASUREMENT_RUNS} 次测量。</p>
    <p>测试环境：${process.platform} ${process.arch}</p>
    <p>测试时间：${new Date().toLocaleString()}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>测试场景</th>
        <th>行数</th>
        <th>平均耗时 (ms)</th>
        <th>95%置信区间</th>
        <th>最小耗时 (ms)</th>
        <th>最大耗时 (ms)</th>
        <th>平均内存 (MB)</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(result => `
      <tr>
        <td>${result.type}</td>
        <td>${result.rowCount}</td>
        <td>${result.duration.mean.toFixed(2)}</td>
        <td>±${result.duration.confidence95.toFixed(2)}</td>
        <td>${result.duration.min.toFixed(2)}</td>
        <td>${result.duration.max.toFixed(2)}</td>
        <td>${result.memory.mean.toFixed(2)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;
  
  fs.writeFileSync(
    path.join(__dirname, 'report.html'),
    html
  );
  
  console.log('HTML报告已保存到 benchmark/report.html');
}

// 导出函数以便其他模块使用
module.exports = {
  generateTestComponent,
  runCompiler,
  runBenchmark,
  runAllBenchmarks
};

// 如果直接运行此脚本，则执行所有基准测试
if (require.main === module) {
  (async () => {
    try {
      await runAllBenchmarks();
    } catch (err) {
      console.error('Benchmark failed:', err);
      process.exit(1);
    }
  })();
}