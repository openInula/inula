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

describe('ReactComponent', () => {
  beforeEach(() => {
    jest.resetModules();

    React = require('horizon-external');
    ReactDOM = require('horizon');
    ReactTestUtils = require('react-test-renderer/test-utils');
  });

  xit('should throw when supplying a ref outside of render method', () => {
    let instance = <div ref="badDiv" />;
    expect(function() {
      instance = ReactTestUtils.renderIntoDocument(instance);
    }).toThrow();
  });

  it('should support refs on owned components', () => {
    const innerObj = {};
    const outerObj = {};

    class Wrapper extends React.Component {
      getObject = () => {
        return this.props.object;
      };

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    class Component extends React.Component {
      render() {
        const inner = <Wrapper object={innerObj} ref="inner" />;
        const outer = (
          <Wrapper object={outerObj} ref="outer">
            {inner}
          </Wrapper>
        );
        return outer;
      }

      componentDidMount() {
        expect(this.refs.inner.getObject()).toEqual(innerObj);
        expect(this.refs.outer.getObject()).toEqual(outerObj);
      }
    }

    ReactTestUtils.renderIntoDocument(<Component />);
  });

  it('should not have refs on unmounted components', () => {
    class Parent extends React.Component {
      render() {
        return (
          <Child>
            <div ref="test" />
          </Child>
        );
      }

      componentDidMount() {
        expect(this.refs && this.refs.test).toEqual(undefined);
      }
    }

    class Child extends React.Component {
      render() {
        return <div />;
      }
    }

    ReactTestUtils.renderIntoDocument(<Parent child={<span />} />);
  });

  it('should support callback-style refs', () => {
    const innerObj = {};
    const outerObj = {};

    class Wrapper extends React.Component {
      getObject = () => {
        return this.props.object;
      };

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    let mounted = false;

    class Component extends React.Component {
      render() {
        const inner = (
          <Wrapper object={innerObj} ref={c => (this.innerRef = c)} />
        );
        const outer = (
          <Wrapper object={outerObj} ref={c => (this.outerRef = c)}>
            {inner}
          </Wrapper>
        );
        return outer;
      }

      componentDidMount() {
        expect(this.innerRef.getObject()).toEqual(innerObj);
        expect(this.outerRef.getObject()).toEqual(outerObj);
        mounted = true;
      }
    }

    ReactTestUtils.renderIntoDocument(<Component />);
    expect(mounted).toBe(true);
  });

  it('should support object-style refs', () => {
    const innerObj = {};
    const outerObj = {};

    class Wrapper extends React.Component {
      getObject = () => {
        return this.props.object;
      };

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    let mounted = false;

    class Component extends React.Component {
      constructor() {
        super();
        this.innerRef = React.createRef();
        this.outerRef = React.createRef();
      }
      render() {
        const inner = <Wrapper object={innerObj} ref={this.innerRef} />;
        const outer = (
          <Wrapper object={outerObj} ref={this.outerRef}>
            {inner}
          </Wrapper>
        );
        return outer;
      }

      componentDidMount() {
        expect(this.innerRef.current.getObject()).toEqual(innerObj);
        expect(this.outerRef.current.getObject()).toEqual(outerObj);
        mounted = true;
      }
    }

    ReactTestUtils.renderIntoDocument(<Component />);
    expect(mounted).toBe(true);
  });

  it('should support new-style refs with mixed-up owners', () => {
    class Wrapper extends React.Component {
      getTitle = () => {
        return this.props.title;
      };

      render() {
        return this.props.getContent();
      }
    }

    let mounted = false;

    class Component extends React.Component {
      getInner = () => {
        // (With old-style refs, it's impossible to get a ref to this div
        // because Wrapper is the current owner when this function is called.)
        return <div className="inner" ref={c => (this.innerRef = c)} />;
      };

      render() {
        return (
          <Wrapper
            title="wrapper"
            ref={c => (this.wrapperRef = c)}
            getContent={this.getInner}
          />
        );
      }

      componentDidMount() {
        // Check .props.title to make sure we got the right elements back
        expect(this.wrapperRef.getTitle()).toBe('wrapper');
        expect(this.innerRef.className).toBe('inner');
        mounted = true;
      }
    }

    ReactTestUtils.renderIntoDocument(<Component />);
    expect(mounted).toBe(true);
  });

  it('should call refs at the correct time', () => {
    const log = [];

    class Inner extends React.Component {
      render() {
        log.push(`inner ${this.props.id} render`);
        return <div />;
      }

      componentDidMount() {
        log.push(`inner ${this.props.id} componentDidMount`);
      }

      componentDidUpdate() {
        log.push(`inner ${this.props.id} componentDidUpdate`);
      }

      componentWillUnmount() {
        log.push(`inner ${this.props.id} componentWillUnmount`);
      }
    }

    class Outer extends React.Component {
      render() {
        return (
          <div>
            <Inner
              id={1}
              ref={c => {
                log.push(`ref 1 got ${c ? `instance ${c.props.id}` : 'null'}`);
              }}
            />
            <Inner
              id={2}
              ref={c => {
                log.push(`ref 2 got ${c ? `instance ${c.props.id}` : 'null'}`);
              }}
            />
          </div>
        );
      }

      componentDidMount() {
        log.push('outer componentDidMount');
      }

      componentDidUpdate() {
        log.push('outer componentDidUpdate');
      }

      componentWillUnmount() {
        log.push('outer componentWillUnmount');
      }
    }

    // mount, update, unmount
    const el = document.createElement('div');
    log.push('start mount');
    ReactDOM.render(<Outer />, el);
    log.push('start update');
    ReactDOM.render(<Outer />, el);
    log.push('start unmount');
    ReactDOM.unmountComponentAtNode(el);

    /* eslint-disable indent */
    expect(log).toEqual([
      'start mount',
      'inner 1 render',
      'inner 2 render',
      'inner 1 componentDidMount',
      'ref 1 got instance 1',
      'inner 2 componentDidMount',
      'ref 2 got instance 2',
      'outer componentDidMount',
      'start update',
      // Previous (equivalent) refs get cleared
      // Fiber renders first, resets refs later
      'inner 1 render',
      'inner 2 render',
      'ref 1 got null',
      'ref 2 got null',
      'inner 1 componentDidUpdate',
      'ref 1 got instance 1',
      'inner 2 componentDidUpdate',
      'ref 2 got instance 2',
      'outer componentDidUpdate',
      'start unmount',
      'outer componentWillUnmount',
      'ref 1 got null',
      'inner 1 componentWillUnmount',
      'ref 2 got null',
      'inner 2 componentWillUnmount',
    ]);
    /* eslint-enable indent */
  });

  it('fires the callback after a component is rendered', () => {
    const callback = jest.fn();
    const container = document.createElement('div');
    ReactDOM.render(<div />, container, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    ReactDOM.render(<div className="foo" />, container, callback);
    expect(callback).toHaveBeenCalledTimes(2);
    ReactDOM.render(<span />, container, callback);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('throws usefully when rendering badly-typed elements', () => {
    const X = undefined;
    expect(() => {
      expect(() => ReactTestUtils.renderIntoDocument(<X />)).toErrorDev(
        'React.createElement: type is invalid -- expected a string (for built-in components) ' +
          'or a class/function (for composite components) but got: undefined.',
      );
    }).toThrowError('Component type is invalid, got: undefined');

    const Y = null;
    expect(() => {
      expect(() => ReactTestUtils.renderIntoDocument(<Y />)).toErrorDev(
        'React.createElement: type is invalid -- expected a string (for built-in components) ' +
          'or a class/function (for composite components) but got: null.',
      );
    }).toThrowError('Component type is invalid, got: null');
  });

  it('includes owner name in the error about badly-typed elements', () => {
    const X = undefined;

    function Indirection(props) {
      return <div>{props.children}</div>;
    }

    function Bar() {
      return (
        <Indirection>
          <X />
        </Indirection>
      );
    }

    function Foo() {
      return <Bar />;
    }

    expect(() => {
      expect(() => ReactTestUtils.renderIntoDocument(<Foo />)).toErrorDev(
        'React.createElement: type is invalid -- expected a string (for built-in components) ' +
          'or a class/function (for composite components) but got: undefined.',
      );
    }).toThrowError('Component type is invalid, got: undefined');
  });

  xit('throws if a plain object is used as a child', () => {
    const children = {
      x: <span />,
      y: <span />,
      z: <span />,
    };
    const element = <div>{[children]}</div>;
    const container = document.createElement('div');
    expect(() => {
      ReactDOM.render(element, container);
    }).toThrowError(
      'horizon child can not be object.  use string / function / array.',
    );
  });

  xit('throws if a plain object even if it is in an owner', () => {
    class Foo extends React.Component {
      render() {
        const children = {
          a: <span />,
          b: <span />,
          c: <span />,
        };
        return <div>{[children]}</div>;
      }
    }
    const container = document.createElement('div');
    expect(() => {
      ReactDOM.render(<Foo />, container);
    }).toThrowError(
      'horizon child can not be object.  use string / function / array.',
    );
  });

  describe('with new features', () => {
    xit('warns on function as a return value from a function', () => {
      function Foo() {
        return Foo;
      }
      const container = document.createElement('div');
      expect(() => ReactDOM.render(<Foo />, container)).toErrorDev(
        'Warning: horizon child can not be functions.  use string / object / array.',
      );
    });

    xit('warns on function as a return value from a class', () => {
      class Foo extends React.Component {
        render() {
          return Foo;
        }
      }
      const container = document.createElement('div');
      expect(() => ReactDOM.render(<Foo />, container)).toErrorDev(
        'Warning: horizon child can not be functions.  use string / object / array.',
      );
    });

    xit('warns on function as a child to host component', () => {
      function Foo() {
        return (
          <div>
            <span>{Foo}</span>
          </div>
        );
      }
      const container = document.createElement('div');
      expect(() => ReactDOM.render(<Foo />, container)).toErrorDev(
        'Warning: horizon child can not be functions.  use string / object / array.',
      );
    });

    it('does not warn for function-as-a-child that gets resolved', () => {
      function Bar(props) {
        return props.children();
      }
      function Foo() {
        return <Bar>{() => 'Hello'}</Bar>;
      }
      const container = document.createElement('div');
      ReactDOM.render(<Foo />, container);
      expect(container.innerHTML).toBe('Hello');
    });

    xit('deduplicates function type warnings based on component type', () => {
      class Foo extends React.PureComponent {
        constructor() {
          super();
          this.state = {type: 'mushrooms'};
        }
        render() {
          return (
            <div>
              {Foo}
              {Foo}
              <span>
                {Foo}
                {Foo}
              </span>
            </div>
          );
        }
      }
      const container = document.createElement('div');
      let component;
      expect(() => {
        component = ReactDOM.render(<Foo />, container);
      }).toErrorDev([
        'Warning: horizon child can not be functions.  use string / object / array.',
        'Warning: horizon child can not be functions.  use string / object / array.',
      ]);
      component.setState({type: 'portobello mushrooms'});
    });
  });
});
