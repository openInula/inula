/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React = require('horizon-external');
let ReactDOM = require('horizon');
let Scheduler = require('scheduler');

describe('ReactDOMRoot', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();
    container = document.createElement('div');
    React = require('horizon-external');
    ReactDOM = require('horizon');
    Scheduler = require('scheduler');
  });

  if (!__EXPERIMENTAL__) {
    it('createRoot is not exposed in stable build', () => {
      expect(ReactDOM.unstable_createRoot).toBe(undefined);
    });
    return;
  }

  it('clears existing children with legacy API', async () => {
    container.innerHTML = '<div>a</div><div>b</div>';
    ReactDOM.render(
      <div>
        <span>c</span>
        <span>d</span>
      </div>,
      container,
    );
    expect(container.textContent).toEqual('cd');
    ReactDOM.render(
      <div>
        <span>d</span>
        <span>c</span>
      </div>,
      container,
    );
    Scheduler.unstable_flushAll();
    expect(container.textContent).toEqual('dc');
  });
});
