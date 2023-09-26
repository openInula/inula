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

let MockedComponent;

describe('ReactMockedComponent', () => {
  beforeEach(() => {
    React = require('horizon-external');
    ReactDOM = require('horizon');

    MockedComponent = class extends React.Component {
      render() {
        throw new Error('Should not get here.');
      }
    };
    // This is close enough to what a Jest mock would give us.
    MockedComponent.prototype.render = jest.fn();
  });

  xit('should allow a mocked component to be rendered in dev', () => {
    const container = document.createElement('container');
    if (isDev) {
      ReactDOM.render(<MockedComponent />, container);
    } else {
      expect(() => ReactDOM.render(<MockedComponent />, container)).toThrow(
        'The render function cannot return null.',
      );
    }
  });

  xit('should allow a mocked component to be updated in dev', () => {
    const container = document.createElement('container');
    if (isDev) {
      ReactDOM.render(<MockedComponent />, container);
    } else {
      expect(() => ReactDOM.render(<MockedComponent />, container)).toThrow(
        'The render function cannot return null.',
      );
    }
    if (isDev) {
      ReactDOM.render(<MockedComponent />, container);
    } else {
      expect(() => ReactDOM.render(<MockedComponent />, container)).toThrow(
        'The render function cannot return null.',
      );
    }
  });
});
