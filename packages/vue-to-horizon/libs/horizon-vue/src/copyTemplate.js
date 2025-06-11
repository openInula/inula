import { resolve } from 'path';
import pkg from 'fs-extra';
const { existsSync, mkdirsSync, readdirSync, rmSync, copySync } = pkg;
import sw from './sw.js';
const { start, log } = sw;

import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的 URL 路径
const __filename = fileURLToPath(import.meta.url);

// 获取当前文件所在目录的路径
const __dirname = path.dirname(__filename);

const templatePath = resolve(__dirname, '../template');
const adapterPath = resolve(__dirname, '../adapters');
const horizonPath = resolve(__dirname, '../../../build/horizon');

function copyTemplate(targetLocation, noRemove) {
  let handle = start('Old data removal');
  if (!existsSync(targetLocation)) {
    mkdirsSync(targetLocation);
  }
  let filenames = readdirSync(targetLocation);
  filenames.forEach(file => {
    if (noRemove || file === 'node_modules') return;
    rmSync(resolve(targetLocation, file), { recursive: true, force: true });
  });
  log(handle);

  handle = start('template copy');
  filenames = readdirSync(templatePath);
  filenames.forEach(file => {
    if (noRemove || file === 'node_modules') return;
    copySync(resolve(templatePath, file), resolve(targetLocation, file), {
      overwrite: true,
      filter: (src, tar) => {
        // NOTE: add filter if needed
        return true;
      },
      recursive: true,
    });
  });

  log(handle);
  handle = start('adapters copy');
  filenames = readdirSync(adapterPath);
  filenames.forEach(file => {
    if (noRemove || file === 'node_modules') return;
    // Adpter js
    copySync(resolve(adapterPath, file), resolve(targetLocation, 'adapters', file), {
      overwrite: true,
      filter: (src, tar) => {
        // NOTE: add filter if needed
        return true;
      },
      recursive: true,
    });
  });
  log(handle);
}

export default copyTemplate;
