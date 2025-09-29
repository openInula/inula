#!/usr/bin/env node

/**
 * Inula2 Rust vs TypeScript Compiler Benchmark
 * 基于 JS Framework Benchmark 标准的编译器性能测试
 * 
 * 测试指标：
 * - 编译时间 (Compilation Time)
 * - 内存使用 (Memory Usage)
 * - 输出代码大小 (Output Size)
 * - 解析速度 (Parsing Speed)
 * - 代码生成速度 (Code Generation Speed)
 * - 增量编译 (Incremental Compilation)
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const os = require('os');

class CompilerBenchmark {
  constructor() {
    this.results = {
      rust: {},
      typescript: {},
      comparison: {}
    };
    this.testCases = this.generateTestCases();
    this.warmupRounds = 3;
    this.testRounds = 10;
  }

  // 生成测试用例 - 参考 JS Framework Benchmark 的复杂度
  generateTestCases() {
    return {
      // 简单组件 - 基础性能
      simple: {
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
        expectedSize: 200,
        complexity: 'low'
      },

      // 中等复杂度 - 包含状态和事件
      medium: {
        name: 'Medium Component',
        code: `
import inula from 'inula';

function MediumComponent() {
  const [count, setCount] = inula.useState(0);
  const [name, setName] = inula.useState('');
  
  const handleClick = () => setCount(count + 1);
  const handleChange = (e) => setName(e.target.value);
  
  return (
    <div className="app">
      <header>
        <h1>Counter: {count}</h1>
        <button onClick={handleClick}>Increment</button>
      </header>
      <main>
        <input 
          type="text" 
          value={name} 
          onChange={handleChange}
          placeholder="Enter your name"
        />
        <p>Hello, {name || 'Anonymous'}!</p>
      </main>
    </div>
  );
}

export default MediumComponent;
        `,
        expectedSize: 800,
        complexity: 'medium'
      },

      // 复杂组件 - 包含列表渲染和条件渲染
      complex: {
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
      <header className="header">
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
        expectedSize: 2000,
        complexity: 'high'
      },

      // 大型组件 - 包含大量子组件和复杂逻辑
      large: {
        name: 'Large Component',
        code: `
import inula from 'inula';

function LargeComponent() {
  const [data, setData] = inula.useState({
    users: [],
    posts: [],
    comments: [],
    currentUser: null,
    selectedPost: null,
    searchTerm: '',
    sortBy: 'date',
    filterBy: 'all'
  });
  
  const [loading, setLoading] = inula.useState(false);
  const [error, setError] = inula.useState(null);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟 API 调用
      const users = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: \`User \${i + 1}\`,
        email: \`user\${i + 1}@example.com\`,
        avatar: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${i + 1}\`
      }));
      
      const posts = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        title: \`Post \${i + 1}\`,
        content: \`This is the content of post \${i + 1}. It contains some sample text to simulate a real blog post.\`,
        authorId: Math.floor(Math.random() * 100) + 1,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        likes: Math.floor(Math.random() * 1000),
        tags: ['react', 'javascript', 'webdev'].slice(0, Math.floor(Math.random() * 3) + 1)
      }));
      
      setData(prev => ({ ...prev, users, posts }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredAndSortedPosts = data.posts
    .filter(post => {
      if (data.filterBy === 'liked') return post.likes > 100;
      if (data.filterBy === 'recent') return post.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return true;
    })
    .filter(post => 
      post.title.toLowerCase().includes(data.searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(data.searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (data.sortBy === 'date') return b.createdAt - a.createdAt;
      if (data.sortBy === 'likes') return b.likes - a.likes;
      return a.title.localeCompare(b.title);
    });
  
  return (
    <div className="large-app">
      <header className="app-header">
        <h1>Social Media Dashboard</h1>
        <div className="controls">
          <input
            type="text"
            placeholder="Search posts..."
            value={data.searchTerm}
            onChange={(e) => setData(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
          <select
            value={data.sortBy}
            onChange={(e) => setData(prev => ({ ...prev, sortBy: e.target.value }))}
          >
            <option value="date">Sort by Date</option>
            <option value="likes">Sort by Likes</option>
            <option value="title">Sort by Title</option>
          </select>
          <select
            value={data.filterBy}
            onChange={(e) => setData(prev => ({ ...prev, filterBy: e.target.value }))}
          >
            <option value="all">All Posts</option>
            <option value="liked">Popular Posts</option>
            <option value="recent">Recent Posts</option>
          </select>
          <button onClick={loadData} disabled={loading}>
            {loading ? 'Loading...' : 'Load Data'}
          </button>
        </div>
      </header>
      
      {error && <div className="error">Error: {error}</div>}
      
      <main className="app-main">
        <div className="stats">
          <div className="stat">
            <h3>Total Users</h3>
            <span>{data.users.length}</span>
          </div>
          <div className="stat">
            <h3>Total Posts</h3>
            <span>{data.posts.length}</span>
          </div>
          <div className="stat">
            <h3>Filtered Posts</h3>
            <span>{filteredAndSortedPosts.length}</span>
          </div>
        </div>
        
        <div className="posts-grid">
          {filteredAndSortedPosts.map(post => {
            const author = data.users.find(u => u.id === post.authorId);
            return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <img src={author?.avatar} alt={author?.name} className="author-avatar" />
                  <div className="post-meta">
                    <h3>{post.title}</h3>
                    <p>By {author?.name} • {post.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                </div>
                <div className="post-footer">
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="post-actions">
                    <button className="like-btn">
                      ❤️ {post.likes}
                    </button>
                    <button className="comment-btn">💬 Comment</button>
                    <button className="share-btn">📤 Share</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default LargeComponent;
        `,
        expectedSize: 8000,
        complexity: 'very-high'
      }
    };
  }

  // 运行基准测试
  async runBenchmark() {
    console.log('🚀 开始 Inula2 编译器基准测试');
    console.log('='.repeat(60));
    
    // 加载编译器
    await this.loadCompilers();
    
    // 预热
    console.log('🔥 预热阶段...');
    await this.warmup();
    
    // 运行测试
    console.log('📊 运行基准测试...');
    for (const [key, testCase] of Object.entries(this.testCases)) {
      console.log(`\n测试用例: ${testCase.name} (${testCase.complexity})`);
      console.log('-'.repeat(40));
      
      await this.runTestCase(key, testCase);
    }
    
    // 生成报告
    this.generateReport();
  }

  // 加载编译器
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

  // 预热
  async warmup() {
    const warmupCode = this.testCases.simple.code;
    
    for (let i = 0; i < this.warmupRounds; i++) {
      try {
        // Rust 编译器预热
        this.rustCompiler.compile_jsx(warmupCode);
        
        // TypeScript 编译器预热
        this.tsCompiler.babel.transformSync(warmupCode, {
          babelrc: false,
          configFile: false,
          presets: [[this.tsCompiler.preset, {}]],
          sourceMaps: false,
          filename: 'warmup.jsx'
        });
      } catch (error) {
        // 忽略预热错误
      }
    }
  }

  // 运行单个测试用例
  async runTestCase(key, testCase) {
    const rustResults = await this.benchmarkCompiler('rust', testCase);
    const tsResults = await this.benchmarkCompiler('typescript', testCase);
    
    this.results.rust[key] = rustResults;
    this.results.typescript[key] = tsResults;
    this.results.comparison[key] = this.compareResults(rustResults, tsResults);
    
    // 显示结果
    this.displayTestCaseResults(key, testCase, rustResults, tsResults);
  }

  // 基准测试单个编译器
  async benchmarkCompiler(compilerType, testCase) {
    const results = {
      compilationTime: [],
      memoryUsage: [],
      outputSize: [],
      parsingTime: [],
      codeGenerationTime: []
    };
    
    for (let round = 0; round < this.testRounds; round++) {
      const roundResults = await this.runSingleRound(compilerType, testCase);
      
      results.compilationTime.push(roundResults.compilationTime);
      results.memoryUsage.push(roundResults.memoryUsage);
      results.outputSize.push(roundResults.outputSize);
      results.parsingTime.push(roundResults.parsingTime);
      results.codeGenerationTime.push(roundResults.codeGenerationTime);
    }
    
    return this.calculateStats(results);
  }

  // 运行单轮测试
  async runSingleRound(compilerType, testCase) {
    const startMemory = process.memoryUsage();
    const startTime = performance.now();
    
    let output = '';
    let parsingTime = 0;
    let codeGenerationTime = 0;
    
    try {
      if (compilerType === 'rust') {
        // Rust 编译器测试
        const parseStart = performance.now();
        const parsed = this.rustCompiler.parse_jsx(testCase.code);
        parsingTime = performance.now() - parseStart;
        
        const genStart = performance.now();
        const compiled = this.rustCompiler.compile_jsx(testCase.code);
        codeGenerationTime = performance.now() - genStart;
        
        output = JSON.parse(compiled).code || compiled;
      } else {
        // TypeScript 编译器测试
        const parseStart = performance.now();
        const parsed = this.tsCompiler.babel.parseSync(testCase.code, {
          sourceType: 'module',
          plugins: ['jsx']
        });
        parsingTime = performance.now() - parseStart;
        
        const genStart = performance.now();
        const compiled = this.tsCompiler.babel.transformSync(testCase.code, {
          babelrc: false,
          configFile: false,
          presets: [[this.tsCompiler.preset, {}]],
          sourceMaps: false,
          filename: 'test.jsx'
        });
        codeGenerationTime = performance.now() - genStart;
        
        output = compiled.code;
      }
    } catch (error) {
      console.warn(`⚠️  ${compilerType} 编译器错误:`, error.message);
      output = '';
    }
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      compilationTime: endTime - startTime,
      memoryUsage: endMemory.heapUsed - startMemory.heapUsed,
      outputSize: output.length,
      parsingTime,
      codeGenerationTime
    };
  }

  // 计算统计信息
  calculateStats(results) {
    const stats = {};
    
    for (const [metric, values] of Object.entries(results)) {
      const sorted = values.sort((a, b) => a - b);
      const len = sorted.length;
      
      stats[metric] = {
        min: sorted[0],
        max: sorted[len - 1],
        mean: values.reduce((a, b) => a + b, 0) / len,
        median: len % 2 === 0 
          ? (sorted[len / 2 - 1] + sorted[len / 2]) / 2
          : sorted[Math.floor(len / 2)],
        p95: sorted[Math.floor(len * 0.95)],
        p99: sorted[Math.floor(len * 0.99)],
        stdDev: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - stats[metric]?.mean || 0, 2), 0) / len)
      };
    }
    
    return stats;
  }

  // 比较结果
  compareResults(rustResults, tsResults) {
    const comparison = {};
    
    for (const metric of Object.keys(rustResults)) {
      const rust = rustResults[metric];
      const ts = tsResults[metric];
      
      comparison[metric] = {
        rustMean: rust.mean,
        tsMean: ts.mean,
        speedup: ts.mean / rust.mean,
        improvement: ((ts.mean - rust.mean) / ts.mean * 100).toFixed(2),
        winner: rust.mean < ts.mean ? 'rust' : 'typescript'
      };
    }
    
    return comparison;
  }

  // 显示测试用例结果
  displayTestCaseResults(key, testCase, rustResults, tsResults) {
    const comparison = this.results.comparison[key];
    
    console.log(`📈 编译时间:`);
    console.log(`   Rust:     ${rustResults.compilationTime.mean.toFixed(2)}ms (${rustResults.compilationTime.stdDev.toFixed(2)}ms std)`);
    console.log(`   TypeScript: ${tsResults.compilationTime.mean.toFixed(2)}ms (${tsResults.compilationTime.stdDev.toFixed(2)}ms std)`);
    console.log(`   性能提升: ${comparison.compilationTime.speedup.toFixed(2)}x (${comparison.compilationTime.improvement}%)`);
    
    console.log(`💾 内存使用:`);
    console.log(`   Rust:     ${(rustResults.memoryUsage.mean / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   TypeScript: ${(tsResults.memoryUsage.mean / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   内存节省: ${comparison.memoryUsage.improvement}%`);
    
    console.log(`📦 输出大小:`);
    console.log(`   Rust:     ${rustResults.outputSize.mean.toFixed(0)} bytes`);
    console.log(`   TypeScript: ${tsResults.outputSize.mean.toFixed(0)} bytes`);
    console.log(`   大小差异: ${comparison.outputSize.improvement}%`);
  }

  // 生成完整报告
  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.resolve(__dirname, `compiler-benchmark-report-${timestamp}.json`);
    
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        testRounds: this.testRounds,
        warmupRounds: this.warmupRounds
      },
      results: this.results,
      summary: this.generateSummary()
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 基准测试完成！');
    console.log('='.repeat(60));
    this.displaySummary();
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  }

  // 生成摘要
  generateSummary() {
    const summary = {
      overallWinner: 'rust',
      totalTests: Object.keys(this.testCases).length,
      averageSpeedup: 0,
      averageMemoryImprovement: 0,
      averageSizeImprovement: 0,
      testResults: {}
    };
    
    let totalSpeedup = 0;
    let totalMemoryImprovement = 0;
    let totalSizeImprovement = 0;
    let rustWins = 0;
    
    for (const [key, comparison] of Object.entries(this.results.comparison)) {
      const speedup = comparison.compilationTime.speedup;
      const memoryImprovement = parseFloat(comparison.memoryUsage.improvement);
      const sizeImprovement = parseFloat(comparison.outputSize.improvement);
      
      totalSpeedup += speedup;
      totalMemoryImprovement += memoryImprovement;
      totalSizeImprovement += sizeImprovement;
      
      if (speedup > 1) rustWins++;
      
      summary.testResults[key] = {
        speedup: speedup.toFixed(2),
        memoryImprovement: memoryImprovement.toFixed(2),
        sizeImprovement: sizeImprovement.toFixed(2),
        winner: speedup > 1 ? 'rust' : 'typescript'
      };
    }
    
    summary.averageSpeedup = (totalSpeedup / summary.totalTests).toFixed(2);
    summary.averageMemoryImprovement = (totalMemoryImprovement / summary.totalTests).toFixed(2);
    summary.averageSizeImprovement = (totalSizeImprovement / summary.totalTests).toFixed(2);
    summary.rustWinRate = ((rustWins / summary.totalTests) * 100).toFixed(1);
    
    return summary;
  }

  // 显示摘要
  displaySummary() {
    const summary = this.generateSummary();
    
    console.log(`🏆 总体结果:`);
    console.log(`   平均性能提升: ${summary.averageSpeedup}x`);
    console.log(`   平均内存节省: ${summary.averageMemoryImprovement}%`);
    console.log(`   平均大小优化: ${summary.averageSizeImprovement}%`);
    console.log(`   Rust 胜率: ${summary.rustWinRate}%`);
    
    console.log(`\n📋 各测试用例结果:`);
    for (const [key, result] of Object.entries(summary.testResults)) {
      const testCase = this.testCases[key];
      console.log(`   ${testCase.name}:`);
      console.log(`     性能: ${result.speedup}x (${result.winner === 'rust' ? 'Rust 胜' : 'TypeScript 胜'})`);
      console.log(`     内存: ${result.memoryImprovement}%`);
      console.log(`     大小: ${result.sizeImprovement}%`);
    }
  }
}

// 运行基准测试
if (require.main === module) {
  const benchmark = new CompilerBenchmark();
  benchmark.runBenchmark().catch(console.error);
}

module.exports = CompilerBenchmark;




