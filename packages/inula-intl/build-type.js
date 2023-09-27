import fs from 'fs';
import path from 'path';
import dts from 'rollup-plugin-dts';

function deleteFolder(filePath) {
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        const nextFilePath = path.join(filePath, file);
        const states = fs.lstatSync(nextFilePath);
        if (states.isDirectory()) {
          deleteFolder(nextFilePath);
        } else {
          fs.unlinkSync(nextFilePath);
        }
      });
      fs.rmdirSync(filePath);
    } else if (fs.lstatSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  }
}


/**
 *
 * @param folders {string[]}
 * @returns {{buildEnd(): void, name: string}}
 */
export function cleanUp(folders) {
  return {
    name: 'clean-up',
    buildEnd() {
      folders.forEach(f => deleteFolder(f));
    },
  };
}


function buildTypeConfig() {
  return {
    input: './build/@types/index.d.ts',
    output: {
      file: './build/index.d.ts',
      format: 'es',
    },
    plugins: [dts(), cleanUp(['./build/@types/example', './build/@types/src'])],
  };
}

export default [buildTypeConfig()];
