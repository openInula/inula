/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let ChildUpdates;
let MorphingComponent;
let React;
let ReactDOM;
let GlobalVar;
let ReactTestUtils;
let PropTypes;

describe('ReactCompositeComponent', () => {
  const hasOwnProperty = Object.prototype.hasOwnProperty;

  /**
   * Performs equality by iterating through keys on an object and returning false
   * when any key has values which are not strictly equal between the arguments.
   * Returns true when the values of all keys are strictly equal.
   */
  function shallowEqual(objA: mixed, objB: mixed): boolean {
    if (Object.is(objA, objB)) {
      return true;
    }
    if (
      typeof objA !== 'object' ||
      objA === null ||
      typeof objB !== 'object' ||
      objB === null
    ) {
      return false;
    }
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
      return false;
    }
    for (let i = 0; i < keysA.length; i++) {
      if (
        !hasOwnProperty.call(objB, keysA[i]) ||
        !Object.is(objA[keysA[i]], objB[keysA[i]])
      ) {
        return false;
      }
    }
    return true;
  }

  function shallowCompare(instance, nextProps, nextState) {
    return (
      !shallowEqual(instance.props, nextProps) ||
      !shallowEqual(instance.state, nextState)
    );
  }

  beforeEach(() => {
    jest.resetModules();
    React = require('horizon-external');
    ReactDOM = require('horizon');
    GlobalVar = require('inula/src/renderer/GlobalVar');
    ReactTestUtils = require('react-test-renderer/test-utils');
    PropTypes = require('prop-types');

    MorphingComponent = class extends React.Component {
      state = {activated: false};

      _toggleActivatedState = () => {
        this.setState({activated: !this.state.activated});
      };

      render() {
        const toggleActivatedState = this._toggleActivatedState;
        return !this.state.activated ? (
          <a ref="x" onClick={toggleActivatedState} />
        ) : (
          <b ref="x" onClick={toggleActivatedState} />
        );
      }
    };

    /**
     * We'll use this to ensure that an old version is not cached when it is
     * reallocated again.
     */
    ChildUpdates = class extends React.Component {
      getAnchor = () => {
        return this.refs.anch;
      };

      render() {
        const className = this.props.anchorClassOn ? 'anchorClass' : '';
        return this.props.renderAnchor ? (
          <a ref="anch" className={className} />
        ) : (
          <b />
        );
      }
    };
  });

  it('should support rendering to different child types over time', () => {
    const instance = ReactTestUtils.renderIntoDocument(<MorphingComponent />);
    let el = ReactDOM.findDOMNode(instance);
    expect(el.tagName).toBe('A');

    instance._toggleActivatedState();
    el = ReactDOM.findDOMNode(instance);
    expect(el.tagName).toBe('B');

    instance._toggleActivatedState();
    el = ReactDOM.findDOMNode(instance);
    expect(el.tagName).toBe('A');
  });

  it('should react to state changes from callbacks', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      const instance = ReactDOM.render(<MorphingComponent />, container);
      let el = ReactDOM.findDOMNode(instance);
      expect(el.tagName).toBe('A');
      el.click();
      el = ReactDOM.findDOMNode(instance);
      expect(el.tagName).toBe('B');
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should rewire refs when rendering to different child types', () => {
    const instance = ReactTestUtils.renderIntoDocument(<MorphingComponent />);

    expect(instance.refs.x.tagName).toBe('A');
    instance._toggleActivatedState();
    expect(instance.refs.x.tagName).toBe('B');
    instance._toggleActivatedState();
    expect(instance.refs.x.tagName).toBe('A');
  });

  it('should not cache old DOM nodes when switching constructors', () => {
    const container = document.createElement('div');
    const instance = ReactDOM.render(
      <ChildUpdates renderAnchor={true} anchorClassOn={false} />,
      container,
    );
    ReactDOM.render(
      // Warm any cache
      <ChildUpdates renderAnchor={true} anchorClassOn={true} />,
      container,
    );
    ReactDOM.render(
      // Clear out the anchor
      <ChildUpdates renderAnchor={false} anchorClassOn={true} />,
      container,
    );
    ReactDOM.render(
      // rerender
      <ChildUpdates renderAnchor={true} anchorClassOn={false} />,
      container,
    );
    expect(instance.getAnchor().className).toBe('');
  });

  it('should use default values for undefined props', () => {
    class Component extends React.Component {
      static defaultProps = {prop: 'testKey'};

      render() {
        return <span />;
      }
    }

    const instance1 = ReactTestUtils.renderIntoDocument(<Component />);
    expect(instance1.props).toEqual({prop: 'testKey'});

    const instance2 = ReactTestUtils.renderIntoDocument(
      <Component prop={undefined} />,
    );
    expect(instance2.props).toEqual({prop: 'testKey'});

    const instance3 = ReactTestUtils.renderIntoDocument(
      <Component prop={null} />,
    );
    expect(instance3.props).toEqual({prop: null});
  });

  it('should not mutate passed-in props object', () => {
    class Component extends React.Component {
      static defaultProps = {prop: 'testKey'};

      render() {
        return <span />;
      }
    }

    const inputProps = {};
    let instance1 = <Component {...inputProps} />;
    instance1 = ReactTestUtils.renderIntoDocument(instance1);
    expect(instance1.props.prop).toBe('testKey');

    // We don't mutate the input, just in case the caller wants to do something
    // with it after using it to instantiate a component
    expect(inputProps.prop).not.toBeDefined();
  });

  it('should silently allow `setState`, not call cb on unmounting components', () => {
    let cbCalled = false;
    const container = document.createElement('div');
    document.body.appendChild(container);

    class Component extends React.Component {
      state = {value: 0};

      componentWillUnmount() {
        expect(() => {
          this.setState({value: 2}, function() {
            cbCalled = true;
          });
        }).not.toThrow();
      }

      render() {
        return <div />;
      }
    }

    const instance = ReactDOM.render(<Component />, container);
    instance.setState({value: 1});

    ReactDOM.unmountComponentAtNode(container);
    expect(cbCalled).toBe(false);
  });

  it('should warn about `setState` in render', () => {
    const container = document.createElement('div');

    let renderedState = -1;
    let renderPasses = 0;

    class Component extends React.Component {
      state = {value: 0};

      render() {
        renderPasses++;
        renderedState = this.state.value;
        if (this.state.value === 0) {
          this.setState({value: 1});
        }
        return <div />;
      }
    }

    const instance = ReactDOM.render(<Component />, container);

    // The setState call is queued and then executed as a second pass. This
    // behavior is undefined though so we're free to change it to suit the
    // implementation details.
    expect(renderPasses).toBe(2);
    expect(renderedState).toBe(1);
    expect(instance.state.value).toBe(1);

    // Forcing a rerender anywhere will cause the update to happen.
    const instance2 = ReactDOM.render(<Component prop={123} />, container);
    expect(instance).toBe(instance2);
    expect(renderedState).toBe(1);
    expect(instance2.state.value).toBe(1);

    // Test deduplication; (no additional warnings are expected).
    ReactDOM.unmountComponentAtNode(container);
    ReactDOM.render(<Component prop={123} />, container);
  });

  it('should cleanup even if render() fatals', () => {
    class BadComponent extends React.Component {
      render() {
        throw new Error();
      }
    }

    let instance = <BadComponent />;

    expect(GlobalVar.getProcessingClassVNode()).toBe(null);

    expect(() => {
      instance = ReactTestUtils.renderIntoDocument(instance);
    }).toThrow();

    expect(GlobalVar.getProcessingClassVNode()).toBe(null);
  });

  it('should call componentWillUnmount before unmounting', () => {
    const container = document.createElement('div');
    let innerUnmounted = false;

    class Component extends React.Component {
      render() {
        return (
          <div>
            <Inner />
            Text
          </div>
        );
      }
    }

    class Inner extends React.Component {
      componentWillUnmount() {
        innerUnmounted = true;
      }

      render() {
        return <div />;
      }
    }

    ReactDOM.render(<Component />, container);
    ReactDOM.unmountComponentAtNode(container);
    expect(innerUnmounted).toBe(true);
  });

  // @gate enableLegacyContext
  it('should pass context to children when not owner', () => {
    class Parent extends React.Component {
      render() {
        return (
          <Child>
            <Grandchild />
          </Child>
        );
      }
    }

    class Child extends React.Component {
      static childContextTypes = {
        foo: PropTypes.string,
      };

      getChildContext() {
        return {
          foo: 'bar',
        };
      }

      render() {
        return React.Children.only(this.props.children);
      }
    }

    class Grandchild extends React.Component {
      static contextTypes = {
        foo: PropTypes.string,
      };

      render() {
        return <div>{this.context.foo}</div>;
      }
    }

    const component = ReactTestUtils.renderIntoDocument(<Parent />);
    expect(ReactDOM.findDOMNode(component).innerHTML).toBe('bar');
  });

  it('should skip update when rerendering element in container', () => {
    class Parent extends React.Component {
      render() {
        return <div>{this.props.children}</div>;
      }
    }

    let childRenders = 0;

    class Child extends React.Component {
      render() {
        childRenders++;
        return <div />;
      }
    }

    const container = document.createElement('div');
    const child = <Child />;

    ReactDOM.render(<Parent>{child}</Parent>, container);
    ReactDOM.render(<Parent>{child}</Parent>, container);
    expect(childRenders).toBe(1);
  });

  // @gate enableLegacyContext
  it('should pass context when re-rendered for static child', () => {
    let parentInstance = null;
    let childInstance = null;

    class Parent extends React.Component {
      static childContextTypes = {
        foo: PropTypes.string,
        flag: PropTypes.bool,
      };

      state = {
        flag: false,
      };

      getChildContext() {
        return {
          foo: 'bar',
          flag: this.state.flag,
        };
      }

      render() {
        return React.Children.only(this.props.children);
      }
    }

    class Middle extends React.Component {
      render() {
        return this.props.children;
      }
    }

    class Child extends React.Component {
      static contextTypes = {
        foo: PropTypes.string,
        flag: PropTypes.bool,
      };

      render() {
        childInstance = this;
        return <span>Child</span>;
      }
    }

    parentInstance = ReactTestUtils.renderIntoDocument(
      <Parent>
        <Middle>
          <Child />
        </Middle>
      </Parent>,
    );

    expect(parentInstance.state.flag).toBe(false);
    expect(childInstance.context).toEqual({foo: 'bar', flag: false});

    parentInstance.setState({flag: true});
    expect(parentInstance.state.flag).toBe(true);
    expect(childInstance.context).toEqual({foo: 'bar', flag: true});
  });

  // @gate enableLegacyContext
  it('should pass context when re-rendered for static child within a composite component', () => {
    class Parent extends React.Component {
      static childContextTypes = {
        flag: PropTypes.bool,
      };

      state = {
        flag: true,
      };

      getChildContext() {
        return {
          flag: this.state.flag,
        };
      }

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    class Child extends React.Component {
      static contextTypes = {
        flag: PropTypes.bool,
      };

      render() {
        return <div />;
      }
    }

    class Wrapper extends React.Component {
      render() {
        return (
          <Parent ref="parent">
            <Child ref="child" />
          </Parent>
        );
      }
    }

    const wrapper = ReactTestUtils.renderIntoDocument(<Wrapper />);

    expect(wrapper.refs.parent.state.flag).toEqual(true);
    expect(wrapper.refs.child.context).toEqual({flag: true});

    // We update <Parent /> while <Child /> is still a static prop relative to this update
    wrapper.refs.parent.setState({flag: false});

    expect(wrapper.refs.parent.state.flag).toEqual(false);
    expect(wrapper.refs.child.context).toEqual({flag: false});
  });

  // @gate enableLegacyContext
  it('should pass context transitively', () => {
    let childInstance = null;
    let grandchildInstance = null;

    class Parent extends React.Component {
      static childContextTypes = {
        foo: PropTypes.string,
        depth: PropTypes.number,
      };

      getChildContext() {
        return {
          foo: 'bar',
          depth: 0,
        };
      }

      render() {
        return <Child />;
      }
    }

    class Child extends React.Component {
      static contextTypes = {
        foo: PropTypes.string,
        depth: PropTypes.number,
      };

      static childContextTypes = {
        depth: PropTypes.number,
      };

      getChildContext() {
        return {
          depth: this.context.depth + 1,
        };
      }

      render() {
        childInstance = this;
        return <Grandchild />;
      }
    }

    class Grandchild extends React.Component {
      static contextTypes = {
        foo: PropTypes.string,
        depth: PropTypes.number,
      };

      render() {
        grandchildInstance = this;
        return <div />;
      }
    }

    ReactTestUtils.renderIntoDocument(<Parent />);
    expect(childInstance.context).toEqual({foo: 'bar', depth: 0});
    expect(grandchildInstance.context).toEqual({foo: 'bar', depth: 1});
  });

  // @gate enableLegacyContext
  it('should pass context when re-rendered', () => {
    let parentInstance = null;
    let childInstance = null;

    class Parent extends React.Component {
      static childContextTypes = {
        foo: PropTypes.string,
        depth: PropTypes.number,
      };

      state = {
        flag: false,
      };

      getChildContext() {
        return {
          foo: 'bar',
          depth: 0,
        };
      }

      render() {
        let output = <Child />;
        if (!this.state.flag) {
          output = <span>Child</span>;
        }
        return output;
      }
    }

    class Child extends React.Component {
      static contextTypes = {
        foo: PropTypes.string,
        depth: PropTypes.number,
      };

      render() {
        childInstance = this;
        return <span>Child</span>;
      }
    }

    parentInstance = ReactTestUtils.renderIntoDocument(<Parent />);
    expect(childInstance).toBeNull();

    expect(parentInstance.state.flag).toBe(false);
    ReactDOM.unstable_batchedUpdates(function() {
      parentInstance.setState({flag: true});
    });
    expect(parentInstance.state.flag).toBe(true);

    expect(childInstance.context).toEqual({foo: 'bar', depth: 0});
  });

  // @gate enableLegacyContext
  it('unmasked context propagates through updates', () => {
    class Leaf extends React.Component {
      static contextTypes = {
        foo: PropTypes.string.isRequired,
      };

      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        expect('foo' in nextContext).toBe(true);
      }

      shouldComponentUpdate(nextProps, nextState, nextContext) {
        expect('foo' in nextContext).toBe(true);
        return true;
      }

      render() {
        return <span>{this.context.foo}</span>;
      }
    }

    class Intermediary extends React.Component {
      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        expect('foo' in nextContext).toBe(false);
      }

      shouldComponentUpdate(nextProps, nextState, nextContext) {
        expect('foo' in nextContext).toBe(false);
        return true;
      }

      render() {
        return <Leaf />;
      }
    }

    class Parent extends React.Component {
      static childContextTypes = {
        foo: PropTypes.string,
      };

      getChildContext() {
        return {
          foo: this.props.cntxt,
        };
      }

      render() {
        return <Intermediary />;
      }
    }

    const div = document.createElement('div');
    ReactDOM.render(<Parent cntxt="noise" />, div);
    expect(div.children[0].innerHTML).toBe('noise');
    div.children[0].innerHTML = 'aliens';
    div.children[0].id = 'aliens';
    expect(div.children[0].innerHTML).toBe('aliens');
    expect(div.children[0].id).toBe('aliens');
    ReactDOM.render(<Parent cntxt="bar" />, div);
    expect(div.children[0].innerHTML).toBe('bar');
    expect(div.children[0].id).toBe('aliens');
  });

  // @gate enableLegacyContext
  it('should trigger componentWillReceiveProps for context changes', () => {
    let contextChanges = 0;
    let propChanges = 0;

    class GrandChild extends React.Component {
      static contextTypes = {
        foo: PropTypes.string.isRequired,
      };

      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        expect('foo' in nextContext).toBe(true);

        if (nextProps !== this.props) {
          propChanges++;
        }

        if (nextContext !== this.context) {
          contextChanges++;
        }
      }

      render() {
        return <span className="grand-child">{this.props.children}</span>;
      }
    }

    class ChildWithContext extends React.Component {
      static contextTypes = {
        foo: PropTypes.string.isRequired,
      };

      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        expect('foo' in nextContext).toBe(true);

        if (nextProps !== this.props) {
          propChanges++;
        }

        if (nextContext !== this.context) {
          contextChanges++;
        }
      }

      render() {
        return <div className="child-with">{this.props.children}</div>;
      }
    }

    class ChildWithoutContext extends React.Component {
      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        expect('foo' in nextContext).toBe(false);

        if (nextProps !== this.props) {
          propChanges++;
        }

        if (nextContext !== this.context) {
          contextChanges++;
        }
      }

      render() {
        return <div className="child-without">{this.props.children}</div>;
      }
    }

    class Parent extends React.Component {
      static childContextTypes = {
        foo: PropTypes.string,
      };

      state = {
        foo: 'abc',
      };

      getChildContext() {
        return {
          foo: this.state.foo,
        };
      }

      render() {
        return <div className="parent">{this.props.children}</div>;
      }
    }

    const div = document.createElement('div');

    let parentInstance = null;
    ReactDOM.render(
      <Parent ref={inst => (parentInstance = inst)}>
        <ChildWithoutContext>
          A1
          <GrandChild>A2</GrandChild>
        </ChildWithoutContext>

        <ChildWithContext>
          B1
          <GrandChild>B2</GrandChild>
        </ChildWithContext>
      </Parent>,
      div,
    );

    parentInstance.setState({
      foo: 'def',
    });

    expect(propChanges).toBe(0);
    expect(contextChanges).toBe(3); // ChildWithContext, GrandChild x 2
  });

  it('only renders once if updated in componentWillReceiveProps', () => {
    let renders = 0;

    class Component extends React.Component {
      state = {updated: false};

      UNSAFE_componentWillReceiveProps(props) {
        expect(props.update).toBe(1);
        expect(renders).toBe(1);
        this.setState({updated: true});
        expect(renders).toBe(1);
      }

      render() {
        renders++;
        return <div />;
      }
    }

    const container = document.createElement('div');
    const instance = ReactDOM.render(<Component update={0} />, container);
    expect(renders).toBe(1);
    expect(instance.state.updated).toBe(false);
    ReactDOM.render(<Component update={1} />, container);
    expect(renders).toBe(2);
    expect(instance.state.updated).toBe(true);
  });

  it('only renders once if updated in componentWillReceiveProps when batching', () => {
    let renders = 0;

    class Component extends React.Component {
      state = {updated: false};

      UNSAFE_componentWillReceiveProps(props) {
        expect(props.update).toBe(1);
        expect(renders).toBe(1);
        this.setState({updated: true});
        expect(renders).toBe(1);
      }

      render() {
        renders++;
        return <div />;
      }
    }

    const container = document.createElement('div');
    const instance = ReactDOM.render(<Component update={0} />, container);
    expect(renders).toBe(1);
    expect(instance.state.updated).toBe(false);
    ReactDOM.unstable_batchedUpdates(() => {
      ReactDOM.render(<Component update={1} />, container);
    });
    expect(renders).toBe(2);
    expect(instance.state.updated).toBe(true);
  });

  it('should update refs if shouldComponentUpdate gives false', () => {
    class Static extends React.Component {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    class Component extends React.Component {
      render() {
        if (this.props.flipped) {
          return (
            <div>
              <Static ref="static0" key="B">
                B (ignored)
              </Static>
              <Static ref="static1" key="A">
                A (ignored)
              </Static>
            </div>
          );
        } else {
          return (
            <div>
              <Static ref="static0" key="A">
                A
              </Static>
              <Static ref="static1" key="B">
                B
              </Static>
            </div>
          );
        }
      }
    }

    const container = document.createElement('div');
    const comp = ReactDOM.render(<Component flipped={false} />, container);
    expect(ReactDOM.findDOMNode(comp.refs.static0).textContent).toBe('A');
    expect(ReactDOM.findDOMNode(comp.refs.static1).textContent).toBe('B');

    // When flipping the order, the refs should update even though the actual
    // contents do not
    ReactDOM.render(<Component flipped={true} />, container);
    expect(ReactDOM.findDOMNode(comp.refs.static0).textContent).toBe('B');
    expect(ReactDOM.findDOMNode(comp.refs.static1).textContent).toBe('A');
  });

  it('should allow access to findDOMNode in componentWillUnmount', () => {
    let a = null;
    let b = null;

    class Component extends React.Component {
      componentDidMount() {
        a = ReactDOM.findDOMNode(this);
        expect(a).not.toBe(null);
      }

      componentWillUnmount() {
        b = ReactDOM.findDOMNode(this);
        expect(b).not.toBe(null);
      }

      render() {
        return <div />;
      }
    }

    const container = document.createElement('div');
    expect(a).toBe(container.firstChild);
    ReactDOM.render(<Component />, container);
    ReactDOM.unmountComponentAtNode(container);
    expect(a).toBe(b);
  });

  it('context should be passed down from the parent', () => {
    class Parent extends React.Component {
      static childContextTypes = {
        foo: PropTypes.string,
      };

      getChildContext() {
        return {
          foo: 'bar',
        };
      }

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    class Component extends React.Component {
      static contextTypes = {
        foo: PropTypes.string.isRequired,
      };

      render() {
        return <div />;
      }
    }

    const div = document.createElement('div');
    ReactDOM.render(
      <Parent>
        <Component />
      </Parent>,
      div,
    );
  });

  it('should support objects with prototypes as state', () => {
    const NotActuallyImmutable = function(str) {
      this.str = str;
    };
    NotActuallyImmutable.prototype.amIImmutable = function() {
      return true;
    };
    class Moo extends React.Component {
      state = new NotActuallyImmutable('first');

      render() {
        return <div />;
      }
    }

    const moo = ReactTestUtils.renderIntoDocument(<Moo />);
    expect(moo.state.str).toBe('first');
    expect(moo.state.amIImmutable()).toBe(true);

    moo.setState({str: 'third'});
    expect(moo.state.str).toBe('third');
    // Here we lose the prototype.
    expect(moo.state.amIImmutable).toBe(undefined);

    // When more than one state update is enqueued, we have the same behavior
    const fifthState = new NotActuallyImmutable('fifth');
    ReactDOM.unstable_batchedUpdates(function() {
      moo.setState({str: 'fourth'});
    });
    expect(moo.state.str).toBe('fourth');

    // When more than one state update is enqueued, we have the same behavior
    const sixthState = new NotActuallyImmutable('sixth');
    ReactDOM.unstable_batchedUpdates(function() {
      moo.setState({str: 'seventh'});
    });
    expect(moo.state.str).toBe('seventh');
    expect(moo.state.amIImmutable).toBe(undefined);
  });

  it('should not warn about unmounting during unmounting', () => {
    const container = document.createElement('div');
    const layer = document.createElement('div');

    class Component extends React.Component {
      componentDidMount() {
        ReactDOM.render(<div />, layer);
      }

      componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(layer);
      }

      render() {
        return <div />;
      }
    }

    class Outer extends React.Component {
      render() {
        return <div>{this.props.children}</div>;
      }
    }

    ReactDOM.render(
      <Outer>
        <Component />
      </Outer>,
      container,
    );
    ReactDOM.render(<Outer />, container);
  });

  it('should only call componentWillUnmount once', () => {
    let app;
    let count = 0;

    class App extends React.Component {
      render() {
        if (this.props.stage === 1) {
          return <UnunmountableComponent />;
        } else {
          return null;
        }
      }
    }

    class UnunmountableComponent extends React.Component {
      componentWillUnmount() {
        app.setState({});
        count++;
        throw Error('always fails');
      }

      render() {
        return <div>Hello {this.props.name}</div>;
      }
    }

    const container = document.createElement('div');

    const setRef = ref => {
      if (ref) {
        app = ref;
      }
    };

    expect(() => {
      ReactDOM.render(<App ref={setRef} stage={1} />, container);
      ReactDOM.render(<App ref={setRef} stage={2} />, container);
    }).toThrow();
    expect(count).toBe(1);
  });

  it('prepares new child before unmounting old', () => {
    const log = [];

    class Spy extends React.Component {
      UNSAFE_componentWillMount() {
        log.push(this.props.name + ' componentWillMount');
      }
      render() {
        log.push(this.props.name + ' render');
        return <div />;
      }
      componentDidMount() {
        log.push(this.props.name + ' componentDidMount');
      }
      componentWillUnmount() {
        log.push(this.props.name + ' componentWillUnmount');
      }
    }

    class Wrapper extends React.Component {
      render() {
        return <Spy key={this.props.name} name={this.props.name} />;
      }
    }

    const container = document.createElement('div');
    ReactDOM.render(<Wrapper name="A" />, container);
    ReactDOM.render(<Wrapper name="B" />, container);

    expect(log).toEqual([
      'A componentWillMount',
      'A render',
      'A componentDidMount',

      'B componentWillMount',
      'B render',
      'A componentWillUnmount',
      'B componentDidMount',
    ]);
  });

  it('respects a shallow shouldComponentUpdate implementation', () => {
    let renderCalls = 0;
    class PlasticWrap extends React.Component {
      constructor(props, context) {
        super(props, context);
        this.state = {
          color: 'green',
        };
      }

      render() {
        return <Apple color={this.state.color} ref="apple" />;
      }
    }

    class Apple extends React.Component {
      state = {
        cut: false,
        slices: 1,
      };

      shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
      }

      cut() {
        this.setState({
          cut: true,
          slices: 10,
        });
      }

      eatSlice() {
        this.setState({
          slices: this.state.slices - 1,
        });
      }

      render() {
        renderCalls++;
        return <div />;
      }
    }

    const container = document.createElement('div');
    const instance = ReactDOM.render(<PlasticWrap />, container);
    expect(renderCalls).toBe(1);

    // Do not re-render based on props
    instance.setState({color: 'green'});
    expect(renderCalls).toBe(1);

    // Re-render based on props
    instance.setState({color: 'red'});
    expect(renderCalls).toBe(2);

    // Re-render base on state
    instance.refs.apple.cut();
    expect(renderCalls).toBe(3);

    // No re-render based on state
    instance.refs.apple.cut();
    expect(renderCalls).toBe(3);

    // Re-render based on state again
    instance.refs.apple.eatSlice();
    expect(renderCalls).toBe(4);
  });

  it('does not do a deep comparison for a shallow shouldComponentUpdate implementation', () => {
    function getInitialState() {
      return {
        foo: [1, 2, 3],
        bar: {a: 4, b: 5, c: 6},
      };
    }

    let renderCalls = 0;
    const initialSettings = getInitialState();

    class Component extends React.Component {
      state = initialSettings;

      shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
      }

      render() {
        renderCalls++;
        return <div />;
      }
    }

    const container = document.createElement('div');
    const instance = ReactDOM.render(<Component />, container);
    expect(renderCalls).toBe(1);

    // Do not re-render if state is equal
    const settings = {
      foo: initialSettings.foo,
      bar: initialSettings.bar,
    };
    instance.setState(settings);
    expect(renderCalls).toBe(1);

    // Re-render because one field changed
    initialSettings.foo = [1, 2, 3];
    instance.setState(initialSettings);
    expect(renderCalls).toBe(2);

    // Re-render because the object changed
    instance.setState(getInitialState());
    expect(renderCalls).toBe(3);
  });

  it('should call setState callback with no arguments', () => {
    let mockArgs;
    class Component extends React.Component {
      componentDidMount() {
        this.setState({}, (...args) => (mockArgs = args));
      }
      render() {
        return false;
      }
    }

    ReactTestUtils.renderIntoDocument(<Component />);
    expect(mockArgs.length).toEqual(0);
  });

  it('this.state should be updated on setState callback inside componentWillMount', () => {
    const div = document.createElement('div');
    let stateSuccessfullyUpdated = false;

    class Component extends React.Component {
      constructor(props, context) {
        super(props, context);
        this.state = {
          hasUpdatedState: false,
        };
      }

      UNSAFE_componentWillMount() {
        this.setState(
          {hasUpdatedState: true},
          () => (stateSuccessfullyUpdated = this.state.hasUpdatedState),
        );
      }

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    ReactDOM.render(<Component />, div);
    expect(stateSuccessfullyUpdated).toBe(true);
  });

  it('should call the setState callback even if shouldComponentUpdate = false', done => {
    const mockFn = jest.fn().mockReturnValue(false);
    const div = document.createElement('div');

    let instance;

    class Component extends React.Component {
      constructor(props, context) {
        super(props, context);
        this.state = {
          hasUpdatedState: false,
        };
      }

      UNSAFE_componentWillMount() {
        instance = this;
      }

      shouldComponentUpdate() {
        return mockFn();
      }

      render() {
        return <div>{this.state.hasUpdatedState}</div>;
      }
    }

    ReactDOM.render(<Component />, div);

    expect(instance).toBeDefined();
    expect(mockFn).not.toBeCalled();

    instance.setState({hasUpdatedState: true}, () => {
      expect(mockFn).toBeCalled();
      expect(instance.state.hasUpdatedState).toBe(true);
      done();
    });
  });

  // Regression test for accidental breaking change
  // https://github.com/facebook/react/issues/13580
  it('should support classes shadowing isClassComponent', () => {
    class Shadow extends React.Component {
      isClassComponent() {}
      render() {
        return <div />;
      }
    }
    const container = document.createElement('div');
    ReactDOM.render(<Shadow />, container);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('should not warn on updating function component from componentWillMount', () => {
    let _setState;
    function A() {
      _setState = React.useState()[1];
      return null;
    }
    class B extends React.Component {
      UNSAFE_componentWillMount() {
        _setState({});
      }
      render() {
        return null;
      }
    }
    function Parent() {
      return (
        <div>
          <A />
          <B />
        </div>
      );
    }
    const container = document.createElement('div');
    ReactDOM.render(<Parent />, container);
  });

  it('should not warn on updating function component from componentWillUpdate', () => {
    let _setState;
    function A() {
      _setState = React.useState()[1];
      return null;
    }
    class B extends React.Component {
      UNSAFE_componentWillUpdate() {
        _setState({});
      }
      render() {
        return null;
      }
    }
    function Parent() {
      return (
        <div>
          <A />
          <B />
        </div>
      );
    }
    const container = document.createElement('div');
    ReactDOM.render(<Parent />, container);
    ReactDOM.render(<Parent />, container);
  });

  it('should not warn on updating function component from componentWillReceiveProps', () => {
    let _setState;
    function A() {
      _setState = React.useState()[1];
      return null;
    }
    class B extends React.Component {
      UNSAFE_componentWillReceiveProps() {
        _setState({});
      }
      render() {
        return null;
      }
    }
    function Parent() {
      return (
        <div>
          <A />
          <B />
        </div>
      );
    }
    const container = document.createElement('div');
    ReactDOM.render(<Parent />, container);
    ReactDOM.render(<Parent />, container);
  });
});
