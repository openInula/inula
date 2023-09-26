/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

// This test doesn't really have a good home yet. I'm leaving it here since this
// behavior belongs to the old propTypes system yet is currently implemented
// in the core ReactCompositeComponent. It should technically live in core's
// test suite but I'll leave it here to indicate that this is an issue that
// needs to be fixed.

'use strict';

let PropTypes;
let React;
let ReactDOM;
let ReactTestUtils;

describe('ReactContextValidator', () => {
  beforeEach(() => {
    jest.resetModules();

    PropTypes = require('prop-types');
    React = require('horizon-external');
    ReactDOM = require('horizon');
    ReactTestUtils = require('react-test-renderer/test-utils');
  });

  // @gate enableLegacyContext
  it('should filter out context not in contextTypes', () => {
    class Component extends React.Component {
      render() {
        return <div />;
      }
    }
    Component.contextTypes = {
      foo: PropTypes.string,
    };

    class ComponentInFooBarContext extends React.Component {
      getChildContext() {
        return {
          foo: 'abc',
          bar: 123,
        };
      }

      render() {
        return <Component ref="child" />;
      }
    }
    ComponentInFooBarContext.childContextTypes = {
      foo: PropTypes.string,
      bar: PropTypes.number,
    };

    const instance = ReactTestUtils.renderIntoDocument(
      <ComponentInFooBarContext />,
    );
    expect(instance.refs.child.context).toEqual({foo: 'abc'});
  });

  // @gate enableLegacyContext
  it('should pass next context to lifecycles', () => {
    let componentDidMountContext;
    let componentDidUpdateContext;
    let componentWillReceivePropsContext;
    let componentWillReceivePropsNextContext;
    let componentWillUpdateContext;
    let componentWillUpdateNextContext;
    let constructorContext;
    let renderContext;
    let shouldComponentUpdateContext;
    let shouldComponentUpdateNextContext;

    class Parent extends React.Component {
      getChildContext() {
        return {
          foo: this.props.foo,
          bar: 'bar',
        };
      }
      render() {
        return <Component />;
      }
    }
    Parent.childContextTypes = {
      foo: PropTypes.string.isRequired,
      bar: PropTypes.string.isRequired,
    };

    class Component extends React.Component {
      constructor(props, context) {
        super(props, context);
        constructorContext = context;
      }
      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        componentWillReceivePropsContext = this.context;
        componentWillReceivePropsNextContext = nextContext;
        return true;
      }
      shouldComponentUpdate(nextProps, nextState, nextContext) {
        shouldComponentUpdateContext = this.context;
        shouldComponentUpdateNextContext = nextContext;
        return true;
      }
      UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
        componentWillUpdateContext = this.context;
        componentWillUpdateNextContext = nextContext;
      }
      render() {
        renderContext = this.context;
        return <div />;
      }
      componentDidMount() {
        componentDidMountContext = this.context;
      }
      componentDidUpdate() {
        componentDidUpdateContext = this.context;
      }
    }
    Component.contextTypes = {
      foo: PropTypes.string,
    };

    const container = document.createElement('div');
    ReactDOM.render(<Parent foo="abc" />, container);
    expect(constructorContext).toEqual({foo: 'abc'});
    expect(renderContext).toEqual({foo: 'abc'});
    expect(componentDidMountContext).toEqual({foo: 'abc'});
    ReactDOM.render(<Parent foo="def" />, container);
    expect(componentWillReceivePropsContext).toEqual({foo: 'abc'});
    expect(componentWillReceivePropsNextContext).toEqual({foo: 'def'});
    expect(shouldComponentUpdateContext).toEqual({foo: 'abc'});
    expect(shouldComponentUpdateNextContext).toEqual({foo: 'def'});
    expect(componentWillUpdateContext).toEqual({foo: 'abc'});
    expect(componentWillUpdateNextContext).toEqual({foo: 'def'});
    expect(renderContext).toEqual({foo: 'def'});
    expect(componentDidUpdateContext).toEqual({foo: 'def'});
  });

  // gate问题，暂时注释掉
  // it('should pass next context to lifecycles', () => {
  //   let componentDidMountContext;
  //   let componentDidUpdateContext;
  //   let componentWillReceivePropsContext;
  //   let componentWillReceivePropsNextContext;
  //   let componentWillUpdateContext;
  //   let componentWillUpdateNextContext;
  //   let constructorContext;
  //   let renderContext;
  //   let shouldComponentUpdateWasCalled = false;
  //
  //   const Context = React.createContext();
  //
  //   class Component extends React.Component {
  //     static contextType = Context;
  //     constructor(props, context) {
  //       super(props, context);
  //       constructorContext = context;
  //     }
  //     UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
  //       componentWillReceivePropsContext = this.context;
  //       componentWillReceivePropsNextContext = nextContext;
  //       return true;
  //     }
  //     shouldComponentUpdate(nextProps, nextState, nextContext) {
  //       shouldComponentUpdateWasCalled = true;
  //       return true;
  //     }
  //     UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
  //       componentWillUpdateContext = this.context;
  //       componentWillUpdateNextContext = nextContext;
  //     }
  //     render() {
  //       renderContext = this.context;
  //       return <div />;
  //     }
  //     componentDidMount() {
  //       componentDidMountContext = this.context;
  //     }
  //     componentDidUpdate() {
  //       componentDidUpdateContext = this.context;
  //     }
  //   }
  //
  //   const firstContext = {foo: 123};
  //   const secondContext = {bar: 456};
  //
  //   const container = document.createElement('div');
  //   ReactDOM.render(
  //     <Context.Provider value={firstContext}>
  //       <Component />
  //     </Context.Provider>,
  //     container,
  //   );
  //   expect(constructorContext).toBe(firstContext);
  //   expect(renderContext).toBe(firstContext);
  //   expect(componentDidMountContext).toBe(firstContext);
  //   ReactDOM.render(
  //     <Context.Provider value={secondContext}>
  //       <Component />
  //     </Context.Provider>,
  //     container,
  //   );
  //   expect(componentWillReceivePropsContext).toBe(firstContext);
  //   expect(componentWillReceivePropsNextContext).toBe(secondContext);
  //   expect(componentWillUpdateContext).toBe(firstContext);
  //   expect(componentWillUpdateNextContext).toBe(secondContext);
  //   expect(renderContext).toBe(secondContext);
  //   expect(componentDidUpdateContext).toBe(secondContext);
  //
  //   // sCU is not called in this case because React force updates when a provider re-renders
  //   expect(shouldComponentUpdateWasCalled).toBe(false);
  // });

  it('should re-render PureComponents when context Provider updates', () => {
    let renderedContext;

    const Context = React.createContext();

    class Component extends React.PureComponent {
      static contextType = Context;
      render() {
        renderedContext = this.context;
        return <div />;
      }
    }

    const firstContext = {foo: 123};
    const secondContext = {bar: 456};

    const container = document.createElement('div');
    ReactDOM.render(
      <Context.Provider value={firstContext}>
        <Component />
      </Context.Provider>,
      container,
    );
    expect(renderedContext).toBe(firstContext);
    ReactDOM.render(
      <Context.Provider value={secondContext}>
        <Component />
      </Context.Provider>,
      container,
    );
    expect(renderedContext).toBe(secondContext);
  });

  it('should not warn when class contextType is null', () => {
    class Foo extends React.Component {
      static contextType = null; // Handy for conditional declaration
      render() {
        return this.context.hello.world;
      }
    }
    expect(() => {
      ReactTestUtils.renderIntoDocument(<Foo />);
    }).toThrow("Cannot read property 'world' of undefined");
  });
});
