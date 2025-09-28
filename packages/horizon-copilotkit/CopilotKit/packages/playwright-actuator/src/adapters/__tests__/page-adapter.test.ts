/**
 * PageAdapter Unit Tests - JSDOM Compatible Version
 */

// Setup mocks before imports
const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
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

const mockLocatorAdapter = {
  selector: '#selector',
  page: null,
  options: {},
  click: jest.fn(),
  fill: jest.fn(),
  check: jest.fn()
};

// Mock constructors
const MockLogger = jest.fn().mockImplementation(() => mockLogger);
const MockWaitManager = jest.fn().mockImplementation(() => mockWaitManager);
const MockEventSimulator = jest.fn().mockImplementation(() => mockEventSimulator);
const MockLocatorAdapter = jest.fn().mockImplementation((selector, page, options) => ({
  ...mockLocatorAdapter,
  selector,
  page,
  options
}));

// Mock console constructor
const MockConsole = jest.fn().mockImplementation(() => mockLogger);

// Set up window object before import
Object.assign(window, {
  PlaywrightLogger: MockLogger,
  PlaywrightWaitManager: MockWaitManager,
  PlaywrightEventSimulator: MockEventSimulator,
  PlaywrightLocatorAdapter: MockLocatorAdapter
});

// Mock console
(global as any).console = MockConsole;

// Mock MutationObserver for tests
global.MutationObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn()
}));

// Import PageAdapter after mocks are set up
import PageAdapter from '../page-adapter';

describe('PageAdapter Tests', () => {
  let pageAdapter: PageAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.getComputedStyle for visibility checks
    window.getComputedStyle = jest.fn().mockReturnValue({
      display: 'block',
      visibility: 'visible',
      opacity: '1'
    });
    
    pageAdapter = new PageAdapter();
  });

  describe('Basic Navigation', () => {
    test('should return current URL', () => {
      expect(pageAdapter.url()).toBe('http://localhost/');
    });

    test('should return page title', async () => {
      const title = await pageAdapter.title();
      expect(title).toBe('');
    });

    test('should return page content', async () => {
      const content = await pageAdapter.content();
      expect(content).toContain('<html><head></head><body></body></html>');
    });

    test('should handle goBack', async () => {
      const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation();
      const waitForLoadStateSpy = jest.spyOn(pageAdapter, 'waitForLoadState').mockResolvedValue(undefined);

      await pageAdapter.goBack();

      expect(historyBackSpy).toHaveBeenCalled();
      expect(waitForLoadStateSpy).toHaveBeenCalledWith('load');
      
      historyBackSpy.mockRestore();
      waitForLoadStateSpy.mockRestore();
    });

    test('should handle goForward', async () => {
      const historyForwardSpy = jest.spyOn(window.history, 'forward').mockImplementation();
      const waitForLoadStateSpy = jest.spyOn(pageAdapter, 'waitForLoadState').mockResolvedValue(undefined);

      await pageAdapter.goForward();

      expect(historyForwardSpy).toHaveBeenCalled();
      expect(waitForLoadStateSpy).toHaveBeenCalledWith('load');
      
      historyForwardSpy.mockRestore();
      waitForLoadStateSpy.mockRestore();
    });
  });

  describe('Element Interactions', () => {
    test('should handle click', async () => {
      const mockElement = { 
        scrollIntoView: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100, bottom: 200, left: 50, right: 150, 
          width: 100, height: 100
        })
      };
      // Mock querySelector to return element immediately
      document.querySelector = jest.fn().mockReturnValue(mockElement);

      await pageAdapter.click('#button');

      expect(document.querySelector).toHaveBeenCalledWith('#button');
      expect(mockEventSimulator.simulateClick).toHaveBeenCalledWith(mockElement, {});
      expect(mockLogger.debug).toHaveBeenCalledWith('点击: #button');
    });

    test('should handle fill', async () => {
      const mockInput = {
        value: '',
        scrollIntoView: jest.fn(),
        dispatchEvent: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100, bottom: 200, left: 50, right: 150, 
          width: 100, height: 100
        })
      };
      // Mock querySelector to return element immediately
      document.querySelector = jest.fn().mockReturnValue(mockInput);

      await pageAdapter.fill('#input', 'test value');

      expect(mockInput.value).toBe('test value');
      expect(mockInput.dispatchEvent).toHaveBeenCalledTimes(2);
      expect(mockLogger.debug).toHaveBeenCalledWith('填充: #input = "test value"');
    });

    test('should handle checkbox check', async () => {
      const mockCheckbox = {
        type: 'checkbox',
        checked: false,
        scrollIntoView: jest.fn(),
        dispatchEvent: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100, bottom: 200, left: 50, right: 150, 
          width: 100, height: 100
        })
      };
      // Mock querySelector to return element immediately
      document.querySelector = jest.fn().mockReturnValue(mockCheckbox);

      await pageAdapter.check('#checkbox');

      expect(mockCheckbox.checked).toBe(true);
      expect(mockCheckbox.dispatchEvent).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('选择: #checkbox');
    });

    test('should handle hover', async () => {
      const mockElement = { 
        scrollIntoView: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100, bottom: 200, left: 50, right: 150, 
          width: 100, height: 100
        })
      };
      // Mock querySelector to return element immediately
      document.querySelector = jest.fn().mockReturnValue(mockElement);

      await pageAdapter.hover('#element');

      expect(document.querySelector).toHaveBeenCalledWith('#element');
      expect(mockEventSimulator.simulateHover).toHaveBeenCalledWith(mockElement);
      expect(mockLogger.debug).toHaveBeenCalledWith('悬停: #element');
    });

    test('should handle focus', async () => {
      const mockElement = { 
        focus: jest.fn(),
        scrollIntoView: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100, bottom: 200, left: 50, right: 150, 
          width: 100, height: 100
        })
      };
      // Mock querySelector to return element immediately
      document.querySelector = jest.fn().mockReturnValue(mockElement);

      await pageAdapter.focus('#input');

      expect(mockElement.focus).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('聚焦: #input');
    });

    test('should handle uncheck', async () => {
      const mockCheckbox = {
        type: 'checkbox',
        checked: true,
        scrollIntoView: jest.fn(),
        dispatchEvent: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100, bottom: 200, left: 50, right: 150, 
          width: 100, height: 100
        })
      };
      // Mock querySelector to return element immediately
      document.querySelector = jest.fn().mockReturnValue(mockCheckbox);

      await pageAdapter.uncheck('#checkbox');

      expect(mockCheckbox.checked).toBe(false);
      expect(mockCheckbox.dispatchEvent).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('取消选择: #checkbox');
    });

    test('should handle press', async () => {
      const mockElement = { 
        focus: jest.fn(),
        scrollIntoView: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100, bottom: 200, left: 50, right: 150, 
          width: 100, height: 100
        })
      };
      // Mock querySelector to return element immediately
      document.querySelector = jest.fn().mockReturnValue(mockElement);

      await pageAdapter.press('#input', 'Enter');

      expect(mockElement.focus).toHaveBeenCalled();
      expect(mockEventSimulator.simulateKeyPress).toHaveBeenCalledWith(mockElement, 'Enter', {});
      expect(mockLogger.debug).toHaveBeenCalledWith('按键: #input -> Enter');
    });
  });

  describe('Locator Methods', () => {
    test('should create locator', () => {
      const locator = pageAdapter.locator('#selector');

      expect(MockLocatorAdapter).toHaveBeenCalledWith('#selector', pageAdapter, {});
      // Note: selector property is not part of BaseLocator interface
    });

    test('should handle getByRole', () => {
      const locator = pageAdapter.getByRole('button');

      expect(MockLocatorAdapter).toHaveBeenCalled();
      expect(locator).toBeDefined();
    });

    test('should handle getByText', () => {
      const locator = pageAdapter.getByText('Click me');

      expect(MockLocatorAdapter).toHaveBeenCalled();
      expect(locator).toBeDefined();
    });
  });

  describe('Wait Methods', () => {
    test('should waitForSelector', async () => {
      const mockElement = {
        getBoundingClientRect: jest.fn().mockReturnValue({
          width: 100,
          height: 50,
          top: 0,
          left: 0
        })
      };
      
      // Mock querySelector to first return null, then return element
      let callCount = 0;
      document.querySelector = jest.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? null : mockElement;
      });

      const elementPromise = pageAdapter.waitForSelector('#element');
      
      // Simulate element appearing by triggering MutationObserver callback
      setTimeout(() => {
        const mutationObserverCall = (global.MutationObserver as jest.Mock).mock.calls[0];
        if (mutationObserverCall) {
          const callback = mutationObserverCall[0];
          // Simulate a DOM mutation
          callback([{ type: 'childList', addedNodes: [mockElement] }]);
        }
      }, 50);

      const result = await elementPromise;
      expect(result).toBe(mockElement);
    });

    test('should waitForTimeout', async () => {
      const startTime = Date.now();
      await pageAdapter.waitForTimeout(100); // Use shorter timeout for tests
      const endTime = Date.now();
      
      // Verify that it actually waited approximately the right amount of time
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
      expect(endTime - startTime).toBeLessThan(200);
    });

    test('should waitForFunction', async () => {
      const testFn = jest.fn().mockReturnValue(true);

      const result = await pageAdapter.waitForFunction(testFn);

      expect(testFn).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Script Execution', () => {
    test('should evaluate function', async () => {
      const testFn = jest.fn().mockReturnValue('result');

      const result = await pageAdapter.evaluate(testFn, 'arg');

      expect(testFn).toHaveBeenCalledWith('arg');
      expect(result).toBe('result');
    });

    test('should handle script tag creation', async () => {
      // Mock appendChild to avoid JSDOM issues
      const mockAppendChild = jest.spyOn(document.head, 'appendChild').mockImplementation();
      
      const result = await pageAdapter.addScriptTag({ content: 'console.log("test")' });

      expect(result).toBeInstanceOf(HTMLScriptElement);
      expect(result.textContent).toBe('console.log("test")');
      expect(mockAppendChild).toHaveBeenCalled();
      
      mockAppendChild.mockRestore();
    });

    test('should handle style tag creation', async () => {
      // Mock appendChild to avoid JSDOM issues  
      const mockAppendChild = jest.spyOn(document.head, 'appendChild').mockImplementation();
      
      const result = await pageAdapter.addStyleTag({ content: 'body { margin: 0; }' });

      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect(result.textContent).toBe('body { margin: 0; }');
      expect(mockAppendChild).toHaveBeenCalled();
      
      mockAppendChild.mockRestore();
    });
  });

  describe('Helper Methods', () => {
    test('should return viewport size', () => {
      const size = pageAdapter.viewportSize();
      expect(size).toEqual({ width: 1024, height: 768 });
    });

    test('should handle setViewportSize', async () => {
      const result = await pageAdapter.setViewportSize({ width: 1920, height: 1080 });
      
      expect(mockLogger.warn).toHaveBeenCalledWith('浏览器环境中无法设置视口大小');
      expect(result).toEqual({ width: 1024, height: 768 });
    });

    test('should return bounding box', async () => {
      const mockElement = {
        getBoundingClientRect: jest.fn().mockReturnValue({
          left: 10, top: 20, width: 100, height: 50
        }),
        scrollIntoView: jest.fn()
      };
      // Mock querySelector to return element immediately
      document.querySelector = jest.fn().mockReturnValue(mockElement);

      const result = await pageAdapter.boundingBox('#element');

      expect(result).toEqual({
        x: 10, y: 20, width: 100, height: 50
      });
    });
  });
});