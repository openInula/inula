#!/usr/bin/env node

/**
 * 快速基准测试 - 简化版本
 * 基于 JS Framework Benchmark 标准
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class QuickBenchmark {
  constructor() {
    this.testCases = [
      {
        name: 'Simple Component',
        code: `
import inula from 'inula';

function SimpleComponent() {
  return (
    <div className="container">
      <h1>Hello World</h1>
      <p>This is a simple component</p>
    </div>
  );
}

export default SimpleComponent;
        `,
        complexity: 'low'
      },
      {
        name: 'Reactive Component',
        code: `
import inula from 'inula';

function ReactiveComponent() {
  const [count, setCount] = inula.useState(0);
  const [text, setText] = inula.useState('');
  
  const handleClick = () => setCount(count + 1);
  const handleChange = (e) => setText(e.target.value);
  
  return (
    <div className="app">
      <h1>Counter: {count}</h1>
      <button onClick={handleClick}>Increment</button>
      <input 
        type="text" 
        value={text} 
        onChange={handleChange}
        placeholder="Enter text"
      />
      <p>You typed: {text}</p>
    </div>
  );
}

export default ReactiveComponent;
        `,
        complexity: 'medium'
      },
      {
        name: 'Complex Component',
        code: `
import inula from 'inula';

function ComplexComponent() {
  const [items, setItems] = inula.useState([]);
  const [filter, setFilter] = inula.useState('all');
  const [newItem, setNewItem] = inula.useState('');
  
  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), text: newItem, completed: false }]);
      setNewItem('');
    }
  };
  
  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };
  
  const filteredItems = items.filter(item => {
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });
  
  return (
    <div className="todo-app">
      <header>
        <h1>Todo List</h1>
        <div className="input-group">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add new todo..."
          />
          <button onClick={addItem}>Add</button>
        </div>
      </header>
      
      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({items.length})
        </button>
        <button 
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active ({items.filter(i => !i.completed).length})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed ({items.filter(i => i.completed).length})
        </button>
      </div>
      
      <ul className="todo-list">
        {filteredItems.map(item => (
          <li key={item.id} className={item.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ComplexComponent;
        `,
        complexity: 'high'
      }
    ];
  }

  async run() {
    console.log('🚀 快速基准测试开始');
    console.log('='.repeat(50));
    
    // 加载编译器
    await this.loadCompilers();
    
    const results = {
      rust: {},
      typescript: {},
      comparison: {}
    };
    
    for (const testCase of this.testCases) {
      console.log(`\n📊 测试: ${testCase.name} (${testCase.complexity})`);
      console.log('-'.repeat(30));
      
      const rustResult = await this.benchmarkRust(testCase);
      const tsResult = await this.benchmarkTypeScript(testCase);
      
      results.rust[testCase.name] = rustResult;
      results.typescript[testCase.name] = tsResult;
      results.comparison[testCase.name] = this.compareResults(rustResult, tsResult);
      
      this.displayResults(testCase.name, rustResult, tsResult);
    }
    
    this.generateSummary(results);
  }

  async loadCompilers() {
    try {
      // 加载 Rust WASM 编译器
      const wasmPath = path.resolve(__dirname, '../wasm-build/pkg/inula_compiler_wasm.js');
      const wasmModule = await import(wasmPath);
      this.rustCompiler = new wasmModule.InulaCompiler();
      console.log('✅ Rust WASM 编译器加载成功');
      
      // 加载 TypeScript 编译器
      const inulaPresetPath = path.resolve(__dirname, '../inula/next-packages/compiler/babel-inula-next-core/dist/index.js');
      const inulaPreset = await import(inulaPresetPath);
      const babelCore = await import('@babel/core');
      
      this.tsCompiler = {
        preset: inulaPreset.default || inulaPreset,
        babel: babelCore
      };
      console.log('✅ TypeScript 编译器加载成功');
      
    } catch (error) {
      console.error('❌ 编译器加载失败:', error.message);
      process.exit(1);
    }
  }

  async benchmarkRust(testCase) {
    const times = [];
    const sizes = [];
    
    // 运行 5 次测试
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      
      try {
        const result = this.rustCompiler.compile_jsx(testCase.code);
        const output = JSON.parse(result).code || result;
        
        const end = performance.now();
        times.push(end - start);
        sizes.push(output.length);
      } catch (error) {
        console.warn(`⚠️  Rust 编译错误: ${error.message}`);
        times.push(0);
        sizes.push(0);
      }
    }
    
    return {
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
      success: times.filter(t => t > 0).length / times.length
    };
  }

  async benchmarkTypeScript(testCase) {
    const times = [];
    const sizes = [];
    
    // 运行 5 次测试
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      
      try {
        const result = this.tsCompiler.babel.transformSync(testCase.code, {
          babelrc: false,
          configFile: false,
          presets: [[this.tsCompiler.preset, {}]],
          sourceMaps: false,
          filename: 'test.jsx'
        });
        
        const end = performance.now();
        times.push(end - start);
        sizes.push(result.code.length);
      } catch (error) {
        console.warn(`⚠️  TypeScript 编译错误: ${error.message}`);
        times.push(0);
        sizes.push(0);
      }
    }
    
    return {
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
      success: times.filter(t => t > 0).length / times.length
    };
  }

  compareResults(rust, ts) {
    return {
      timeSpeedup: (ts.avgTime / rust.avgTime).toFixed(2),
      timeImprovement: (((ts.avgTime - rust.avgTime) / ts.avgTime) * 100).toFixed(1),
      sizeDifference: (((ts.avgSize - rust.avgSize) / ts.avgSize) * 100).toFixed(1),
      winner: rust.avgTime < ts.avgTime ? 'Rust' : 'TypeScript'
    };
  }

  displayResults(name, rust, ts) {
    const comparison = this.compareResults(rust, ts);
    
    console.log(`⏱️  编译时间:`);
    console.log(`   Rust:      ${rust.avgTime.toFixed(2)}ms (${rust.minTime.toFixed(2)}-${rust.maxTime.toFixed(2)}ms)`);
    console.log(`   TypeScript: ${ts.avgTime.toFixed(2)}ms (${ts.minTime.toFixed(2)}-${ts.maxTime.toFixed(2)}ms)`);
    console.log(`   性能提升:  ${comparison.timeSpeedup}x (${comparison.timeImprovement}%)`);
    
    console.log(`📦 输出大小:`);
    console.log(`   Rust:      ${rust.avgSize.toFixed(0)} bytes`);
    console.log(`   TypeScript: ${ts.avgSize.toFixed(0)} bytes`);
    console.log(`   大小差异:  ${comparison.sizeDifference}%`);
    
    console.log(`✅ 成功率:`);
    console.log(`   Rust:      ${(rust.success * 100).toFixed(1)}%`);
    console.log(`   TypeScript: ${(ts.success * 100).toFixed(1)}%`);
    
    console.log(`🏆 胜者: ${comparison.winner}`);
  }

  generateSummary(results) {
    console.log('\n' + '='.repeat(50));
    console.log('📊 基准测试摘要');
    console.log('='.repeat(50));
    
    let rustWins = 0;
    let totalSpeedup = 0;
    let totalImprovement = 0;
    
    for (const [name, comparison] of Object.entries(results.comparison)) {
      if (comparison.winner === 'Rust') rustWins++;
      totalSpeedup += parseFloat(comparison.timeSpeedup);
      totalImprovement += parseFloat(comparison.timeImprovement);
    }
    
    const avgSpeedup = (totalSpeedup / Object.keys(results.comparison).length).toFixed(2);
    const avgImprovement = (totalImprovement / Object.keys(results.comparison).length).toFixed(1);
    const winRate = ((rustWins / Object.keys(results.comparison).length) * 100).toFixed(1);
    
    console.log(`🏆 总体结果:`);
    console.log(`   平均性能提升: ${avgSpeedup}x`);
    console.log(`   平均时间节省: ${avgImprovement}%`);
    console.log(`   Rust 胜率: ${winRate}%`);
    
    // 保存结果
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.resolve(__dirname, `quick-benchmark-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        avgSpeedup,
        avgImprovement,
        winRate,
        rustWins,
        totalTests: Object.keys(results.comparison).length
      },
      results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  }
}

// 运行快速基准测试
if (require.main === module) {
  const benchmark = new QuickBenchmark();
  benchmark.run().catch(console.error);
}

module.exports = QuickBenchmark;




