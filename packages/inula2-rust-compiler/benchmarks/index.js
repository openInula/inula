#!/usr/bin/env node

const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

// 配置参数
const CONFIG = {
  WARMUP_RUNS: 3,
  MEASUREMENT_RUNS: 5,
  BENCHMARK_TYPES: [
    { name: 'create rows', cpuSlowdown: 1, warmupRuns: 3 },
    { name: 'replace all rows', cpuSlowdown: 1, warmupRuns: 3 },
    { name: 'partial update', cpuSlowdown: 1, warmupRuns: 3 },
    { name: 'select row', cpuSlowdown: 1, warmupRuns: 3 },
    { name: 'swap rows', cpuSlowdown: 1, warmupRuns: 3 },
    { name: 'remove row', cpuSlowdown: 1, warmupRuns: 3 },
    { name: 'create many rows', cpuSlowdown: 1, warmupRuns: 3 },
    { name: 'append rows to large table', cpuSlowdown: 1, warmupRuns: 3 },
    { name: 'clear rows', cpuSlowdown: 1, warmupRuns: 3 }
  ],
  ROW_COUNTS: { small: 1000, large: 10000 }
};

// 临时文件目录
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// 引入 WASM 包（需先执行 npm run build:wasm）
const WASM_PKG_DIR = path.join(__dirname, '..', 'src', 'wasm', 'pkg');
let InulaCompiler;
let compiler;
try {
  // wasm-pack --target nodejs 产物包含 node 入口
  // eslint-disable-next-line import/no-dynamic-require
  ({ InulaCompiler } = require(WASM_PKG_DIR));
  compiler = new InulaCompiler();
} catch (e) {
  console.error('请先构建 WASM 包: npm run build:wasm');
  process.exit(1);
}

function compileWithRust(jsx) {
  const result = compiler.compile_jsx(jsx);
  const text = result.toString();
  try {
    const parsed = JSON.parse(text);
    return parsed.code || text;
  } catch (_) {
    return text;
  }
}

function runTsBaseline(code) {
  const cmd = process.env.TS_BASELINE_CMD;
  if (!cmd) {
    return { ok: false, reason: 'TS baseline not configured (set TS_BASELINE_CMD)' };
  }
  const extra = (process.env.TS_BASELINE_OPTS || '').split(' ').filter(Boolean);
  const parts = cmd.split(' ').filter(Boolean);
  const bin = parts[0];
  const args = [...parts.slice(1), ...extra];
  const res = spawnSync(bin, args, { input: code, encoding: 'utf-8', shell: true });
  if (res.status !== 0) {
    return { ok: false, reason: res.stderr || 'baseline process failed' };
  }
  return { ok: true, output: res.stdout };
}

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

// 生成各场景 JSX（保持原逻辑，省略为简洁）
function generateCreateRowsComponent(rowCount) {
  let items = '';
  for (let i = 0; i < rowCount; i++) {
    const item = `{ id: ${i}, label: 'Item ${i}', value: ${Math.random()} }`;
    items += i === 0 ? item : `, ${item}`;
  }
  return `import { useState } from 'inula';\nfunction CreateRowsComponent() {\n  const [items] = useState([${items}]);\n  return (<table><tbody>{items.map(item => (<tr key={item.id}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td></tr>))}</tbody></table>);\n}`;
}
function generateReplaceAllRowsComponent(rowCount){return `import { useState } from 'inula';\nfunction ReplaceAllRowsComponent(){const [items,setItems]=useState(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Item '+i,value:Math.random()})));const [counter,setCounter]=useState(0);const replaceAllRows=()=>{setCounter(c=>c+1);setItems(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Updated Item '+i+' (counter: '+(counter+1)+')',value:Math.random()})))};return (<div><button onClick={replaceAllRows}>替换所有行</button><table><tbody>{items.map(item=>(<tr key={item.id}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td></tr>))}</tbody></table></div>);}`}
function generatePartialUpdateComponent(rowCount){return `import { useState } from 'inula';\nfunction PartialUpdateComponent(){const [items,setItems]=useState(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Item '+i,value:Math.random()})));const updateEveryTenthRow=()=>{setItems(items.map(item=>{if(item.id%10===0){return {...item,value:Math.random()}}return item}))};return (<div><button onClick={updateEveryTenthRow}>部分更新</button><table><tbody>{items.map(item=>(<tr key={item.id}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td></tr>))}</tbody></table></div>);}`}
function generateSelectRowComponent(rowCount){return `import { useState } from 'inula';\nfunction SelectRowComponent(){const [items]=useState(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Item '+i,value:Math.random()})));const [selectedId,setSelectedId]=useState(null);return (<table><tbody>{items.map(item=>(<tr key={item.id} className={selectedId===item.id?'selected':''}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td><td><button onClick={()=>setSelectedId(item.id)}>选择</button></td></tr>))}</tbody></table>);}`}
function generateSwapRowsComponent(rowCount){return `import { useState } from 'inula';\nfunction SwapRowsComponent(){const [items,setItems]=useState(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Item '+i,value:Math.random()})));const swapRows=()=>{if(items.length<2)return;const newItems=[...items];[newItems[0],newItems[1]]=[newItems[1],newItems[0]];setItems(newItems)};return (<div><button onClick={swapRows}>交换前两行</button><table><tbody>{items.map((item,index)=>(<tr key={index}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td></tr>))}</tbody></table></div>);}`}
function generateRemoveRowComponent(rowCount){return `import { useState } from 'inula';\nfunction RemoveRowComponent(){const [items,setItems]=useState(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Item '+i,value:Math.random()})));const removeFirstRow=()=>{if(items.length>0){setItems(items.slice(1))}};return (<div><button onClick={removeFirstRow}>删除第一行</button><table><tbody>{items.map((item,index)=>(<tr key={index}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td></tr>))}</tbody></table></div>);}`}
function generateCreateManyRowsComponent(rowCount){return `import { useState } from 'inula';\nfunction CreateManyRowsComponent(){const [items,setItems]=useState([]);const [showItems,setShowItems]=useState(false);const createRows=()=>{setItems(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Item '+i,value:Math.random()})));setShowItems(true)};return (<div><button onClick={createRows}>创建 ${rowCount} 行</button>{showItems&&(<table><tbody>{items.map(item=>(<tr key={item.id}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td></tr>))}</tbody></table>)}</div>);}`}
function generateAppendRowsComponent(rowCount){const half=Math.ceil(rowCount/2);return `import { useState } from 'inula';\nfunction AppendRowsComponent(){const [items,setItems]=useState(Array.from({ length: ${Math.floor(rowCount/2)} },(_,i)=>({id:i,label:'Initial Item '+i,value:Math.random()})));const [nextId,setNextId]=useState(${Math.floor(rowCount/2)});const appendRows=()=>{const newItems=Array.from({ length: ${half} },(_,i)=>({id:nextId+i,label:'Appended Item '+(nextId+i),value:Math.random()}));setItems([...items,...newItems]);setNextId(nextId+${half})};return (<div><button onClick={appendRows}>追加 ${half} 行</button><table><tbody>{items.map(item=>(<tr key={item.id}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td></tr>))}</tbody></table></div>);}`}
function generateClearRowsComponent(rowCount){return `import { useState } from 'inula';\nfunction ClearRowsComponent(){const [items,setItems]=useState(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Item '+i,value:Math.random()})));const clearRows=()=>{setItems([])};const reset=()=>{setItems(Array.from({ length: ${rowCount} },(_,i)=>({id:i,label:'Item '+i,value:Math.random()})))};return (<div><button onClick={clearRows}>清除所有行</button><button onClick={reset}>重置</button><table><tbody>{items.map(item=>(<tr key={item.id}><td>{item.id}</td><td>{item.label}</td><td>{item.value}</td></tr>))}</tbody></table></div>);}`}

function runCompiler(code){
  const startMemory = process.memoryUsage().rss;
  const startTime = Date.now();
  // 使用 WASM 编译：InulaCompiler.compile_jsx -> 解析 JSON 获取 code
  const output = compileWithRust(code);
  const endTime = Date.now();
  const endMemory = process.memoryUsage().rss;
  return { duration: endTime - startTime, memoryUsed: (endMemory - startMemory) / (1024*1024), output };
}

function diffWithTsBaseline(jsx) {
  const baseline = runTsBaseline(jsx);
  if (!baseline.ok) {
    return { available: false, reason: baseline.reason };
  }
  const rustOut = compileWithRust(jsx);
  const tsOut = baseline.output;
  const norm = s => s.replace(/\s+/g, ' ').trim();
  const same = norm(rustOut) === norm(tsOut);
  return { available: true, same, rustOut, tsOut };
}

function calculateStatistics(measurements){
  if(measurements.length===0){return {mean:0,median:0,confidence95:0,min:0,max:0}};
  const sorted=[...measurements].sort((a,b)=>a-b);
  const sum=sorted.reduce((acc,v)=>acc+v,0);
  const mean=sum/sorted.length;
  const median=sorted.length%2===0?(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2:sorted[Math.floor(sorted.length/2)];
  const variance=sorted.reduce((acc,v)=>acc+Math.pow(v-mean,2),0)/sorted.length;
  const stdDev=Math.sqrt(variance);
  const confidence95=sorted.length>1?(1.96*stdDev)/Math.sqrt(sorted.length):0;
  return {mean,median,confidence95,min:sorted[0],max:sorted[sorted.length-1]};
}

async function runBenchmark(benchmarkType,rowCount){
  console.log(`Running benchmark: ${benchmarkType} (${rowCount} rows)`);
  const componentCode = generateTestComponent(benchmarkType,rowCount);
  // 一致性（可选）：若配置了 TS 基线则做一次 diff
  const diff = diffWithTsBaseline(componentCode);
  if (diff.available) {
    console.log(`[consistency] TS baseline ${diff.same ? 'MATCH' : 'DIFF'}`);
    if (!diff.same && process.env.SAVE_DIFF === '1') {
      const outDir = path.join(TEMP_DIR, 'diffs');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, `${benchmarkType.replace(/\s+/g,'_')}_rust.js`), diff.rustOut);
      fs.writeFileSync(path.join(outDir, `${benchmarkType.replace(/\s+/g,'_')}_ts.js`), diff.tsOut);
      console.log(`[consistency] 已保存 diff 输出到 ${outDir}`);
    }
  } else {
    console.log(`[consistency] skip TS baseline: ${diff.reason}`);
  }
  const warmup = CONFIG.BENCHMARK_TYPES.find(b=>b.name===benchmarkType)?.warmupRuns||CONFIG.WARMUP_RUNS;
  console.log(`Warming up ${warmup} times...`);
  for(let i=0;i<warmup;i++){ try{ runCompiler(componentCode); } catch(e){ console.error(`Warmup run ${i+1} failed:`, e.message); } }
  const measurements=[];
  console.log(`Measuring ${CONFIG.MEASUREMENT_RUNS} times...`);
  for(let i=0;i<CONFIG.MEASUREMENT_RUNS;i++){
    try{
      const result=runCompiler(componentCode);
      measurements.push({duration:result.duration,memoryUsed:result.memoryUsed});
      console.log(`Run ${i+1}: ${result.duration}ms, ${result.memoryUsed.toFixed(2)}MB`);
    }catch(e){ console.error(`Measurement run ${i+1} failed:`, e.message); }
  }
  if(measurements.length===0){ throw new Error(`No successful measurements for ${benchmarkType}`); }
  return { type:benchmarkType,rowCount, duration:calculateStatistics(measurements.map(m=>m.duration)), memory:calculateStatistics(measurements.map(m=>m.memoryUsed)) };
}

async function runAllBenchmarks(){
  console.log('=== 开始基准测试 ===');
  console.log(`测试配置: ${CONFIG.MEASUREMENT_RUNS}次测量, ${CONFIG.WARMUP_RUNS}次预热`);
  const allResults=[];
  console.log('\n=== 测试小型数据集 (1000行) ===');
  for(const b of CONFIG.BENCHMARK_TYPES){ try{ allResults.push(await runBenchmark(b.name, CONFIG.ROW_COUNTS.small)); } catch(e){ console.error(`测试 ${b.name} 失败:`, e.message); } }
  console.log('\n=== 测试大型数据集 (10000行) ===');
  for(const b of CONFIG.BENCHMARK_TYPES){ try{ allResults.push(await runBenchmark(b.name, CONFIG.ROW_COUNTS.large)); } catch(e){ console.error(`测试 ${b.name} 失败:`, e.message); } }
  generateReport(allResults);
  console.log('\n=== 基准测试完成 ===');
}

function generateReport(results){
  console.log('\n=== 基准测试结果摘要 ===');
  results.forEach(r=>{
    console.log(`\n测试场景: ${r.type} (${r.rowCount}行)`);
    console.log(`  平均耗时: ${r.duration.mean.toFixed(2)}ms`);
    console.log(`  95%置信区间: ±${r.duration.confidence95.toFixed(2)}ms`);
    console.log(`  最小耗时: ${r.duration.min.toFixed(2)}ms`);
    console.log(`  最大耗时: ${r.duration.max.toFixed(2)}ms`);
    console.log(`  平均内存: ${r.memory.mean.toFixed(2)}MB`);
  });
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Inula编译器基准测试报告</title></head><body><h1>Inula编译器基准测试报告</h1><pre>${JSON.stringify(results,null,2)}</pre></body></html>`;
  fs.writeFileSync(path.join(__dirname, 'report.html'), html);
  console.log('HTML报告已保存到 benchmark/report.html');
}

module.exports = { generateTestComponent, runCompiler, runBenchmark, runAllBenchmarks };

if (require.main === module) {
  (async () => { try { await runAllBenchmarks(); } catch (err) { console.error('Benchmark failed:', err); process.exit(1); } })();
}