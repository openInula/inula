import prettier from 'prettier';
import LOG from './logHelper.js';
import { ESLint } from 'eslint';
import reactPlugin from 'eslint-plugin-react';
import jsxAllyPlugin from 'eslint-plugin-jsx-a11y';
import parser from '@babel/eslint-parser';
import importPlugin from 'eslint-plugin-import';
const defaultOption = {
  printWidth: 120, //一行120字符数，如果超过会进行换行
  tabWidth: 2, //tab等2个空格
  useTabs: false, //用空格缩进行
  semi: true, //行尾使用分号
  singleQuote: true, //字符串使用单引号
  quoteProps: 'as-needed', //仅在需要时在对象属性添加引号
  jsxSingleQuote: false, //在JSX中使用双引号
  bracketSpacing: true, //对象的括号间增加空格
  bracketSameLine: false, //将多行JSX元素的>放在最后一行的末尾
  endOfLine: 'lf', //仅限换行（\n）
  parser: 'babel',
};

const eslintOptions = {
  fix: true,
  fixTypes: ['directive', 'problem', 'suggestion', 'layout'],
  overrideConfigFile: true,
  overrideConfig: {
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxAllyPlugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // 移出冗余的fregment
      'react/jsx-no-useless-fragment': 'warn',
      // 对象属性简写
      'object-shorthand': ['warn', 'properties'],
      // 合并重复的import
      'import/no-duplicates': 'warn',
      // 禁止未使用变量,实测eslint无法自动修复该问题
      // 'no-unused-vars': ["warn", { args: 'after-used' }],
      // 标签自闭合
      'react/self-closing-comp': [
        'warn',
        {
          component: true,
          html: true,
        },
      ],
      // 标签对齐
      'react/jsx-closing-tag-location': ['warn', { location: 'tag-aligned' }],
    },
  },
};

async function formatCode(code) {
  const eslint = new ESLint(eslintOptions);
  try {
    // 使用 ESLint API 处理模板字符串
    const result = await eslint.lintText(code);
    return prettier.format(result[0].output || code, defaultOption);
  } catch (error) {
    const errormessage = 'format the file Error' + error.message;
    LOG.error(errormessage);
    throw errormessage;
  }
}

export default formatCode;
