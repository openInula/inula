/// <reference path="../../types/global.d.ts" />

import FrameLocatorAdapter from '../frame-locator-adapter.js';

// Mock dependencies
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  success: jest.fn(),
  setLevel: jest.fn(),
  getLevel: jest.fn()
};

const mockFrameAdapter = {
  click: jest.fn(),
  dblclick: jest.fn(),
  fill: jest.fn(),
  type: jest.fn(),
  press: jest.fn(),
  hover: jest.fn(),
  check: jest.fn(),
  uncheck: jest.fn(),
  selectOption: jest.fn(),
  focus: jest.fn(),
  waitForSelector: jest.fn(),
  waitForTimeout: jest.fn(),
  locator: jest.fn(),
  getByRole: jest.fn(),
  getByText: jest.fn(),
  getByLabel: jest.fn(),
  getByPlaceholder: jest.fn(),
  getByTestId: jest.fn(),
  getByTitle: jest.fn(),
  textContent: jest.fn(),
  innerHTML: jest.fn(),
  getAttribute: jest.fn(),
  isVisible: jest.fn(),
  title: jest.fn().mockResolvedValue('Frame Title'),
  url: jest.fn().mockReturnValue('https://frame.example.com')
};

// Setup global mocks
beforeAll(() => {
  (global as any).window = global.window || {};
  Object.assign(global.window, {
    PlaywrightFrameAdapter: jest.fn().mockImplementation(() => mockFrameAdapter)
  });
});

describe('FrameLocatorAdapter Tests', () => {
  let mockParentPage: any;
  let mockFrameElement: HTMLIFrameElement;
  let frameLocatorAdapter: FrameLocatorAdapter;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock frame element
    mockFrameElement = {
      tagName: 'IFRAME',
      id: 'test-frame',
      src: 'https://example.com/frame'
    } as HTMLIFrameElement;

    // Create mock parent page
    mockParentPage = {
      frameDocument: undefined, // Main page context
      createFrameAdapter: jest.fn().mockReturnValue(mockFrameAdapter)
    };
    
    // Reset the window mock for each test
    (window as any).PlaywrightFrameAdapter = jest.fn().mockImplementation(() => mockFrameAdapter);

    // Mock document.querySelector
    (document.querySelector as any) = jest.fn().mockReturnValue(mockFrameElement);

    frameLocatorAdapter = new FrameLocatorAdapter('#test-frame', mockParentPage);
  });

  describe('Constructor', () => {
    test('should create FrameLocatorAdapter with selector and parent page', () => {
      expect(frameLocatorAdapter).toBeInstanceOf(FrameLocatorAdapter);
    });

    test('should work with FrameAdapter as parent', () => {
      const mockFrameParent = {
        frameDocument: {
          querySelector: jest.fn().mockReturnValue(mockFrameElement),
          querySelectorAll: jest.fn(),
          createElement: jest.fn(),
          createTextNode: jest.fn(),
          body: { tagName: 'BODY' },
          documentElement: { tagName: 'HTML' }
        } as any,
        waitForSelector: jest.fn(),
        scrollIntoViewIfNeeded: jest.fn(),
        waitForTimeout: jest.fn(),
        logger: {
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          success: jest.fn()
        },
        eventSimulator: {
          simulateClick: jest.fn(),
          simulateDoubleClick: jest.fn(),
          simulateHover: jest.fn(),
          simulateKeyPress: jest.fn(),
          simulateTyping: jest.fn()
        }
      };

      const nestedFrameLocator = new FrameLocatorAdapter('#nested-frame', mockFrameParent);
      expect(nestedFrameLocator).toBeInstanceOf(FrameLocatorAdapter);
    });
  });

  describe('Element Interaction Methods', () => {
    test('should click element in frame', async () => {
      await frameLocatorAdapter.click('.button');

      expect(document.querySelector).toHaveBeenCalledWith('#test-frame');
      expect(mockParentPage.createFrameAdapter).toHaveBeenCalledWith(mockFrameElement);
      expect(mockFrameAdapter.click).toHaveBeenCalledWith('.button', undefined);
    });

    test('should click element with options', async () => {
      const options = { button: 'right' as const };
      await frameLocatorAdapter.click('.button', options);

      expect(mockFrameAdapter.click).toHaveBeenCalledWith('.button', options);
    });

    test('should double click element', async () => {
      await frameLocatorAdapter.dblclick('.button');

      expect(mockFrameAdapter.dblclick).toHaveBeenCalledWith('.button', undefined);
    });

    test('should fill form element', async () => {
      await frameLocatorAdapter.fill('#input', 'test value');

      expect(mockFrameAdapter.fill).toHaveBeenCalledWith('#input', 'test value', undefined);
    });

    test('should type text', async () => {
      const options = { delay: 100 };
      await frameLocatorAdapter.type('#input', 'hello', options);

      expect(mockFrameAdapter.type).toHaveBeenCalledWith('#input', 'hello', options);
    });

    test('should press key', async () => {
      await frameLocatorAdapter.press('#input', 'Enter');

      expect(mockFrameAdapter.press).toHaveBeenCalledWith('#input', 'Enter', undefined);
    });

    test('should hover element', async () => {
      await frameLocatorAdapter.hover('.button');

      expect(mockFrameAdapter.hover).toHaveBeenCalledWith('.button');
    });

    test('should check checkbox', async () => {
      await frameLocatorAdapter.check('#checkbox');

      expect(mockFrameAdapter.check).toHaveBeenCalledWith('#checkbox');
    });

    test('should uncheck checkbox', async () => {
      await frameLocatorAdapter.uncheck('#checkbox');

      expect(mockFrameAdapter.uncheck).toHaveBeenCalledWith('#checkbox');
    });

    test('should select option', async () => {
      await frameLocatorAdapter.selectOption('#select', 'value1');

      expect(mockFrameAdapter.selectOption).toHaveBeenCalledWith('#select', 'value1');
    });

    test('should focus element', async () => {
      await frameLocatorAdapter.focus('#input');

      expect(mockFrameAdapter.focus).toHaveBeenCalledWith('#input');
    });
  });

  describe('Wait Methods', () => {
    test('should wait for selector', async () => {
      const mockElement = { tagName: 'DIV', id: 'test' };
      const options = { timeout: 5000 };
      
      // Configure the mock to return an element
      mockFrameAdapter.waitForSelector.mockResolvedValue(mockElement);
      
      const result = await frameLocatorAdapter.waitForSelector('.element', options);

      expect(mockFrameAdapter.waitForSelector).toHaveBeenCalledWith('.element', options);
      expect(result).toBe(mockElement);
    });

    test('should wait for timeout', async () => {
      mockFrameAdapter.waitForTimeout.mockResolvedValue(undefined);
      
      await frameLocatorAdapter.waitForTimeout(1000);

      expect(mockFrameAdapter.waitForTimeout).toHaveBeenCalledWith(1000);
    });
  });

  describe('Locator Methods', () => {
    test('should create locator', () => {
      const mockLocator = { click: jest.fn() };
      mockFrameAdapter.locator.mockReturnValue(mockLocator);

      const locator = frameLocatorAdapter.locator('.button');

      expect(mockFrameAdapter.locator).toHaveBeenCalledWith('.button', undefined);
      expect(locator).toBe(mockLocator);
    });

    test('should create locator with options', () => {
      const options = { hasText: 'Submit' };
      frameLocatorAdapter.locator('.button', options);

      expect(mockFrameAdapter.locator).toHaveBeenCalledWith('.button', options);
    });
  });

  describe('Modern Locator Methods', () => {
    test('should get element by role', () => {
      const mockLocator = { click: jest.fn() };
      mockFrameAdapter.getByRole.mockReturnValue(mockLocator);

      const locator = frameLocatorAdapter.getByRole('button', { name: 'Submit' });

      expect(mockFrameAdapter.getByRole).toHaveBeenCalledWith('button', { name: 'Submit' });
      expect(locator).toBe(mockLocator);
    });

    test('should get element by text', () => {
      const mockLocator = { click: jest.fn() };
      mockFrameAdapter.getByText.mockReturnValue(mockLocator);

      const locator = frameLocatorAdapter.getByText('Click me');

      expect(mockFrameAdapter.getByText).toHaveBeenCalledWith('Click me', undefined);
      expect(locator).toBe(mockLocator);
    });

    test('should get element by label', () => {
      frameLocatorAdapter.getByLabel('Username');
      expect(mockFrameAdapter.getByLabel).toHaveBeenCalledWith('Username', undefined);
    });

    test('should get element by placeholder', () => {
      frameLocatorAdapter.getByPlaceholder('Enter text...');
      expect(mockFrameAdapter.getByPlaceholder).toHaveBeenCalledWith('Enter text...', undefined);
    });

    test('should get element by test id', () => {
      frameLocatorAdapter.getByTestId('submit-button');
      expect(mockFrameAdapter.getByTestId).toHaveBeenCalledWith('submit-button');
    });

    test('should get element by title', () => {
      frameLocatorAdapter.getByTitle('Help text');
      expect(mockFrameAdapter.getByTitle).toHaveBeenCalledWith('Help text', undefined);
    });
  });

  describe('Element Information Methods', () => {
    test('should get text content', async () => {
      mockFrameAdapter.textContent.mockResolvedValue('Test content');

      const text = await frameLocatorAdapter.textContent('.element');

      expect(mockFrameAdapter.textContent).toHaveBeenCalledWith('.element');
      expect(text).toBe('Test content');
    });

    test('should get inner HTML', async () => {
      mockFrameAdapter.innerHTML.mockResolvedValue('<span>HTML</span>');

      const html = await frameLocatorAdapter.innerHTML('.element');

      expect(mockFrameAdapter.innerHTML).toHaveBeenCalledWith('.element');
      expect(html).toBe('<span>HTML</span>');
    });

    test('should get attribute', async () => {
      mockFrameAdapter.getAttribute.mockResolvedValue('test-value');

      const attr = await frameLocatorAdapter.getAttribute('.element', 'data-test');

      expect(mockFrameAdapter.getAttribute).toHaveBeenCalledWith('.element', 'data-test');
      expect(attr).toBe('test-value');
    });

    test('should check if element is visible', async () => {
      mockFrameAdapter.isVisible.mockResolvedValue(true);

      const isVisible = await frameLocatorAdapter.isVisible('.element');

      expect(mockFrameAdapter.isVisible).toHaveBeenCalledWith('.element');
      expect(isVisible).toBe(true);
    });
  });

  describe('Nested FrameLocator Support', () => {
    test('should create nested FrameLocator', () => {
      const nestedFrameLocator = frameLocatorAdapter.frameLocator('#nested-frame');

      expect(nestedFrameLocator).toBeInstanceOf(FrameLocatorAdapter);
    });

    test('should handle nested frame operations', async () => {
      // Mock the nested frame element
      const nestedFrameElement = { tagName: 'IFRAME' };
      const frameDocumentMock = {
        querySelector: jest.fn().mockReturnValue(nestedFrameElement)
      };
      
      // Create a mock frame adapter with frameDocument property for the parent
      const parentFrameAdapter = {
        ...mockFrameAdapter,
        frameDocument: frameDocumentMock,
        createFrameAdapter: jest.fn().mockReturnValue(mockFrameAdapter)
      };
      
      // Mock createFrameAdapter to return our parent frame adapter first
      mockParentPage.createFrameAdapter.mockReturnValue(parentFrameAdapter);

      // Now create the nested frame locator
      const nestedFrameLocator = frameLocatorAdapter.frameLocator('#nested-frame');
      await nestedFrameLocator.click('.nested-button');

      // Verify that the parent frame adapter's createFrameAdapter was called with the nested element
      expect(parentFrameAdapter.createFrameAdapter).toHaveBeenCalledWith(nestedFrameElement);
    });
  });

  describe('Frame Access Methods', () => {
    test('should get actual frame adapter', () => {
      const frame = frameLocatorAdapter.frame();

      expect(frame).toBe(mockFrameAdapter);
      expect(mockParentPage.createFrameAdapter).toHaveBeenCalledWith(mockFrameElement);
    });
  });

  describe('Error Handling', () => {
    test('should throw error if frame element not found', async () => {
      (document.querySelector as any).mockReturnValue(null);

      await expect(frameLocatorAdapter.click('.button')).rejects.toThrow('Frame not found: #test-frame');
    });

    test('should throw error if element is not an iframe', async () => {
      const divElement = { tagName: 'DIV' };
      (document.querySelector as any).mockReturnValue(divElement);

      await expect(frameLocatorAdapter.click('.button')).rejects.toThrow('Element is not an iframe: #test-frame');
    });

    test('should throw error if PlaywrightFrameAdapter not found', async () => {
      delete (window as any).PlaywrightFrameAdapter;
      mockParentPage.createFrameAdapter = undefined;

      await expect(frameLocatorAdapter.click('.button')).rejects.toThrow('PlaywrightFrameAdapter not found in global scope');
    });

    test('should throw error if frame adapter creation fails', async () => {
      (window as any).PlaywrightFrameAdapter = jest.fn().mockImplementation(() => {
        throw new Error('Cross-origin access denied');
      });
      mockParentPage.createFrameAdapter = undefined;

      await expect(frameLocatorAdapter.click('.button')).rejects.toThrow('Cannot create frame adapter: Cross-origin access denied');
    });
  });

  describe('Parent Context Detection', () => {
    test('should use parent frame document when parent is FrameAdapter', async () => {
      const mockFrameParent = {
        frameDocument: {
          querySelector: jest.fn().mockReturnValue(mockFrameElement),
          querySelectorAll: jest.fn(),
          createElement: jest.fn(),
          createTextNode: jest.fn(),
          body: { tagName: 'BODY' },
          documentElement: { tagName: 'HTML' }
        } as any,
        waitForSelector: jest.fn(),
        scrollIntoViewIfNeeded: jest.fn(),
        waitForTimeout: jest.fn(),
        logger: {
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          success: jest.fn()
        },
        eventSimulator: {
          simulateClick: jest.fn(),
          simulateDoubleClick: jest.fn(),
          simulateHover: jest.fn(),
          simulateKeyPress: jest.fn(),
          simulateTyping: jest.fn()
        }
      };

      const nestedFrameLocator = new FrameLocatorAdapter('#nested-frame', mockFrameParent);
      await nestedFrameLocator.click('.button');

      expect(mockFrameParent.frameDocument.querySelector).toHaveBeenCalledWith('#nested-frame');
    });

    test('should use main document when parent is PageAdapter', async () => {
      await frameLocatorAdapter.click('.button');

      expect(document.querySelector).toHaveBeenCalledWith('#test-frame');
    });
  });

  describe('Frame Adapter Delegation', () => {
    test('should delegate createFrameAdapter to parent when available', async () => {
      await frameLocatorAdapter.click('.button');

      expect(mockParentPage.createFrameAdapter).toHaveBeenCalledWith(mockFrameElement);
    });

    test('should create frame adapter directly when parent method unavailable', async () => {
      mockParentPage.createFrameAdapter = undefined;

      await frameLocatorAdapter.click('.button');

      expect(window.PlaywrightFrameAdapter).toHaveBeenCalledWith(mockFrameElement);
    });
  });

  describe('Method Chaining and Fluent API', () => {
    test('should support method chaining through returned locators', () => {
      const mockLocator = {
        click: jest.fn().mockResolvedValue(undefined),
        fill: jest.fn().mockResolvedValue(undefined)
      };
      mockFrameAdapter.getByRole.mockReturnValue(mockLocator);

      const locator = frameLocatorAdapter.getByRole('button', { name: 'Submit' });
      
      expect(typeof locator.click).toBe('function');
      expect(typeof locator.fill).toBe('function');
    });

    test('should support nested frameLocator calls', () => {
      const level1 = frameLocatorAdapter.frameLocator('#level1');
      const level2 = level1.frameLocator('#level2');
      const level3 = level2.frameLocator('#level3');

      expect(level3).toBeInstanceOf(FrameLocatorAdapter);
    });
  });
});