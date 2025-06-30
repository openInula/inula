import { resolve, relative } from 'path';
import { globSync } from 'glob';
import pkg from 'fs-extra';
import LOG from './logHelper.js';
const { lstatSync, readFileSync, writeFileSync, existsSync, mkdirSync, mkdirsSync, rmSync, statSync } = pkg;
/**
 * 获取所有的编码文件
 * @param {*} vuePath
 * @param {*} whitelist
 * @param {*} blacklist
 * @returns
 */
export function scanPath(vuePath, whitelist, blacklist) {
  const globNames = globSync(whitelist, { cwd: vuePath, ignore: blacklist, recursive: true });
  LOG.info({ globNames });
  let files = new Set();
  let directories = new Set();

  globNames.forEach(file => {
    LOG.info({ file });
    const stats = lstatSync(resolve(vuePath, file));
    if (stats.isDirectory()) {
      directories.add(file);
    } else {
      files.add(file);
    }
  });

  files = Array.from(files);

  directories = Array.from(directories)
    .sort()
    .map(dir => dir.split('\\'))
    .sort((a, b) => {
      return a.length - b.length;
    })
    .map(dir => dir.join('\\'));

  LOG.info(
    'SCAN PATH: ',
    JSON.stringify(
      {
        files,
        directories,
        vuePath,
      },
      2
    )
  );
  return {
    files,
    directories,
    vuePath,
  };
}

/**
 * 初始化文件夹
 * @param {*} folderPath
 * @param {*} clean
 */
export function initFileFolderSync(folderPath, clean = true) {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath);
  } else if (clean) {
    LOG.info('Converted project already exists and it will be cleaned.');
    rmSync(folderPath, { recursive: true, force: true });
    mkdirSync(folderPath);
  }
}

/**
 * 创建文件所在的目录
 * @param {*} dirPath
 * @param {*} fileindex
 * @returns
 */
export function createFileFolderSync(rootPath, dirPath, fileindex) {
  const targetDir = resolve(rootPath, dirPath, '..');
  LOG.info('trying to create: ', targetDir);
  if (existsSync(targetDir)) {
    LOG.info(`creating directory [${fileindex + 1}/${fileindex + 1}]: '${dirPath}'... skip...`);
    return;
  } else {
    mkdirsSync(targetDir);
  }
}
