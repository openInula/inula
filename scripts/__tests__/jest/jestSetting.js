import { unmountComponentAtNode } from '../../../libs/horizon/src/dom/DOMExternal';
import { getLogUtils } from './testUtils';
//import failOnConsole from 'jest-fail-on-console';

//failOnConsole();
const LogUtils = getLogUtils();
global.isDev = process.env.NODE_ENV === 'development';
global.isTest = true;
global.container = null;
global.beforeEach(() => {
  LogUtils.clear();
  // 创建一个 DOM 元素作为渲染目标
  global.container = document.createElement('div');
  document.body.appendChild(global.container);
});

global.afterEach(() => {
  unmountComponentAtNode(global.container);
  global.container.remove();
  global.container = null;
  LogUtils.clear();
});


function runAssertion(fn) {
  try {
    fn();
  } catch (error) {
    return {
      pass: false,
      message: () => error.message,
    };
  }
  return { pass: true };
}

function toMatchValue(LogUtils, expectedValues) {
  return runAssertion(() => {
    const actualValues = LogUtils.getAndClear();
    expect(actualValues).toEqual(expectedValues);
  });
}

// 使Jest感知自定义匹配器
expect.extend({
  toMatchValue,
});
