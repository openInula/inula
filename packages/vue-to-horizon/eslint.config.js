import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      '*.min.js',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
];
