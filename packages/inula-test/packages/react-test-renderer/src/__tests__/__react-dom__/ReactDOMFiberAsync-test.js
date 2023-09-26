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
let Scheduler;
let act;

const setUntrackedInputValue = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value',
).set;

describe('ReactDOMFiberAsync', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();
    container = document.createElement('div');
    React = require('horizon-external');
    ReactDOM = require('horizon');
    act = require('react-test-renderer/test-utils').unstable_concurrentAct;
    Scheduler = require('scheduler');

    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders synchronously by default', () => {
    const ops = [];
    ReactDOM.render(<div>Hi</div>, container, () => {
      ops.push(container.textContent);
    });
    ReactDOM.render(<div>Bye</div>, container, () => {
      ops.push(container.textContent);
    });
    expect(ops).toEqual(['Hi', 'Bye']);
  });

  xit('flushSync batches sync updates and flushes them at the end of the batch', () => {
    const ops = [];
    let instance;

    class Component extends React.Component {
      state = {text: ''};
      push(val) {
        this.setState(state => ({text: state.text + val}));
      }
      componentDidUpdate() {
        ops.push(this.state.text);
      }
      render() {
        instance = this;
        return <span>{this.state.text}</span>;
      }
    }

    ReactDOM.render(<Component />, container);

    instance.push('A');
    expect(ops).toEqual(['A']);
    expect(container.textContent).toEqual('A');

    ReactDOM.flushSync(() => {
      instance.push('B');
      instance.push('C');
      // Not flushed yet
      expect(container.textContent).toEqual('A');
      expect(ops).toEqual(['A']);
    });
    expect(container.textContent).toEqual('ABC');
    expect(ops).toEqual(['A', 'ABC']);
    instance.push('D');
    expect(container.textContent).toEqual('ABCD');
    expect(ops).toEqual(['A', 'ABC', 'ABCD']);
  });

  xit('flushSync flushes updates even if nested inside another flushSync', () => {
    const ops = [];
    let instance;

    class Component extends React.Component {
      state = {text: ''};
      push(val) {
        this.setState(state => ({text: state.text + val}));
      }
      componentDidUpdate() {
        ops.push(this.state.text);
      }
      render() {
        instance = this;
        return <span>{this.state.text}</span>;
      }
    }

    ReactDOM.render(<Component />, container);

    instance.push('A');
    expect(ops).toEqual(['A']);
    expect(container.textContent).toEqual('A');

    ReactDOM.flushSync(() => {
      instance.push('B');
      instance.push('C');
      // Not flushed yet
      expect(container.textContent).toEqual('A');
      expect(ops).toEqual(['A']);

      ReactDOM.flushSync(() => {
        instance.push('D');
      });
      // The nested flushSync caused everything to flush.
      expect(container.textContent).toEqual('ABCD');
      expect(ops).toEqual(['A', 'ABCD']);
    });
    expect(container.textContent).toEqual('ABCD');
    expect(ops).toEqual(['A', 'ABCD']);
  });

  xit('flushSync logs an error if already performing work', () => {
    class Component extends React.Component {
      componentDidUpdate() {
        ReactDOM.flushSync(() => {});
      }
      render() {
        return null;
      }
    }

    // Initial mount
    ReactDOM.render(<Component />, container);
    // Update
    expect(() => ReactDOM.render(<Component />, container)).toErrorDev(
      'flushSync was called from inside a lifecycle method',
    );
  });

  it('regression test: does not drop passive effects across roots (#17066)', () => {
    const {useState, useEffect} = React;

    function App({label}) {
      const [step, setStep] = useState(0);
      useEffect(() => {
        if (step < 3) {
          setStep(step + 1);
        }
      }, [step]);

      // The component should keep re-rendering itself until `step` is 3.
      return step === 3 ? 'Finished' : 'Unresolved';
    }

    const containerA = document.createElement('div');
    const containerB = document.createElement('div');
    const containerC = document.createElement('div');

    ReactDOM.render(<App label="A" />, containerA);
    ReactDOM.render(<App label="B" />, containerB);
    ReactDOM.render(<App label="C" />, containerC);

    Scheduler.unstable_flushAll();

    expect(containerA.textContent).toEqual('Finished');
    expect(containerB.textContent).toEqual('Finished');
    expect(containerC.textContent).toEqual('Finished');
  });
});
