#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the NAPI compiler
const { compileJsxToJs } = await import('../napi-build/index.js');

// Test cases to run consistency tests on
const testCases = [
    {
        name: "Simple Hello World",
        jsx: '<div>Hello World</div>'
    },
    {
        name: "Simple Expression",
        jsx: '<div>Hello {name}</div>'
    },
    {
        name: "Stateful Component",
        jsx: '<div className="container"><h1>Hello {name}</h1><p>Count: {count}</p></div>'
    },
    {
        name: "Conditional Rendering", 
        jsx: '<div>{isVisible && <span>Visible</span>}</div>'
    },
    {
        name: "Event Handlers",
        jsx: '<button onClick={handleClick}>Click me</button>'
    },
    {
        name: "List Rendering",
        jsx: '<ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>'
    }
];

// Function to call the original TypeScript compiler
async function callOriginalCompiler(jsx) {
    return new Promise((resolve, reject) => {
        // Create a temporary file
        const tempFile = path.join(__dirname, 'temp_test.jsx');
        
        fs.writeFile(tempFile, jsx)
            .then(() => {
                const tsCliPath = path.join(__dirname, '../inula/next-packages/compiler/scripts/ts_cli.mjs');
                const child = spawn('node', [tsCliPath, tempFile], {
                    cwd: path.join(__dirname, '../inula/next-packages/compiler'),
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                child.on('close', (code) => {
                    // Clean up temp file
                    fs.unlink(tempFile).catch(() => {});
                    
                    if (code !== 0) {
                        reject(new Error(`Original compiler failed: ${stderr}`));
                    } else {
                        resolve(stdout.trim());
                    }
                });
            })
            .catch(reject);
    });
}

// Function to normalize output for comparison
function normalizeOutput(output) {
    return output
        .replace(/\$t_[a-f0-9]+/g, '$t_TEMPLATE_ID')  // Normalize template IDs
        .replace(/\s+/g, ' ')                          // Normalize whitespace
        .trim();
}

// Function to run consistency test
async function runConsistencyTest() {
    console.log('🚀 Running Consistency Tests\n');
    console.log('=' .repeat(80));
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const testCase of testCases) {
        totalTests++;
        console.log(`\n📝 Test: ${testCase.name}`);
        console.log(`JSX: ${testCase.jsx}`);
        console.log('-'.repeat(40));
        
        try {
            // Get NAPI compiler output
            const napiResult = await compileJsxToJs(testCase.jsx);
            console.log(`NAPI: ${napiResult}`);
            
            // Get original compiler output
            let originalResult;
            try {
                originalResult = await callOriginalCompiler(testCase.jsx);
                console.log(`ORIG: ${originalResult}`);
            } catch (error) {
                console.log(`ORIG: ERROR - ${error.message}`);
                originalResult = null;
            }
            
            // Compare outputs
            if (originalResult) {
                const napiNormalized = normalizeOutput(napiResult);
                const originalNormalized = normalizeOutput(originalResult);
                
                const isConsistent = napiNormalized === originalNormalized;
                
                if (isConsistent) {
                    console.log('✅ CONSISTENT');
                    passedTests++;
                } else {
                    console.log('❌ INCONSISTENT');
                    console.log(`NAPI (normalized): ${napiNormalized}`);
                    console.log(`ORIG (normalized): ${originalNormalized}`);
                }
            } else {
                console.log('⚠️  ORIGINAL COMPILER ERROR - Cannot compare');
            }
            
        } catch (error) {
            console.log(`❌ NAPI ERROR: ${error.message}`);
        }
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
    console.log(`🎯 Consistency Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! 100% consistency achieved!');
    } else {
        console.log(`🔧 ${totalTests - passedTests} tests need attention`);
    }
}

// Run the consistency test
runConsistencyTest().catch(console.error);

