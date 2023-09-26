/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

describe('SimpleEventPlugin', function() {
  let React;
  let ReactDOM;
  let Scheduler;

  let onClick;
  let container;

  function expectClickThru(element) {
    element.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  }

  function expectNoClickThru(element) {
    element.click();
    expect(onClick).toHaveBeenCalledTimes(0);
  }

  function mounted(element) {
    container = document.createElement('div');
    document.body.appendChild(container);
    element = ReactDOM.render(element, container);
    return element;
  }

  beforeEach(function() {
    jest.resetModules();
    React = require('horizon-external');
    ReactDOM = require('horizon');
    Scheduler = require('scheduler');

    onClick = jest.fn();
  });

  afterEach(() => {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
      container = null;
    }
  });

  it('A non-interactive tags click when disabled', function() {
    const element = <div onClick={onClick} />;
    expectClickThru(mounted(element));
  });

  it('A non-interactive tags clicks bubble when disabled', function() {
    const element = mounted(
      <div onClick={onClick}>
        <div />
      </div>,
    );
    const child = element.firstChild;
    child.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not register a click when clicking a child of a disabled element', function() {
    const element = mounted(
      <button onClick={onClick} disabled={true}>
        <span />
      </button>,
    );
    const child = element.querySelector('span');

    child.click();
    expect(onClick).toHaveBeenCalledTimes(0);
  });

  it('triggers click events for children of disabled elements', function() {
    const element = mounted(
      <button disabled={true}>
        <span onClick={onClick} />
      </button>,
    );
    const child = element.querySelector('span');

    child.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('triggers parent captured click events when target is a child of a disabled elements', function() {
    const element = mounted(
      <div onClickCapture={onClick}>
        <button disabled={true}>
          <span />
        </button>
      </div>,
    );
    const child = element.querySelector('span');

    child.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('triggers captured click events for children of disabled elements', function() {
    const element = mounted(
      <button disabled={true}>
        <span onClickCapture={onClick} />
      </button>,
    );
    const child = element.querySelector('span');

    child.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  ['button', 'input', 'select', 'textarea'].forEach(function(tagName) {
    describe(tagName, function() {
      it('should forward clicks when it starts out not disabled', () => {
        const element = React.createElement(tagName, {
          onClick: onClick,
        });

        expectClickThru(mounted(element));
      });

      it('should not forward clicks when it starts out disabled', () => {
        const element = React.createElement(tagName, {
          onClick: onClick,
          disabled: true,
        });

        expectNoClickThru(mounted(element));
      });

      it('should forward clicks when it becomes not disabled', () => {
        container = document.createElement('div');
        document.body.appendChild(container);
        let element = ReactDOM.render(
          React.createElement(tagName, {onClick: onClick, disabled: true}),
          container,
        );
        element = ReactDOM.render(
          React.createElement(tagName, {onClick: onClick}),
          container,
        );
        expectClickThru(element);
      });

      it('should not forward clicks when it becomes disabled', () => {
        container = document.createElement('div');
        document.body.appendChild(container);
        let element = ReactDOM.render(
          React.createElement(tagName, {onClick: onClick}),
          container,
        );
        element = ReactDOM.render(
          React.createElement(tagName, {onClick: onClick, disabled: true}),
          container,
        );
        expectNoClickThru(element);
      });

      it('should work correctly if the listener is changed', () => {
        container = document.createElement('div');
        document.body.appendChild(container);
        let element = ReactDOM.render(
          React.createElement(tagName, {onClick: onClick, disabled: true}),
          container,
        );
        element = ReactDOM.render(
          React.createElement(tagName, {onClick: onClick, disabled: false}),
          container,
        );
        expectClickThru(element);
      });
    });
  });

  it('batches updates that occur as a result of a nested event dispatch', () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    let button;
    class Button extends React.Component {
      state = {count: 0};
      increment = () =>
        this.setState(state => ({
          count: state.count + 1,
        }));
      componentDidUpdate() {
        Scheduler.unstable_yieldValue(`didUpdate - Count: ${this.state.count}`);
      }
      render() {
        return (
          <button
            ref={el => (button = el)}
            onFocus={this.increment}
            onClick={() => {
              // The focus call synchronously dispatches a nested event. All of
              // the updates in this handler should be batched together.
              this.increment();
              button.focus();
              this.increment();
            }}>
            Count: {this.state.count}
          </button>
        );
      }
    }

    function click() {
      button.dispatchEvent(
        new MouseEvent('click', {bubbles: true, cancelable: true}),
      );
    }

    ReactDOM.render(<Button />, container);
    expect(button.textContent).toEqual('Count: 0');
    expect(Scheduler).toHaveYielded([]);

    click();

    // There should be exactly one update.
    expect(Scheduler).toHaveYielded(['didUpdate - Count: 3']);
    expect(button.textContent).toEqual('Count: 3');
  });
});
