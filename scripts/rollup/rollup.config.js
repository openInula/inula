import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import path from 'path';
import replace from '@rollup/plugin-replace';
import copy from './copy-plugin';
import { terser } from 'rollup-plugin-terser';
import { version as horizonVersion } from '@cloudsop/horizon/package.json';

const extensions = ['.js', '.ts'];

const libDir = path.join(__dirname, '../../libs/horizon');
const rootDir = path.join(__dirname, '../..');
const outDir = path.join(rootDir, 'build', 'horizon');
const outputResolve = (...p) => path.resolve(outDir, ...p);

function genConfig(mode) {
  const sourcemap = mode === 'development' ? 'inline' : false;
  return {
    input: path.resolve(libDir, 'index.ts'),
    output: [
      {
        file: outputResolve('cjs', `horizon.${mode}.js`),
        sourcemap,
        format: 'cjs',
      },
      {
        file: outputResolve('umd', `horizon.${mode}.js`),
        sourcemap,
        name: 'Horizon',
        format: 'umd',
      },
    ],
    plugins: [
      nodeResolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        exclude: 'node_modules/**',
        configFile: path.join(__dirname, '../../babel.config.js'),
        babelHelpers: 'runtime',
        extensions,
      }),
      replace({
        values: {
          'process.env.NODE_ENV': `"${mode}"`,
          isDev: 'true',
          __VERSION__: `"${horizonVersion}"`,
        },
        preventAssignment: true,
      }),
      mode === 'production' && terser(),
      copy([
        {
          from: path.join(libDir, 'index.js'),
          to: path.join(outDir, 'index.js'),
        },
        {
          from: path.join(libDir, 'package.json'),
          to: path.join(outDir, 'package.json'),
        },
      ]),
    ],
  };
}

export default [genConfig('development'), genConfig('production')];