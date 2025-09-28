/// <reference path="../../types/global.d.ts" />

import { FrameAdapter } from '../frame-adapter.js';

// Mock the global window objects
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  success: jest.fn(),
  setLevel: jest.fn(),
  getLevel: jest.fn()
};

// Setup global mocks
beforeAll(() => {
  (global as any).window = global.window || {};
  Object.assign(global.window, {
    PlaywrightLogger: jest.fn().mockImplementation(() => mockLogger),
    PlaywrightEventSimulator: jest.fn().mockImplementation(() => ({
      simulateClick: jest.fn(),
      simulateDoubleClick: jest.fn(),
      simulateHover: jest.fn(),
      simulateKeyPress: jest.fn(),
      simulateTyping: jest.fn()
    })),
    PlaywrightLocatorAdapter: jest.fn().mockImplementation((selector: string, page: any, options: any) => ({
      selector,
      page,
      options,
      filter: jest.fn().mockReturnThis(),
      click: jest.fn(),
      fill: jest.fn()
    }))
  });
  
  // Mock MutationObserver for tests
  global.MutationObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn()
  }));
});

describe('FrameAdapter Tests', () => {
  let mockFrameElement: HTMLIFrameElement;
  let mockFrameWindow: Window;
  let mockFrameDocument: Document;
  let frameAdapter: FrameAdapter;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock frame document
    mockFrameDocument = {
      title: 'Test Frame Title',
      documentElement: {
        outerHTML: '<html><body>Frame Content</body></html>',
        tagName: 'HTML'
      },
      body: {
        tagName: 'BODY',
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      readyState: 'complete',
      addEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      createElement: jest.fn(),
      createTextNode: jest.fn()
    } as any;

    // Create mock frame window
    mockFrameWindow = {
      document: mockFrameDocument,
      location: { href: 'https://example.com/frame' },
      addEventListener: jest.fn(),
      getComputedStyle: jest.fn().mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      }),
      scrollX: 0,
      scrollY: 0,
      innerWidth: 800,
      innerHeight: 600,
      Event: Event,
      MouseEvent: MouseEvent,
      KeyboardEvent: KeyboardEvent
    } as any;

    // Create mock frame element
    mockFrameElement = {
      contentWindow: mockFrameWindow,
      src: 'https://example.com/frame',
      name: 'test-frame',
      tagName: 'IFRAME',
      getBoundingClientRect: jest.fn().mockReturnValue({
        top: 0,
        left: 0,
        width: 800,
        height: 600
      })
    } as any;

    // Mock document.contains for isDetached check
    (document.contains as any) = jest.fn().mockReturnValue(true);

    frameAdapter = new FrameAdapter(mockFrameElement);
  });

  describe('Constructor', () => {
    test('should create FrameAdapter with valid iframe element', () => {
      expect(frameAdapter).toBeInstanceOf(FrameAdapter);
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    test('should throw error if contentWindow is null', () => {
      const invalidFrameElement = {
        contentWindow: null
      } as any;

      expect(() => new FrameAdapter(invalidFrameElement)).toThrow('Cannot access frame window (cross-origin?)');
    });

    test('should throw error if contentDocument is null', () => {
      const invalidFrameElement = {
        contentWindow: {
          document: null
        }
      } as any;

      expect(() => new FrameAdapter(invalidFrameElement)).toThrow('Cannot access frame document');
    });
  });

  describe('Basic Information Methods', () => {
    test('should get frame URL', () => {
      const url = frameAdapter.url();
      expect(url).toBe('https://example.com/frame');
    });

    test('should get frame URL from src when cross-origin', () => {
      // Mock cross-origin error
      Object.defineProperty(mockFrameWindow, 'location', {
        get: () => { throw new Error('Cross-origin'); }
      });

      const url = frameAdapter.url();
      expect(url).toBe('https://example.com/frame');
    });

    test('should get frame title', async () => {
      const title = await frameAdapter.title();
      expect(title).toBe('Test Frame Title');
    });

    test('should get frame content', async () => {
      const content = await frameAdapter.content();
      expect(content).toBe('<html><body>Frame Content</body></html>');
    });

    test('should check if frame is detached', () => {
      const isDetached = frameAdapter.isDetached();
      expect(isDetached).toBe(false);
      expect(document.contains).toHaveBeenCalledWith(mockFrameElement);
    });

    test('should detect detached frame', () => {
      (document.contains as any).mockReturnValue(false);
      const isDetached = frameAdapter.isDetached();
      expect(isDetached).toBe(true);
    });
  });

  describe('Navigation Methods', () => {
    test('should navigate to URL', async () => {
      const result = await frameAdapter.goto('https://new-url.com');
      
      expect(mockFrameElement.src).toBe('https://new-url.com');
      expect(result).toEqual({
        url: 'https://example.com/frame',
        status: 200
      });
    });

    test('should wait for load state', async () => {
      Object.defineProperty(mockFrameDocument, 'readyState', {
        value: 'loading',
        writable: true
      });
      const loadPromise = frameAdapter.waitForLoadState('load');
      
      // Simulate load event
      setTimeout(() => {
        const loadHandler = (mockFrameWindow.addEventListener as jest.Mock).mock.calls
          .find(call => call[0] === 'load')?.[1];
        if (loadHandler) loadHandler();
      }, 10);

      await loadPromise;
      expect(mockFrameWindow.addEventListener).toHaveBeenCalledWith('load', expect.any(Function), { once: true });
    });

    test('should wait for DOMContentLoaded state', async () => {
      Object.defineProperty(mockFrameDocument, 'readyState', {
        value: 'loading',
        writable: true
      });
      const loadPromise = frameAdapter.waitForLoadState('domcontentloaded');
      
      // Simulate DOMContentLoaded event
      setTimeout(() => {
        const loadHandler = (mockFrameDocument.addEventListener as jest.Mock).mock.calls
          .find(call => call[0] === 'DOMContentLoaded')?.[1];
        if (loadHandler) loadHandler();
      }, 10);

      await loadPromise;
      expect(mockFrameDocument.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function), { once: true });
    });
  });

  describe('Element Interaction Methods', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = {
        tagName: 'BUTTON',
        dispatchEvent: jest.fn(),
        focus: jest.fn(),
        value: '',
        type: 'button',
        scrollIntoView: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100,
          left: 100,
          width: 100,
          height: 50
        })
      } as any;

      mockFrameDocument.querySelector = jest.fn().mockReturnValue(mockElement);
    });

    test('should click element', async () => {
      await frameAdapter.click('.button');

      expect(mockFrameDocument.querySelector).toHaveBeenCalledWith('.button');
      expect(mockElement.dispatchEvent).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Clicked: .button');
    });

    test('should double click element', async () => {
      await frameAdapter.dblclick('.button');

      expect(mockFrameDocument.querySelector).toHaveBeenCalledWith('.button');
      expect(mockElement.dispatchEvent).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Double clicked: .button');
    });

    test('should fill input element', async () => {
      const inputElement = {
        ...mockElement,
        tagName: 'INPUT',
        type: 'text',
        value: ''
      };
      mockFrameDocument.querySelector = jest.fn().mockReturnValue(inputElement);

      await frameAdapter.fill('#input', 'test value');

      expect(inputElement.value).toBe('test value');
      expect(inputElement.dispatchEvent).toHaveBeenCalledTimes(2); // input and change events
      expect(mockLogger.debug).toHaveBeenCalledWith('填充: #input = "test value"');
    });

    test('should type text', async () => {
      const inputElement = {
        ...mockElement,
        tagName: 'INPUT',
        type: 'text',
        value: '',
        focus: jest.fn()
      };
      mockFrameDocument.querySelector = jest.fn().mockReturnValue(inputElement);

      // Mock the typing process - the base class implements character-by-character typing
      await frameAdapter.type('#input', 'hi');

      expect(inputElement.focus).toHaveBeenCalled();
      // The value accumulates through dispatched events, but our mock doesn't simulate that
      expect(mockLogger.debug).toHaveBeenCalledWith('Typed: #input -> "hi"');
    });

    test('should press key', async () => {
      await frameAdapter.press('#input', 'Enter');

      expect(mockElement.focus).toHaveBeenCalled();
      expect(mockElement.dispatchEvent).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Pressed key: #input -> Enter');
    });

    test('should hover element', async () => {
      await frameAdapter.hover('.button');

      expect(mockElement.dispatchEvent).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Hovered: .button');
    });

    test('should check checkbox', async () => {
      const checkboxElement = {
        ...mockElement,
        type: 'checkbox',
        checked: false
      };
      mockFrameDocument.querySelector = jest.fn().mockReturnValue(checkboxElement);

      await frameAdapter.check('#checkbox');

      expect(checkboxElement.checked).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith('选择: #checkbox');
    });

    test('should uncheck checkbox', async () => {
      const checkboxElement = {
        ...mockElement,
        type: 'checkbox',
        checked: true
      };
      mockFrameDocument.querySelector = jest.fn().mockReturnValue(checkboxElement);

      await frameAdapter.uncheck('#checkbox');

      expect(checkboxElement.checked).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith('取消选择: #checkbox');
    });

    test('should select option', async () => {
      const selectElement = {
        ...mockElement,
        tagName: 'SELECT',
        value: '',
        options: [
          { value: 'option1', text: 'Option 1', selected: false },
          { value: 'option2', text: 'Option 2', selected: false }
        ]
      };
      mockFrameDocument.querySelector = jest.fn().mockReturnValue(selectElement);

      await frameAdapter.selectOption('#select', 'option2');

      expect(selectElement.value).toBe('option2');
      expect(mockLogger.debug).toHaveBeenCalledWith('Selected option: #select = option2');
    });

    test('should focus element', async () => {
      await frameAdapter.focus('#input');

      expect(mockElement.focus).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('聚焦: #input');
    });
  });

  describe('Wait Methods', () => {
    test('should wait for selector', async () => {
      const mockElement = { 
        id: 'test',
        getBoundingClientRect: jest.fn().mockReturnValue({
          width: 100,
          height: 50,
          top: 0,
          left: 0
        })
      };
      
      // Mock querySelector to first return null, then return element
      let callCount = 0;
      mockFrameDocument.querySelector = jest.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? null : mockElement;
      });

      const elementPromise = frameAdapter.waitForSelector('.element');
      
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

    test('should timeout when waiting for selector', async () => {
      mockFrameDocument.querySelector = jest.fn().mockReturnValue(null);

      await expect(frameAdapter.waitForSelector('.nonexistent', { timeout: 100 }))
        .rejects.toThrow('等待元素超时: .nonexistent (100ms)');
    });

    test('should wait for function', async () => {
      let counter = 0;
      const testFunction = () => {
        counter++;
        return counter >= 3;
      };

      const result = await frameAdapter.waitForFunction(testFunction);
      expect(result).toBe(true);
    });
  });

  describe('Script Execution', () => {
    test('should evaluate script', async () => {
      const result = await frameAdapter.evaluate(() => 2 + 2);
      expect(result).toBe(4);
    });

    test('should evaluate script with arguments', async () => {
      const result = await frameAdapter.evaluate((a: number, b: number) => a + b, 3, 4);
      expect(result).toBe(7);
    });

    test('should handle script execution error', async () => {
      const errorFunction = () => { throw new Error('Script error'); };
      
      await expect(frameAdapter.evaluate(errorFunction)).rejects.toThrow('Script error');
      expect(mockLogger.error).toHaveBeenCalledWith('Script execution failed:', expect.any(Error));
    });
  });

  describe('Element Information Methods', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = {
        textContent: 'Test Content',
        innerHTML: '<span>Inner HTML</span>',
        getAttribute: jest.fn().mockReturnValue('test-value'),
        getBoundingClientRect: jest.fn().mockReturnValue({
          left: 10,
          top: 20,
          width: 100,
          height: 50
        })
      } as any;

      mockFrameDocument.querySelector = jest.fn().mockReturnValue(mockElement);
    });

    test('should get text content', async () => {
      const text = await frameAdapter.textContent('.element');
      expect(text).toBe('Test Content');
    });

    test('should get inner HTML', async () => {
      const html = await frameAdapter.innerHTML('.element');
      expect(html).toBe('<span>Inner HTML</span>');
    });

    test('should get attribute', async () => {
      const attr = await frameAdapter.getAttribute('.element', 'data-test');
      expect(attr).toBe('test-value');
      expect(mockElement.getAttribute).toHaveBeenCalledWith('data-test');
    });

    test('should check if element is visible', async () => {
      const isVisible = await frameAdapter.isVisible('.element');
      expect(isVisible).toBe(true);
    });

    test('should detect hidden element', async () => {
      const mockElement = {
        getBoundingClientRect: jest.fn().mockReturnValue({
          width: 100,
          height: 50,
          top: 0,
          left: 0
        })
      };
      
      // Mock querySelector to return element immediately to avoid waitForSelector timeout
      mockFrameDocument.querySelector = jest.fn().mockReturnValue(mockElement);
      
      // Override the waitForSelector method to skip visibility checks and return element directly
      const waitForSelectorSpy = jest.spyOn(frameAdapter, 'waitForSelector').mockResolvedValue(mockElement as any);
      
      mockFrameWindow.getComputedStyle = jest.fn().mockReturnValue({
        display: 'none',
        visibility: 'visible',
        opacity: '1'
      });

      const isVisible = await frameAdapter.isVisible('.element');
      expect(isVisible).toBe(false);
      
      waitForSelectorSpy.mockRestore();
    });

    test('should get bounding box', async () => {
      const bbox = await frameAdapter.boundingBox('.element');
      
      expect(bbox).toEqual({
        x: 10,
        y: 20,
        width: 100,
        height: 50
      });
    });
  });

  describe('Locator Methods', () => {
    test('should create locator', () => {
      frameAdapter.locator('.button');
      
      expect(window.PlaywrightLocatorAdapter).toHaveBeenCalledWith(
        '.button',
        expect.objectContaining({
          waitForSelector: expect.any(Function),
          scrollIntoViewIfNeeded: expect.any(Function),
          waitForTimeout: expect.any(Function),
          logger: mockLogger
        }),
        {}
      );
    });

    test('should throw error if LocatorAdapter not found', () => {
      delete (window as any).PlaywrightLocatorAdapter;
      
      expect(() => frameAdapter.locator('.button')).toThrow('PlaywrightLocatorAdapter not found in global scope');
    });
  });

  describe('Viewport and Utility Methods', () => {
    test('should get viewport size', () => {
      const size = frameAdapter.viewportSize();
      expect(size).toEqual({ width: 800, height: 600 });
    });

    test('should scroll element into view if needed', async () => {
      const mockElement = {
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: -100, // Out of view
          bottom: -50,
          left: 0,
          right: 100
        }),
        scrollIntoView: jest.fn()
      };

      await frameAdapter.scrollIntoViewIfNeeded(mockElement as any);
      
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });
    });

    test('should not scroll if element is already in view', async () => {
      const mockElement = {
        getBoundingClientRect: jest.fn().mockReturnValue({
          top: 100,
          bottom: 200,
          left: 100,
          right: 200
        }),
        scrollIntoView: jest.fn()
      };

      await frameAdapter.scrollIntoViewIfNeeded(mockElement as any);
      
      expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('Frame Navigation Methods', () => {
    beforeEach(() => {
      // Mock nested frames
      const nestedFrame1 = {
        src: 'https://nested1.com',
        name: 'nested1',
        contentWindow: { location: { href: 'https://nested1.com' } }
      };
      const nestedFrame2 = {
        src: 'https://nested2.com', 
        name: 'nested2',
        contentWindow: { location: { href: 'https://nested2.com' } }
      };

      mockFrameDocument.querySelectorAll = jest.fn().mockReturnValue([nestedFrame1, nestedFrame2]);
      
      // Mock FrameAdapter constructor for nested frames
      (window as any).PlaywrightFrameAdapter = jest.fn().mockImplementation(() => ({
        click: jest.fn(),
        fill: jest.fn(),
        url: jest.fn().mockReturnValue('https://nested1.com')
      }));
    });

    test('should get all frames', () => {
      const frames = frameAdapter.frames();
      expect(frames).toHaveLength(2);
      expect(mockFrameDocument.querySelectorAll).toHaveBeenCalledWith('iframe, frame');
    });

    test('should find frame by URL', () => {
      const frame = frameAdapter.frame({ url: 'nested1.com' });
      expect(frame).toBeDefined();
      expect(window.PlaywrightFrameAdapter).toHaveBeenCalled();
    });

    test('should find frame by name', () => {
      const frame = frameAdapter.frame({ name: 'nested2' });
      expect(frame).toBeDefined();
      expect(window.PlaywrightFrameAdapter).toHaveBeenCalled();
    });

    test('should return null if frame not found', () => {
      const frame = frameAdapter.frame({ name: 'nonexistent' });
      expect(frame).toBeNull();
    });

    test('should wait for frame', async () => {
      mockFrameDocument.querySelector = jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({
          tagName: 'IFRAME'
        });

      const framePromise = frameAdapter.waitForFrame('#new-frame');
      
      setTimeout(() => {
        // Frame will be found on second call
      }, 50);

      const result = await framePromise;
      expect(result).toBeDefined();
    });
  });
});