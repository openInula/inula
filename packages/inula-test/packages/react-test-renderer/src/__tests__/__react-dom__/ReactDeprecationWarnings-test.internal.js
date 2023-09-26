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
let ReactNoop;
let Scheduler;

describe('ReactDeprecationWarnings', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('horizon-external');
    ReactNoop = require('react-noop-renderer');
    Scheduler = require('scheduler');

  });


  it('should not warn when owner and self are the same for string refs', () => {

    class RefComponent extends React.Component {
      render() {
        return null;
      }
    }
    class Component extends React.Component {
      render() {
        return <RefComponent ref="refComponent" __self={this} />;
      }
    }
    ReactNoop.renderLegacySyncRoot(<Component />);
    expect(Scheduler).toFlushWithoutYielding();
  });
});
