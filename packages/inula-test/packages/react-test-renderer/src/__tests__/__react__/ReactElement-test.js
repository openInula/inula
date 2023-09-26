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
let Scheduler;

describe('ReactElement', () => {
  let ComponentClass;

  beforeEach(() => {
    jest.resetModules();

    React = require('horizon-external');
    ReactDOM = require('horizon');
    ReactTestUtils = require('react-test-renderer/test-utils');
    Scheduler = require('scheduler');
    // NOTE: We're explicitly not using JSX here. This is intended to test
    // classic JS without JSX.
    ComponentClass = class extends React.Component {
      render() {
        return React.createElement('div');
      }
    };
  });

  it('uses the fallback value when in an environment without Symbol', () => {
    expect((<div />).vtype).toBe(1);
  });

  it('returns a complete element according to spec', () => {
    const element = React.createElement(ComponentClass);
    expect(element.type).toBe(ComponentClass);
    expect(element.key).toBe(null);
    expect(element.ref).toBe(null);
    expect(element.props).toEqual({});
  });

  it('allows a string to be passed as the type', () => {
    const element = React.createElement('div');
    expect(element.type).toBe('div');
    expect(element.key).toBe(null);
    expect(element.ref).toBe(null);
    expect(element.props).toEqual({});
  });

  it('returns an immutable element', () => {
    const element = React.createElement(ComponentClass);
    expect(() => (element.type = 'div')).not.toThrow();
  });

  it('does not reuse the original config object', () => {
    const config = {foo: 1};
    const element = React.createElement(ComponentClass, config);
    expect(element.props.foo).toBe(1);
    config.foo = 2;
    expect(element.props.foo).toBe(1);
  });

  it('does not fail if config has no prototype', () => {
    const config = Object.create(null, {foo: {value: 1, enumerable: true}});
    const element = React.createElement(ComponentClass, config);
    expect(element.props.foo).toBe(1);
  });

  it('extracts key and ref from the config', () => {
    const element = React.createElement(ComponentClass, {
      key: '12',
      ref: '34',
      foo: '56',
    });
    expect(element.type).toBe(ComponentClass);
    expect(element.key).toBe('12');
    expect(element.ref).toBe('34');
    expect(element.props).toEqual({foo: '56'});
  });

  it('extracts null key and ref', () => {
    const element = React.createElement(ComponentClass, {
      key: null,
      ref: null,
      foo: '12',
    });
    expect(element.type).toBe(ComponentClass);
    expect(element.key).toBe('null');
    expect(element.ref).toBe(null);
    expect(element.props).toEqual({foo: '12'});
  });

  it('ignores undefined key and ref', () => {
    const props = {
      foo: '56',
      key: undefined,
      ref: undefined,
    };
    const element = React.createElement(ComponentClass, props);
    expect(element.type).toBe(ComponentClass);
    expect(element.key).toBe(null);
    expect(element.ref).toBe(null);
    expect(element.props).toEqual({foo: '56'});
  });

  it('ignores key and ref warning getters', () => {
    const elementA = React.createElement('div');
    const elementB = React.createElement('div', elementA.props);
    expect(elementB.key).toBe(null);
    expect(elementB.ref).toBe(null);
  });

  it('coerces the key to a string', () => {
    const element = React.createElement(ComponentClass, {
      key: 12,
      foo: '56',
    });
    expect(element.type).toBe(ComponentClass);
    expect(element.key).toBe('12');
    expect(element.ref).toBe(null);
    expect(element.props).toEqual({foo: '56'});
  });

  it('preserves the owner on the element', () => {
    let element;

    class Wrapper extends React.Component {
      render() {
        element = React.createElement(ComponentClass);
        return element;
      }
    }

    const instance = ReactTestUtils.renderIntoDocument(
      React.createElement(Wrapper),
    );
    const symbolAttibute = Object.getOwnPropertySymbols(element)[0];
    expect(element[symbolAttibute].realNode).toBe(instance);
  });

  it('merges an additional argument onto the children prop', () => {
    const a = 1;
    const element = React.createElement(
      ComponentClass,
      {
        children: 'text',
      },
      a,
    );
    expect(element.props.children).toBe(a);
  });

  it('does not override children if no rest args are provided', () => {
    const element = React.createElement(ComponentClass, {
      children: 'text',
    });
    expect(element.props.children).toBe('text');
  });

  it('overrides children if null is provided as an argument', () => {
    const element = React.createElement(
      ComponentClass,
      {
        children: 'text',
      },
      null,
    );
    expect(element.props.children).toBe(null);
  });

  it('merges rest arguments onto the children prop in an array', () => {
    const a = 1;
    const b = 2;
    const c = 3;
    const element = React.createElement(ComponentClass, null, a, b, c);
    expect(element.props.children).toEqual([1, 2, 3]);
  });

  // NOTE: We're explicitly not using JSX here. This is intended to test
  // classic JS without JSX.
  it('allows static methods to be called using the type property', () => {
    class StaticMethodComponentClass extends React.Component {
      render() {
        return React.createElement('div');
      }
    }
    StaticMethodComponentClass.someStaticMethod = () => 'someReturnValue';

    const element = React.createElement(StaticMethodComponentClass);
    expect(element.type.someStaticMethod()).toBe('someReturnValue');
  });

  it('allow update ref.current object', () => {
    function UpdateRef(props, ref) {
      React.useImperativeHandle(ref, () => ({
        print: () => {
          Scheduler.unstable_yieldValue('changed current obj');
        }
      }))

      return <div>abc</div>
    }

    const ForwardUpdateRef = React.forwardRef(UpdateRef);
    function Fun() {
      const ref = React.useRef();
      const click = () => {
        ref.current.print();
      }
      return <div ><button id={'button'} onClick={click} ></button> <ForwardUpdateRef ref={ref} /></div>;
    }

    const container = document.createElement('div');
    const act = require('react-test-renderer/test-utils').act;
    act(() => {
      ReactDOM.render(
        <Fun/>,
        container,
      );
    })
    const button = container.querySelector('#button');
    button.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(Scheduler).toHaveYielded(['changed current obj']);
  })

  // NOTE: We're explicitly not using JSX here. This is intended to test
  // classic JS without JSX.
  it('identifies valid elements', () => {
    class Component extends React.Component {
      render() {
        return React.createElement('div');
      }
    }

    expect(React.isValidElement(React.createElement('div'))).toEqual(true);
    expect(React.isValidElement(React.createElement(Component))).toEqual(true);

    expect(React.isValidElement(null)).toEqual(false);
    expect(React.isValidElement(true)).toEqual(false);
    expect(React.isValidElement({})).toEqual(false);
    expect(React.isValidElement('string')).toEqual(false);
    expect(React.isValidElement(Component)).toEqual(false);
    expect(React.isValidElement({type: 'div', props: {}})).toEqual(false);

    const jsonElement = JSON.stringify(React.createElement('div'));
    expect(React.isValidElement(JSON.parse(jsonElement))).toBe(true);
  });

  // NOTE: We're explicitly not using JSX here. This is intended to test
  // classic JS without JSX.
  it('is indistinguishable from a plain object', () => {
    const element = React.createElement('div', {className: 'foo'});
    const object = {};
    expect(element.constructor).toBe(object.constructor);
  });

  // NOTE: We're explicitly not using JSX here. This is intended to test
  // classic JS without JSX.
  it('should use default prop value when removing a prop', () => {
    class Component extends React.Component {
      render() {
        return React.createElement('span');
      }
    }
    Component.defaultProps = {fruit: 'persimmon'};

    const container = document.createElement('div');
    const instance = ReactDOM.render(
      React.createElement(Component, {fruit: 'mango'}),
      container,
    );
    expect(instance.props.fruit).toBe('mango');

    ReactDOM.render(React.createElement(Component), container);
    expect(instance.props.fruit).toBe('persimmon');
  });

  // NOTE: We're explicitly not using JSX here. This is intended to test
  // classic JS without JSX.
  it('should normalize props with default values', () => {
    class Component extends React.Component {
      render() {
        return React.createElement('span', null, this.props.prop);
      }
    }
    Component.defaultProps = {prop: 'testKey'};

    const instance = ReactTestUtils.renderIntoDocument(
      React.createElement(Component),
    );
    expect(instance.props.prop).toBe('testKey');

    const inst2 = ReactTestUtils.renderIntoDocument(
      React.createElement(Component, {prop: null}),
    );
    expect(inst2.props.prop).toBe(null);
  });

  it('throws when changing a prop (in dev) after element creation', () => {
    class Outer extends React.Component {
      render() {
        const el = <div className="moo" />;

        el.props.className = 'quack';
        expect(el.props.className).toBe('quack');

        return el;
      }
    }
    const outer = ReactTestUtils.renderIntoDocument(<Outer color="orange" />);
    expect(ReactDOM.findDOMNode(outer).className).toBe('quack');
  });

  it('does not warn for NaN props', () => {
    class Test extends React.Component {
      render() {
        return <div />;
      }
    }
    const test = ReactTestUtils.renderIntoDocument(<Test value={+undefined} />);
    expect(test.props.value).toBeNaN();
  });

  // NOTE: We're explicitly not using JSX here. This is intended to test
  // classic JS without JSX.
  xit('identifies elements, but not JSON, if Symbols are supported', () => {
    // Rudimentary polyfill
    // Once all jest engines support Symbols natively we can swap this to test
    // WITH native Symbols by default.
    const REACT_ELEMENT_TYPE = function() {}; // fake Symbol
    const OTHER_SYMBOL = function() {}; // another fake Symbol
    global.Symbol = function(name) {
      return OTHER_SYMBOL;
    };
    global.Symbol.for = function(key) {
      if (key === 'react.element') {
        return REACT_ELEMENT_TYPE;
      }
      return OTHER_SYMBOL;
    };

    jest.resetModules();

    React = require('horizon-external');

    class Component extends React.Component {
      render() {
        return React.createElement('div');
      }
    }

    expect(React.isValidElement(React.createElement('div'))).toEqual(true);
    expect(React.isValidElement(React.createElement(Component))).toEqual(true);

    expect(React.isValidElement(null)).toEqual(false);
    expect(React.isValidElement(true)).toEqual(false);
    expect(React.isValidElement({})).toEqual(false);
    expect(React.isValidElement('string')).toEqual(false);
    expect(React.isValidElement(Component)).toEqual(false);
    expect(React.isValidElement({type: 'div', props: {}})).toEqual(false);

    const jsonElement = JSON.stringify(React.createElement('div'));
    expect(React.isValidElement(JSON.parse(jsonElement))).toBe(false);
  });
});
