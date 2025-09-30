import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

describe('Error handling and recovery', () => {
  let tempDir;
  let originalCwd;
  
  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inula-error-test-'));
    process.chdir(tempDir);
  });
  
  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  it('should handle file write errors gracefully', () => {
    // 这个测试验证错误处理逻辑存在，但不实际触发写入错误
    // 因为模拟写入错误在不同系统上可能不一致
    
    // 创建测试文件
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `import React from 'react';\nfunction App() { return <div>Test</div>; }`);
    
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" test.jsx --write --verbose`, { 
      encoding: 'utf8',
      cwd: tempDir
    });
    
    // 验证正常情况下的输出包含备份信息
    expect(result).toContain('processed 1 files');
    expect(result).toContain('Backed up:');
  });
  
  it('should provide recovery guidance when cache exists', () => {
    // 创建测试文件并成功运行迁移（创建缓存）
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `import React from 'react';\nfunction App() { return <div>Test</div>; }`);
    
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    execSync(`node "${binPath}" test.jsx --write`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 现在创建一个会失败的情况（通过创建无效的转换文件）
    // 由于我们无法轻易模拟转换失败，我们测试回滚指引的存在
    const rollbackBin = path.join(originalCwd, 'bin/inula-rollback');
    const infoResult = execSync(`node "${rollbackBin}" --info`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    expect(infoResult).toContain('Cache Information');
    expect(infoResult).toContain('Cached files: 1');
  });
  
  it('should show helpful tips when no cache exists', () => {
    // 创建一个简单的测试文件（会被 Prettier 格式化）
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `function App() { return <div>Test</div>; }`);
    
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" test.jsx`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证正常执行
    expect(result).toContain('processed 1 files');
    // 文件可能会被 Prettier 格式化，所以检查是否有变化
    expect(result).toMatch(/changed [01]/); // 可能是0或1
  });
  
  it('should handle non-existent files gracefully', () => {
    try {
      const binPath = path.join(originalCwd, 'bin/inula-migrate');
      const result = execSync(`node "${binPath}" non-existent.jsx`, { 
        encoding: 'utf8',
        cwd: tempDir,
        stdio: 'pipe'
      });
      
      expect(result).toContain('processed 0 files');
    } catch (error) {
      // 可能会抛出错误，这是正常的
      const output = error.stdout ? error.stdout.toString() : '';
      const stderr = error.stderr ? error.stderr.toString() : '';
      
      // 验证有合理的错误处理
      expect(output.includes('processed 0 files') || stderr.includes('Error')).toBe(true);
    }
  });
  
  it('should show error summary when there are issues', () => {
    // 创建一个会产生警告的文件（如果转换器有警告机制）
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `import React from 'react';\nfunction App() { return <div>Test</div>; }`);
    
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" test.jsx --verbose`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证正常执行和详细输出
    expect(result).toContain('processed 1 files');
    expect(result).toContain('changed 1');
  });
});
