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
let ReactTestUtils;
let PropTypes;

const clone = function(o) {
  return JSON.parse(JSON.stringify(o));
};

const GET_load_STATE_RETURN_VAL = {
  hasWillMountCompleted: false,
  hasRenderCompleted: false,
  hasDidMountCompleted: false,
  hasWillUnmountCompleted: false,
};

const INIT_RENDER_STATE = {
  hasWillMountCompleted: true,
  hasRenderCompleted: false,
  hasDidMountCompleted: false,
  hasWillUnmountCompleted: false,
};

const DID_MOUNT_STATE = {
  hasWillMountCompleted: true,
  hasRenderCompleted: true,
  hasDidMountCompleted: false,
  hasWillUnmountCompleted: false,
};

const NEXT_RENDER_STATE = {
  hasWillMountCompleted: true,
  hasRenderCompleted: true,
  hasDidMountCompleted: true,
  hasWillUnmountCompleted: false,
};

const WILL_UNMOUNT_STATE = {
  hasWillMountCompleted: true,
  hasDidMountCompleted: true,
  hasRenderCompleted: true,
  hasWillUnmountCompleted: false,
};

const POST_WILL_UNMOUNT_STATE = {
  hasWillMountCompleted: true,
  hasDidMountCompleted: true,
  hasRenderCompleted: true,
  hasWillUnmountCompleted: true,
};

/**
 * Every React component is in one of these life cycles.
 */
type ComponentLifeCycle =
  /**
   * Mounted components have a DOM node representation and are capable of
   * receiving new props.
   */
  | 'MOUNTED'
  /**
   * Unmounted components are inactive and cannot receive new props.
   */
  | 'UNMOUNTED';


/**
 * TODO: We should make any setState calls fail in
 * `getInitialState` and `componentWillMount`. They will usually fail
 * anyways because `this._renderedComponent` is empty, however, if a component
 * is *reused*, then that won't be the case and things will appear to work in
 * some cases. Better to just block all updates in initialization.
 */
describe('ReactComponentLifeCycle', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('horizon-external');
    ReactDOM = require('horizon');
    ReactTestUtils = require('react-test-renderer/test-utils');
    PropTypes = require('prop-types');
  });

  it('should not reuse an instance when it has been unmounted', () => {
    const container = document.createElement('div');

    class StatefulComponent extends React.Component {
      state = {};

      render() {
        return <div />;
      }
    }

    const element = <StatefulComponent />;
    const firstInstance = ReactDOM.render(element, container);
    ReactDOM.unmountComponentAtNode(container);
    const secondInstance = ReactDOM.render(element, container);
    expect(firstInstance).not.toBe(secondInstance);
  });

  it('should support state change in componentWillMount and componentWillReceiveProps', () => {
    const container = document.createElement('div');
    const logger = [];
    class Inner extends React.Component {
      state = {};

      componentWillReceiveProps() {
        this.state = {text: 'cWRP'};
      }

      componentWillMount() {
        this.state = {text: 'cWM'};
      }

      render() {
        logger.push(this.state.text);
        return <div>{this.state.text}</div>;
      }
    }

    class Outer extends React.Component {
      state = {a: ''};

      update = () => {
        this.setState({a: 'change'});
      }

      render() {
        return <Inner />;
      }
    }

    const element = <Outer />;
    const instance = ReactDOM.render(element, container);
    instance.update();
    expect(logger).toStrictEqual(['cWM', 'cWRP']);
  });

  /**
   * If a state update triggers rerendering that in turn fires an onDOMReady,
   * that second onDOMReady should not fail.
   */
  it('it should fire onDOMReady when already in onDOMReady', () => {
    const _testJournal = [];

    class Child extends React.Component {
      componentDidMount() {
        _testJournal.push('Child:onDOMReady');
      }

      render() {
        return <div />;
      }
    }

    class SwitcherParent extends React.Component {
      constructor(props) {
        super(props);
        _testJournal.push('SwitcherParent:getInitialState');
        this.state = {showHasOnDOMReadyComponent: false};
      }

      componentDidMount() {
        _testJournal.push('SwitcherParent:onDOMReady');
        this.switchIt();
      }

      switchIt = () => {
        this.setState({showHasOnDOMReadyComponent: true});
      };

      render() {
        return (
          <div>
            {this.state.showHasOnDOMReadyComponent ? <Child /> : <div />}
          </div>
        );
      }
    }

    ReactTestUtils.renderIntoDocument(<SwitcherParent />);
    expect(_testJournal).toEqual([
      'SwitcherParent:getInitialState',
      'SwitcherParent:onDOMReady',
      'Child:onDOMReady',
    ]);
  });

  // You could assign state here, but not access members of it, unless you
  // had provided a getInitialState method.
  it('throws when accessing state in componentWillMount', () => {
    class StatefulComponent extends React.Component {
      UNSAFE_componentWillMount() {
        void this.state.yada;
      }

      render() {
        return <div />;
      }
    }

    let instance = <StatefulComponent />;
    expect(function() {
      instance = ReactTestUtils.renderIntoDocument(instance);
    }).toThrow();
  });

  it('should allow update state inside of componentWillMount', () => {
    class StatefulComponent extends React.Component {
      UNSAFE_componentWillMount() {
        this.setState({stateField: 'something'});
      }

      render() {
        return <div />;
      }
    }

    let instance = <StatefulComponent />;
    expect(function() {
      instance = ReactTestUtils.renderIntoDocument(instance);
    }).not.toThrow();
  });

  xit('isMounted should return false when unmounted', () => {
    class Component extends React.Component {
      render() {
        return <div />;
      }
    }

    const container = document.createElement('div');
    const instance = ReactDOM.render(<Component />, container);

    // No longer a public API, but we can test that it works internally by
    // reaching into the updater.
    expect(instance._isMounted(instance)).toBe(true);

    ReactDOM.unmountComponentAtNode(container);

    expect(instance._isMounted(instance)).toBe(false);
  });

  it('should carry through each of the phases of setup', () => {
    class LifeCycleComponent extends React.Component {
      constructor(props, context) {
        super(props, context);
        this._testJournal = {};
        const initState = {
          hasWillMountCompleted: false,
          hasDidMountCompleted: false,
          hasRenderCompleted: false,
          hasWillUnmountCompleted: false,
        };
        this._testJournal.returnedFromGetInitialState = clone(initState);
        this.state = initState;
      }

      UNSAFE_componentWillMount() {
        this._testJournal.stateAtStartOfWillMount = clone(this.state);
        this.state.hasWillMountCompleted = true;
      }

      componentDidMount() {
        this._testJournal.stateAtStartOfDidMount = clone(this.state);
        this.setState({hasDidMountCompleted: true});
      }

      render() {
        const isInitialRender = !this.state.hasRenderCompleted;
        if (isInitialRender) {
          this._testJournal.stateInInitialRender = clone(this.state);
        } else {
          this._testJournal.stateInLaterRender = clone(this.state);
        }
        // you would *NEVER* do anything like this in real code!
        this.state.hasRenderCompleted = true;
        return <div ref="theDiv">I am the inner DIV</div>;
      }

      componentWillUnmount() {
        this._testJournal.stateAtStartOfWillUnmount = clone(this.state);
        this.state.hasWillUnmountCompleted = true;
      }
    }

    // A component that is merely "constructed" (as in "constructor") but not
    // yet initialized, or rendered.
    //
    const container = document.createElement('div');

    let instance = ReactDOM.render(<LifeCycleComponent />, container);

    // getInitialState
    expect(instance._testJournal.returnedFromGetInitialState).toEqual(
      GET_load_STATE_RETURN_VAL,
    );

    // componentWillMount
    expect(instance._testJournal.stateAtStartOfWillMount).toEqual(
      instance._testJournal.returnedFromGetInitialState,
    );

    // componentDidMount
    expect(instance._testJournal.stateAtStartOfDidMount).toEqual(
      DID_MOUNT_STATE,
    );

    // initial render
    expect(instance._testJournal.stateInInitialRender).toEqual(
      INIT_RENDER_STATE,
    );

    // Now *update the component*
    instance.forceUpdate();

    // render 2nd time
    expect(instance._testJournal.stateInLaterRender).toEqual(NEXT_RENDER_STATE);

    ReactDOM.unmountComponentAtNode(container);

    expect(instance._testJournal.stateAtStartOfWillUnmount).toEqual(
      WILL_UNMOUNT_STATE,
    );

    // But the current lifecycle of the component is unmounted.
    expect(instance.state).toEqual(POST_WILL_UNMOUNT_STATE);
  });

  it('should not throw when updating an auxiliary component', () => {
    class Tooltip extends React.Component {
      render() {
        return <div>{this.props.children}</div>;
      }

      componentDidMount() {
        this.container = document.createElement('div');
        this.updateTooltip();
      }

      componentDidUpdate() {
        this.updateTooltip();
      }

      updateTooltip = () => {
        // Even though this.props.tooltip has an owner, updating it shouldn't
        // throw here because it's mounted as a root component
        ReactDOM.render(this.props.tooltip, this.container);
      };
    }

    class Component extends React.Component {
      render() {
        return (
          <Tooltip ref="tooltip" tooltip={<div>{this.props.tooltipText}</div>}>
            {this.props.text}
          </Tooltip>
        );
      }
    }

    const container = document.createElement('div');
    ReactDOM.render(<Component text="uno" tooltipText="one" />, container);

    // Since `instance` is a root component, we can set its props. This also
    // makes Tooltip rerender the tooltip component, which shouldn't throw.
    ReactDOM.render(<Component text="dos" tooltipText="two" />, container);
  });

  it('should allow state updates in componentDidMount', () => {
    /**
     * calls setState in an componentDidMount.
     */
    class SetStateInComponentDidMount extends React.Component {
      state = {
        stateField: this.props.valueToUseInitially,
      };

      componentDidMount() {
        this.setState({stateField: this.props.valueToUseInOnDOMReady});
      }

      render() {
        return <div />;
      }
    }

    let instance = (
      <SetStateInComponentDidMount
        valueToUseInitially="hello"
        valueToUseInOnDOMReady="goodbye"
      />
    );
    instance = ReactTestUtils.renderIntoDocument(instance);
    expect(instance.state.stateField).toBe('goodbye');
  });

  it('should call nested legacy lifecycle methods in the right order', () => {
    let log;
    const logger = function(msg) {
      return function() {
        // return true for shouldComponentUpdate
        log.push(msg);
        return true;
      };
    };
    class Outer extends React.Component {
      UNSAFE_componentWillMount = logger('outer componentWillMount');
      componentDidMount = logger('outer componentDidMount');
      UNSAFE_componentWillReceiveProps = logger(
        'outer componentWillReceiveProps',
      );
      shouldComponentUpdate = logger('outer shouldComponentUpdate');
      UNSAFE_componentWillUpdate = logger('outer componentWillUpdate');
      componentDidUpdate = logger('outer componentDidUpdate');
      componentWillUnmount = logger('outer componentWillUnmount');
      render() {
        return (
          <div>
            <Inner x={this.props.x} />
          </div>
        );
      }
    }

    class Inner extends React.Component {
      UNSAFE_componentWillMount = logger('inner componentWillMount');
      componentDidMount = logger('inner componentDidMount');
      UNSAFE_componentWillReceiveProps = logger(
        'inner componentWillReceiveProps',
      );
      shouldComponentUpdate = logger('inner shouldComponentUpdate');
      UNSAFE_componentWillUpdate = logger('inner componentWillUpdate');
      componentDidUpdate = logger('inner componentDidUpdate');
      componentWillUnmount = logger('inner componentWillUnmount');
      render() {
        return <span>{this.props.x}</span>;
      }
    }

    const container = document.createElement('div');
    log = [];
    ReactDOM.render(<Outer x={1} />, container);
    expect(log).toEqual([
      'outer componentWillMount',
      'inner componentWillMount',
      'inner componentDidMount',
      'outer componentDidMount',
    ]);

    // Dedup warnings
    log = [];
    ReactDOM.render(<Outer x={2} />, container);
    expect(log).toEqual([
      'outer componentWillReceiveProps',
      'outer shouldComponentUpdate',
      'outer componentWillUpdate',
      'inner componentWillReceiveProps',
      'inner shouldComponentUpdate',
      'inner componentWillUpdate',
      'inner componentDidUpdate',
      'outer componentDidUpdate',
    ]);

    log = [];
    ReactDOM.unmountComponentAtNode(container);
    expect(log).toEqual([
      'outer componentWillUnmount',
      'inner componentWillUnmount',
    ]);
  });

  it('should call nested new lifecycle methods in the right order', () => {
    let log;
    const logger = function(msg) {
      return function() {
        // return true for shouldComponentUpdate
        log.push(msg);
        return true;
      };
    };
    class Outer extends React.Component {
      state = {};
      static getDerivedStateFromProps(props, prevState) {
        log.push('outer getDerivedStateFromProps');
        return null;
      }
      componentDidMount = logger('outer componentDidMount');
      shouldComponentUpdate = logger('outer shouldComponentUpdate');
      getSnapshotBeforeUpdate = logger('outer getSnapshotBeforeUpdate');
      componentDidUpdate = logger('outer componentDidUpdate');
      componentWillUnmount = logger('outer componentWillUnmount');
      render() {
        return (
          <div>
            <Inner x={this.props.x} />
          </div>
        );
      }
    }

    class Inner extends React.Component {
      state = {};
      static getDerivedStateFromProps(props, prevState) {
        log.push('inner getDerivedStateFromProps');
        return null;
      }
      componentDidMount = logger('inner componentDidMount');
      shouldComponentUpdate = logger('inner shouldComponentUpdate');
      getSnapshotBeforeUpdate = logger('inner getSnapshotBeforeUpdate');
      componentDidUpdate = logger('inner componentDidUpdate');
      componentWillUnmount = logger('inner componentWillUnmount');
      render() {
        return <span>{this.props.x}</span>;
      }
    }

    const container = document.createElement('div');
    log = [];
    ReactDOM.render(<Outer x={1} />, container);
    expect(log).toEqual([
      'outer getDerivedStateFromProps',
      'inner getDerivedStateFromProps',
      'inner componentDidMount',
      'outer componentDidMount',
    ]);

    // Dedup warnings
    log = [];
    ReactDOM.render(<Outer x={2} />, container);
    expect(log).toEqual([
      'outer getDerivedStateFromProps',
      'outer shouldComponentUpdate',
      'inner getDerivedStateFromProps',
      'inner shouldComponentUpdate',
      'inner getSnapshotBeforeUpdate',
      'outer getSnapshotBeforeUpdate',
      'inner componentDidUpdate',
      'outer componentDidUpdate',
    ]);

    log = [];
    ReactDOM.unmountComponentAtNode(container);
    expect(log).toEqual([
      'outer componentWillUnmount',
      'inner componentWillUnmount',
    ]);
  });

  it('should not override state with stale values if prevState is spread within getDerivedStateFromProps', () => {
    const divRef = React.createRef();
    let childInstance;

    class Child extends React.Component {
      state = {local: 0};
      static getDerivedStateFromProps(nextProps, prevState) {
        return {...prevState, remote: nextProps.remote};
      }
      updateState = () => {
        this.setState(state => ({local: state.local + 1}));
        this.props.onChange(this.state.remote + 1);
      };
      render() {
        childInstance = this;
        return (
          <div
            onClick={this.updateState}
            ref={
              divRef
            }>{`remote:${this.state.remote}, local:${this.state.local}`}</div>
        );
      }
    }

    class Parent extends React.Component {
      state = {value: 0};
      handleChange = value => {
        this.setState({value});
      };
      render() {
        return <Child remote={this.state.value} onChange={this.handleChange} />;
      }
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      ReactDOM.render(<Parent />, container);
      expect(divRef.current.textContent).toBe('remote:0, local:0');

      // Trigger setState() calls
      childInstance.updateState();
      expect(divRef.current.textContent).toBe('remote:1, local:1');

      // Trigger batched setState() calls
      divRef.current.click();
      expect(divRef.current.textContent).toBe('remote:2, local:2');
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should pass the return value from getSnapshotBeforeUpdate to componentDidUpdate', () => {
    const log = [];

    class MyComponent extends React.Component {
      state = {
        value: 0,
      };
      static getDerivedStateFromProps(nextProps, prevState) {
        return {
          value: prevState.value + 1,
        };
      }
      getSnapshotBeforeUpdate(prevProps, prevState) {
        log.push(
          `getSnapshotBeforeUpdate() prevProps:${prevProps.value} prevState:${prevState.value}`,
        );
        return 'abc';
      }
      componentDidUpdate(prevProps, prevState, snapshot) {
        log.push(
          `componentDidUpdate() prevProps:${prevProps.value} prevState:${prevState.value} snapshot:${snapshot}`,
        );
      }
      render() {
        log.push('render');
        return null;
      }
    }

    const div = document.createElement('div');
    ReactDOM.render(
      <div>
        <MyComponent value="foo" />
      </div>,
      div,
    );
    expect(log).toEqual(['render']);
    log.length = 0;

    ReactDOM.render(
      <div>
        <MyComponent value="bar" />
      </div>,
      div,
    );
    expect(log).toEqual([
      'render',
      'getSnapshotBeforeUpdate() prevProps:foo prevState:1',
      'componentDidUpdate() prevProps:foo prevState:1 snapshot:abc',
    ]);
    log.length = 0;

    ReactDOM.render(
      <div>
        <MyComponent value="baz" />
      </div>,
      div,
    );
    expect(log).toEqual([
      'render',
      'getSnapshotBeforeUpdate() prevProps:bar prevState:2',
      'componentDidUpdate() prevProps:bar prevState:2 snapshot:abc',
    ]);
    log.length = 0;

    ReactDOM.render(<div />, div);
    expect(log).toEqual([]);
  });

  it('should pass previous state to shouldComponentUpdate even with getDerivedStateFromProps', () => {
    const divRef = React.createRef();
    class SimpleComponent extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          value: props.value,
        };
      }

      static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.value === prevState.value) {
          return null;
        }
        return {value: nextProps.value};
      }

      shouldComponentUpdate(nextProps, nextState) {
        return nextState.value !== this.state.value;
      }

      render() {
        return <div ref={divRef}>value: {this.state.value}</div>;
      }
    }

    const div = document.createElement('div');

    ReactDOM.render(<SimpleComponent value="initial" />, div);
    expect(divRef.current.textContent).toBe('value: initial');
    ReactDOM.render(<SimpleComponent value="updated" />, div);
    expect(divRef.current.textContent).toBe('value: updated');
  });

  it('should call getSnapshotBeforeUpdate before mutations are committed', () => {
    const log = [];

    class MyComponent extends React.Component {
      divRef = React.createRef();
      getSnapshotBeforeUpdate(prevProps, prevState) {
        log.push('getSnapshotBeforeUpdate');
        expect(this.divRef.current.textContent).toBe(
          `value:${prevProps.value}`,
        );
        return 'foobar';
      }
      componentDidUpdate(prevProps, prevState, snapshot) {
        log.push('componentDidUpdate');
        expect(this.divRef.current.textContent).toBe(
          `value:${this.props.value}`,
        );
        expect(snapshot).toBe('foobar');
      }
      render() {
        log.push('render');
        return <div ref={this.divRef}>{`value:${this.props.value}`}</div>;
      }
    }

    const div = document.createElement('div');
    ReactDOM.render(<MyComponent value="foo" />, div);
    expect(log).toEqual(['render']);
    log.length = 0;

    ReactDOM.render(<MyComponent value="bar" />, div);
    expect(log).toEqual([
      'render',
      'getSnapshotBeforeUpdate',
      'componentDidUpdate',
    ]);
    log.length = 0;
  });
});
