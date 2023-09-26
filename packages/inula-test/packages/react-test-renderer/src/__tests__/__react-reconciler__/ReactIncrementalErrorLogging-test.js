/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

'use strict';

let React;
let ReactNoop;
let Scheduler;

describe('ReactIncrementalErrorLogging', () => {
  beforeEach(() => {
    jest.resetModules();
    ReactNoop = require('react-noop-renderer');
    React = require('horizon-external');
    Scheduler = require('scheduler');
  });

  // Note: in this test file we won't be using toErrorDev() matchers
  // because they filter out precisely the messages we want to test for.
  let oldConsoleError;
  beforeEach(() => {
    oldConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = oldConsoleError;
    oldConsoleError = null;
  });

  it('should log errors that occur during the begin phase', () => {
    class ErrorThrowingComponent extends React.Component {
      constructor(props) {
        super(props);
        throw new Error('constructor error');
      }
      render() {
        return <div />;
      }
    }

    expect(() => {
      ReactNoop.render(
        <div>
        <span>
          <ErrorThrowingComponent />
        </span>
        </div>,
      );
    }).toThrow('constructor error');
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should log errors that occur during the commit phase', () => {
    class ErrorThrowingComponent extends React.Component {
      componentDidMount() {
        throw new Error('componentDidMount error');
      }
      render() {
        return <div />;
      }
    }

    expect(() => {
      ReactNoop.render(
        <div>
        <span>
          <ErrorThrowingComponent />
        </span>
        </div>,
      );
    }).toThrow('componentDidMount error');
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('resets instance variables before unmounting failed node', () => {
    class ErrorBoundary extends React.Component {
      state = {error: null};
      componentDidCatch(error) {
        this.setState({error});
      }
      render() {
        return this.state.error ? null : this.props.children;
      }
    }
    class Foo extends React.Component {
      state = {step: 0};
      componentDidMount() {
        this.setState({step: 1});
      }
      componentWillUnmount() {
        Scheduler.unstable_yieldValue(
          'componentWillUnmount: ' + this.state.step,
        );
      }
      render() {
        Scheduler.unstable_yieldValue('render: ' + this.state.step);
        if (this.state.step > 0) {
          throw new Error('oops');
        }
        return null;
      }
    }

    ReactNoop.render(
      <ErrorBoundary>
        <Foo />
      </ErrorBoundary>,
    );
    expect(Scheduler).toHaveYielded(
      [
        'render: 0',

        'render: 1',

        // Retry one more time before handling error
        // 'render: 1',

        'componentWillUnmount: 1',
      ].filter(Boolean),
    );

    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
