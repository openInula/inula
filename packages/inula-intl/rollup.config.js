import path from 'path';
import { fileURLToPath } from 'url';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import { terser } from 'rollup-plugin-terser';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entry = path.join(__dirname, '/index.ts');

const output = path.join(__dirname, '/build');

const extensions = ['.js', '.ts', '.tsx'];

export default {
    input: entry,
    output: [
        {
            file: path.resolve(output, 'intl.umd.js'),
            sourcemap: 'inline',
            name: 'I18n',
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
            configFile: path.join(__dirname, '/babel.config.js'),
            extensions,
        }),
        typescript(
            {
                tsconfig: 'tsconfig.json',
                include: ['./**/*.ts', './**/*.tsx'],
            }
        ),
      terser(),
    ],
    external:[
        "inulajs",
        "react",
        "react-dom"
    ]
};
