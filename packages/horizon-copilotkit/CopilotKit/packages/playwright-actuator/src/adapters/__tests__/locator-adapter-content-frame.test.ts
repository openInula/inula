import LocatorAdapter from '../locator-adapter.js';
import type { PageContext, FrameAdapter } from '../../../types/index.js';

describe('LocatorAdapter contentFrame', () => {
  let mockLogger: any;
  let mockEventSimulator: any;
  let mockPageContext: PageContext;
  let mockFrameAdapterConstructor: jest.Mock;

  beforeEach(() => {
    // Mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      success: jest.fn()
    };

    // Mock event simulator
    mockEventSimulator = {
      simulateClick: jest.fn(),
      simulateDoubleClick: jest.fn(),
      simulateHover: jest.fn(),
      simulateKeyPress: jest.fn(),
      simulateTyping: jest.fn()
    };

    // Mock page context
    mockPageContext = {
      frameDocument: undefined,
      waitForSelector: jest.fn(),
      scrollIntoViewIfNeeded: jest.fn(),
      waitForTimeout: jest.fn(),
      logger: mockLogger,
      eventSimulator: mockEventSimulator
    };

    // Mock FrameAdapter constructor
    mockFrameAdapterConstructor = jest.fn().mockImplementation((frameElement: HTMLIFrameElement) => ({
      frameElement,
      frameDocument: frameElement.contentWindow?.document,
      url: () => frameElement.src || 'about:blank',
      isDetached: () => !document.contains(frameElement),
      click: jest.fn(),
      fill: jest.fn(),
      locator: jest.fn()
    }));
    
    // Mock global window objects
    (global as any).window = {
      PlaywrightLogger: jest.fn().mockImplementation(() => mockLogger),
      PlaywrightFrameAdapter: mockFrameAdapterConstructor
    };
    
    // 也要设置在 window 上
    (window as any).PlaywrightLogger = (global as any).window.PlaywrightLogger;
    (window as any).PlaywrightFrameAdapter = mockFrameAdapterConstructor;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('contentFrame()', () => {
    test('应该成功获取iframe的contentFrame', async () => {
      // 创建模拟的iframe元素
      const mockIframe = document.createElement('iframe');
      mockIframe.src = 'http://example.com';
      
      // 模拟contentWindow和document
      const mockContentWindow = {
        document: document.implementation.createHTMLDocument('Frame Document'),
        location: { href: 'http://example.com' }
      };
      
      Object.defineProperty(mockIframe, 'contentWindow', {
        value: mockContentWindow,
        configurable: true
      });

      // 模拟DOM查询
      document.body.appendChild(mockIframe);
      
      const locator = new LocatorAdapter('iframe[src="http://example.com"]', mockPageContext);
      
      // Mock waitFor to return the iframe element
      jest.spyOn(locator, 'waitFor').mockResolvedValue(mockIframe);

      const frame = await locator.contentFrame();

      expect(frame).not.toBeNull();
      expect(mockFrameAdapterConstructor).toHaveBeenCalledWith(mockIframe);
      expect(mockLogger.debug).toHaveBeenCalledWith('Created frame adapter for: iframe[src="http://example.com"]');
      
      // 清理
      document.body.removeChild(mockIframe);
    });

    test('应该对非iframe元素返回null', async () => {
      const mockDiv = document.createElement('div');
      document.body.appendChild(mockDiv);
      
      const locator = new LocatorAdapter('div', mockPageContext);
      
      // Mock waitFor to return the div element
      jest.spyOn(locator, 'waitFor').mockResolvedValue(mockDiv);

      const frame = await locator.contentFrame();

      expect(frame).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith('Element is not an iframe or frame: div');
      
      // 清理
      document.body.removeChild(mockDiv);
    });

    test('应该处理cross-origin iframe访问错误', async () => {
      const mockIframe = document.createElement('iframe');
      mockIframe.src = 'http://cross-origin.com';
      
      // 模拟cross-origin访问被拒绝
      Object.defineProperty(mockIframe, 'contentWindow', {
        get: () => null,
        configurable: true
      });

      document.body.appendChild(mockIframe);
      
      const locator = new LocatorAdapter('iframe[src="http://cross-origin.com"]', mockPageContext);
      
      // Mock waitFor to return the iframe element
      jest.spyOn(locator, 'waitFor').mockResolvedValue(mockIframe);

      const frame = await locator.contentFrame();

      expect(frame).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith('Cannot access frame window (cross-origin?): iframe[src="http://cross-origin.com"]');
      
      // 清理
      document.body.removeChild(mockIframe);
    });

    test('应该处理FrameAdapter创建失败', async () => {
      const mockIframe = document.createElement('iframe');
      mockIframe.src = 'http://example.com';
      
      const mockContentWindow = {
        document: document.implementation.createHTMLDocument('Frame Document'),
        location: { href: 'http://example.com' }
      };
      
      Object.defineProperty(mockIframe, 'contentWindow', {
        value: mockContentWindow,
        configurable: true
      });

      document.body.appendChild(mockIframe);
      
      // Mock PlaywrightFrameAdapter to throw error
      const failingConstructor = jest.fn().mockImplementation(() => {
        throw new Error('Frame adapter creation failed');
      });
      (global as any).window.PlaywrightFrameAdapter = failingConstructor;
      (window as any).PlaywrightFrameAdapter = failingConstructor;
      
      const locator = new LocatorAdapter('iframe[src="http://example.com"]', mockPageContext);
      
      // Mock waitFor to return the iframe element
      jest.spyOn(locator, 'waitFor').mockResolvedValue(mockIframe);

      const frame = await locator.contentFrame();

      expect(frame).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create frame adapter: Frame adapter creation failed');
      
      // 清理
      document.body.removeChild(mockIframe);
    });

    test('应该处理PlaywrightFrameAdapter不存在的情况', async () => {
      const mockIframe = document.createElement('iframe');
      mockIframe.src = 'http://example.com';
      
      const mockContentWindow = {
        document: document.implementation.createHTMLDocument('Frame Document'),
        location: { href: 'http://example.com' }
      };
      
      Object.defineProperty(mockIframe, 'contentWindow', {
        value: mockContentWindow,
        configurable: true
      });

      document.body.appendChild(mockIframe);
      
      // Remove PlaywrightFrameAdapter from global
      delete (global as any).window.PlaywrightFrameAdapter;
      delete (window as any).PlaywrightFrameAdapter;
      
      const locator = new LocatorAdapter('iframe[src="http://example.com"]', mockPageContext);
      
      // Mock waitFor to return the iframe element
      jest.spyOn(locator, 'waitFor').mockResolvedValue(mockIframe);

      const frame = await locator.contentFrame();
      
      expect(frame).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('contentFrame failed: PlaywrightFrameAdapter not found in global scope');
      
      // 清理
      document.body.removeChild(mockIframe);
    });

    test('应该处理waitFor超时错误', async () => {
      const locator = new LocatorAdapter('iframe[src="nonexistent"]', mockPageContext);
      
      // Mock waitFor to throw timeout error
      jest.spyOn(locator, 'waitFor').mockRejectedValue(new Error('Element not found'));

      const frame = await locator.contentFrame();

      expect(frame).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('contentFrame failed: Element not found');
    });

    test('应该支持frame元素（不只是iframe）', async () => {
      // 创建模拟的frame元素
      const mockFrame = document.createElement('frame');
      mockFrame.src = 'http://example.com';
      
      const mockContentWindow = {
        document: document.implementation.createHTMLDocument('Frame Document'),
        location: { href: 'http://example.com' }
      };
      
      Object.defineProperty(mockFrame, 'contentWindow', {
        value: mockContentWindow,
        configurable: true
      });

      document.body.appendChild(mockFrame);
      
      const locator = new LocatorAdapter('frame[src="http://example.com"]', mockPageContext);
      
      // Mock waitFor to return the frame element
      jest.spyOn(locator, 'waitFor').mockResolvedValue(mockFrame);

      const frame = await locator.contentFrame();

      expect(frame).not.toBeNull();
      expect(mockFrameAdapterConstructor).toHaveBeenCalledWith(mockFrame);
      
      // 清理
      document.body.removeChild(mockFrame);
    });
  });
});