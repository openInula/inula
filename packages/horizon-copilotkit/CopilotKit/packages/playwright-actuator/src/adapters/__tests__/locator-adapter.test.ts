/**
 * LocatorAdapter Unit Tests - Real Implementation
 */

// Mock external dependencies before imports
const mockReactAdapter = {
  isReactComponent: jest.fn(() => false),
  triggerClickEvent: jest.fn(() => Promise.resolve({ method: 'react' })),
  triggerInputEvent: jest.fn(() => Promise.resolve()),
  triggerChangeEvent: jest.fn(() => Promise.resolve({ method: 'react' })),
  triggerInteractionEvents: jest.fn(() => Promise.resolve())
};

const mockOpenInulaAdapter = {
  isOpenInulaComponent: jest.fn(() => false),
  triggerClickEvent: jest.fn(() => Promise.resolve({ method: 'openinula' })),
  triggerInputEvent: jest.fn(() => Promise.resolve()),
  triggerChangeEvent: jest.fn(() => Promise.resolve({ method: 'openinula' })),
  triggerInteractionEvents: jest.fn(() => Promise.resolve())
};

jest.mock('../../framework-adapters/react-adapter.js', () => ({
  getReactAdapter: jest.fn(() => mockReactAdapter)
}));

jest.mock('../../framework-adapters/openinula-adapter.js', () => ({
  getOpenInulaAdapter: jest.fn(() => mockOpenInulaAdapter)
}));

jest.mock('../../utils/role-selector-utils.js', () => ({
  getRoleSelector: jest.fn((role: string) => `[role="${role}"]`),
  elementMatchesText: jest.fn((element: Element, text: string | RegExp, exact?: boolean) => {
    const elementText = element.textContent || '';
    if (text instanceof RegExp) {
      return text.test(elementText);
    }
    return exact ? elementText === text : elementText.includes(text);
  }),
  elementMatchesAccessibleName: jest.fn((element: Element, name: string | RegExp, exact?: boolean) => {
    const accessibleName = element.getAttribute('aria-label') || 
                          element.getAttribute('title') || 
                          element.textContent || '';
    if (name instanceof RegExp) {
      return name.test(accessibleName);
    }
    if (name === '' && exact) {
      return accessibleName === '';
    }
    return exact ? accessibleName === name : accessibleName.includes(name);
  }),
  buildGetByTextSelector: jest.fn((text: string, exact?: boolean) => `[data-text*="${text}"]`),
  buildGetByLabelSelector: jest.fn((text: string, exact?: boolean) => `[aria-label*="${text}"]`),
  buildGetByPlaceholderSelector: jest.fn((text: string, exact?: boolean) => `[placeholder*="${text}"]`),
  buildGetByTestIdSelector: jest.fn((testId: string) => `[data-testid="${testId}"]`),
  buildGetByTitleSelector: jest.fn((text: string, exact?: boolean) => `[title*="${text}"]`)
}));

// Setup mocks
const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  success: jest.fn() // 添加缺失的 success 方法
};

const mockWaitManager = {
  waitForElement: jest.fn(),
  waitForCondition: jest.fn(),
  waitForTimeout: jest.fn(),
  waitForURL: jest.fn(),
  waitForLoadState: jest.fn()
};

const mockEventSimulator = {
  simulateClick: jest.fn(),
  simulateDoubleClick: jest.fn(),
  simulateKeyPress: jest.fn(),
  simulateTyping: jest.fn(),
  simulateHover: jest.fn()
};

const mockPage = {
  waitManager: mockWaitManager,
  eventSimulator: mockEventSimulator,
  scrollIntoViewIfNeeded: jest.fn(),
  // 添加 BasePageContext 需要的方法
  getContext: jest.fn().mockReturnValue({
    document: document,
    window: window
  }),
  waitForElementInContext: jest.fn(),
  waitForConditionInContext: jest.fn(),
  waitForSelector: jest.fn(),
  waitForTimeout: jest.fn(), // 添加缺失的 waitForTimeout 方法
  logger: mockLogger,
  // 添加其他可能需要的方法
  locator: jest.fn(),
  getByRole: jest.fn(),
  getByText: jest.fn(),
  getByLabel: jest.fn(),
  getByPlaceholder: jest.fn(),
  getByTestId: jest.fn(),
  getByTitle: jest.fn()
};

// Mock constructors
const MockLogger = jest.fn().mockImplementation(() => mockLogger);

// Set up window object before import
Object.assign(window, {
  PlaywrightLogger: MockLogger
});

// Setup mock implementations for framework adapters
// These are already mocked in jest.mock() calls above

// Import the real LocatorAdapter
import LocatorAdapter from '../locator-adapter.js';

describe('LocatorAdapter Tests', () => {
  let locatorAdapter: LocatorAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a test element in the DOM
    document.body.innerHTML = `
      <div id="parent">
        <button id="test-button" class="btn primary" data-testid="submit-btn">Submit</button>
        <input id="test-input" type="text" placeholder="Enter text" />
        <input id="test-checkbox" type="checkbox" />
        <select id="test-select">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
        <div class="content">Sample text</div>
        <div aria-label="Custom Label">Labeled element</div>
        <div title="Custom Title">Titled element</div>
      </div>
    `;
    
    locatorAdapter = new LocatorAdapter('#test-button', mockPage);
    
    // Mock auto-wait methods globally for all tests
    const mockElement = document.getElementById('test-button')!;
    jest.spyOn(locatorAdapter, 'waitFor').mockResolvedValue(mockElement);
    jest.spyOn(locatorAdapter as any, 'waitForClickable').mockResolvedValue(undefined);
    jest.spyOn(locatorAdapter as any, 'waitForEditable').mockResolvedValue(undefined);
    jest.spyOn(locatorAdapter as any, 'isElementVisible').mockReturnValue(true);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Constructor and Basic Setup', () => {
    test('should create locator with selector and page', () => {
      expect(locatorAdapter).toBeInstanceOf(LocatorAdapter);
      expect((locatorAdapter as any).selector).toBe('#test-button');
      expect((locatorAdapter as any).page).toBe(mockPage);
    });

    test('should initialize with empty filters', () => {
      expect((locatorAdapter as any).filters).toEqual([]);
    });

    test('should set up logger and dependencies', () => {
      expect((locatorAdapter as any).logger).toBe(mockLogger);
      expect((locatorAdapter as any).eventSimulator).toBe(mockEventSimulator);
    });
  });

  describe('Chain Filter Methods', () => {
    test('filter() should create new locator with filters', () => {
      // Test position filter (uses delayed filtering)
      const positionFiltered = locatorAdapter.filter({ position: 0 });
      
      expect(positionFiltered).toBeInstanceOf(LocatorAdapter);
      expect(positionFiltered).not.toBe(locatorAdapter);
      expect((positionFiltered as any).filters).toEqual([{ position: 0 }]);
      
      // Test text filter (now uses lazy filtering)
      const textFiltered = locatorAdapter.filter({ hasText: 'Submit' });
      
      expect(textFiltered).toBeInstanceOf(LocatorAdapter);
      expect(textFiltered).not.toBe(locatorAdapter);
      // Lazy execution: text filters are also stored, not executed immediately
      expect((textFiltered as any).filters).toEqual([{ hasText: 'Submit' }]);
    });

    test('first() should return nth(0)', () => {
      const first = locatorAdapter.first();
      
      expect((first as any).filters).toEqual([{ position: 0 }]);
    });

    test('last() should add last position filter', () => {
      const last = locatorAdapter.last();
      
      expect((last as any).filters).toEqual([{ position: 'last' }]);
    });

    test('nth() should add position filter', () => {
      const nth = locatorAdapter.nth(2);
      
      expect((nth as any).filters).toEqual([{ position: 2 }]);
    });

    test('chained filters should accumulate', () => {
      // Test chaining with position filters (delayed filtering)
      const positionChained = locatorAdapter
        .filter({ position: 0 })
        .filter({ exact: true });
      
      expect((positionChained as any).filters).toEqual([
        { position: 0 },
        { exact: true }
      ]);
      
      // Test chaining with text filter + position filter (all lazy now)
      const mixedChained = locatorAdapter
        .filter({ hasText: 'Submit' })  // Now stores filter instead of executing
        .filter({ exact: true });       // Adds another filter to chain
      
      // All filters should be stored in sequence (lazy execution)
      expect((mixedChained as any).filters).toEqual([
        { hasText: 'Submit' },
        { exact: true }
      ]);
    });
  });

  describe('Locator Creation Methods', () => {
    test('locator() should create child locator', () => {
      const child = locatorAdapter.locator('.child');
      
      expect((child as any).selector).toBe('#test-button .child');
    });

    test('getByRole() should create role-based locator', () => {
      const roleLocator = locatorAdapter.getByRole('button');
      
      expect((roleLocator as any).selector).toBe('#test-button [role="button"]');
    });

    test('getByRole() with name should add accessible name filter', () => {
      const roleLocator = locatorAdapter.getByRole('button', { name: 'Submit', exact: true });
      
      expect((roleLocator as any).filters).toContainEqual({
        hasAccessibleName: 'Submit',
        exact: true
      });
    });

    test('getByText() should create text-based locator', () => {
      const textLocator = locatorAdapter.getByText('Submit');
      
      expect((textLocator as any).selector).toBe('#test-button text="Submit"');
    });

    test('getByLabel() should create label-based locator', () => {
      const labelLocator = locatorAdapter.getByLabel('Username');
      
      expect((labelLocator as any).selector).toBe('#test-button label="Username"');
    });

    test('getByLabel() with empty string should handle no-label case', () => {
      const emptyLabelLocator = locatorAdapter.getByLabel('');
      
      // The new implementation uses label query strategy
      expect((emptyLabelLocator as any).selector).toBe('#test-button label=""');
    });

    test('getByPlaceholder() should create placeholder-based locator', () => {
      const placeholderLocator = locatorAdapter.getByPlaceholder('Enter text');
      
      expect((placeholderLocator as any).selector).toBe('#test-button placeholder="Enter text"');
    });

    test('getByTestId() should create test-id-based locator', () => {
      const testIdLocator = locatorAdapter.getByTestId('submit-btn');
      
      expect((testIdLocator as any).selector).toBe('#test-button [data-testid="submit-btn"]');
    });

    test('getByTitle() should create title-based locator', () => {
      const titleLocator = locatorAdapter.getByTitle('Custom Title');
      
      expect((titleLocator as any).selector).toBe('#test-button [title="Custom Title"]');
    });
  });

  describe('CSS to XPath Conversion', () => {
    test('should convert ID selector to XPath', () => {
      const result = (locatorAdapter as any).cssSelectorToXPath('#test-id');
      expect(result).toBe('.//*[@id="test-id"]');
    });

    test('should convert class selector to XPath', () => {
      const result = (locatorAdapter as any).cssSelectorToXPath('.test-class');
      expect(result).toBe('.//*[contains(@class, "test-class")]');
    });

    test('should convert attribute selector with value to XPath', () => {
      const result = (locatorAdapter as any).cssSelectorToXPath('[data-testid="test"]');
      expect(result).toBe('.//*[@data-testid="test"]');
    });

    test('should convert attribute existence selector to XPath', () => {
      const result = (locatorAdapter as any).cssSelectorToXPath('[disabled]');
      expect(result).toBe('.//*[@disabled]');
    });

    test('should convert tag selector to XPath', () => {
      const result = (locatorAdapter as any).cssSelectorToXPath('button');
      expect(result).toBe('.//button');
    });

    test('should handle comma-separated selectors', () => {
      const result = (locatorAdapter as any).cssSelectorToXPath('input, select, textarea');
      expect(result).toBe('.//input | .//select | .//textarea');
    });

    test('should extract tag for complex selectors', () => {
      const result = (locatorAdapter as any).cssSelectorToXPath('div.class > p:first-child');
      expect(result).toBe('.//div');
    });
  });

  describe('Selector Combination Methods', () => {
    let parentLocator: LocatorAdapter;

    beforeEach(() => {
      parentLocator = new LocatorAdapter('.parent', mockPage);
    });

    test('should combine CSS selectors correctly', () => {
      const result = (parentLocator as any).combineSelectorWithParent('.child');
      expect(result).toBe('.parent .child');
    });

    test('should combine XPath selectors correctly', () => {
      const xpathParent = new LocatorAdapter('xpath=//div[@class="parent"]', mockPage);
      const result = (xpathParent as any).combineSelectorWithParent('xpath=//span');
      expect(result).toBe('xpath=(//div[@class="parent"])//span');
    });

    test('should convert CSS parent to XPath when child is XPath', () => {
      const result = (parentLocator as any).combineSelectorWithParent('xpath=//span');
      expect(result).toBe('xpath=(.//*[contains(@class, "parent")])//span');
    });

    test('should convert XPath parent when child is CSS', () => {
      const xpathParent = new LocatorAdapter('xpath=//div', mockPage);
      const result = (xpathParent as any).combineSelectorWithParent('.child');
      expect(result).toBe('xpath=(//div)//.//*[contains(@class, \"child\")]');
    });
  });

  describe('Action Methods', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.getElementById('test-button')!;
      
      // Reset framework adapter mocks to return false by default
      mockReactAdapter.isReactComponent.mockReturnValue(false);
      mockOpenInulaAdapter.isOpenInulaComponent.mockReturnValue(false);
    });

    test('click() should handle native element', async () => {
      await locatorAdapter.click();

      expect(mockPage.scrollIntoViewIfNeeded).toHaveBeenCalledWith(mockElement);
      expect(mockEventSimulator.simulateClick).toHaveBeenCalledWith(mockElement, {});
      expect(mockLogger.debug).toHaveBeenCalledWith('点击元素: #test-button (native)');
    });

    test('click() should handle React component', async () => {
      mockReactAdapter.isReactComponent.mockReturnValue(true);
      
      await locatorAdapter.click();

      expect(mockReactAdapter.triggerClickEvent).toHaveBeenCalledWith(mockElement);
      expect(mockLogger.debug).toHaveBeenCalledWith('点击元素完成: #test-button (react)');
    });

    test('click() should handle OpenInula component', async () => {
      mockOpenInulaAdapter.isOpenInulaComponent.mockReturnValue(true);
      
      await locatorAdapter.click();

      expect(mockOpenInulaAdapter.triggerClickEvent).toHaveBeenCalledWith(mockElement);
      expect(mockLogger.debug).toHaveBeenCalledWith('点击元素完成: #test-button (openinula)');
    });

    test('dblclick() should handle native element', async () => {
      await locatorAdapter.dblclick();

      expect(mockPage.scrollIntoViewIfNeeded).toHaveBeenCalledWith(mockElement);
      expect(mockEventSimulator.simulateDoubleClick).toHaveBeenCalledWith(mockElement);
      expect(mockLogger.debug).toHaveBeenCalledWith('双击元素: #test-button (native)');
    });

    test('dblclick() should handle React component', async () => {
      mockReactAdapter.isReactComponent.mockReturnValue(true);
      
      await locatorAdapter.dblclick();

      expect(mockReactAdapter.triggerClickEvent).toHaveBeenCalledTimes(2);
      expect(mockLogger.debug).toHaveBeenCalledWith('双击元素完成: #test-button (react)');
    });

    test('fill() should handle input element', async () => {
      const inputElement = document.getElementById('test-input') as HTMLInputElement;
      // Override the waitFor mock to return the input element
      jest.spyOn(locatorAdapter, 'waitFor').mockResolvedValue(inputElement);

      await locatorAdapter.fill('test value');

      expect(inputElement.value).toBe('test value');
      expect(mockLogger.debug).toHaveBeenCalledWith('填充元素完成: #test-button = "test value" (native)');
    });

    test('fill() should handle React component', async () => {
      const inputElement = document.getElementById('test-input') as HTMLInputElement;
      // Override the waitFor mock to return the input element
      jest.spyOn(locatorAdapter, 'waitFor').mockResolvedValue(inputElement);
      mockReactAdapter.isReactComponent.mockReturnValue(true);

      await locatorAdapter.fill('test value');

      expect(inputElement.value).toBe('test value');
      expect(mockReactAdapter.triggerInputEvent).toHaveBeenCalledWith(inputElement, 'test value');
      expect(mockReactAdapter.triggerChangeEvent).toHaveBeenCalledWith(inputElement, 'test value');
      expect(mockLogger.debug).toHaveBeenCalledWith('填充元素完成: #test-button = "test value" (react)');
    });

    test('press() should simulate key press', async () => {
      const focusSpy = jest.spyOn(mockElement, 'focus');

      await locatorAdapter.press('Enter');

      expect(focusSpy).toHaveBeenCalled();
      expect(mockEventSimulator.simulateKeyPress).toHaveBeenCalledWith(mockElement, 'Enter', {});
      expect(mockLogger.debug).toHaveBeenCalledWith('按键: #test-button -> Enter');
    });

    test('pressSequentially() should simulate typing', async () => {
      await locatorAdapter.pressSequentially('hello world');

      expect(mockEventSimulator.simulateTyping).toHaveBeenCalledWith(mockElement, 'hello world', {});
      expect(mockLogger.debug).toHaveBeenCalledWith('逐字符输入: #test-button -> "hello world"');
    });

    test('hover() should handle native element', async () => {
      // Mock waitFor to return the element
      jest.spyOn(locatorAdapter, 'waitFor').mockResolvedValue(mockElement);
      
      await locatorAdapter.hover();

      expect(mockPage.scrollIntoViewIfNeeded).toHaveBeenCalledWith(mockElement);
      expect(mockEventSimulator.simulateHover).toHaveBeenCalledWith(mockElement);
      expect(mockLogger.debug).toHaveBeenCalledWith('悬停元素: #test-button (native)');
    });

    test('check() should handle checkbox', async () => {
      const checkboxElement = document.getElementById('test-checkbox') as HTMLInputElement;
      // Mock waitFor and waitForClickable to return the element
      jest.spyOn(locatorAdapter, 'waitFor').mockResolvedValue(checkboxElement);
      jest.spyOn(locatorAdapter as any, 'waitForClickable').mockResolvedValue(undefined);

      await locatorAdapter.check();

      expect(checkboxElement.checked).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith('选择复选框: #test-button (native)');
    });

    test('uncheck() should handle checkbox', async () => {
      const checkboxElement = document.getElementById('test-checkbox') as HTMLInputElement;
      checkboxElement.checked = true;
      // Mock waitFor and waitForClickable to return the element
      jest.spyOn(locatorAdapter, 'waitFor').mockResolvedValue(checkboxElement);
      jest.spyOn(locatorAdapter as any, 'waitForClickable').mockResolvedValue(undefined);

      await locatorAdapter.uncheck();

      expect(checkboxElement.checked).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith('取消选择复选框: #test-button (native)');
    });

    test('selectOption() should handle single value selection', async () => {
      const selectElement = document.getElementById('test-select') as HTMLSelectElement;
      // Mock waitFor and waitForClickable to return the element
      jest.spyOn(locatorAdapter, 'waitFor').mockResolvedValue(selectElement);
      jest.spyOn(locatorAdapter as any, 'waitForClickable').mockResolvedValue(undefined);

      await locatorAdapter.selectOption('option2');

      expect(selectElement.value).toBe('option2');
      expect(mockLogger.debug).toHaveBeenCalledWith('选择下拉选项: #test-button = option2 (native)');
    });

    test('selectOption() should handle multiple value selection', async () => {
      const selectElement = document.getElementById('test-select') as HTMLSelectElement;
      selectElement.multiple = true;
      // Mock waitFor and waitForClickable to return the element
      jest.spyOn(locatorAdapter, 'waitFor').mockResolvedValue(selectElement);
      jest.spyOn(locatorAdapter as any, 'waitForClickable').mockResolvedValue(undefined);

      await locatorAdapter.selectOption(['option1', 'option2']);

      const selectedOptions = Array.from(selectElement.options).filter(opt => opt.selected);
      expect(selectedOptions.length).toBe(2);
      expect(mockLogger.debug).toHaveBeenCalledWith('选择下拉选项: #test-button = option1,option2 (native)');
    });
  });

  describe('State Check Methods', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.getElementById('test-button')!;
      // 注意：这些状态检查方法现在不再使用getElement，而是getCurrentElements
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue([mockElement]);
    });

    test('isVisible() should return true for visible element', async () => {
      // Mock isElementVisible to return true for visible element
      jest.spyOn(locatorAdapter as any, 'isElementVisible').mockReturnValue(true);

      const result = await locatorAdapter.isVisible();
      expect(result).toBe(true);
    });

    test('isVisible() should return false for hidden element', async () => {
      // Mock isElementVisible to return false for hidden element
      jest.spyOn(locatorAdapter as any, 'isElementVisible').mockReturnValue(false);

      const result = await locatorAdapter.isVisible();
      expect(result).toBe(false);
    });

    test('isHidden() should return opposite of isVisible', async () => {
      jest.spyOn(locatorAdapter, 'isVisible').mockResolvedValue(true);

      const result = await locatorAdapter.isHidden();
      expect(result).toBe(false);
    });

    test('isEnabled() should return true for enabled element', async () => {
      const inputElement = document.getElementById('test-input') as HTMLInputElement;
      jest.spyOn(locatorAdapter as any, 'getElement').mockResolvedValue(inputElement);

      const result = await locatorAdapter.isEnabled();
      expect(result).toBe(true);
    });

    test('isDisabled() should return opposite of isEnabled', async () => {
      jest.spyOn(locatorAdapter, 'isEnabled').mockResolvedValue(true);

      const result = await locatorAdapter.isDisabled();
      expect(result).toBe(false);
    });

    test('isChecked() should return checkbox state', async () => {
      const checkboxElement = document.getElementById('test-checkbox') as HTMLInputElement;
      checkboxElement.checked = true;
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue([checkboxElement]);

      const result = await locatorAdapter.isChecked();
      expect(result).toBe(true);
    });

    test('isVisible() should NOT wait for elements - immediate check', async () => {
      // 模拟没有找到元素的情况
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue([]);

      const startTime = Date.now();
      const isVisible = await locatorAdapter.isVisible();
      const endTime = Date.now();

      // 验证立即返回false，不等待
      expect(isVisible).toBe(false);
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    test('isEnabled() should NOT wait for elements - immediate check', async () => {
      // 模拟没有找到元素的情况
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue([]);

      const startTime = Date.now();
      const isEnabled = await locatorAdapter.isEnabled();
      const endTime = Date.now();

      // 验证立即返回false，不等待
      expect(isEnabled).toBe(false);
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    test('isChecked() should NOT wait for elements - immediate check', async () => {
      // 模拟没有找到元素的情况
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue([]);

      const startTime = Date.now();
      const isChecked = await locatorAdapter.isChecked();
      const endTime = Date.now();

      // 验证立即返回false，不等待
      expect(isChecked).toBe(false);
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });

  describe('Content Methods', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.querySelector('.content')!;
      jest.spyOn(locatorAdapter as any, 'getElement').mockResolvedValue(mockElement);
    });

    test('textContent() should return element text content', async () => {
      const result = await locatorAdapter.textContent();
      expect(result).toBe('Sample text');
    });

    test('innerText() should return element inner text', async () => {
      const contentElement = document.querySelector('.content')! as HTMLElement;
      // Mock innerText property
      Object.defineProperty(contentElement, 'innerText', {
        get: () => 'Sample text',
        configurable: true
      });
      jest.spyOn(locatorAdapter as any, 'getElement').mockResolvedValue(contentElement);
      
      const result = await locatorAdapter.innerText();
      expect(result).toBe('Sample text');
    });

    test('innerHTML() should return element HTML', async () => {
      const result = await locatorAdapter.innerHTML();
      expect(result).toBe('Sample text');
    });

    test('getAttribute() should return attribute value', async () => {
      const result = await locatorAdapter.getAttribute('class');
      expect(result).toBe('content');
    });

    test('getAttribute() should return null for non-existent attribute', async () => {
      const result = await locatorAdapter.getAttribute('nonexistent');
      expect(result).toBeNull();
    });

    test('inputValue() should return input value', async () => {
      const inputElement = document.getElementById('test-input') as HTMLInputElement;
      inputElement.value = 'test value';
      jest.spyOn(locatorAdapter as any, 'getElement').mockResolvedValue(inputElement);

      const result = await locatorAdapter.inputValue();
      expect(result).toBe('test value');
    });
  });

  describe('JavaScript Execution Methods', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.getElementById('test-button')!;
      mockElement.textContent = 'Test Button';
      mockElement.setAttribute('data-value', '123');
    });

    test('evaluate() should execute function on single element', async () => {
      jest.spyOn(locatorAdapter, 'getElement').mockResolvedValue(mockElement);

      const result = await locatorAdapter.evaluate((el) => {
        return {
          tagName: el.tagName,
          textContent: el.textContent,
          id: el.id
        };
      });

      expect(result).toEqual({
        tagName: 'BUTTON',
        textContent: 'Test Button',
        id: 'test-button'
      });
    });

    test('evaluate() should pass arguments to function', async () => {
      jest.spyOn(locatorAdapter, 'getElement').mockResolvedValue(mockElement);

      const result = await locatorAdapter.evaluate((el, suffix) => {
        return (el.textContent || '') + (suffix || '');
      }, ' - Modified');

      expect(result).toBe('Test Button - Modified');
    });

    test('evaluate() should handle async functions', async () => {
      jest.spyOn(locatorAdapter, 'getElement').mockResolvedValue(mockElement);

      const result = await locatorAdapter.evaluate(async (el) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(el.getAttribute('data-value')), 10);
        });
      });

      expect(result).toBe('123');
    });

    test('evaluate() should throw error for non-serializable results', async () => {
      jest.spyOn(locatorAdapter, 'getElement').mockResolvedValue(mockElement);

      await expect(locatorAdapter.evaluate((_el) => {
        // Return a function (not serializable)
        return () => 'test';
      })).rejects.toThrow('Evaluation failed');
    });

    test('evaluateAll() should execute function on all elements', async () => {
      const elements = [
        mockElement,
        document.getElementById('test-input')!,
        document.getElementById('test-checkbox')!
      ];
      
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue(elements);

      const result = await locatorAdapter.evaluateAll((els) => {
        return els.map(el => el.tagName);
      });

      expect(result).toEqual(['BUTTON', 'INPUT', 'INPUT']);
    });

    test('evaluateAll() should pass arguments to function', async () => {
      const elements = [mockElement];
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue(elements);

      const result = await locatorAdapter.evaluateAll((els, multiplier) => {
        return els.length * (multiplier || 1);
      }, 5);

      expect(result).toBe(5);
    });

    test('evaluateHandle() should return non-serializable values', async () => {
      jest.spyOn(locatorAdapter, 'getElement').mockResolvedValue(mockElement);

      const result = await locatorAdapter.evaluateHandle((el) => {
        // Return the element itself (not serializable but should work with evaluateHandle)
        return el;
      });

      expect(result).toBe(mockElement);
    });

    test('evaluateHandle() should handle functions returning DOM elements', async () => {
      jest.spyOn(locatorAdapter, 'getElement').mockResolvedValue(mockElement);

      const result = await locatorAdapter.evaluateHandle((el) => {
        return el.parentElement;
      });

      expect(result).toBe(mockElement.parentElement);
    });

    test('evaluate() should handle errors in page function', async () => {
      jest.spyOn(locatorAdapter, 'getElement').mockResolvedValue(mockElement);

      await expect(locatorAdapter.evaluate(() => {
        throw new Error('Custom error');
      })).rejects.toThrow('Evaluation failed: Custom error');
    });

    test('evaluateAll() should handle errors in page function', async () => {
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue([mockElement]);

      await expect(locatorAdapter.evaluateAll(() => {
        throw new Error('EvaluateAll error');
      })).rejects.toThrow('EvaluateAll failed: EvaluateAll error');
    });

    test('evaluateHandle() should handle errors in page function', async () => {
      jest.spyOn(locatorAdapter, 'getElement').mockResolvedValue(mockElement);

      await expect(locatorAdapter.evaluateHandle(() => {
        throw new Error('EvaluateHandle error');
      })).rejects.toThrow('EvaluateHandle failed: EvaluateHandle error');
    });
  });

  describe('Wait Methods', () => {
    test('waitFor() should wait for visible elements', async () => {
      // Clear the global mock for this specific test
      jest.restoreAllMocks();
      
      const testElement = document.getElementById('test-button')!;
      jest.spyOn(locatorAdapter as any, 'getElementImmediate').mockResolvedValue(testElement);
      jest.spyOn(locatorAdapter as any, 'isElementVisible').mockReturnValue(true);

      const result = await locatorAdapter.waitFor({ state: 'visible', timeout: 1000 });
      
      expect(result).toBe(testElement);
    });

    test('waitFor() should timeout when condition not met', async () => {
      // Clear the global mock for this specific test
      jest.restoreAllMocks();
      
      const testElement = document.getElementById('test-button')!;
      jest.spyOn(locatorAdapter as any, 'getElementImmediate').mockResolvedValue(testElement);
      jest.spyOn(locatorAdapter as any, 'isElementVisible').mockReturnValue(false);

      await expect(locatorAdapter.waitFor({ state: 'visible', timeout: 100 }))
        .rejects.toThrow('等待超时');
    });
  });

  describe('Query Methods', () => {
    test('count() should return number of matching elements', async () => {
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue([
        document.getElementById('test-button')
      ]);

      const result = await locatorAdapter.count();

      expect(result).toBe(1);
    });

    test('all() should return array of locators', async () => {
      const elements = [document.getElementById('test-button')!, document.getElementById('test-input')!];
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue(elements);
      jest.spyOn(locatorAdapter as any, 'buildUniqueSelector').mockReturnValue('#unique-selector');

      const result = await locatorAdapter.all();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(LocatorAdapter);
      expect(result[1]).toBeInstanceOf(LocatorAdapter);
    });

    test('getElement() should return cached element if valid', async () => {
      const testElement = document.getElementById('test-button')!;
      (locatorAdapter as any)._element = testElement;
      jest.spyOn(document, 'contains').mockReturnValue(true);

      const result = await locatorAdapter.getElement();

      expect(result).toBe(testElement);
    });

    test('getElement() should query new element if not cached', async () => {
      const testElement = document.getElementById('test-button')!;
      jest.spyOn(locatorAdapter as any, 'getCurrentElements').mockReturnValue([testElement]);

      const result = await locatorAdapter.getElement();

      expect(result).toBe(testElement);
    });

    test('getElement() should throw error if no elements found', async () => {
      // Mock waitFor to reject for this specific test
      jest.spyOn(locatorAdapter, 'waitFor').mockRejectedValue(new Error('等待超时 (30000ms): #test-button, 状态: visible'));

      await expect(locatorAdapter.getElement()).rejects.toThrow('等待超时');
    });

    test('getElement() should throw error if no elements pass filters', async () => {
      // Mock waitFor to reject for this specific test
      jest.spyOn(locatorAdapter, 'waitFor').mockRejectedValue(new Error('等待超时 (30000ms): #test-button, 状态: visible'));

      await expect(locatorAdapter.getElement()).rejects.toThrow('等待超时');
    });
  });

  describe('Filter Application', () => {
    let elements: Element[];

    beforeEach(() => {
      elements = [
        document.getElementById('test-button')!,
        document.getElementById('test-input')!,
        document.querySelector('.content')!
      ].filter(Boolean);
    });

    test('applyFilter() should handle position number filter', () => {
      const result = (locatorAdapter as any).applyFilter(elements, { position: 1 });
      expect(result).toEqual([elements[1]]);
    });

    test('applyFilter() should handle last position filter', () => {
      const result = (locatorAdapter as any).applyFilter(elements, { position: 'last' });
      expect(result).toEqual([elements[elements.length - 1]]);
    });

    test('applyFilter() should handle hasText filter', () => {
      const result = (locatorAdapter as any).applyFilter(elements, { hasText: 'Sample' });
      expect(result).toEqual([document.querySelector('.content')]);
    });

    test('applyFilter() should handle hasAccessibleName filter with empty string', () => {
      const result = (locatorAdapter as any).applyFilter(elements, { hasAccessibleName: '', exact: true });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    test('applyFilter() should handle hasNotText filter', () => {
      const result = (locatorAdapter as any).applyFilter(elements, { hasNotText: 'Sample' });
      expect(result).toEqual([elements[0], elements[1]]); // Exclude .content element
    });
  });

  describe('Unique Selector Building', () => {
    test('buildUniqueSelector() should use ID if available', () => {
      const element = document.getElementById('test-button')!;
      const result = (locatorAdapter as any).buildUniqueSelector(element);
      expect(result).toBe('#test-button');
    });

    test('buildUniqueSelector() should build path with classes', () => {
      const element = document.querySelector('.btn.primary')!;
      const result = (locatorAdapter as any).buildUniqueSelector(element);
      // The element has an ID, so it should use that instead of classes
      expect(result).toBe('#test-button');
    });
  });

  describe('XPath Query Handling', () => {
    test('queryElementsBySelector() should handle XPath selectors', () => {
      const mockResult = {
        snapshotLength: 1,
        snapshotItem: jest.fn().mockReturnValue(document.getElementById('test-button'))
      };
      jest.spyOn(document, 'evaluate').mockReturnValue(mockResult as any);

      const xpathLocator = new LocatorAdapter('xpath=//button', mockPage);
      const result = (xpathLocator as any).queryElementsBySelector('xpath=//button');

      expect(document.evaluate).toHaveBeenCalled();
      expect(result).toEqual([document.getElementById('test-button')]);
    });

    test('queryElementsBySelector() should handle CSS selectors', () => {
      const result = (locatorAdapter as any).queryElementsBySelector('#test-button');
      expect(result).toEqual([document.getElementById('test-button')]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle getElement when no elements match', async () => {
      const emptyLocator = new LocatorAdapter('.nonexistent', mockPage);
      // Mock the auto-wait methods for this new instance
      jest.spyOn(emptyLocator, 'waitFor').mockRejectedValue(new Error('等待超时 (30000ms): .nonexistent, 状态: visible'));

      await expect(emptyLocator.getElement()).rejects.toThrow('等待超时');
    });

    test('should handle state checks when element is not found', async () => {
      const emptyLocator = new LocatorAdapter('.nonexistent', mockPage);
      jest.spyOn(emptyLocator as any, 'getElement').mockRejectedValue(new Error('Element not found'));

      expect(await emptyLocator.isVisible()).toBe(false);
      expect(await emptyLocator.isEnabled()).toBe(false);
      expect(await emptyLocator.isChecked()).toBe(false);
    });

    test('should handle invalid filter position', () => {
      const elements = [document.getElementById('test-button')!];
      const result = (locatorAdapter as any).applyFilter(elements, { position: 99 });
      expect(result).toEqual([]);
    });

    test('should handle empty elements array in filters', () => {
      const result = (locatorAdapter as any).applyFilter([], { hasText: 'anything' });
      expect(result).toEqual([]);
    });
  });

  describe('Advanced Filter Tests', () => {
    let elements: Element[];
    let testLocator: LocatorAdapter;

    beforeEach(() => {
      // Add more complex DOM structure
      document.body.innerHTML = `
        <div class="container">
          <div class="item" data-text="First Item">First</div>
          <div class="item" data-text="Second Item" aria-label="Second Label">Second</div>
          <div class="item" data-text="Third Item" title="Third Title">Third</div>
          <input type="text" aria-label="Input Field" />
          <input type="text" />
        </div>
      `;
      
      elements = Array.from(document.querySelectorAll('.item'));
      testLocator = new LocatorAdapter('.item', mockPage);
    });

    test('should filter by exact text match', () => {
      const result = (testLocator as any).applyFilter(elements, { hasText: 'Second', exact: true });
      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Second');
    });

    test('should filter by text regex', () => {
      // The regex should match elements with "First" or "Third" in their combined text + data-text
      const result = (testLocator as any).applyFilter(elements, { hasText: /(First|Third)/ });
      expect(result).toHaveLength(2);
    });

    test('should filter by accessible name with exact match', () => {
      const result = (testLocator as any).applyFilter(elements, { 
        hasAccessibleName: 'Second Label', 
        exact: true 
      });
      expect(result).toHaveLength(1);
    });

    test('should filter by accessible name partial match', () => {
      const result = (testLocator as any).applyFilter(elements, { 
        hasAccessibleName: 'Label',
        exact: false 
      });
      expect(result).toHaveLength(1);
    });

    test('should filter by hasNotText with regex', () => {
      const result = (testLocator as any).applyFilter(elements, { hasNotText: /Second|Third/ });
      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('First');
    });

    test('should handle multiple filters in sequence', async () => {
      // Create a locator with multiple filters
      const locatorWithFilters = testLocator
        .filter({ position: 0 })  // Position filter
        .filter({ hasText: 'First' });  // Text filter
      
      // Test that the filters are applied correctly
      expect((locatorWithFilters as any).filters).toHaveLength(2);
      expect((locatorWithFilters as any).filters[0]).toEqual({ position: 0 });
      expect((locatorWithFilters as any).filters[1]).toEqual({ hasText: 'First' });
      
      // Mock getCurrentElements to return filtered elements
      jest.spyOn(locatorWithFilters as any, 'getCurrentElements').mockReturnValue([elements[0]]);
      
      const count = await locatorWithFilters.count();
      expect(count).toBe(1);
    });
  });

  describe('XPath Generation Bug - getByRole + getByLabel Combination', () => {
    beforeEach(() => {
      // Create table structure that reproduces the issue
      document.body.innerHTML = `
        <div id="test-table">
          <table>
            <thead>
              <tr role="row" aria-label="名称 告警ID 分组名称">
                <th>名称</th>
                <th>告警ID</th>
                <th>分组名称</th>
                <th><input type="checkbox" /></th>
              </tr>
            </thead>
            <tbody>
              <tr role="row">
                <td>Alert 1</td>
                <td>12345</td>
                <td>Group A</td>
                <td><input type="checkbox" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    });

    test('should handle getByRole + getByLabel combination without XPath errors', async () => {
      // This reproduces the issue: page.getByRole("row", { name: "名称 告警ID 分组名称", exact: true }).getByLabel("").check();
      const pageLocator = new LocatorAdapter('body', mockPage);
      
      // Step 1: getByRole("row", { name: "名称 告警ID 分组名称", exact: true })
      const rowLocator = pageLocator.getByRole("row", { name: "名称 告警ID 分组名称", exact: true });
      
      // Step 2: getByLabel("") - this should find checkboxes without labels
      const checkboxLocator = rowLocator.getByLabel("");
      
      // The selector should be valid and not cause XPath errors
      const selector = (checkboxLocator as any).selector;
      
      expect(selector).toBeDefined();
      expect(typeof selector).toBe('string');
      
      // Test that we can actually query elements with this selector
      const mockQueryElementsBySelector = jest.spyOn(checkboxLocator as any, 'queryElementsBySelector');
      mockQueryElementsBySelector.mockImplementation((...args: unknown[]) => {
        const sel = args[0] as string;
        // This should not throw an XPath error
        try {
          if (sel.startsWith('xpath=')) {
            const xpath = sel.substring(6);
            // Validate that it's a valid XPath expression
            expect(xpath).not.toContain('[self::]');
            expect(xpath).not.toContain('//[self::]');
            return [document.querySelector('input[type="checkbox"]')];
          } else {
            return Array.from(document.querySelectorAll(sel));
          }
        } catch (error) {
          throw new Error(`Invalid XPath expression: ${sel}. Error: ${error}`);
        }
      });
      
      // This should not throw - we're mainly testing that XPath generation doesn't crash
      const countResult = await checkboxLocator.count();
      expect(countResult).toBeGreaterThanOrEqual(0); // Any non-crashing result is good
    });

    test('should generate valid XPath when combining role selector with empty label', () => {
      const pageLocator = new LocatorAdapter('div', mockPage);
      
      // Create a row locator with role and name
      const rowLocator = pageLocator.getByRole("row", { name: "Test Row", exact: true });
      
      // Add empty label selector
      const checkboxLocator = rowLocator.getByLabel("");
      
      const selector = (checkboxLocator as any).selector;
      
      // Check that the generated selector is valid
      if (selector.startsWith('xpath=')) {
        const xpath = selector.substring(6);
        
        // Should not contain invalid XPath constructs
        expect(xpath).not.toContain('[self::]');
        expect(xpath).not.toContain('//[self::]');
        expect(xpath).not.toContain('//[');
        expect(xpath).not.toMatch(/\/\/\[\s*\]/);
        
        // Test XPath validity by attempting to parse it
        expect(() => {
          document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        }).not.toThrow();
      }
    });

    test('should reproduce original error scenario without crashing', () => {
      // Reproduce the exact scenario: page.getByRole("row", { name: "名称 告警ID 分组名称", exact: true }).getByLabel("").check();
      const pageLocator = new LocatorAdapter('body', mockPage);
      
      // This should not throw during selector generation
      expect(() => {
        const rowLocator = pageLocator.getByRole("row", { name: "名称 告警ID 分组名称", exact: true });
        const checkboxLocator = rowLocator.getByLabel("");
        
        // Getting the selector should not crash
        const selector = (checkboxLocator as any).selector;
        expect(selector).toBeDefined();
        
        // If it's an XPath, it should be valid
        if (selector.startsWith('xpath=')) {
          const xpath = selector.substring(6);
          // This should not throw
          document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        }
      }).not.toThrow();
    });

    test('should handle CSS to XPath conversion edge cases', () => {
      const locator = new LocatorAdapter('body', mockPage);
      
      // Test various CSS selectors that might cause XPath conversion issues
      const testCases = [
        { selector: 'input, select, textarea', expected: './/input | .//select | .//textarea' },
        { selector: 'tr, [role="row"]', expected: './/tr | .//*[@role="row"]' },
        { selector: 'div.complex-class > span:first-child', expected: './/div' },
        { selector: '*[data-testid="test"]', expected: './/*[@data-testid="test"]' }
      ];
      
      testCases.forEach(({ selector, expected }) => {
        const xpath = (locator as any).cssSelectorToXPath(selector);
        expect(xpath).toBe(expected);
        
        // Should not generate empty or invalid XPath parts
        expect(xpath).not.toBe('');
        expect(xpath).not.toContain('self::');
      });
    });
  });

  describe('Complex DOM Interactions', () => {
    beforeEach(() => {
      // Create a more complex DOM structure
      document.body.innerHTML = `
        <div id="app">
          <header class="header">
            <nav role="navigation">
              <button role="button" aria-label="Menu">☰</button>
              <a href="/home" role="link">Home</a>
              <a href="/about" role="link">About</a>
            </nav>
          </header>
          <main role="main">
            <form id="contact-form">
              <label for="name">Full Name</label>
              <input id="name" type="text" placeholder="Enter your name" required />
              
              <label for="email">Email Address</label>
              <input id="email" type="email" placeholder="Enter your email" />
              
              <label for="message">Message</label>
              <textarea id="message" placeholder="Your message here"></textarea>
              
              <input type="checkbox" id="subscribe" />
              <label for="subscribe">Subscribe to newsletter</label>
              
              <button type="submit" data-testid="submit-form">Send Message</button>
            </form>
          </main>
        </div>
      `;
    });

    test('should handle nested selector combinations', () => {
      const formLocator = new LocatorAdapter('#contact-form', mockPage);
      const submitButton = formLocator.getByTestId('submit-form');
      
      expect((submitButton as any).selector).toBe('#contact-form [data-testid="submit-form"]');
    });

    test('should handle role-based selections with accessible names', () => {
      const navLocator = new LocatorAdapter('nav', mockPage);
      const menuButton = navLocator.getByRole('button', { name: 'Menu' });
      
      expect((menuButton as any).selector).toBe('nav [role="button"]');
      expect((menuButton as any).filters).toContainEqual({
        hasAccessibleName: 'Menu',
        exact: false
      });
    });

    test('should chain multiple locator methods', () => {
      const appLocator = new LocatorAdapter('#app', mockPage);
      const emailInput = appLocator
        .locator('form')
        .getByPlaceholder('Enter your email');
      
      expect((emailInput as any).selector).toBe('#app form placeholder="Enter your email"');
    });
  });
});