/**
 * Role Selector Utils Unit Tests
 * 专门测试 XPath 生成逻辑
 */

import {
  buildRoleXPathWithName,
  getRoleSelector,
  elementMatchesAccessibleName,
  buildGetByLabelSelector,
  buildGetByTextSelector,
  elementMatchesText
} from '../role-selector-utils.js';

describe('role-selector-utils', () => {
  describe('buildRoleXPathWithName', () => {
    it('should generate valid XPath for role with name', () => {
      const xpath = buildRoleXPathWithName('row', '名称 告警ID 分组名称', { exact: true });
      
      // XPath 不应该包含无效的 //[ 格式
      expect(xpath).not.toContain('//[@role="row"]');
      // 应该包含有效的 //*[@role="row"] 格式
      expect(xpath).toContain('//*[@role="row"]');
      // 应该包含名称匹配条件
      expect(xpath).toContain('名称 告警ID 分组名称');
    });

    it('should handle role selectors with empty tag names correctly', () => {
      // 测试纯属性选择器 [role="row"] 的情况
      const xpath = buildRoleXPathWithName('row', 'test', { exact: true });
      
      // 验证生成的 XPath 是有效的
      expect(xpath).toMatch(/\/\/\*\[@role="row"\]/);
      expect(() => {
        document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      }).not.toThrow();
    });

    it('should generate valid XPath for multiple selectors', () => {
      // 测试包含多个选择器的角色
      const xpath = buildRoleXPathWithName('button', 'Submit', { exact: true });
      
      // 确保生成的 XPath 是有效的
      expect(xpath).toBeTruthy();
      expect(() => {
        document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      }).not.toThrow();
    });

    it('should handle exact vs non-exact matching', () => {
      const exactXPath = buildRoleXPathWithName('button', 'Click', { exact: true });
      const partialXPath = buildRoleXPathWithName('button', 'Click', { exact: false });
      
      // 精确匹配应该使用 = 
      expect(exactXPath).toContain('="Click"');
      // 部分匹配应该使用 contains
      expect(partialXPath).toContain('contains(');
    });

    it('should handle complex attribute selectors correctly', () => {
      // 测试复杂的选择器，如 input[type="button"]
      const xpath = buildRoleXPathWithName('textbox', 'Search', { exact: true });
      
      // 应该正确处理 input 标签的各种 type 属性
      expect(xpath).toBeTruthy();
      expect(() => {
        document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      }).not.toThrow();
    });
  });

  describe('getRoleSelector', () => {
    it('should return correct CSS selector for known roles', () => {
      expect(getRoleSelector('button')).toContain('button');
      expect(getRoleSelector('button')).toContain('[role="button"]');
      
      expect(getRoleSelector('row')).toContain('tr');
      expect(getRoleSelector('row')).toContain('[role="row"]');
    });

    it('should handle heading with level', () => {
      expect(getRoleSelector('heading', { level: 1 })).toContain('h1');
      expect(getRoleSelector('heading', { level: 2 })).toContain('h2');
    });

    it('should fallback to role attribute for unknown roles', () => {
      expect(getRoleSelector('unknown-role')).toBe('[role="unknown-role"]');
    });
  });

  describe('elementMatchesAccessibleName', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('button');
      document.body.appendChild(element);
    });

    afterEach(() => {
      element.remove();
    });

    it('should match aria-label', () => {
      element.setAttribute('aria-label', 'Test Button');
      expect(elementMatchesAccessibleName(element, 'Test Button', true)).toBe(true);
      expect(elementMatchesAccessibleName(element, 'Test', false)).toBe(true);
      expect(elementMatchesAccessibleName(element, 'Other', true)).toBe(false);
    });

    it('should match empty string for elements without accessible name', () => {
      expect(elementMatchesAccessibleName(element, '', true)).toBe(true);
      
      element.setAttribute('aria-label', 'Has label');
      expect(elementMatchesAccessibleName(element, '', true)).toBe(false);
    });

    it('should match text content', () => {
      element.textContent = 'Button Text';
      expect(elementMatchesAccessibleName(element, 'Button Text', true)).toBe(true);
      expect(elementMatchesAccessibleName(element, 'Button', false)).toBe(true);
    });

    it('should match title attribute', () => {
      element.setAttribute('title', 'Button Title');
      expect(elementMatchesAccessibleName(element, 'Button Title', true)).toBe(true);
    });

    it('should match table row accessible name from cell contents', () => {
      // 创建表格行结构，模拟用户提供的 HTML
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const row = document.createElement('tr');
      
      // 添加复选框单元格（应该被忽略或提取正确文本）
      const checkboxCell = document.createElement('th');
      checkboxCell.className = 'eui-table-cell eui-table-selection-cell';
      checkboxCell.innerHTML = `
        <label class="eui-checkbox-pro-wrapper">
          <span class="eui-checkbox-pro">
            <input class="eui-checkbox-pro-input" type="checkbox">
            <span class="eui-checkbox-pro-inner"></span>
          </span>
        </label>
      `;
      
      // 添加名称单元格
      const nameCell = document.createElement('th');
      nameCell.title = '名称';
      nameCell.className = 'eui-table-cell eui-table-cell-ellipsis';
      nameCell.innerHTML = `
        <div class="eui-table-column-sorter">
          <div class="eui-table-column-sorter-title eui-table-column-title-content">名称</div>
          <span class="eui-table-sorter eui-table-sorter-aui3" tabindex="0"></span>
        </div>
        <div class="eui-table-resizable-bar"></div>
      `;
      
      // 添加告警ID单元格
      const idCell = document.createElement('th');
      idCell.title = '告警ID';
      idCell.className = 'eui-table-cell eui-table-cell-ellipsis';
      idCell.innerHTML = `
        <div class="eui-table-column-sorter">
          <div class="eui-table-column-sorter-title eui-table-column-title-content">告警ID</div>
          <span class="eui-table-sorter eui-table-sorter-aui3" tabindex="0"></span>
        </div>
        <div class="eui-table-resizable-bar"></div>
      `;
      
      // 添加分组名称单元格
      const groupCell = document.createElement('th');
      groupCell.title = '分组名称';
      groupCell.className = 'eui-table-cell eui-table-cell-ellipsis';
      groupCell.innerHTML = `
        <div class="eui-table-column-sorter">
          <div class="eui-table-column-sorter-title eui-table-column-title-content">分组名称</div>
          <span class="eui-table-sorter eui-table-sorter-aui3" tabindex="0"></span>
        </div>
        <div class="eui-table-resizable-bar"></div>
      `;
      
      row.appendChild(checkboxCell);
      row.appendChild(nameCell);
      row.appendChild(idCell);
      row.appendChild(groupCell);
      thead.appendChild(row);
      table.appendChild(thead);
      document.body.appendChild(table);
      
      // 测试表格行能否匹配包含的文本
      expect(elementMatchesAccessibleName(row, '名称 告警ID 分组名称', true)).toBe(true);
      expect(elementMatchesAccessibleName(row, '名称 告警ID', false)).toBe(true);
      expect(elementMatchesAccessibleName(row, '不存在的文本', true)).toBe(false);
      
      // 清理
      table.remove();
    });

    it('should handle table rows with mixed content correctly', () => {
      const row = document.createElement('tr');
      
      // 单元格1：只有文本
      const cell1 = document.createElement('td');
      cell1.textContent = 'Cell 1';
      
      // 单元格2：有复杂结构
      const cell2 = document.createElement('td');
      cell2.innerHTML = '<div>Cell <span>2</span></div>';
      
      // 单元格3：有aria-label
      const cell3 = document.createElement('td');
      cell3.setAttribute('aria-label', 'Cell 3 Label');
      cell3.textContent = 'Cell 3 Text'; // 应该使用 aria-label
      
      row.appendChild(cell1);
      row.appendChild(cell2);
      row.appendChild(cell3);
      document.body.appendChild(row);
      
      // 应该匹配所有单元格文本的组合
      expect(elementMatchesAccessibleName(row, 'Cell 1 Cell 2 Cell 3 Label', true)).toBe(true);
      expect(elementMatchesAccessibleName(row, 'Cell 1', false)).toBe(true);
      expect(elementMatchesAccessibleName(row, 'Cell 3 Label', false)).toBe(true);
      
      // 清理
      row.remove();
    });
  });

  describe('buildGetByLabelSelector', () => {
    it('should generate XPath for label association', () => {
      const selector = buildGetByLabelSelector('Username', true);
      expect(selector.startsWith('xpath=')).toBe(true);
      expect(selector).toContain('Username');
    });

    it('should handle exact vs partial matching', () => {
      const exactSelector = buildGetByLabelSelector('Username', true);
      const partialSelector = buildGetByLabelSelector('Username', false);
      
      expect(exactSelector).toContain('="Username"');
      expect(partialSelector).toContain('contains(');
    });
  });

  describe('buildGetByTextSelector', () => {
    it('should generate XPath for text matching', () => {
      const selector = buildGetByTextSelector('Click me');
      expect(selector.startsWith('xpath=')).toBe(true);
      expect(selector).toContain('Click me');
    });

    it('should handle exact vs partial text matching', () => {
      const exactSelector = buildGetByTextSelector('Click', true);
      const partialSelector = buildGetByTextSelector('Click', false);
      
      expect(exactSelector).toContain('="Click"');
      expect(partialSelector).toContain('contains(');
    });
  });

  describe('XPath Validation Tests', () => {
    it('should generate valid XPath expressions that can be evaluated', () => {
      const testCases = [
        { role: 'row', name: '名称 告警ID 分组名称' },
        { role: 'button', name: 'Submit' },
        { role: 'textbox', name: 'Search' },
        { role: 'checkbox', name: '' },
        { role: 'link', name: 'Home Page' }
      ];

      testCases.forEach(({ role, name }) => {
        const xpath = buildRoleXPathWithName(role, name, { exact: true });
        expect(() => {
          document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        }).not.toThrow(`XPath should be valid for role=${role}, name=${name}: ${xpath}`);
      });
    });

    it('should not generate XPath with invalid syntax like //[@attr]', () => {
      const xpath = buildRoleXPathWithName('row', 'test', { exact: true });
      
      // 不应该包含无效的 //[ 语法
      expect(xpath).not.toMatch(/\/\/\[@/);
      // 应该包含有效的 //*[@ 语法
      expect(xpath).toMatch(/\/\/\*\[@/);
    });
  });

  describe('Complex Text Matching (hasText behavior)', () => {
    it('should match complex nested text like Playwright hasText filter', () => {
      // 创建复杂的嵌套结构，模拟用户提供的示例
      const conditionDiv = document.createElement('div');
      conditionDiv.className = 'conditionRow dynamicRow';
      conditionDiv.innerHTML = `
        <label title="最近发生时间:" class="link_label">最近发生时间:</label>
        <div class="condition_content">
          <span class="timeLabel">从</span>
          <input type="text">
          <span class="timeLabel">到</span>
          <input type="text">
          <span class="timeLabel">最近</span>
          <input type="text">
          <label class="eui_label eui_radio_label">天</label>
          <label class="eui_label eui_radio_label">小时</label>
          <label class="eui_label eui_radio_label">分钟</label>
        </div>
      `;
      
      document.body.appendChild(conditionDiv);
      
      // 测试实际情况：元素包含这些文本，但可能有空格分隔
      // Playwright 的 hasText 会匹配包含关系，所以我们应该能匹配各个部分
      expect(elementMatchesText(conditionDiv, '最近发生时间')).toBe(true);
      expect(elementMatchesText(conditionDiv, '从')).toBe(true);
      expect(elementMatchesText(conditionDiv, '到')).toBe(true);
      expect(elementMatchesText(conditionDiv, '最近')).toBe(true);
      expect(elementMatchesText(conditionDiv, '天')).toBe(true);
      expect(elementMatchesText(conditionDiv, '小时')).toBe(true);
      expect(elementMatchesText(conditionDiv, '分钟')).toBe(true);
      
      // 测试更现实的组合匹配（考虑可能的空格）
      expect(elementMatchesText(conditionDiv, '最近发生时间: 从')).toBe(true);
      expect(elementMatchesText(conditionDiv, '从 到 最近')).toBe(true);
      expect(elementMatchesText(conditionDiv, '天 小时 分钟')).toBe(true);
      
      // 测试不匹配的情况
      expect(elementMatchesText(conditionDiv, '不存在的文本')).toBe(false);
      
      // 清理
      conditionDiv.remove();
    });

    it('should handle text normalization correctly', () => {
      const testDiv = document.createElement('div');
      testDiv.innerHTML = `
        <span>  文本1  </span>
        <div>
          文本2
        </div>
        <p>文本3</p>
      `;
      
      document.body.appendChild(testDiv);
      
      // 应该能匹配规范化后的文本（空白字符被合并）
      expect(elementMatchesText(testDiv, '文本1 文本2 文本3')).toBe(true);
      expect(elementMatchesText(testDiv, '文本1  文本2  文本3')).toBe(true); // 多个空格也应该匹配
      
      // 清理
      testDiv.remove();
    });

    it('should skip hidden elements in text extraction', () => {
      const testDiv = document.createElement('div');
      testDiv.innerHTML = `
        <span>可见文本</span>
        <span style="display: none;">隐藏文本</span>
        <span style="visibility: hidden;">不可见文本</span>
        <span>另一个可见文本</span>
      `;
      
      document.body.appendChild(testDiv);
      
      // 应该只匹配可见文本
      expect(elementMatchesText(testDiv, '可见文本 另一个可见文本')).toBe(true);
      expect(elementMatchesText(testDiv, '隐藏文本')).toBe(false);
      expect(elementMatchesText(testDiv, '不可见文本')).toBe(false);
      
      // 清理
      testDiv.remove();
    });

    it('should match text with RegExp patterns', () => {
      const testDiv = document.createElement('div');
      testDiv.textContent = '测试文本 123 结束';
      
      document.body.appendChild(testDiv);
      
      // 正则表达式匹配
      expect(elementMatchesText(testDiv, /测试.*结束/)).toBe(true);
      expect(elementMatchesText(testDiv, /^\d+$/)).toBe(false);
      expect(elementMatchesText(testDiv, /\d+/)).toBe(true);
      
      // 清理
      testDiv.remove();
    });

    it('should handle exact vs contains matching', () => {
      const testDiv = document.createElement('div');
      testDiv.innerHTML = `<span>完整文本内容</span>`;
      
      document.body.appendChild(testDiv);
      
      // 包含匹配（默认）
      expect(elementMatchesText(testDiv, '完整文本内容', false)).toBe(true);
      expect(elementMatchesText(testDiv, '文本', false)).toBe(true);
      expect(elementMatchesText(testDiv, '内容', false)).toBe(true);
      
      // 精确匹配
      expect(elementMatchesText(testDiv, '完整文本内容', true)).toBe(true);
      expect(elementMatchesText(testDiv, '文本', true)).toBe(false);
      expect(elementMatchesText(testDiv, '内容', true)).toBe(false);
      
      // 清理
      testDiv.remove();
    });

    it('should handle flexible space matching', () => {
      // 测试灵活的空格匹配功能
      const testDiv = document.createElement('div');
      testDiv.innerHTML = '最近发生事件：从 到 最近 天 小时 分钟';
      document.body.appendChild(testDiv);
      
      // 测试各种空格匹配情况
      expect(elementMatchesText(testDiv, '最近发生事件：从到最近天小时分钟')).toBe(true); // 无空格匹配有空格
      expect(elementMatchesText(testDiv, '最近发生事件：从 到 最近 天 小时 分钟')).toBe(true); // 完全匹配
      expect(elementMatchesText(testDiv, '从 到')).toBe(true); // 部分匹配有空格
      expect(elementMatchesText(testDiv, '从到')).toBe(true); // 部分匹配无空格
      expect(elementMatchesText(testDiv, '发生事件：从到最近')).toBe(true); // 跨空格匹配
      
      // 清理
      testDiv.remove();
    });
  });
});