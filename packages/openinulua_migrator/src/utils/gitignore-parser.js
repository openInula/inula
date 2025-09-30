'use strict';

const fs = require('fs');
const path = require('path');

/**
 * GitIgnore 解析器
 * 解析 .gitignore 文件并转换为 glob 模式
 */

/**
 * 查找项目根目录的 .gitignore 文件
 * @param {string} startDir 开始查找的目录
 * @returns {string|null} .gitignore 文件路径或null
 */
function findGitignoreFile(startDir) {
  let currentDir = startDir;
  
  while (currentDir !== path.dirname(currentDir)) {
    const gitignorePath = path.join(currentDir, '.gitignore');
    const gitDirPath = path.join(currentDir, '.git');
    
    // 如果找到 .git 目录，这就是项目根目录
    if (fs.existsSync(gitDirPath)) {
      return fs.existsSync(gitignorePath) ? gitignorePath : null;
    }
    
    // 如果没有 .git 但有 .gitignore，也考虑这个目录
    if (fs.existsSync(gitignorePath)) {
      // 继续向上查找，看是否有 .git 目录
      let parentDir = path.dirname(currentDir);
      let foundGit = false;
      
      while (parentDir !== path.dirname(parentDir)) {
        if (fs.existsSync(path.join(parentDir, '.git'))) {
          foundGit = true;
          break;
        }
        parentDir = path.dirname(parentDir);
      }
      
      // 如果没有找到上级 .git 目录，则使用当前的 .gitignore
      if (!foundGit) {
        return gitignorePath;
      }
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return null;
}

/**
 * 解析 .gitignore 文件内容
 * @param {string} gitignorePath .gitignore 文件路径
 * @returns {string[]} glob 模式数组
 */
function parseGitignoreFile(gitignorePath) {
  if (!gitignorePath || !fs.existsSync(gitignorePath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    return parseGitignoreContent(content);
  } catch (error) {
    console.warn(`Warning: Failed to read .gitignore file ${gitignorePath}: ${error.message}`);
    return [];
  }
}

/**
 * 解析 .gitignore 内容为 glob 模式
 * @param {string} content .gitignore 文件内容
 * @returns {string[]} glob 模式数组
 */
function parseGitignoreContent(content) {
  const lines = content.split('\n');
  const patterns = [];
  
  for (let line of lines) {
    line = line.trim();
    
    // 跳过空行和注释
    if (!line || line.startsWith('#')) {
      continue;
    }
    
    // 跳过否定模式（以 ! 开头），因为 fast-glob 的否定语法不同
    if (line.startsWith('!')) {
      continue;
    }
    
    // 转换为 glob 模式
    let pattern = gitignoreToGlob(line);
    if (pattern) {
      patterns.push(pattern);
    }
  }
  
  return patterns;
}

/**
 * 将 .gitignore 模式转换为 glob 模式
 * @param {string} gitignorePattern .gitignore 模式
 * @returns {string} glob 模式
 */
function gitignoreToGlob(gitignorePattern) {
  let pattern = gitignorePattern;
  
  // 移除尾随空格
  pattern = pattern.trimEnd();
  
  // 如果模式以 / 开头，表示从根目录开始匹配
  if (pattern.startsWith('/')) {
    pattern = pattern.slice(1);
  } else {
    // 否则在任何位置都可以匹配
    pattern = '**/' + pattern;
  }
  
  // 如果模式以 / 结尾，表示只匹配目录
  if (pattern.endsWith('/')) {
    pattern = pattern + '**';
  } else {
    // 如果不包含文件扩展名且不以 * 结尾，可能是目录
    if (!pattern.includes('.') && !pattern.endsWith('*')) {
      // 既匹配文件也匹配目录
      return [pattern, pattern + '/**'].join('|');
    }
  }
  
  return pattern;
}

/**
 * 获取项目的 gitignore 模式
 * @param {string} projectRoot 项目根目录
 * @returns {string[]} gitignore 模式数组
 */
function getGitignorePatterns(projectRoot) {
  const gitignorePath = findGitignoreFile(projectRoot);
  const patterns = parseGitignoreFile(gitignorePath);
  
  // 添加一些常见的默认忽略模式
  const defaultPatterns = [
    'node_modules/**',
    '.git/**',
    '.DS_Store',
    'Thumbs.db',
    '*.tmp',
    '*.temp',
    '.cache/**',
    'coverage/**',
  ];
  
  // 合并并去重
  const allPatterns = [...new Set([...defaultPatterns, ...patterns])];
  
  return allPatterns.filter(p => p && p.trim());
}

/**
 * 合并 gitignore 模式和用户指定的 ignore 模式
 * @param {string[]} gitignorePatterns gitignore 模式
 * @param {string[]} userIgnorePatterns 用户指定的忽略模式
 * @returns {string[]} 合并后的模式数组
 */
function mergeIgnorePatterns(gitignorePatterns, userIgnorePatterns) {
  const allPatterns = [...gitignorePatterns, ...(userIgnorePatterns || [])];
  return [...new Set(allPatterns)].filter(p => p && p.trim());
}

module.exports = {
  findGitignoreFile,
  parseGitignoreFile,
  parseGitignoreContent,
  gitignoreToGlob,
  getGitignorePatterns,
  mergeIgnorePatterns,
};
