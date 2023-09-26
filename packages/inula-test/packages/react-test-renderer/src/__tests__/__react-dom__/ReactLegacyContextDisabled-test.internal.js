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

describe('ReactLegacyContextDisabled', () => {
  beforeEach(() => {
    jest.resetModules();

    React = require('horizon-external');
    ReactDOM = require('horizon');
  });

  function formatValue(val) {
    if (val === null) {
      return 'null';
    }
    if (val === undefined) {
      return 'undefined';
    }
    if (typeof val === 'string') {
      return val;
    }
    return JSON.stringify(val);
  }

  it('renders a tree with modern context', () => {
    const Ctx = React.createContext();

    class Provider extends React.Component {
      render() {
        return (
          <Ctx.Provider value={this.props.value}>
            {this.props.children}
          </Ctx.Provider>
        );
      }
    }

    class RenderPropConsumer extends React.Component {
      render() {
        return <Ctx.Consumer>{value => formatValue(value)}</Ctx.Consumer>;
      }
    }

    const lifecycleContextLog = [];
    class ContextTypeConsumer extends React.Component {
      static contextType = Ctx;
      shouldComponentUpdate(nextProps, nextState, nextContext) {
        lifecycleContextLog.push(nextContext);
        return true;
      }
      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        lifecycleContextLog.push(nextContext);
      }
      UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
        lifecycleContextLog.push(nextContext);
      }
      render() {
        return formatValue(this.context);
      }
    }

    function FnConsumer() {
      return formatValue(React.useContext(Ctx));
    }

    const container = document.createElement('div');
    ReactDOM.render(
      <Provider value="a">
        <span>
          <RenderPropConsumer />
          <ContextTypeConsumer />
          <FnConsumer />
        </span>
      </Provider>,
      container,
    );
    expect(container.textContent).toBe('aaa');
    expect(lifecycleContextLog).toEqual([]);

    // Test update path
    ReactDOM.render(
      <Provider value="a">
        <span>
          <RenderPropConsumer />
          <ContextTypeConsumer />
          <FnConsumer />
        </span>
      </Provider>,
      container,
    );
    expect(container.textContent).toBe('aaa');
    expect(lifecycleContextLog).toEqual(['a', 'a', 'a']);
    lifecycleContextLog.length = 0;

    ReactDOM.render(
      <Provider value="b">
        <span>
          <RenderPropConsumer />
          <ContextTypeConsumer />
          <FnConsumer />
        </span>
      </Provider>,
      container,
    );
    expect(container.textContent).toBe('bbb');
    expect(lifecycleContextLog).toEqual(['b', 'b']); // sCU skipped due to changed context value.
    ReactDOM.unmountComponentAtNode(container);
  });
});
