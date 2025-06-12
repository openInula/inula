import fs from 'fs';
import LOG from '../logHelper.js';
import formatCode from '../formatOutFile.js';
import fepkg from 'fs-extra';
import { parse, compileTemplate } from '@vue/compiler-sfc';
import VueConvert from './vueConvert.js';
import VueJsConvert from './vuejsConvert.js';
import path from 'path';
import { ESLint } from 'eslint';
import parser from 'vue-eslint-parser';
import vue from 'eslint-plugin-vue';

const { writeFileSync } = fepkg;
function getFileName(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * eslint处理模版
 * @param templateString
 * @returns string
 */
export async function lintTemplate(templateString) {
  if (!templateString) {
    return '';
  }
  const template = `<template>${templateString}</template>`;
  const eslint = new ESLint({
    fix: true,
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {
        parser: parser, // 使用 vue-eslint-parser 解析 Vue 模板
      },
      plugins: { vue }, // 使用 vue 插件
      rules: {
        'vue/html-self-closing': [
          'error',
          {
            html: {
              void: 'always',
              normal: 'never',
              component: 'always',
            },
          },
        ],
        'vue/v-bind-style': 'error',
      },
    },
  });
  // 使用 ESLint API 处理模板字符串
  const result = await eslint.lintText(template);
  if (result[0].output) {
    let lintStr = result[0].output.slice(10, result[0].output.length - 11);

    // <div :isWarn=false></div> 会被ESLint转成： <div :isWarn=false//////////>，这进行一个矫正
    return correctTenSlashes(lintStr);
  }
  return templateString;
}

/**
 * 修正 Vue 模板中由 ESLint 自动格式化导致的恰好 10 个连续斜杠
 * 例如: <div :isWarn=false//////////> 转换为 <div :isWarn=false />
 *
 * @param {string} input - 输入的 Vue 模板字符串
 * @returns {string} 修正后的字符串
 */
function correctTenSlashes(input) {
  return input.replace(/(\S)\s*\/\/\/\/\/\/\/\/\/\/>/g, (match, precedingChar) => {
    return `${precedingChar} />`;
  });
}

/**
 * vue转换
 * @param {*} srcPath
 * @param {*} targetPath
 * @param {*} option
 */
export async function vueFileConvert(srcPath, targetPath, option) {
  const sourceStr = fs.readFileSync(srcPath, 'utf8');

  // 解析 .vue 文件，获取解析结果
  const parsed = parse(sourceStr);
  const template = await lintTemplate(parsed.descriptor.template?.content);

  const isSetup = !!parsed.descriptor.scriptSetup;
  LOG.info('[start] covert the file ', srcPath);

  const tool = new VueConvert(
    {
      js: isSetup ? parsed.descriptor.scriptSetup?.content : parsed.descriptor.script?.content,
      template: template,
      style: parsed.descriptor.styles,
      i18n: parsed.descriptor.customBlocks.find(block => block.type === 'i18n')?.content || ''
    },
    {
      lang: parsed.descriptor.scriptSetup?.lang,
      isSetup,
      name: getFileName(srcPath),
      component: option?.component,
      config: option?.config,
    },
    {
      targetPath,
      sourcePath: srcPath,
    }
  );

  tool.doConvert().then(async () => {
    try {
      writeFileSync(targetPath, await formatCode(tool.getNewCode()));
      LOG.info('[end] covert the file ', targetPath);
    } catch (error) {
      LOG.error('writeFileSync js error  -->  ', targetPath);
      LOG.error(error.message);
    }
    try {
      const cssList= tool.getNewStyle();
      if (cssList && cssList.length > 0) {
        cssList.forEach(({ scoped, lang, content }) => {
          // writeFileSync：如果文件不存在，就会创建；如果存在，就会覆盖。使用 'a' 模式：追加内容，不覆盖
          writeFileSync(targetPath.replace(/\.jsx$/g, `${scoped ? '.scoped' : ''}.${lang}`), content, { flag: 'a' });
        });
      }
    } catch (error) {
      LOG.error('writeFileSync css error  -->  ', targetPath.replace(/\.jsx$/g, '.css'));
      LOG.error(error.message);
    }
  });
}

export function vueJsFileConvert(srcPath, targetPath, option) {
  const sourceStr = fs.readFileSync(srcPath, 'utf8');
  if (!sourceStr) {
    return;
  }
  const tool = new VueJsConvert(
    sourceStr,
    { ts: srcPath.endsWith('.ts'), component: option?.component },
    {
      targetPath,
      sourcePath: srcPath,
    }
  );

  tool.convert().then(async newJsStr => {
    try {
      writeFileSync(targetPath, await formatCode(newJsStr));
      LOG.info('[end] covert the file ', targetPath);
    } catch (error) {
      LOG.error('writeFileSync js error  -->  ', targetPath);
      LOG.error(error.message);
    }
  });
}
