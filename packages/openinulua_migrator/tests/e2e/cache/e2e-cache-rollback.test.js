import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

describe('Cache and Rollback functionality', () => {
  let tempDir;
  let originalCwd;
  
  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inula-cache-test-'));
    process.chdir(tempDir);
  });
  
  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  it('should create backups when writing files', () => {
    // 创建测试文件
    const testFile = path.join(tempDir, 'test.jsx');
    const originalContent = `import React from 'react';\nfunction App() { return <div>Original</div>; }`;
    fs.writeFileSync(testFile, originalContent);
    
    // 运行 CLI with --write
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" test.jsx --write --verbose`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证文件被修改
    const modifiedContent = fs.readFileSync(testFile, 'utf8');
    expect(modifiedContent).not.toBe(originalContent);
    expect(modifiedContent).not.toContain('import React from');
    
    // 验证创建了缓存目录
    const cacheDir = path.join(tempDir, '.inula-migrate-cache');
    expect(fs.existsSync(cacheDir)).toBe(true);
    
    // 验证有备份信息
    expect(result).toContain('Backed up:');
  });
  
  it('should show cache info correctly', () => {
    // 创建测试文件并运行迁移
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `import React from 'react';\nfunction App() { return <div>Test</div>; }`);
    
    const migrateBin = path.join(originalCwd, 'bin/inula-migrate');
    execSync(`node "${migrateBin}" test.jsx --write`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 检查缓存信息
    const rollbackBin = path.join(originalCwd, 'bin/inula-rollback');
    const infoResult = execSync(`node "${rollbackBin}" --info`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    expect(infoResult).toContain('Cache Information');
    expect(infoResult).toContain('Cached files: 1');
    expect(infoResult).toContain('test.jsx');
  });
  
  it('should rollback files correctly', () => {
    // 创建测试文件
    const testFile = path.join(tempDir, 'test.jsx');
    const originalContent = `import React from 'react';\nfunction App() { return <div>Original</div>; }`;
    fs.writeFileSync(testFile, originalContent);
    
    // 运行迁移
    const migrateBin = path.join(originalCwd, 'bin/inula-migrate');
    execSync(`node "${migrateBin}" test.jsx --write`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证文件被修改
    const modifiedContent = fs.readFileSync(testFile, 'utf8');
    expect(modifiedContent).not.toBe(originalContent);
    
    // 执行回滚
    const rollbackBin = path.join(originalCwd, 'bin/inula-rollback');
    const rollbackResult = execSync(`node "${rollbackBin}" --yes`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证文件被恢复
    const restoredContent = fs.readFileSync(testFile, 'utf8');
    expect(restoredContent).toBe(originalContent);
    
    // 验证回滚成功消息
    expect(rollbackResult).toContain('Rolling back changes');
    expect(rollbackResult).toContain('All files restored successfully');
    
    // 验证缓存目录被清理
    const cacheDir = path.join(tempDir, '.inula-migrate-cache');
    expect(fs.existsSync(cacheDir)).toBe(false);
  });
  
  it('should clear cache without restoring', () => {
    // 创建测试文件并运行迁移
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `import React from 'react';\nfunction App() { return <div>Test</div>; }`);
    
    const migrateBin = path.join(originalCwd, 'bin/inula-migrate');
    execSync(`node "${migrateBin}" test.jsx --write`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 记录修改后的内容
    const modifiedContent = fs.readFileSync(testFile, 'utf8');
    
    // 清理缓存
    const rollbackBin = path.join(originalCwd, 'bin/inula-rollback');
    const clearResult = execSync(`node "${rollbackBin}" --clear --yes`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证缓存被清理
    expect(clearResult).toContain('Cache cleared successfully');
    const cacheDir = path.join(tempDir, '.inula-migrate-cache');
    expect(fs.existsSync(cacheDir)).toBe(false);
    
    // 验证文件内容没有改变（没有回滚）
    const currentContent = fs.readFileSync(testFile, 'utf8');
    expect(currentContent).toBe(modifiedContent);
  });
  
  it('should handle no cache gracefully', () => {
    // 直接运行回滚（没有缓存）
    const rollbackBin = path.join(originalCwd, 'bin/inula-rollback');
    const result = execSync(`node "${rollbackBin}" --info`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    expect(result).toContain('No cache found');
  });
});
