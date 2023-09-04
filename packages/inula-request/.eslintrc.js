module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    root: true,

    plugins: ['jest', 'no-for-of-loops', 'no-function-declare-after-return', 'react', '@typescript-eslint'],

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
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        semi: ['warn', 'always'],
        quotes: ['warn', 'single'],
        'accessor-pairs': 'off',
        'brace-style': ['error', '1tbs'],
        'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
        'max-lines-per-function': 'off',
        'object-curly-newline': 'off',
        // 尾随逗号
        'comma-dangle': ['error', 'only-multiline'],
        'prefer-const': 'off',
        'no-constant-condition': 'off',
        'no-for-of-loops/no-for-of-loops': 'error',
        'no-function-declare-after-return/no-function-declare-after-return': 'error',
    },
    globals: {
        isDev: true,
        isTest: true,
    },
    overrides: [
        {
            files: ['scripts/__tests__/**/*.js'],
            globals: {
                container: true,
            },
        },
    ],
};
