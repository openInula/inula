import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder before JSDOM import
Object.assign(global, {
  TextEncoder,
  TextDecoder,
});

// Setup environment polyfills
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});