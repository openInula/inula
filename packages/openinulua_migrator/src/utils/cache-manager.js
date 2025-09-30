'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * 缓存管理器
 * 负责在转换前备份文件，并在需要时恢复
 */

const CACHE_DIR_NAME = '.inula-migrate-cache';

/**
 * 获取缓存目录路径
 * @param {string} projectRoot 项目根目录
 * @returns {string} 缓存目录路径
 */
function getCacheDir(projectRoot) {
  return path.join(projectRoot, CACHE_DIR_NAME);
}

/**
 * 确保缓存目录存在
 * @param {string} cacheDir 缓存目录路径
 */
function ensureCacheDir(cacheDir) {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

/**
 * 生成文件的缓存键
 * @param {string} filePath 文件路径
 * @param {string} projectRoot 项目根目录
 * @returns {string} 缓存键
 */
function generateCacheKey(filePath, projectRoot) {
  const relativePath = path.relative(projectRoot, filePath);
  const hash = crypto.createHash('md5').update(relativePath).digest('hex');
  return `${hash}-${path.basename(filePath)}`;
}

/**
 * 获取缓存文件路径
 * @param {string} filePath 原始文件路径
 * @param {string} projectRoot 项目根目录
 * @returns {string} 缓存文件路径
 */
function getCacheFilePath(filePath, projectRoot) {
  const cacheDir = getCacheDir(projectRoot);
  const cacheKey = generateCacheKey(filePath, projectRoot);
  return path.join(cacheDir, cacheKey);
}

/**
 * 备份文件到缓存
 * @param {string} filePath 要备份的文件路径
 * @param {string} projectRoot 项目根目录
 * @returns {string|null} 缓存文件路径，失败时返回null
 */
function backupFile(filePath, projectRoot) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const cacheDir = getCacheDir(projectRoot);
    ensureCacheDir(cacheDir);
    
    const cacheFilePath = getCacheFilePath(filePath, projectRoot);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 保存原始内容和元信息
    const cacheData = {
      originalPath: filePath,
      relativePath: path.relative(projectRoot, filePath),
      content,
      timestamp: new Date().toISOString(),
      size: content.length,
      checksum: crypto.createHash('md5').update(content).digest('hex'),
    };
    
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf8');
    return cacheFilePath;
  } catch (error) {
    console.warn(`Warning: Failed to backup file ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * 从缓存恢复文件
 * @param {string} filePath 要恢复的文件路径
 * @param {string} projectRoot 项目根目录
 * @returns {boolean} 是否成功恢复
 */
function restoreFile(filePath, projectRoot) {
  try {
    const cacheFilePath = getCacheFilePath(filePath, projectRoot);
    
    if (!fs.existsSync(cacheFilePath)) {
      return false;
    }
    
    const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    
    // 验证缓存数据
    if (cacheData.originalPath !== filePath) {
      console.warn(`Warning: Cache path mismatch for ${filePath}`);
      return false;
    }
    
    // 恢复文件内容
    fs.writeFileSync(filePath, cacheData.content, 'utf8');
    
    // 删除缓存文件
    fs.unlinkSync(cacheFilePath);
    
    return true;
  } catch (error) {
    console.warn(`Warning: Failed to restore file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 获取缓存信息
 * @param {string} projectRoot 项目根目录
 * @returns {object} 缓存信息
 */
function getCacheInfo(projectRoot) {
  const cacheDir = getCacheDir(projectRoot);
  
  if (!fs.existsSync(cacheDir)) {
    return {
      exists: false,
      fileCount: 0,
      totalSize: 0,
      files: [],
    };
  }
  
  try {
    const cacheFiles = fs.readdirSync(cacheDir);
    const files = [];
    let totalSize = 0;
    
    for (const fileName of cacheFiles) {
      const cacheFilePath = path.join(cacheDir, fileName);
      const stat = fs.statSync(cacheFilePath);
      
      try {
        const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        files.push({
          originalPath: cacheData.originalPath,
          relativePath: cacheData.relativePath,
          timestamp: cacheData.timestamp,
          size: cacheData.size,
          cacheFile: cacheFilePath,
        });
        totalSize += stat.size;
      } catch (e) {
        // 忽略损坏的缓存文件
      }
    }
    
    return {
      exists: true,
      fileCount: files.length,
      totalSize,
      files,
      cacheDir,
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
      fileCount: 0,
      totalSize: 0,
      files: [],
    };
  }
}

/**
 * 清理缓存目录
 * @param {string} projectRoot 项目根目录
 * @returns {boolean} 是否成功清理
 */
function clearCache(projectRoot) {
  try {
    const cacheDir = getCacheDir(projectRoot);
    
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
    
    return true;
  } catch (error) {
    console.warn(`Warning: Failed to clear cache: ${error.message}`);
    return false;
  }
}

/**
 * 批量恢复所有缓存文件
 * @param {string} projectRoot 项目根目录
 * @returns {object} 恢复结果统计
 */
function restoreAllFiles(projectRoot) {
  const cacheInfo = getCacheInfo(projectRoot);
  const results = {
    total: cacheInfo.fileCount,
    restored: 0,
    failed: 0,
    errors: [],
  };
  
  if (!cacheInfo.exists) {
    return results;
  }
  
  for (const file of cacheInfo.files) {
    if (restoreFile(file.originalPath, projectRoot)) {
      results.restored++;
    } else {
      results.failed++;
      results.errors.push(file.originalPath);
    }
  }
  
  // 清理空的缓存目录
  if (results.restored > 0) {
    const remainingFiles = fs.readdirSync(cacheInfo.cacheDir);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(cacheInfo.cacheDir);
    }
  }
  
  return results;
}

module.exports = {
  getCacheDir,
  backupFile,
  restoreFile,
  getCacheInfo,
  clearCache,
  restoreAllFiles,
  CACHE_DIR_NAME,
};
