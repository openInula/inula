import path from 'path';
import { fileURLToPath } from 'url';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import execute from 'rollup-plugin-execute';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routerEntry = path.join(__dirname, '/src/router/index.ts');
const connectRouterEntry = path.join(__dirname, '/src/router/index2.ts');

const output = __dirname;

const extensions = ['.js', '.ts', '.tsx'];

if (!fs.existsSync(path.join(output, 'connectRouter'))) {
  fs.mkdirSync(path.join(output, 'connectRouter'), { recursive: true });
}

const routerBuildConfig = {
  input: { router: routerEntry },
  output: [
    {
      dir: path.resolve(output, 'router/cjs'),
      sourcemap: 'inline',
      format: 'cjs',
    },
    {
      dir: path.resolve(output, 'router/esm'),
      sourcemap: 'inline',
      format: 'esm',
    },
  ],
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
    execute('npm run build-types-router'),
  ],
};

const connectRouterConfig = {
  input: { connectRouter: connectRouterEntry },
  output: [
    {
      dir: path.resolve(output, 'connectRouter/cjs'),
      sourcemap: 'inline',
      format: 'cjs',
    },
    {
      dir: path.resolve(output, 'connectRouter/esm'),
      sourcemap: 'inline',
      format: 'esm',
    },
  ],
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
    execute('npm run build-types-all'),
    copyFiles([
      {
        from: path.join(__dirname, 'src/configs/package.json'),
        to: path.join(output, '/connectRouter/package.json'),
      },
    ]),
  ],
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


export default [routerBuildConfig, connectRouterConfig];
