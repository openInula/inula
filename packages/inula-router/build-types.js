import dts from 'rollup-plugin-dts';
import fs from 'fs';

function deleteFolder(filePath) {
  if (fs.existsSync(filePath)) {
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      const nextFilePath = `${filePath}/${file}`;
      const states = fs.statSync(nextFilePath);
      if (states.isDirectory()) {
        // recurse
        deleteFolder(nextFilePath);
      } else {
        // delete file
        fs.unlinkSync(nextFilePath);
      }
    });
    fs.rmdirSync(filePath);
  }
}

/**
 * rollup 删除文件夹插件
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

function routerTypeConfig() {
  return {
    input: './router/@types/router/index.d.ts',
    output: {
      file: './router/@types/index.d.ts',
      format: 'es',
    },
    plugins: [dts(), cleanUp(['./router/@types/history', './router/@types/router', './router/@types/matcher'])],
  };
}

function connectRouterTypeConfig() {
  return {
    input: './connectRouter/@types/router/index2.d.ts',
    output: {
      file: './connectRouter/@types/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts(),
      cleanUp([
        './connectRouter/@types/matcher',
        './connectRouter/@types/history',
        './connectRouter/@types/router',
        './connectRouter/@types/connect-router',
      ]),
    ],
  };
}

function vueRouterAdapterTypeConfig() {
  return {
    input: './vueRouterAdapter/@types/vue-router-adapter/index.d.ts',
    output: {
      file: './vueRouterAdapter/@types/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts(),
      cleanUp([
        './vueRouterAdapter/@types/vue-router-adapter',
        './vueRouterAdapter/@types/matcher',
        './vueRouterAdapter/@types/history',
      ]),
    ],
  };
}

export default [routerTypeConfig(), connectRouterTypeConfig(), vueRouterAdapterTypeConfig()];
