'use strict';

const fs = require('fs');
const path = require('path');

/**
 * 配置文件加载器
 * 支持 .inularc.json, .inularc.js, .inularc.yaml, .inularc.yml
 */

const DEFAULT_CONFIG = {
  ignore: [],
  prettier: true,
  concurrency: require('os').cpus().length,
  extensions: ['js', 'jsx', 'ts', 'tsx'],
  parser: 'auto',
  recursive: true,
  failOnWarn: false,
  quiet: false,
  verbose: false,
  report: null,
  reportFormat: 'json',
};

/**
 * 查找配置文件
 * @param {string} startDir 开始查找的目录
 * @param {string|null} explicitPath 明确指定的配置文件路径
 * @returns {string|null} 配置文件路径或null
 */
function findConfigFile(startDir, explicitPath = null) {
  if (explicitPath) {
    const resolved = path.resolve(startDir, explicitPath);
    return fs.existsSync(resolved) ? resolved : null;
  }

  const configNames = [
    '.inularc.json',
    '.inularc.js',
    '.inularc.yaml',
    '.inularc.yml',
    'inula.config.js',
    'inula.config.json',
  ];

  let currentDir = startDir;
  while (currentDir !== path.dirname(currentDir)) {
    for (const name of configNames) {
      const configPath = path.join(currentDir, name);
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * 加载配置文件内容
 * @param {string} configPath 配置文件路径
 * @returns {object} 配置对象
 */
function loadConfigFile(configPath) {
  if (!configPath || !fs.existsSync(configPath)) {
    return {};
  }

  const ext = path.extname(configPath).toLowerCase();
  
  try {
    if (ext === '.json') {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    }
    
    if (ext === '.js') {
      // 清除缓存以支持重新加载
      delete require.cache[require.resolve(configPath)];
      const mod = require(configPath);
      return mod && mod.default ? mod.default : mod;
    }
    
    if (ext === '.yaml' || ext === '.yml') {
      // 简单的 YAML 解析（仅支持基本格式）
      const content = fs.readFileSync(configPath, 'utf8');
      return parseSimpleYaml(content);
    }
  } catch (error) {
    throw new Error(`Failed to load config file ${configPath}: ${error.message}`);
  }

  return {};
}

/**
 * 简单的 YAML 解析器（仅支持基本格式）
 * @param {string} content YAML 内容
 * @returns {object} 解析后的对象
 */
function parseSimpleYaml(content) {
  const result = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();
    
    // 处理基本类型
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^\d+$/.test(value)) value = parseInt(value, 10);
    else if (value.startsWith('[') && value.endsWith(']')) {
      // 简单数组解析
      value = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
    } else {
      // 字符串值，移除引号
      value = value.replace(/^['"]|['"]$/g, '');
    }
    
    result[key] = value;
  }
  
  return result;
}

/**
 * 合并配置
 * @param {object} defaultConfig 默认配置
 * @param {object} fileConfig 文件配置
 * @param {object} cliConfig CLI 配置
 * @returns {object} 合并后的配置
 */
function mergeConfigs(defaultConfig, fileConfig, cliConfig) {
  const merged = { ...defaultConfig };
  
  // 合并文件配置
  Object.keys(fileConfig).forEach(key => {
    if (fileConfig[key] !== undefined) {
      if (Array.isArray(defaultConfig[key]) && Array.isArray(fileConfig[key])) {
        // 对于数组类型，如果是 ignore 则合并，其他则替换
        if (key === 'ignore') {
          merged[key] = [...defaultConfig[key], ...fileConfig[key]];
        } else {
          merged[key] = fileConfig[key];
        }
      } else {
        merged[key] = fileConfig[key];
      }
    }
  });
  
  // 合并 CLI 配置（CLI 优先级最高）
  Object.keys(cliConfig).forEach(key => {
    if (cliConfig[key] !== undefined) {
      if (Array.isArray(merged[key]) && Array.isArray(cliConfig[key])) {
        // 对于数组类型，如果是 ignore 则合并，其他则替换
        if (key === 'ignore') {
          merged[key] = [...merged[key], ...cliConfig[key]];
        } else {
          merged[key] = cliConfig[key];
        }
      } else {
        merged[key] = cliConfig[key];
      }
    }
  });
  
  return merged;
}

/**
 * 加载完整配置
 * @param {object} options CLI 选项
 * @param {string} cwd 当前工作目录
 * @returns {object} 最终配置
 */
function loadConfig(options = {}, cwd = process.cwd()) {
  const configPath = findConfigFile(cwd, options.config);
  const fileConfig = loadConfigFile(configPath);
  
  const finalConfig = mergeConfigs(DEFAULT_CONFIG, fileConfig, options);
  
  // 添加元信息
  finalConfig._meta = {
    configPath,
    loadedAt: new Date().toISOString(),
    cwd,
  };
  
  return finalConfig;
}

module.exports = {
  loadConfig,
  findConfigFile,
  loadConfigFile,
  mergeConfigs,
  DEFAULT_CONFIG,
};
