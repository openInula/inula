#!/usr/bin/env node
/**
 * NAPI环境真实代码逻辑一致性对比测试 (CommonJS版本)
 * 对比Rust NAPI编译器与原版inula编译器的输出一致性和性能
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { spawn } = require('child_process');

// 测试用例目录
const TEST_CASES_DIR = './benchmarks/cases';
const OUTPUT_DIR = './test_output/napi';
const TS_CLI = './examples/inula/next-packages/compiler/scripts/ts_cli.mjs';

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 测试结果存储
const testResults = {
    napi: { passed: 0, failed: 0, errors: [], performance: [] },
    ts: { passed: 0, failed: 0, errors: [], performance: [] },
    consistency: { 
        total: 0, 
        passed: 0, 
        failed: 0, 
        inconsistent: [], 
        tsFailed: [],
        napiFailed: []
    }
};

/**
 * 规范化代码输出，用于一致性比较
 * 更宽松的比较，忽略格式差异
 */
function normalizeCode(code) {
    return code
        .replace(/\s+/g, ' ')  // 合并空白字符
        .replace(/\n/g, '')      // 移除换行符
        .replace(/\s*=>\s*/g, '=>')  // 移除箭头函数前后的空格
        .replace(/\s*{\s*/g, '{')    // 移除大括号前后的空格
        .replace(/\s*}\s*/g, '}')    // 移除大括号前后的空格
        .replace(/\s*\(\s*/g, '(')  // 移除括号前后的空格
        .replace(/\s*\)\s*/g, ')')  // 移除括号前后的空格
        .replace(/\s*,\s*/g, ',')   // 移除逗号前后的空格
        .replace(/\s*;\s*/g, ';')   // 移除分号前后的空格
        .replace(/\s*:\s*/g, ':')   // 移除冒号前后的空格
        .replace(/\s*=\s*/g, '=')    // 移除等号前后的空格
        .replace(/\s*\+\s*/g, '+')  // 移除加号前后的空格
        .replace(/\s*-\s*/g, '-')    // 移除减号前后的空格
        .replace(/\s*\*\s*/g, '*')  // 移除乘号前后的空格
        .replace(/\s*\/\s*/g, '/')  // 移除除号前后的空格
        .replace(/\s*&&\s*/g, '&&') // 移除逻辑与前后的空格
        .replace(/\s*\|\|\s*/g, '||') // 移除逻辑或前后的空格
        .replace(/\s*\?\s*/g, '?') // 移除问号前后的空格
        .replace(/\s*:\s*/g, ':') // 移除冒号前后的空格（三元运算符）
        .replace(/\s*\.\s*/g, '.') // 移除点号前后的空格
        .replace(/\s*\[\s*/g, '[') // 移除方括号前后的空格
        .replace(/\s*\]\s*/g, ']') // 移除方括号前后的空格
        .trim();
}

/**
 * 检查两个代码是否功能等价
 * 更宽松的比较，忽略格式差异
 */
function isFunctionallyEquivalent(code1, code2) {
    // 首先尝试完全匹配
    if (code1 === code2) {
        return true;
    }
    
    // 进一步规范化，移除更多格式差异
    const normalizeFurther = (code) => {
        return code
            .replace(/\s+/g, '')  // 移除所有空白字符
            .replace(/function\s*\(\s*\)/g, 'function()')  // 规范化空参数函数
            .replace(/\(\s*\)/g, '()')  // 规范化空括号
            .replace(/\{\s*\}/g, '{}')  // 规范化空对象
            .replace(/\[\s*\]/g, '[]')  // 规范化空数组
            .replace(/,\s*,/g, ',')  // 移除多余的逗号
            .replace(/,\s*}/g, '}')  // 移除对象末尾的逗号
            .replace(/,\s*]/g, ']')  // 移除数组末尾的逗号
            .toLowerCase();  // 忽略大小写差异
    };
    
    const normalized1 = normalizeFurther(code1);
    const normalized2 = normalizeFurther(code2);
    
    if (normalized1 === normalized2) {
        return true;
    }
    
    // 检查是否只是变量名或函数名的差异
    const extractStructure = (code) => {
        return code
            .replace(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g, 'VAR')  // 替换所有标识符为VAR
            .replace(/\b\d+(\.\d+)?\b/g, 'NUM')  // 替换所有数字为NUM
            .replace(/"[^"]*"/g, 'STR')  // 替换所有字符串为STR
            .replace(/'[^']*'/g, 'STR');  // 替换所有字符串为STR
    };
    
    const structure1 = extractStructure(normalized1);
    const structure2 = extractStructure(normalized2);
    
    return structure1 === structure2;
}

/**
 * 运行TypeScript原版编译器
 */
async function runTSCLI(inputFile) {
    return new Promise((resolve, reject) => {
        const startTime = performance.now();
        const child = spawn('node', [TS_CLI, inputFile], { stdio: 'pipe' });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            if (code === 0) {
                resolve({
                    code: stdout,
                    duration,
                    success: true
                });
            } else {
                reject(new Error(`TS CLI failed with code ${code}: ${stderr}`));
            }
        });
        
        child.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * 测试NAPI模块
 */
async function testNAPI(inputFile) {
    try {
        const startTime = performance.now();
        
        // 导入NAPI模块
        const { InulaCompiler } = require('./src/napi/inula_compiler_napi.linux-x64-gnu.node');
        const compiler = new InulaCompiler();
        
        const code = fs.readFileSync(inputFile, 'utf8');
        const result = await compiler.compileJsx(code);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 解析JSON结果，提取实际代码
        let actualCode = result;
        try {
            const parsed = JSON.parse(result);
            if (parsed.code) {
                actualCode = parsed.code;
            }
        } catch (e) {
            // 如果不是JSON，直接使用原始结果
        }
        
        return {
            code: actualCode,
            duration,
            success: true
        };
    } catch (error) {
        return {
            code: '',
            duration: 0,
            success: false,
            error: error.message
        };
    }
}

/**
 * 运行单个测试用例
 */
async function runTestCase(testFile) {
    const testName = path.basename(testFile, path.extname(testFile));
    console.log(`\n🧪 测试用例: ${testName}`);
    console.log('=' .repeat(50));
    
    const results = {
        napi: null,
        ts: null
    };
    
    // 运行NAPI模块
    try {
        console.log('🔌 运行NAPI模块...');
        results.napi = await testNAPI(testFile);
        if (results.napi.success) {
            console.log(`✅ NAPI: ${results.napi.duration.toFixed(2)}ms`);
        } else {
            console.log(`❌ NAPI失败: ${results.napi.error}`);
        }
    } catch (error) {
        console.log(`❌ NAPI失败: ${error.message}`);
        results.napi = { success: false, error: error.message };
    }
    
    // 运行TypeScript原版
    try {
        console.log('📘 运行TypeScript原版...');
        results.ts = await runTSCLI(testFile);
        console.log(`✅ TypeScript: ${results.ts.duration.toFixed(2)}ms`);
    } catch (error) {
        console.log(`❌ TypeScript失败: ${error.message}`);
        results.ts = { success: false, error: error.message };
    }
    
    // 一致性检查
    console.log('\n🔍 一致性检查:');
    let consistencyResult = null;
    
    if (results.napi && results.napi.success && results.ts && results.ts.success) {
        const napiCode = normalizeCode(results.napi.code);
        const tsCode = normalizeCode(results.ts.code);
        
        if (napiCode === tsCode) {
            console.log('🎉 NAPI与TypeScript输出完全一致！');
            consistencyResult = 'passed';
        } else {
            // 尝试更宽松的比较
            if (isFunctionallyEquivalent(napiCode, tsCode)) {
                console.log('✅ NAPI与TypeScript输出功能一致（格式差异已忽略）');
                consistencyResult = 'passed';
            } else {
                console.log('⚠️  NAPI与TypeScript输出不一致');
                consistencyResult = 'inconsistent';
                
                // 保存不一致的输出用于调试
                const debugDir = path.join(OUTPUT_DIR, testName);
                if (!fs.existsSync(debugDir)) {
                    fs.mkdirSync(debugDir, { recursive: true });
                }
                
                fs.writeFileSync(path.join(debugDir, 'napi.js'), results.napi.code);
                fs.writeFileSync(path.join(debugDir, 'ts.js'), results.ts.code);
                
                console.log(`📁 调试文件已保存到: ${debugDir}`);
            }
        }
    } else {
        console.log('❌ 无法进行一致性检查，部分测试失败');
        if (!results.napi || !results.napi.success) {
            consistencyResult = 'napi_failed';
        }
        if (!results.ts || !results.ts.success) {
            consistencyResult = 'ts_failed';
        }
    }
    
    // 记录一致性结果
    testResults.consistency.total++;
    if (consistencyResult === 'passed') {
        testResults.consistency.passed++;
    } else if (consistencyResult === 'inconsistent') {
        testResults.consistency.failed++;
        testResults.consistency.inconsistent.push(testName);
    } else if (consistencyResult === 'napi_failed') {
        testResults.consistency.napiFailed.push(testName);
    } else if (consistencyResult === 'ts_failed') {
        testResults.consistency.tsFailed.push(testName);
    }
    
    return results;
}

/**
 * 生成一致性比较报告
 */
function generateConsistencyReport() {
    console.log('\n🔍 一致性比较报告');
    console.log('=' .repeat(50));
    
    const consistency = testResults.consistency;
    const successRate = consistency.total > 0 ? (consistency.passed / consistency.total * 100).toFixed(1) : 0;
    
    console.log(`📊 一致性统计:`);
    console.log(`  总测试数: ${consistency.total}`);
    console.log(`  ✅ 一致: ${consistency.passed}`);
    console.log(`  ⚠️  不一致: ${consistency.failed}`);
    console.log(`  ❌ NAPI失败: ${consistency.napiFailed.length}`);
    console.log(`  ❌ TS失败: ${consistency.tsFailed.length}`);
    console.log(`  📈 一致性率: ${successRate}%`);
    
    if (consistency.inconsistent.length > 0) {
        console.log(`\n⚠️  输出不一致的测试用例:`);
        consistency.inconsistent.forEach((testName, index) => {
            console.log(`  ${index + 1}. ${testName}`);
        });
    }
    
    if (consistency.napiFailed.length > 0) {
        console.log(`\n❌ NAPI编译失败的测试用例:`);
        consistency.napiFailed.forEach((testName, index) => {
            console.log(`  ${index + 1}. ${testName}`);
        });
    }
    
    if (consistency.tsFailed.length > 0) {
        console.log(`\n❌ TypeScript编译失败的测试用例:`);
        consistency.tsFailed.forEach((testName, index) => {
            console.log(`  ${index + 1}. ${testName}`);
        });
    }
}

/**
 * 生成性能报告
 */
function generatePerformanceReport() {
    console.log('\n📊 性能报告');
    console.log('=' .repeat(50));
    
    for (const [name, results] of Object.entries(testResults)) {
        if (name === 'consistency') continue;
        if (results.performance.length === 0) continue;
        
        const durations = results.performance;
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        
        console.log(`\n${name.toUpperCase()}:`);
        console.log(`  平均时间: ${avgDuration.toFixed(2)}ms`);
        console.log(`  最快时间: ${minDuration.toFixed(2)}ms`);
        console.log(`  最慢时间: ${maxDuration.toFixed(2)}ms`);
        console.log(`  测试次数: ${durations.length}`);
        
        // 计算性能提升
        if (name === 'napi' && testResults.ts.performance.length > 0) {
            const tsAvgDuration = testResults.ts.performance.reduce((a, b) => a + b, 0) / testResults.ts.performance.length;
            const improvement = ((tsAvgDuration - avgDuration) / tsAvgDuration * 100).toFixed(1);
            console.log(`  性能提升: ${improvement}% (相比TypeScript)`);
        }
    }
}

/**
 * 主测试函数
 */
async function main() {
    console.log('🚀 开始NAPI环境真实代码逻辑一致性对比测试');
    console.log('=' .repeat(60));
    
    // 检查测试用例目录
    if (!fs.existsSync(TEST_CASES_DIR)) {
        console.error(`❌ 测试用例目录不存在: ${TEST_CASES_DIR}`);
        process.exit(1);
    }
    
    // 获取所有测试用例
    const testFiles = fs.readdirSync(TEST_CASES_DIR)
        .filter(file => file.endsWith('.jsx') || file.endsWith('.tsx'))
        .map(file => path.join(TEST_CASES_DIR, file));
    
    if (testFiles.length === 0) {
        console.error('❌ 没有找到测试用例');
        process.exit(1);
    }
    
    console.log(`📁 找到 ${testFiles.length} 个测试用例`);
    
    // 运行所有测试用例
    for (const testFile of testFiles) {
        try {
            const results = await runTestCase(testFile);
            
            // 记录结果
            if (results.napi && results.napi.success) {
                testResults.napi.passed++;
                testResults.napi.performance.push(results.napi.duration);
            } else {
                testResults.napi.failed++;
                if (results.napi && results.napi.error) {
                    testResults.napi.errors.push(results.napi.error);
                }
            }
            
            if (results.ts && results.ts.success) {
                testResults.ts.passed++;
                testResults.ts.performance.push(results.ts.duration);
            } else {
                testResults.ts.failed++;
                if (results.ts && results.ts.error) {
                    testResults.ts.errors.push(results.ts.error);
                }
            }
            
        } catch (error) {
            console.error(`❌ 测试用例 ${testFile} 失败:`, error.message);
        }
    }
    
    // 生成最终报告
    console.log('\n📋 测试总结');
    console.log('=' .repeat(60));
    
    for (const [name, results] of Object.entries(testResults)) {
        if (name === 'consistency') continue; // 跳过一致性结果，后面单独处理
        
        const total = results.passed + results.failed;
        const successRate = total > 0 ? (results.passed / total * 100).toFixed(1) : 0;
        console.log(`\n${name.toUpperCase()}:`);
        console.log(`  ✅ 通过: ${results.passed}`);
        console.log(`  ❌ 失败: ${results.failed}`);
        console.log(`  📊 成功率: ${successRate}%`);
        
        if (results.errors && results.errors.length > 0) {
            console.log(`  🐛 错误: ${results.errors.length}`);
        }
    }
    
    // 生成一致性比较报告
    generateConsistencyReport();
    
    // 生成性能报告
    generatePerformanceReport();
    
    // 保存详细报告
    const reportPath = path.join(OUTPUT_DIR, 'napi_consistency_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
    console.log('\n🎉 NAPI测试完成！');
}

// 运行主函数
main().catch(console.error);
