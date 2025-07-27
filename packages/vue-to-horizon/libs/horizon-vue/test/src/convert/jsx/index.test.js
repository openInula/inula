// 新增 vitest 全局 API 导入 (根据配置的 globals 设置可选)
import { describe, test, expect, vi, beforeEach } from 'vitest'; // 如果配置了 globals: true 可省略
import convertTemplate from '../../../../src/next/convert/jsx/index.js';
import { generateReactCode } from '../../util.js';
import SourceCodeContext from '../../../../src/next/convert/sourceCodeContext.js';

// Mock 工具函数修改为 vitest 的语法
vi.mock('@src/next/logHelper');

describe('Vue 模板转 React JSX 测试', () => {
  let mockReactConvert;

  beforeEach(() => {
    // new BaseCovertHandler(name, this.sourcePath, { isSetup, css: this.targetStyle, config }, {});
    mockReactConvert = {
      sourceCodeContext: new SourceCodeContext(),
      name: 'TodoItem',
      path: '/mock/path',
    };
  });

  describe('核心指令转换', () => {
    test('v-model 基础输入框转换', () => {
      const vueTemplate = `<input v-model="searchText" />`;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toMatchInlineSnapshot(`
        "<input value={searchText} onChange={($event) => {searchText = $event.target.value}} />"
      `);
    });

    test('v-model 复选框转换', () => {
      const vueTemplate = `<input type="checkbox" v-model="isChecked" />`;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toMatchInlineSnapshot(`
        "<input type=\\"checkbox\\" checked={isChecked} onChange={($event) => {isChecked = $event.target.checked}} />"
      `);
    });

    test('文件输入生成非受控组件', () => {
      const vueTemplate = `<input type="file" v-model="file" />`;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toMatchInlineSnapshot(`
        "<input type=\\"file\\" onChange={($event) => {file = $event.target.files}} />"
      `);
    });

    test('select v-modal绑定', () => {
      const vueTemplate = `<select v-model="selected" />`;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toMatchInlineSnapshot(`
        "<select value={selected} onChange={($event) => {selected = $event.target.value}} />"
      `);
    });
  });

  describe('组件名称转换', () => {
    test('自动转换短横线组件名为驼峰式', () => {
      const vueTemplate = `<todo-item />`;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toContain('<TodoItem />');
    });

    test('不转换原生 HTML 标签', () => {
      const vueTemplate = `<button type="primary">Click</button>`;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toMatchInlineSnapshot(`"<button type=\\"primary\\">Click</button>"`);
    });
  });

  describe('条件渲染处理', () => {
    test('v-if 转换为条件表达式', () => {
      const vueTemplate = `<div v-if="show">Content</div>`;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toMatchInlineSnapshot(`"<>{!!show && <div>Content</div>}</>"`);
    });

    test('多个根元素自动包裹 Fragment', () => {
      const vueTemplate = `
        <h1>Title</h1>
        <p>Content</p>
      `;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toMatch(/<Fragment>/);
    });
  });

  describe('列表渲染处理', () => {
    test('v-for 转换为 map 函数', () => {
      const vueTemplate = `<div><li v-for="item in items" :key="item.id">{{ item.text }}</li></div>`;
      const result = convertTemplate(vueTemplate, mockReactConvert);
      expect(generateReactCode(result)).toMatchInlineSnapshot(`
        "<div>{items && items.map((item, index) => {return <li key={item.id}>{item.text}</li>})}</div>"
      `);
    });
  });
});
