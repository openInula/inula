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

const ChildComponent = ({id, eventHandler}) => (
  <div
    id={id + '__DIV'}
    onClickCapture={e => eventHandler(e.currentTarget.id, 'captured', e.type)}
    onClick={e => eventHandler(e.currentTarget.id, 'bubbled', e.type)}
    onMouseEnter={e => eventHandler(e.currentTarget.id, e.type)}
    onMouseLeave={e => eventHandler(e.currentTarget.id, e.type)}>
    <div
      id={id + '__DIV_1'}
      onClickCapture={e => eventHandler(e.currentTarget.id, 'captured', e.type)}
      onClick={e => eventHandler(e.currentTarget.id, 'bubbled', e.type)}
      onMouseEnter={e => eventHandler(e.currentTarget.id, e.type)}
      onMouseLeave={e => eventHandler(e.currentTarget.id, e.type)}
    />
    <div
      id={id + '__DIV_2'}
      onClickCapture={e => eventHandler(e.currentTarget.id, 'captured', e.type)}
      onClick={e => eventHandler(e.currentTarget.id, 'bubbled', e.type)}
      onMouseEnter={e => eventHandler(e.currentTarget.id, e.type)}
      onMouseLeave={e => eventHandler(e.currentTarget.id, e.type)}
    />
  </div>
);

const ParentComponent = ({eventHandler}) => (
  <div
    id="P"
    onClickCapture={e => eventHandler(e.currentTarget.id, 'captured', e.type)}
    onClick={e => eventHandler(e.currentTarget.id, 'bubbled', e.type)}
    onMouseEnter={e => eventHandler(e.currentTarget.id, e.type)}
    onMouseLeave={e => eventHandler(e.currentTarget.id, e.type)}>
    <div
      id="P_P1"
      onClickCapture={e => eventHandler(e.currentTarget.id, 'captured', e.type)}
      onClick={e => eventHandler(e.currentTarget.id, 'bubbled', e.type)}
      onMouseEnter={e => eventHandler(e.currentTarget.id, e.type)}
      onMouseLeave={e => eventHandler(e.currentTarget.id, e.type)}>
      <ChildComponent id="P_P1_C1" eventHandler={eventHandler} />
      <ChildComponent id="P_P1_C2" eventHandler={eventHandler} />
    </div>
    <div
      id="P_OneOff"
      onClickCapture={e => eventHandler(e.currentTarget.id, 'captured', e.type)}
      onClick={e => eventHandler(e.currentTarget.id, 'bubbled', e.type)}
      onMouseEnter={e => eventHandler(e.currentTarget.id, e.type)}
      onMouseLeave={e => eventHandler(e.currentTarget.id, e.type)}
    />
  </div>
);

describe('ReactTreeTraversal', () => {
  const mockFn = jest.fn();
  let container;
  let outerNode1;
  let outerNode2;

  beforeEach(() => {
    React = require('horizon-external');
    ReactDOM = require('horizon');

    mockFn.mockReset();

    container = document.createElement('div');
    outerNode1 = document.createElement('div');
    outerNode2 = document.createElement('div');
    document.body.appendChild(container);
    document.body.appendChild(outerNode1);
    document.body.appendChild(outerNode2);

    ReactDOM.render(<ParentComponent eventHandler={mockFn} />, container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.removeChild(outerNode1);
    document.body.removeChild(outerNode2);
    container = null;
    outerNode1 = null;
    outerNode2 = null;
  });

  describe('Two phase traversal', () => {
    it('should not traverse when target is outside component boundary', () => {
      outerNode1.dispatchEvent(
        new MouseEvent('click', {bubbles: true, cancelable: true}),
      );

      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should traverse two phase across component boundary', () => {
      const expectedCalls = [
        ['P', 'captured', 'click'],
        ['P_P1', 'captured', 'click'],
        ['P_P1_C1__DIV', 'captured', 'click'],
        ['P_P1_C1__DIV_1', 'captured', 'click'],

        ['P_P1_C1__DIV_1', 'bubbled', 'click'],
        ['P_P1_C1__DIV', 'bubbled', 'click'],
        ['P_P1', 'bubbled', 'click'],
        ['P', 'bubbled', 'click'],
      ];

      const node = document.getElementById('P_P1_C1__DIV_1');
      node.dispatchEvent(
        new MouseEvent('click', {bubbles: true, cancelable: true}),
      );

      expect(mockFn.mock.calls).toEqual(expectedCalls);
    });

    it('should traverse two phase at shallowest node', () => {
      const node = document.getElementById('P');
      node.dispatchEvent(
        new MouseEvent('click', {bubbles: true, cancelable: true}),
      );

      const expectedCalls = [
        ['P', 'captured', 'click'],
        ['P', 'bubbled', 'click'],
      ];
      expect(mockFn.mock.calls).toEqual(expectedCalls);
    });
  });
});
