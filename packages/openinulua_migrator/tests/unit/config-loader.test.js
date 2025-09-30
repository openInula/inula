import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
  loadConfig, 
  findConfigFile, 
  loadConfigFile, 
  mergeConfigs,
  DEFAULT_CONFIG 
} from '../../src/config/config-loader.js';

describe('config-loader', () => {
  let tempDir;
  
  beforeEach(() => {
    // 创建临时目录
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inula-test-'));
  });
  
  afterEach(() => {
    // 清理临时目录
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  describe('findConfigFile', () => {
    it('should find .inularc.json in current directory', () => {
      const configPath = path.join(tempDir, '.inularc.json');
      fs.writeFileSync(configPath, '{}');
      
      const found = findConfigFile(tempDir);
      expect(found).toBe(configPath);
    });
    
    it('should find config in parent directory', () => {
      const subDir = path.join(tempDir, 'sub');
      fs.mkdirSync(subDir);
      
      const configPath = path.join(tempDir, '.inularc.json');
      fs.writeFileSync(configPath, '{}');
      
      const found = findConfigFile(subDir);
      expect(found).toBe(configPath);
    });
    
    it('should return explicit config path if provided', () => {
      const configPath = path.join(tempDir, 'custom.json');
      fs.writeFileSync(configPath, '{}');
      
      const found = findConfigFile(tempDir, 'custom.json');
      expect(found).toBe(configPath);
    });
    
    it('should return null if no config found', () => {
      const found = findConfigFile(tempDir);
      expect(found).toBeNull();
    });
  });
  
  describe('loadConfigFile', () => {
    it('should load JSON config', () => {
      const configPath = path.join(tempDir, '.inularc.json');
      const config = { ignore: ['test'], prettier: false };
      fs.writeFileSync(configPath, JSON.stringify(config));
      
      const loaded = loadConfigFile(configPath);
      expect(loaded).toEqual(config);
    });
    
    it('should load JS config', () => {
      const configPath = path.join(tempDir, '.inularc.js');
      const config = { ignore: ['test'], prettier: false };
      fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config)}`);
      
      const loaded = loadConfigFile(configPath);
      expect(loaded).toEqual(config);
    });
    
    it('should load simple YAML config', () => {
      const configPath = path.join(tempDir, '.inularc.yaml');
      const yamlContent = `ignore: ["test"]
prettier: false
concurrency: 4`;
      fs.writeFileSync(configPath, yamlContent);
      
      const loaded = loadConfigFile(configPath);
      expect(loaded.ignore).toEqual(['test']);
      expect(loaded.prettier).toBe(false);
      expect(loaded.concurrency).toBe(4);
    });
    
    it('should return empty object for non-existent file', () => {
      const loaded = loadConfigFile('/non/existent/path');
      expect(loaded).toEqual({});
    });
    
    it('should throw error for invalid JSON', () => {
      const configPath = path.join(tempDir, '.inularc.json');
      fs.writeFileSync(configPath, '{ invalid json }');
      
      expect(() => loadConfigFile(configPath)).toThrow();
    });
  });
  
  describe('mergeConfigs', () => {
    it('should merge configs with correct priority', () => {
      const defaultConfig = { ignore: ['default'], prettier: true, concurrency: 2 };
      const fileConfig = { ignore: ['file'], concurrency: 4 };
      const cliConfig = { concurrency: 8 };
      
      const merged = mergeConfigs(defaultConfig, fileConfig, cliConfig);
      
      expect(merged.ignore).toEqual(['default', 'file']);
      expect(merged.prettier).toBe(true);
      expect(merged.concurrency).toBe(8); // CLI 优先级最高
    });
    
    it('should handle array merging correctly', () => {
      const defaultConfig = { ignore: ['a', 'b'] };
      const fileConfig = { ignore: ['c', 'd'] };
      const cliConfig = { ignore: ['e'] };
      
      const merged = mergeConfigs(defaultConfig, fileConfig, cliConfig);
      expect(merged.ignore).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });
  
  describe('loadConfig', () => {
    it('should load and merge config from file', () => {
      const configPath = path.join(tempDir, '.inularc.json');
      const fileConfig = { ignore: ['test'], concurrency: 4 };
      fs.writeFileSync(configPath, JSON.stringify(fileConfig));
      
      const cliOptions = { verbose: true };
      const config = loadConfig(cliOptions, tempDir);
      
      expect(config.ignore).toEqual(['test']);
      expect(config.concurrency).toBe(4);
      expect(config.verbose).toBe(true);
      expect(config._meta.configPath).toBe(configPath);
    });
    
    it('should use default config when no file exists', () => {
      const config = loadConfig({}, tempDir);
      
      expect(config.ignore).toEqual(DEFAULT_CONFIG.ignore);
      expect(config.prettier).toBe(DEFAULT_CONFIG.prettier);
      expect(config._meta.configPath).toBeNull();
    });
    
    it('should prioritize CLI options over file config', () => {
      const configPath = path.join(tempDir, '.inularc.json');
      fs.writeFileSync(configPath, JSON.stringify({ prettier: false, concurrency: 2 }));
      
      const cliOptions = { prettier: true };
      const config = loadConfig(cliOptions, tempDir);
      
      expect(config.prettier).toBe(true); // CLI 优先
      expect(config.concurrency).toBe(2); // 文件配置
    });
  });
});
