import fs from 'fs';
import path from 'path';
import dts from 'rollup-plugin-dts';

function deleteFolder(filePath) {
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        const nectFilePath = path.join(filePath, file);
        const states = fs.lstatSync(nectFilePath);
        if (states.isDirectory()) {
          deleteFolder(nectFilePath);
        } else {
          fs.unlinkSync(nectFilePath);
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
      folders.forEach(folder => deleteFolder(folder));
    },
  };
}

function builderTypeConfig() {
  return {
    input: './build/@types/index.d.ts',
    output: {
      file: './build/@types/index.d.ts',
      format: 'es',
    },
    plugins: [dts(), cleanUp(['./build/@types/example', './build/@types/src'])],
  };
}

export default [builderTypeConfig()];
