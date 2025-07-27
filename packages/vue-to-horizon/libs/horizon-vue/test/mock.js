import fs from 'fs';
import { parse } from '@vue/compiler-sfc';
import LOG from '../src/next/logHelper.js';
import VueConvert from '../src/next/convert/vueConvert.js';
import formatCode from '../src/next/formatOutFile.js';
import { lintTemplate } from '../src/next/convert/index.js';

export async function transform(sourceStr, option) {
  // 解析 .vue 文件，获取解析结果
  const parsed = parse(sourceStr);
  const template = await lintTemplate(parsed.descriptor.template?.content);

  const isSetup = !!parsed.descriptor.scriptSetup;
  const tool = new VueConvert(
    {
      js: isSetup ? parsed.descriptor.scriptSetup?.content : parsed.descriptor.script?.content,
      template: template,
      style: parsed.descriptor.styles,
    },
    {
      lang: parsed.descriptor.scriptSetup?.lang,
      isSetup,
      name: 'App',
      component: option?.component,
      config: option?.config,
    },
    {
      targetPath: '',
      sourcePath: '',
    }
  );
  await tool.doConvert();
  const convertedCode = formatCode(tool.getNewCode());
  return convertedCode;
}
