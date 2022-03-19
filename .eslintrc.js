module.exports = {
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  root: true,

  plugins: [
    'jest',
    'no-for-of-loops',
    'no-function-declare-after-return',
    'react',
    '@typescript-eslint',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
    },
  },
  env: {
    browser: true,
    jest: true,
    node: true,
    es6: true,
  },

  rules: {
    'accessor-pairs': 'off',
    'brace-style': ['error', '1tbs'],
    'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
    'max-lines-per-function': 'off',
    'object-curly-newline': 'off',
    // 尾随逗号
    'comma-dangle': ['error', 'only-multiline'],

    'no-for-of-loops/no-for-of-loops': 'error',
    'no-function-declare-after-return/no-function-declare-after-return': 'error',
  },
};
