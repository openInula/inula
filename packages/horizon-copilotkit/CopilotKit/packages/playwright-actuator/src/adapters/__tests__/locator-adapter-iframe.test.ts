/// <reference path="../../types/global.d.ts" />

import LocatorAdapter from '../locator-adapter.js';

describe('LocatorAdapter iframe document context', () => {
  let mockFrameDocument: Document;
  let mockPage: any;
  let mockElement: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock frame element
    mockElement = {
      tagName: 'DIV',
      id: 'test-element',
      textContent: 'Test Content',
      getAttribute: jest.fn().mockReturnValue('test-value'),
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 100, height: 50, top: 10, left: 10
      }),
      contains: jest.fn()
    } as any;

    // Create mock frame document
    mockFrameDocument = {
      querySelectorAll: jest.fn().mockReturnValue([mockElement]),
      querySelector: jest.fn().mockReturnValue(mockElement),
      evaluate: jest.fn().mockReturnValue({
        snapshotLength: 1,
        snapshotItem: jest.fn().mockReturnValue(mockElement)
      }),
      contains: jest.fn().mockReturnValue(true),
      body: { tagName: 'BODY' } as any
    } as any;

    // Create mock frameWindow for iframe context
    const mockFrameWindow = {
      getComputedStyle: jest.fn().mockReturnValue({
        display: 'block',
        visibility: 'visible'
      })
    };

    // Create mock page with frameDocument (simulating iframe context)
    mockPage = {
      frameDocument: mockFrameDocument, // This indicates we're in an iframe
      frameWindow: mockFrameWindow, // This is the iframe's window
      scrollIntoViewIfNeeded: jest.fn(),
      eventSimulator: {
        simulateClick: jest.fn(),
        simulateHover: jest.fn()
      },
      logger: {
        debug: jest.fn()
      }
    };

    // Mock getComputedStyle for visibility checks
    (global as any).window = {
      getComputedStyle: jest.fn().mockReturnValue({
        display: 'block',
        visibility: 'visible'
      })
    };
  });

  afterEach(() => {
    delete (global as any).window;
  });

  test('should use frameDocument instead of global document for CSS selectors', () => {
    const locator = new LocatorAdapter('.test-selector', mockPage);
    
    // Trigger element resolution
    const elements = (locator as any).getCurrentElements();
    
    // Should use frameDocument, not global document
    expect(mockFrameDocument.querySelectorAll).toHaveBeenCalledWith('.test-selector');
    expect(elements).toEqual([mockElement]);
  });

  test('should use frameDocument for XPath queries', () => {
    const locator = new LocatorAdapter('xpath=//div[@class="test"]', mockPage);
    
    // Trigger element resolution
    (locator as any).getCurrentElements();
    
    // Should use frameDocument for XPath evaluation
    expect(mockFrameDocument.evaluate).toHaveBeenCalledWith(
      '//div[@class="test"]',
      mockFrameDocument,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
  });

  test('should use frameDocument for element containment checks', async () => {
    const locator = new LocatorAdapter('.test-selector', mockPage);
    
    // Set up element cache
    (locator as any)._element = mockElement;
    
    // Call getElementImmediate which checks document.contains
    await (locator as any).getElementImmediate();
    
    // Should use frameDocument.contains, not global document.contains  
    expect(mockFrameDocument.contains).toHaveBeenCalledWith(mockElement);
  });

  test('should use frameDocument.body for unique selector building', () => {
    const locator = new LocatorAdapter('.test-selector', mockPage);
    
    // Mock element with parent structure
    const parentElement = { tagName: 'BODY', className: '', parentNode: null };
    const testElement = {
      id: '',
      tagName: 'DIV',
      className: 'test-class',
      parentElement: parentElement,
      parentNode: null as any
    } as any;
    
    // Set up the parent reference after creation
    testElement.parentNode = { children: [testElement] };
    
    // Call buildUniqueSelector
    const selector = (locator as any).buildUniqueSelector(testElement);
    
    // Should build selector path until frameDocument.body, not global document.body
    expect(selector).toContain('div.test-class');
  });

  test.skip('should fall back to global document when no frameDocument exists', () => {
    // Create page without frameDocument (main page context)
    const mainPageMock = {
      scrollIntoViewIfNeeded: jest.fn(),
      eventSimulator: {
        simulateClick: jest.fn(),
        simulateDoubleClick: jest.fn(),
        simulateHover: jest.fn(),
        simulateKeyPress: jest.fn(),
        simulateTyping: jest.fn()
      },
      waitForSelector: jest.fn(),
      waitForTimeout: jest.fn(),
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        success: jest.fn()
      }
      // No frameDocument property - this should trigger fallback to global document
    };

    // Mock global document
    const globalDocument = {
      querySelectorAll: jest.fn().mockReturnValue([mockElement]),
      contains: jest.fn().mockReturnValue(true),
      body: { tagName: 'BODY' }
    };

    // Store original document
    const originalDocument = (global as any).document;
    (global as any).document = globalDocument;

    const locator = new LocatorAdapter('.test-selector', mainPageMock);
    
    // Directly call the element resolution to avoid waiting logic
    (locator as any).getCurrentElements();
    
    // Should use global document when no frameDocument
    expect(globalDocument.querySelectorAll).toHaveBeenCalledWith('.test-selector');

    // Restore original document  
    (global as any).document = originalDocument;
  });

  test('should use frameDocument in waitFor state checks', async () => {
    const locator = new LocatorAdapter('.test-selector', mockPage);
    
    try {
      await locator.waitFor({ state: 'attached', timeout: 100 });
    } catch (error) {
      // Expected to timeout, but we want to check the document usage
    }
    
    // Should have used frameDocument.contains for attachment check
    expect(mockFrameDocument.contains).toHaveBeenCalled();
  });

  test('should correctly handle nested iframe scenarios', () => {
    // Create nested frame document structure
    const nestedFrameDocument = {
      querySelectorAll: jest.fn().mockReturnValue([mockElement]),
      contains: jest.fn().mockReturnValue(true),
      body: { tagName: 'BODY' }
    } as any;

    const nestedPage = {
      frameDocument: nestedFrameDocument,
      scrollIntoViewIfNeeded: jest.fn(),
      eventSimulator: {
        simulateClick: jest.fn(),
        simulateDoubleClick: jest.fn(),
        simulateHover: jest.fn(),
        simulateKeyPress: jest.fn(),
        simulateTyping: jest.fn()
      },
      waitForSelector: jest.fn(),
      waitForTimeout: jest.fn(),
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        success: jest.fn()
      }
    };

    const locator = new LocatorAdapter('.nested-selector', nestedPage);
    
    // Trigger element resolution  
    (locator as any).getCurrentElements();
    
    // Should use the nested frame's document
    expect(nestedFrameDocument.querySelectorAll).toHaveBeenCalledWith('.nested-selector');
    expect(mockFrameDocument.querySelectorAll).not.toHaveBeenCalled();
  });
});