import type { Options } from 'tsup';
// Banner for Vite, because babel work in cjs.
const banner = "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);";

export default <Array<Options>>[
  {
    entry: [
      'src/*.ts',
      '!src/vite.ts', // This excludes vite.ts
    ],
    clean: true,
    format: ['cjs', 'esm'],
    dts: true,
    cjsInterop: true,
    splitting: true,
  },
  {
    entry: ['src/vite.ts'],
    clean: true,
    format: ['cjs', 'esm'],
    dts: true,
    cjsInterop: true,
    banner: {
      js: banner,
    },
  },
];
