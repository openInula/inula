/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

// NOTE: We're explicitly not using JSX here. This is intended to test
// the current stack addendum without having source location added by babel.

'use strict';

let React;
let ReactTestUtils;

describe('ReactChildReconciler', () => {
  beforeEach(() => {
    jest.resetModules();

    React = require('horizon-external');
    ReactTestUtils = require('react-test-renderer/test-utils');
  });

  function createIterable(array) {
    return {
      '@@iterator': function() {
        let i = 0;
        return {
          next() {
            const next = {
              value: i < array.length ? array[i] : undefined,
              done: i === array.length,
            };
            i++;
            return next;
          },
        };
      },
    };
  }

  function makeIterableFunction(value) {
    const fn = () => {};
    fn['@@iterator'] = function iterator() {
      let timesCalled = 0;
      return {
        next() {
          const done = timesCalled++ > 0;
          return {done, value: done ? undefined : value};
        },
      };
    };
    return fn;
  }

  xit('does not treat functions as iterables', () => {
    let node;
    const iterableFunction = makeIterableFunction('foo');

    expect(() => {
      node = ReactTestUtils.renderIntoDocument(
        <div>
          <h1>{iterableFunction}</h1>
        </div>,
      );
    }).toErrorDev(
      'horizon child can not be functions.  use string / object / array.',
    );

    expect(node.innerHTML).toContain(''); // h1
  });

  xit('warns for duplicated array keys', () => {
    class Component extends React.Component {
      render() {
        return <div>{[<div key="1" />, <div key="1" />]}</div>;
      }
    }

    expect(() => ReactTestUtils.renderIntoDocument(<Component />)).toErrorDev(
      'Components with the same key value cannot exist: `1`, which may cause an error.',
    );
  });

  xit('warns for duplicated array keys with component stack info', () => {
    class Component extends React.Component {
      render() {
        return <div>{[<div key="1" />, <div key="1" />]}</div>;
      }
    }

    class Parent extends React.Component {
      render() {
        return React.cloneElement(this.props.child);
      }
    }

    class GrandParent extends React.Component {
      render() {
        return <Parent child={<Component />} />;
      }
    }

    expect(() => ReactTestUtils.renderIntoDocument(<GrandParent />)).toErrorDev(
      'Components with the same key value cannot exist: `1`, which may cause an error.',
    );
  });

  xit('warns for duplicated iterable keys', () => {
    class Component extends React.Component {
      render() {
        return <div>{createIterable([<div key="1" />, <div key="1" />])}</div>;
      }
    }

    expect(() => ReactTestUtils.renderIntoDocument(<Component />)).toErrorDev(
      'Components with the same key value cannot exist: `1`, which may cause an error.',
    );
  });

  xit('warns for duplicated iterable keys with component stack info', () => {
    class Component extends React.Component {
      render() {
        return <div>{createIterable([<div key="1" />, <div key="1" />])}</div>;
      }
    }

    class Parent extends React.Component {
      render() {
        return React.cloneElement(this.props.child);
      }
    }

    class GrandParent extends React.Component {
      render() {
        return <Parent child={<Component />} />;
      }
    }

    expect(() => ReactTestUtils.renderIntoDocument(<GrandParent />)).toErrorDev(
      'Components with the same key value cannot exist: `1`, which may cause an error.',
    );
  });
});
