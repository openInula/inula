import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

describe('Gitignore integration', () => {
  let tempDir;
  let originalCwd;
  
  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inula-gitignore-test-'));
    process.chdir(tempDir);
  });
  
  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  it('should respect .gitignore patterns', () => {
    // 创建目录结构
    fs.mkdirSync(path.join(tempDir, 'src'));
    fs.mkdirSync(path.join(tempDir, 'node_modules'));
    fs.mkdirSync(path.join(tempDir, 'dist'));
    
    // 创建测试文件
    fs.writeFileSync(path.join(tempDir, 'src', 'app.jsx'), 
      `import React from 'react';\nfunction App() { return <div>App</div>; }`);
    fs.writeFileSync(path.join(tempDir, 'node_modules', 'react.js'), 
      `import React from 'react';\nfunction Component() { return <div>Component</div>; }`);
    fs.writeFileSync(path.join(tempDir, 'dist', 'bundle.js'), 
      `import React from 'react';\nfunction Bundle() { return <div>Bundle</div>; }`);
    
    // 创建 .gitignore 文件
    fs.writeFileSync(path.join(tempDir, '.gitignore'), `
node_modules/
dist/
*.log
`);
    
    // 运行 CLI
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" . --verbose`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证只处理了 src/app.jsx，忽略了 node_modules 和 dist
    expect(result).toContain('processed 1 files');
    expect(result).toContain('src/app.jsx');
    expect(result).not.toContain('node_modules');
    expect(result).not.toContain('dist');
    expect(result).toContain('Gitignore patterns:');
  });
  
  it('should merge .gitignore with CLI ignore patterns', () => {
    // 创建目录结构
    fs.mkdirSync(path.join(tempDir, 'src'));
    fs.mkdirSync(path.join(tempDir, 'test'));
    fs.mkdirSync(path.join(tempDir, 'build'));
    
    // 创建测试文件
    fs.writeFileSync(path.join(tempDir, 'src', 'app.jsx'), 
      `import React from 'react';\nfunction App() { return <div>App</div>; }`);
    fs.writeFileSync(path.join(tempDir, 'test', 'test.jsx'), 
      `import React from 'react';\nfunction Test() { return <div>Test</div>; }`);
    fs.writeFileSync(path.join(tempDir, 'build', 'build.jsx'), 
      `import React from 'react';\nfunction Build() { return <div>Build</div>; }`);
    
    // 创建 .gitignore（只忽略 build）
    fs.writeFileSync(path.join(tempDir, '.gitignore'), 'build/\n');
    
    // 运行 CLI，通过 --ignore 额外忽略 test
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" . --ignore "**/test/**" --verbose`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证只处理了 src/app.jsx
    expect(result).toContain('processed 1 files');
    expect(result).toContain('src/app.jsx');
    expect(result).not.toContain('test.jsx');
    expect(result).not.toContain('build.jsx');
  });
  
  it('should work without .gitignore file', () => {
    // 创建测试文件（不创建 .gitignore）
    fs.writeFileSync(path.join(tempDir, 'app.jsx'), 
      `import React from 'react';\nfunction App() { return <div>App</div>; }`);
    
    // 运行 CLI
    const binPath = path.join(originalCwd, 'bin/inula-migrate');
    const result = execSync(`node "${binPath}" app.jsx --verbose`, { 
      encoding: 'utf8',
      cwd: tempDir 
    });
    
    // 验证正常处理
    expect(result).toContain('processed 1 files');
    expect(result).toContain('Gitignore patterns:');
  });
});
