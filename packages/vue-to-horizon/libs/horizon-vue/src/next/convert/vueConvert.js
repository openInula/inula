import t from '@babel/types';
import LOG from '../logHelper.js';
import convertTemplate from './jsx/index.js';
import convertJS from './js/index.js';
import BaseCovertHandler from './baseCovertHandler.js';
import { convertJsToAst } from './nodeUtils.js';
import generate from '@babel/generator';
import { formatCssDeepSelectors } from './css/index.js';

let babelGenerate = generate;
if (typeof generate.default === 'function') {
  babelGenerate = generate.default;
}
/**
 * 将js解析为ast树,通过对模板,样式，js的处理
 * @param {*} source
 * @param {*} option
 * @returns
 */
export default class VueConvert {
  source = {};
  option = {};
  sourceAst = null;
  baseCovertHandler = null;

  targetStyle = [];
  targetPath = '';
  sourcePath = '';

  constructor(source, option, fileConfig) {
    if (!source) {
      throw 'no convert context';
    }

    this.source = source;
    this.option = option;
    this.targetPath = fileConfig.targetPath;
    this.sourcePath = fileConfig.sourcePath;
  }

  async doConvert() {
    const { js = '', template = '', style = '', i18n = '' } = this.source;
    let { isSetup = false, lang = 'js', name, config, component } = this.option;

    try {
      // 编译js到AST
      this.sourceAst = convertJsToAst(js, { lang, isSetup });
    } catch (error) {
      LOG.error('trans source code to ast error: ', error.message, `[${this.sourcePath}]`);
    }

    // 编译style，将style收集到文件中
    if (style && Array.isArray(style)) {
      this.targetStyle = style.map(s => {
        const { content = '', scoped = false, lang = 'css' } = s || {};
        // 注释整改成css注释
        let commentContent = content.replace(/\/\/(.*?)\r\n/, '/** $1 */\r\n');
        if (scoped) {
          // vue中:deep()/::v-deep 是CSS深度选择器，用于穿透 scoped 样式 的作用域限制。需要转换
          commentContent = formatCssDeepSelectors(commentContent);
        }
        return {
          content: commentContent,
          scoped,
          lang,
        }
      });
    }

    this.baseCovertHandler = new BaseCovertHandler(name, this.sourcePath, {
      isSetup,
      css: this.targetStyle,
      config,
      template,
    }, {});

    // 存国际化内容，如：<i18n>{ "en": {}, "zh": {} }</i18n>
    this.baseCovertHandler.setI18n(i18n);

    // 加载配置内容
    if (config) {
      if (config.globalProperties) {
        this.baseCovertHandler.setGlobalProperties(config);
      }
    }

    try {
      // 转换vue js到Horizon，同时收集ref等等变量
      convertJS(this.sourceAst, this.baseCovertHandler, { component, config });
    } catch (error) {
      LOG.error('trans js code error in VueConvert: ', error.message, `[${this.sourcePath}]`);
    }

    try {
      // 编译 template
      const jsx = convertTemplate(template, this.baseCovertHandler, component);
      this.baseCovertHandler.setHorizonJSX(jsx);
    } catch (error) {
      LOG.error('trans template code error: ', error.message, `[${this.sourcePath}]`);
    }

    this.afterConvert();
  }

  afterConvert() {
    this.baseCovertHandler.addUseGlobalProperties();

    this.baseCovertHandler.addUseI18n();

    this.baseCovertHandler.insertExtrasImport();

    // 在代码末尾增加 export default 语句
    this.baseCovertHandler.addExportDefault();
  }

  getNewCode() {
    return babelGenerate(this.baseCovertHandler.targetAst).code;
  }

  getNewStyle() {
    return this.targetStyle;
  }
}
