/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');
const { globSync } = require('glob');
const { statSync } = require('fs');
const { basename } = require('path');
const _ = require('lodash');
_.extend(Generator.prototype, require('yeoman-generator/lib/actions/install'));

function noop() {
  return true;
}

class BasicGenerator extends Generator {
  constructor(opts) {
    super(opts);
    this.opts = opts;
    this.name = basename(opts.env.cwd);
  }

  isTsFile(f) {
    return f.endsWith('.ts') || f.endsWith('.tsx') || !!/(tsconfig\.json)/g.test(f);
  }

  /**
   * 拷贝文件
   * @param {string} src 源文件路径
   * @param {string} dest 目标文件路径
   * @param {function} filter 过滤函数
   */
  copyFile(src, dest, filter = () => true) {
    if (src.indexOf('package.json') !== -1 && fs.existsSync(dest)) {
      this.mergePackage(filePath, destFilePath);
      return;
    }
    const readStream = fs.createReadStream(src);
    const writeStream = fs.createWriteStream(dest);
    readStream.pipe(writeStream);
    readStream.on('error', err => console.error(err));
    writeStream.on('error', err => console.error(err));
  }

  /**
   * 拷贝文件夹
   * @param {string} src 源文件夹路径
   * @param {string} dest 目标文件夹路径
   * @param {function} filter 过滤函数
   */
  copyFolder(src, dest, filter = () => true) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stats = fs.statSync(srcPath);
      if (stats.isFile() && filter(srcPath)) {
        this.copyFile(srcPath, destPath);
      } else if (stats.isDirectory()) {
        this.copyFolder(srcPath, destPath, filter);
      }
    }
  }

  writeFiles(src, dest, { context, filterFiles = noop }) {
    const files = globSync('**/*', {
      cwd: src,
      dot: true,
    })
      .filter(filterFiles)
      .forEach(file => {
        const filePath = path.join(src, file);
        if (statSync(filePath).isFile()) {
          this.fs.copyTpl(filePath, path.join(dest, file), context);
        }
      });
  }

  copyFiles({ src, dest, context, filterFiles = noop }) {
    const files = globSync('**/*', {
      cwd: src,
      dot: true,
    })
      .filter(filterFiles)
      .forEach(file => {
        const filePath = path.resolve(src, file);
        const destFilePath = path.resolve(dest, file);
        if (statSync(filePath).isFile()) {
          if (file === 'package.json' && fs.existsSync(destFilePath)) {
            this.mergePackage(filePath, destFilePath);
          } else {
            this.fs.copyTpl(filePath, path.resolve(dest, file.replace(/^_/, '.')), context);
          }
        }
      });
  }

  mergePackage(src, dest) {
    if (fs.existsSync(dest)) {
      const existing = JSON.parse(fs.readFileSync(dest, 'utf8'));
      const newPackage = JSON.parse(fs.readFileSync(src, 'utf8'));
      const pkg = Object.assign({}, existing, newPackage);
      fs.writeFileSync(dest, JSON.stringify(pkg, null, 2) + '\n');
    }
  }

  traverseDirCapture(dir, dirCallback, fileCallback) {
    for (const filename of fs.readdirSync(dir)) {
      const fullpath = path.resolve(dir, filename);
      if (fs.lstatSync(fullpath).isDirectory()) {
        dirCallback(fullpath);
        if (fs.existsSync(fullpath)) {
          this.traverseDirCapture(fullpath, dirCallback, fileCallback);
        }
        continue;
      }
      fileCallback(fullpath);
    }
  }

  traverseDirBubble(dir, dirCallback, fileCallback) {
    for (const filename of fs.readdirSync(dir)) {
      const fullpath = path.resolve(dir, filename);
      if (fs.lstatSync(fullpath).isDirectory()) {
        this.traverseDirBubble(fullpath, dirCallback, fileCallback);
        dirCallback(fullpath);
      }
      else{
        fileCallback(fullpath);
      }
    }
  }

  emptyDir(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }

    this.traverseDirBubble(
      dir,
      dir => fs.rmdirSync(dir),
      file => fs.unlinkSync(file)
    );
  }

  prompt(questions) {
    process.send && process.send({ type: 'prompt' });
    process.emit('message', { type: 'prompt' });
    return super.prompt(questions);
  }
}

module.exports = BasicGenerator;
