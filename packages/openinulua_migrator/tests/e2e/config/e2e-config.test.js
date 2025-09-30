import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

describe('Config file integration', () => {
  let tempDir;
  let originalCwd;
  
  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inula-config-test-'));
    process.chdir(tempDir);
  });
  
  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  it('should use configuration from .inularc.json', () => {
    // 创建测试文件
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `import React from 'react';\nfunction App() { return <div>Hello</div>; }`);
    
    // 创建配置文件
    const configFile = path.join(tempDir, '.inularc.json');
    fs.writeFileSync(configFile, JSON.stringify({
      ignore: [],
      prettier: false,
      verbose: true
    }));
    
    // 运行 CLI
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" test.jsx`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证配置被加载
    expect(result).toContain('Loaded configuration');
    expect(result).toContain('"prettier": false');
    expect(result).toContain('"verbose": true');
  });
  
  it('should prioritize CLI options over config file', () => {
    // 创建测试文件
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `import React from 'react';\nfunction App() { return <div>Hello</div>; }`);
    
    // 创建配置文件
    const configFile = path.join(tempDir, '.inularc.json');
    fs.writeFileSync(configFile, JSON.stringify({
      verbose: false
    }));
    
    // 运行 CLI 并覆盖配置
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" test.jsx --verbose`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证 CLI 选项优先
    expect(result).toContain('Loaded configuration');
    expect(result).toContain('"verbose": true');
  });
  
  it('should work without config file', () => {
    // 创建测试文件
    const testFile = path.join(tempDir, 'test.jsx');
    fs.writeFileSync(testFile, `import React from 'react';\nfunction App() { return <div>Hello</div>; }`);
    
    // 运行 CLI（无配置文件）
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" test.jsx`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证默认行为
    expect(result).toContain('processed 1 files');
  });
});
