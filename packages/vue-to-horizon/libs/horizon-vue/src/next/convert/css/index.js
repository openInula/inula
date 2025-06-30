import fs from 'fs';
import postcss from 'postcss';
import selectorNamespace from 'postcss-selector-namespace';
import selectorParser from 'postcss-selector-parser';
import LOG from '../../logHelper.js';
import less from 'less';
import * as sass from 'sass';

const checkGlobalContext = node => {
  let parent = node.parent;
  while (parent) {
    if ((parent.type === 'pseudo' && parent.value === ':global') || parent.toString().startsWith(':global')) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
};

const addAttributePlugin = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-add-attribute',
    Rule(rule) {
      if (opts.hashCode) {
        rule.selectors = rule.selectors.map(selector => {
          return selectorParser(selectors => {
            let lastValidSelector = null;
            let isDeepSelector = false;

            selectors.walk((selector, index) => {
              if (selector.toString() === '::v-deep' && selector.type === 'pseudo') {
                isDeepSelector = true;
                selector.remove();
              }
              if ((selector.type === 'class' || selector.type === 'tag' || selector.type === 'id') && !checkGlobalContext(selector)) {
                lastValidSelector = selector;
              }
            });

            // 只给最后一个有效的选择器添加属性
            if (lastValidSelector && !isDeepSelector) {
              const attribute = selectorParser.attribute({
                attribute: opts.hashCode,
                value: '',
                raws: {},
                quoteMark: '',
              });
              lastValidSelector.parent.insertAfter(lastValidSelector, attribute);
            }
          }).processSync(selector);
        });
      }
    },
  };
};

/**
 * 为每个css内容添加命名空间
 * @param {*} css
 * @param {*} type
 * @param {*} scope
 * @returns
 */
export async function scopeCss(
  css,
  options = {
    type: 'css',
  }
) {
  let orgStr = css;
  if (options.type === 'less') {
    const result = await less.render(css);
    orgStr = result.css;
  } else if (options.type === 'scss') {
    const result = sass.renderSync({ data: css });
    orgStr = result.css;
  }
  // 使用PostCSS创建一个处理器，并使用postcss-selector-namespace插件
  return postcss()
    .use(addAttributePlugin({ hashCode: options.scope }))
    .process(orgStr)
    .then(result => {
      // console.log(result.css);
      return result.css;
    })
    .catch(e => {
      const mes = 'create Css file Error' + e.message;
      LOG.error(mes);
      throw mes;
    });
  /*
        .process(cssstr, {
      // 如果你的CSS是SCSS，你需要设置一个合适的语法解析器
      syntax: require('postcss-scss'),
    })
    */
}

export function correctedOuterClass(css, options) {
  const { scope, targetClass } = options;

  // 使用正则表达式匹配目标选择器
  const regex = new RegExp(`(${scope.replace('.', '\\.')})\\s+\\.(${targetClass})`, 'g');

  // 替换匹配的选择器
  return css.replace(regex, `$1.$2`);
}

/**
 * 处理css
 */
export default class CSShandler {
  cssstr = '';
  cssAst = null;

  constructor(cssstr) {
    this.cssstr = cssstr;
    this.cssAst = this.parseCss(cssstr);
  }

  /**
   * 解析css
   */
  parseCss(str) {
    let cssAst = null;
    less.parse(str, { javascriptEnabled: true }, (err, root, imports, options) => {
      if (err) {
        console.error(err);
      } else {
        cssAst = root;
      }
    });
    return cssAst;
  }

  /**
   * 添加css 上下文
   * @param {*} scopeName
   */
  addCssScope(scopeName) {
    // 创建一个新的选择器节点，这将是我们要添加的类
    const newSelector = new less.tree.Selector([new less.tree.Element('', `.${scopeName}`, false)]);

    // 新的规则集节点，它将包含原始规则集作为它的规则
    const newRuleset = new less.tree.Ruleset([newSelector], root.rules);

    // 将原始规则集替换为新的规则集
    this.cssAst.rules = [newRuleset];

    // 将修改后的AST转换回CSS
  }

  /**
   * 格式化
   * @returns
   */
  formatCss() {
    // return css.stringify(this.cssAst);
    let result = '';
    const cssCompiler = new less.ParseTree(this.cssAst);
    cssCompiler.toCSS({}, (err, output) => {
      if (err) {
        console.error(err);
      } else {
        result = output.css;
      }
    });
    return result;
  }
}

/**
 *
 * 转换vue中:deep()或::v-deep：CSS 深度选择器，用于穿透 scoped 样式 的作用域限制
 *  .clsA :deep(.childB){...}/.clsA::v-deep .childB{...}
 *  ==>
 *  .clsA {
 *    .childB {...}
 *  }
 * @param cssStr
 * @returns
 */
export function formatCssDeepSelectors(cssStr) {
  return cssStr
    .replace(/(::v-deep([^{]+)|:deep\(([^)]+)\))\s*{\s*([^}]*)\s*}/g,
      (match, p1, p2, p3, contentInside) => {
        const selector = p2 || p3; // 如果是 ::v-deep，则 p2 有值；如果是 :deep()，则 p3 有值
        // 格式化缩进
        const formattedInnerContent = contentInside
          .split('\n')
          .map(line => `  ${line}`) // 假设需要缩进两个空格
          .join('\n');

        return `${p2 ? ' ' : ''}{\n  ${selector} {\n  ${formattedInnerContent}}\n}`;
      });
}
