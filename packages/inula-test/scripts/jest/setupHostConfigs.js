'use strict';

const inlinedHostConfigs = require('../shared/inlinedHostConfigs');

// jest.mock('renderer/src/Renderer', () => {
//   return require.requireActual(
//     'renderer/src/Renderer'
//   );
// });

// When testing the custom renderer code path through `renderer`,
// turn the export into a function, and use the argument as host config.
const shimHostConfigPath = 'inula/src/dom/DOMOperator';
jest.mock('renderer', () => {
  return config => {
    jest.mock(shimHostConfigPath, () => config);
    return require.requireActual('inula/src/renderer/Renderer');
  };
});

const configPaths = [
  'inula/src/dom/DOMOperator',
];

function mockAllConfigs(rendererInfo) {
  configPaths.forEach(path => {
    // We want the reconciler to pick up the host config for this renderer.
    jest.mock(path, () => {
      const shortName = rendererInfo.shortName;
      if (shortName === 'test') {
        return require.requireActual(`react-test-renderer/src/ReactTestHostConfig.js`);
      } else if (shortName === 'dom-browser') {
        return require.requireActual(`inula/src/dom/DOMOperator`);
      }
    });
  });
}

// But for inlined host configs (such as React DOM, Native, etc), we
// mock their named entry points to establish a host config mapping.
inlinedHostConfigs.forEach(rendererInfo => {
  rendererInfo.entryPoints.forEach(entryPoint => {
    jest.mock(entryPoint, () => {
      mockAllConfigs(rendererInfo);
      return require.requireActual(entryPoint);
    });
  });
});

// Make it possible to import this module inside
// the React package itself.
// jest.mock('horizon-external/src/ReactSharedInternals', () =>
//   require.requireActual('horizon-external/src/ReactSharedInternals')
// );

jest.mock('scheduler', () => require.requireActual('react-test-renderer/src/Scheduler_mock'));
jest.mock('inula/src/renderer/taskExecutor/BrowserAsync', () =>
  require.requireActual('react-test-renderer/src/BrowserAsync.mock.js')
);
