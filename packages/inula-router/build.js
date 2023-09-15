import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routerEntry = path.join(__dirname, '/src/router/index.ts');
const connectRouterEntry = path.join(__dirname, '/src/router/index2.ts');

const output = __dirname;

const extensions = ['.js', '.ts', '.tsx'];

if (!fs.existsSync(path.join(output, 'connectRouter'))) {
  fs.mkdirSync(path.join(output, 'connectRouter'), { recursive: true });
}

const routerBuildConfig = mode => {
  const prod = mode.startsWith('prod');
  const outputList = [
    {
      file: path.join(output, `router/cjs/router.${prod ? 'min.' : ''}js`),
      sourcemap: 'true',
      format: 'cjs',
    },
    {
      file: path.join(output, `router/umd/router.${prod ? 'min.' : ''}js`),
      name: 'InulaRouter',
      sourcemap: 'true',
      format: 'umd',
    },
  ];
  if (!prod) {
    outputList.push({
      file: path.join(output, 'router/esm/router.js'),
      sourcemap: 'true',
      format: 'esm',
    });
  }
  return {
    input: routerEntry,
    output: outputList,
    plugins: [
      nodeResolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        exclude: 'node_modules/**',
        configFile: path.join(__dirname, '/babel.config.js'),
        babelHelpers: 'runtime',
        extensions,
      }),
      prod && terser(),
    ],
  };
};

const connectRouterConfig = mode => {
  const prod = mode.startsWith('prod');
  const outputList = [
    {
      file: path.join(output, `connectRouter/cjs/connectRouter.${prod ? 'min.' : ''}js`),
      sourcemap: 'true',
      format: 'cjs',
    },
    {
      file: path.join(output, `connectRouter/umd/connectRouter.${prod ? 'min.' : ''}js`),
      name: 'InulaRouter',
      sourcemap: 'true',
      format: 'umd',
    },
  ];
  if (!prod) {
    outputList.push({
      file: path.join(output, 'connectRouter/esm/connectRouter.js'),
      sourcemap: 'true',
      format: 'esm',
    });
  }
  return {
    input: connectRouterEntry,
    output: outputList,
    plugins: [
      nodeResolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        exclude: 'node_modules/**',
        configFile: path.join(__dirname, '/babel.config.js'),
        babelHelpers: 'runtime',
        extensions,
      }),
      prod && terser(),
      copyFiles([
        {
          from: path.join(__dirname, 'src/configs/package.json'),
          to: path.join(output, '/connectRouter/package.json'),
        },
      ]),
    ],
  };
};

function copyFiles(copyPairs) {
  return {
    name: 'copy-files',
    generateBundle() {
      copyPairs.forEach(({ from, to }) => {
        console.log(`copy files: ${from} → ${to}`);
        fs.copyFileSync(from, to);
      });
    },
  };
}

export default [
  routerBuildConfig('dev'),
  routerBuildConfig('prod'),
  connectRouterConfig('dev'),
  connectRouterConfig('prod'),
];
