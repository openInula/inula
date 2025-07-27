import { resolve, relative } from 'path';
import { vueFileConvert, vueJsFileConvert } from './next/convert/index.js';
import { globSync } from 'glob';
import pkg from 'fs-extra';
import fs from 'fs';
import LOG from './next/logHelper.js';
import { convertToCamelCase } from './next/convert/nodeUtils.js';
const { lstatSync, readFileSync, writeFileSync, existsSync, mkdirSync, mkdirsSync, rmSync, statSync } = pkg;

function shouldReRender(filePath, lastBuild) {
  if (lastBuild < 0) console.log('no previous build');
  if (lastBuild < 0) return true;
  const stats = statSync(filePath);
  const { mtime: modified } = statSync(filePath);
  console.log('should render?', {
    filePath,
    lastBuild,
    modified: new Date(modified).getTime(),
    should: new Date(modified).getTime() > lastBuild,
  });
  return new Date(modified).getTime() > lastBuild;
}

/**
 * 获取所有的编码文件
 * @param {*} vuePath
 * @param {*} whitelist
 * @param {*} blacklist
 * @returns
 */
function scanPath(vuePath, whitelist, blacklist) {
  const globNames = globSync(whitelist, { cwd: vuePath, ignore: blacklist, recursive: true });
  console.log({ globNames });
  let files = new Set();
  let directories = new Set();

  globNames.forEach(file => {
    console.log({ file });
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

  console.log(
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

function compileFiles(
  vueSrcPath,
  out,
  { clean = true, jsx = true, whitelist, blacklist, lastBuild, configPath, componentConfigPath }
) {
  console.log({ vueSrcPath });
  const successLog = [];
  const errorLog = [];

  blacklist = blacklist ? (Array.isArray(blacklist) ? blacklist : [blacklist]) : [];
  whitelist = whitelist ? (Array.isArray(whitelist) ? whitelist : [whitelist]) : ['./**/*'];

  const { files, directories, rootPath } = scanPath(vueSrcPath, whitelist, blacklist);
  console.log(`processing ${files.length} files and ${directories.length} directories.`);
  const outputPath = resolve(out);
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath);
  } else if (clean) {
    console.log('Converted project already exists and it will be cleaned.');
    rmSync(outputPath, { recursive: true, force: true });
    mkdirSync(outputPath);
  }

  let config = null;
  if (configPath) {
    if (configPath && fs.statSync(resolve(configPath))) {
      try {
        config = JSON.parse(fs.readFileSync(resolve(configPath), 'utf-8'));
      } catch (e) {
        LOG.error('read component config file failed');
      }
    }
  }

  let component = null;
  if (componentConfigPath) {
    if (componentConfigPath && fs.statSync(resolve(componentConfigPath))) {
      try {
        component = JSON.parse(fs.readFileSync(resolve(componentConfigPath), 'utf-8'));
        if (component.tag) {
          Object.values(component.tag).forEach(item => {
            const keys = Object.keys(item.attributesMap);
            keys.forEach(key => {
              item.attributesMap[convertToCamelCase(key)] = item.attributesMap[key];
            });
          });
        }
      } catch (e) {
        LOG.error('read component config file failed');
      }
    }
  }

  files.forEach((filePath, index) => {
    createFileFolderSync(outputPath, filePath, index);
    const orgFile = resolve(vueSrcPath, filePath);
    const shouldConvert = shouldReRender(orgFile, lastBuild);
    LOG.info(`processing file [${index + 1}/${files.length}]: '${filePath}'... ${shouldConvert ? '' : ' Skip...'}`);
    if (!shouldConvert) {
      return;
    }

    if (filePath.match(/\.vue$/)) {
      const targetFile = resolve(outputPath, filePath.replace(/\.vue$/g, '.jsx'));
      vueFileConvert(orgFile, targetFile, { component, config });
    } else if (filePath.match(/\.[tj]s$/)) {
      vueJsFileConvert(orgFile, resolve(outputPath, filePath.replace(/ts$/, 'js')), { component, config });
    } else if (filePath.match(/\.scss$/)) {
      pkg.copyFileSync(resolve(vueSrcPath, filePath), resolve(outputPath, filePath));
    } else {
      pkg.copyFileSync(resolve(vueSrcPath, filePath), resolve(outputPath, filePath));
    }
  });

  successLog.forEach(log => console.log(`-done. [${log}]`));
  if (errorLog.length) {
    console.log('Some errors occured while compiling:');
    errorLog.forEach(log => {
      console.log(`-failed. [${log[0]}], ${log[1]}`);
      console.trace(log[1]);
    });
  }
}

/**
 * 创建文件所在的目录
 * @param {*} dirPath
 * @param {*} fileindex
 * @returns
 */
function createFileFolderSync(rootPath, dirPath, fileindex) {
  const targetDir = resolve(rootPath, dirPath, '..');
  LOG.info('trying to create: ', targetDir);
  if (existsSync(targetDir)) {
    LOG.info(`creating directory [${fileindex + 1}/${fileindex + 1}]: '${dirPath}'... skip...`);
    return;
  } else {
    mkdirsSync(targetDir);
  }
}

export default compileFiles;
