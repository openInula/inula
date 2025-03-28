import type { Options } from 'tsup';
import fs from 'fs';
// Banner for Vite, because babel work in cjs.
const banner = "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);";

// clean the dist folder manually
// beacuse tsup run configs in parallel, so it will be clean by other config
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

export default <Array<Options>>[
  {
    entry: [
      'src/*.ts',
      '!src/vite.ts', // This excludes vite.ts
    ],
    clean: false,
    format: ['cjs', 'esm'],
    dts: true,
    cjsInterop: true,
    splitting: true,
  },
  {
    entry: ['src/vite.ts'],
    clean: false,
    format: ['cjs', 'esm'],
    dts: true,
    cjsInterop: true,
    banner: {
      js: banner,
    },
  },
];
