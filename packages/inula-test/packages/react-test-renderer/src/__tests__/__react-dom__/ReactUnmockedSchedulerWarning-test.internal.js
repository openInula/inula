/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

let React;
let ReactDOM;

function App() {
  return null;
}

beforeEach(() => {
  jest.resetModules();
  jest.unmock('scheduler');
  React = require('horizon-external');
  ReactDOM = require('horizon');
});

it('should warn in legacy mode', () => {
  // does not warn twice
  expect(() => {
    ReactDOM.render(<App />, document.createElement('div'));
  }).toErrorDev([]);
});

it('does not warn if Scheduler is mocked', () => {
  jest.resetModules();
  jest.mock('scheduler', () => require('react-test-renderer/src/Scheduler_mock'));
  React = require('horizon-external');
  ReactDOM = require('horizon');

  // This should not warn
  expect(() => {
    ReactDOM.render(<App />, document.createElement('div'));
  }).toErrorDev([]);
});
