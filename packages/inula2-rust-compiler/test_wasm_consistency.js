#!/usr/bin/env node
/**
 * WASM环境真实代码逻辑一致性对比测试
 * 对比Rust WASM编译器与原版inula编译器的输出一致性和性能
 */

import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { spawn } from 'node:child_process';

// 测试用例目录
const TEST_CASES_DIR = './benchmarks/cases';
const OUTPUT_DIR = './test_output/wasm';
const TS_CLI = './examples/inula/next-packages/compiler/scripts/ts_cli.mjs';

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 测试结果存储
const testResults = {
    wasm: { passed: 0, failed: 0, errors: [], performance: [] },
    ts: { passed: 0, failed: 0, errors: [], performance: [] }
};

/**
 * 规范化代码输出，用于一致性比较
 */
function normalizeCode(code) {
    return code
        .replace(/\s+/g, ' ')  // 合并空白字符
        .replace(/\n/g, '')      // 移除换行符
        .trim();
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
 * 测试WASM模块
 */
async function testWASM(inputFile) {
    try {
        const startTime = performance.now();
        
        // 动态导入WASM模块
        const { InulaCompiler } = await import('./src/wasm/pkg/inula_compiler_wasm.js');
        const compiler = new InulaCompiler();
        
        const code = fs.readFileSync(inputFile, 'utf8');
        const result = compiler.compile_jsx(code);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        return {
            code: result,
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
        wasm: null,
        ts: null
    };
    
    // 运行WASM模块
    try {
        console.log('🌐 运行WASM模块...');
        results.wasm = await testWASM(testFile);
        if (results.wasm.success) {
            console.log(`✅ WASM: ${results.wasm.duration.toFixed(2)}ms`);
        } else {
            console.log(`❌ WASM失败: ${results.wasm.error}`);
        }
    } catch (error) {
        console.log(`❌ WASM失败: ${error.message}`);
        results.wasm = { success: false, error: error.message };
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
    if (results.wasm && results.wasm.success && results.ts && results.ts.success) {
        const wasmCode = normalizeCode(results.wasm.code);
        const tsCode = normalizeCode(results.ts.code);
        
        if (wasmCode === tsCode) {
            console.log('🎉 WASM与TypeScript输出完全一致！');
        } else {
            console.log('⚠️  WASM与TypeScript输出不一致');
            
            // 保存不一致的输出用于调试
            const debugDir = path.join(OUTPUT_DIR, testName);
            if (!fs.existsSync(debugDir)) {
                fs.mkdirSync(debugDir, { recursive: true });
            }
            
            fs.writeFileSync(path.join(debugDir, 'wasm.js'), results.wasm.code);
            fs.writeFileSync(path.join(debugDir, 'ts.js'), results.ts.code);
            
            console.log(`📁 调试文件已保存到: ${debugDir}`);
        }
    } else {
        console.log('❌ 无法进行一致性检查，部分测试失败');
    }
    
    return results;
}

/**
 * 生成性能报告
 */
function generatePerformanceReport() {
    console.log('\n📊 性能报告');
    console.log('=' .repeat(50));
    
    for (const [name, results] of Object.entries(testResults)) {
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
        if (name === 'wasm' && testResults.ts.performance.length > 0) {
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
    console.log('🚀 开始WASM环境真实代码逻辑一致性对比测试');
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
            if (results.wasm && results.wasm.success) {
                testResults.wasm.passed++;
                testResults.wasm.performance.push(results.wasm.duration);
            } else {
                testResults.wasm.failed++;
                if (results.wasm && results.wasm.error) {
                    testResults.wasm.errors.push(results.wasm.error);
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
        const total = results.passed + results.failed;
        const successRate = total > 0 ? (results.passed / total * 100).toFixed(1) : 0;
        console.log(`\n${name.toUpperCase()}:`);
        console.log(`  ✅ 通过: ${results.passed}`);
        console.log(`  ❌ 失败: ${results.failed}`);
        console.log(`  📊 成功率: ${successRate}%`);
        
        if (results.errors.length > 0) {
            console.log(`  🐛 错误: ${results.errors.length}`);
        }
    }
    
    // 生成性能报告
    generatePerformanceReport();
    
    // 保存详细报告
    const reportPath = path.join(OUTPUT_DIR, 'wasm_consistency_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
    console.log('\n🎉 WASM测试完成！');
}

// 运行主函数
main().catch(console.error);




