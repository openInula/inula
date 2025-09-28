use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use std::time::Duration;
use wasm_bindgen::prelude::*;

// 模拟 WASM 编译器的核心功能
struct MockInulaCompiler {
    cache: std::collections::HashMap<String, String>,
}

impl MockInulaCompiler {
    fn new() -> Self {
        Self {
            cache: std::collections::HashMap::new(),
        }
    }

    fn compile_jsx(&mut self, code: &str) -> String {
        // 模拟编译过程
        let mut result = String::new();
        
        // 解析 JSX
        let parsed = self.parse_jsx(code);
        
        // 生成代码
        result.push_str("import { compBuilder as $$compBuilder, createElement as $$createElement, createTemplateNode as $$createTemplateNode } from \"@openinula/next\";\n");
        result.push_str("const _$t = function () {\n");
        result.push_str("  const $node0 = $$createElement(\"div\");\n");
        
        if code.contains("useState") {
            result.push_str("  // 响应式组件逻辑\n");
            result.push_str("  const $node1 = $$createElement(\"h1\");\n");
            result.push_str("  $node0.appendChild($node1);\n");
        }
        
        result.push_str("  return $node0;\n");
        result.push_str("}();\n");
        result.push_str("import inula from 'inula';\n");
        result.push_str("function JSX_div() {\n");
        result.push_str("  const $$self = $$compBuilder();\n");
        result.push_str("  return $$self.prepare().init($$createTemplateNode(_$t, null));\n");
        result.push_str("}");
        
        result
    }

    fn parse_jsx(&self, code: &str) -> String {
        // 模拟 JSX 解析
        let mut parsed = String::new();
        
        if code.contains("<div") {
            parsed.push_str("div");
        }
        if code.contains("useState") {
            parsed.push_str("+reactive");
        }
        if code.contains("onClick") {
            parsed.push_str("+events");
        }
        
        parsed
    }
}

// 测试用例
const TEST_CASES: &[(&str, &str, &str)] = &[
    ("simple", "Simple Component", r#"
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
    "#),
    ("reactive", "Reactive Component", r#"
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
    "#),
    ("complex", "Complex Component", r#"
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
    "#),
];

// 基准测试函数
fn benchmark_compilation(c: &mut Criterion) {
    let mut group = c.benchmark_group("compilation");
    group.measurement_time(Duration::from_secs(10));
    group.sample_size(100);
    
    for (test_case in TEST_CASES.iter() {
        let (id, name, code) = test_case;
        
        group.bench_with_input(BenchmarkId::new("rust_compiler", name), code, |b, code| {
            b.iter(|| {
                let mut compiler = MockInulaCompiler::new();
                black_box(compiler.compile_jsx(black_box(code)))
            })
        });
    }
    
    group.finish();
}

fn benchmark_parsing(c: &mut Criterion) {
    let mut group = c.benchmark_group("parsing");
    group.measurement_time(Duration::from_secs(5));
    group.sample_size(50);
    
    for (test_case in TEST_CASES.iter() {
        let (id, name, code) = test_case;
        
        group.bench_with_input(BenchmarkId::new("jsx_parsing", name), code, |b, code| {
            b.iter(|| {
                let compiler = MockInulaCompiler::new();
                black_box(compiler.parse_jsx(black_box(code)))
            })
        });
    }
    
    group.finish();
}

fn benchmark_memory_usage(c: &mut Criterion) {
    let mut group = c.benchmark_group("memory_usage");
    group.measurement_time(Duration::from_secs(5));
    group.sample_size(20);
    
    for (test_case in TEST_CASES.iter() {
        let (id, name, code) = test_case;
        
        group.bench_with_input(BenchmarkId::new("memory", name), code, |b, code| {
            b.iter(|| {
                let mut compiler = MockInulaCompiler::new();
                let result = compiler.compile_jsx(black_box(code));
                black_box(result.len())
            })
        });
    }
    
    group.finish();
}

fn benchmark_incremental_compilation(c: &mut Criterion) {
    let mut group = c.benchmark_group("incremental_compilation");
    group.measurement_time(Duration::from_secs(5));
    group.sample_size(30);
    
    // 模拟增量编译：第一次编译，然后修改代码再编译
    for (test_case in TEST_CASES.iter() {
        let (id, name, code) = test_case;
        
        group.bench_with_input(BenchmarkId::new("incremental", name), code, |b, code| {
            b.iter(|| {
                let mut compiler = MockInulaCompiler::new();
                
                // 第一次编译
                let result1 = compiler.compile_jsx(black_box(code));
                
                // 模拟代码修改
                let modified_code = format!("{} // modified", code);
                let result2 = compiler.compile_jsx(black_box(&modified_code));
                
                black_box((result1.len(), result2.len()))
            })
        });
    }
    
    group.finish();
}

// 性能回归测试
fn benchmark_performance_regression(c: &mut Criterion) {
    let mut group = c.benchmark_group("performance_regression");
    group.measurement_time(Duration::from_secs(15));
    group.sample_size(200);
    
    // 测试不同大小的代码
    let code_sizes = vec![100, 500, 1000, 2000, 5000];
    
    for size in code_sizes {
        let large_code = generate_large_code(size);
        
        group.bench_with_input(BenchmarkId::new("large_code", size), &large_code, |b, code| {
            b.iter(|| {
                let mut compiler = MockInulaCompiler::new();
                black_box(compiler.compile_jsx(black_box(code)))
            })
        });
    }
    
    group.finish();
}

// 生成大型测试代码
fn generate_large_code(size: usize) -> String {
    let mut code = String::from("import inula from 'inula';\n\nfunction LargeComponent() {\n");
    
    // 添加状态
    for i in 0..(size / 100) {
        code.push_str(&format!("  const [state{}, setState{}] = inula.useState(0);\n", i, i));
    }
    
    code.push_str("  return (\n    <div className=\"large-component\">\n");
    
    // 添加元素
    for i in 0..(size / 50) {
        code.push_str(&format!("      <div key={}>\n", i));
        code.push_str(&format!("        <h{}>Title {}</h{}>\n", (i % 6) + 1, i, (i % 6) + 1));
        code.push_str(&format!("        <p>Content {}</p>\n", i));
        code.push_str("      </div>\n");
    }
    
    code.push_str("    </div>\n  );\n}\n\nexport default LargeComponent;");
    code
}

// 并发编译测试
fn benchmark_concurrent_compilation(c: &mut Criterion) {
    let mut group = c.benchmark_group("concurrent_compilation");
    group.measurement_time(Duration::from_secs(10));
    group.sample_size(50);
    
    group.bench_function("concurrent_10", |b| {
        b.iter(|| {
            let handles: Vec<_> = (0..10)
                .map(|i| {
                    std::thread::spawn(move || {
                        let mut compiler = MockInulaCompiler::new();
                        let code = format!("<div>Component {}</div>", i);
                        compiler.compile_jsx(&code)
                    })
                })
                .collect();
            
            let results: Vec<_> = handles
                .into_iter()
                .map(|h| h.join().unwrap())
                .collect();
            
            black_box(results)
        })
    });
    
    group.finish();
}

// 配置基准测试组
criterion_group!(
    benches,
    benchmark_compilation,
    benchmark_parsing,
    benchmark_memory_usage,
    benchmark_incremental_compilation,
    benchmark_performance_regression,
    benchmark_concurrent_compilation
);

criterion_main!(benches);



