/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let ReactDOM;

describe('SyntheticMouseEvent', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();
    React = require('horizon-external');
    ReactDOM = require('horizon');

    // The container has to be attached for events to fire.
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('should correctly calculate movementX/Y for capture phase', () => {
    const events = [];
    const onMouseMove = event => {
      events.push(['move', false]);
    };
    const onMouseMoveCapture = event => {
      events.push(['move', true]);
    };
    const onMouseDown = event => {
      events.push(['down', false]);
    };
    const onMouseDownCapture = event => {
      events.push(['down', true]);
    };

    const node = ReactDOM.render(
      <div
        onMouseMove={onMouseMove}
        onMouseMoveCapture={onMouseMoveCapture}
        onMouseDown={onMouseDown}
        onMouseDownCapture={onMouseDownCapture}
      />,
      container,
    );

    let event = new MouseEvent('mousemove', {
      relatedTarget: null,
      bubbles: true,
      screenX: 2,
      screenY: 2,
    });

    node.dispatchEvent(event);

    event = new MouseEvent('mousemove', {
      relatedTarget: null,
      bubbles: true,
      screenX: 8,
      screenY: 9,
    });

    node.dispatchEvent(event);

    // Now trigger a mousedown event to see if movementX has changed back to 0
    event = new MouseEvent('mousedown', {
      relatedTarget: null,
      bubbles: true,
      screenX: 25,
      screenY: 65,
    });

    node.dispatchEvent(event);

    expect(events).toEqual([
      ['move', true],
      ['move', false],
      ['move', true],
      ['move', false],
      ['down', true],
      ['down', false],
    ]);
  });
});
