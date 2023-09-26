/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

describe('ReactDOMComponent', () => {
  let React;
  let ReactTestUtils;
  let ReactDOM;

  beforeEach(() => {
    jest.resetModules();
    React = require('horizon-external');
    ReactDOM = require('horizon');
    ReactTestUtils = require('react-test-renderer/test-utils');
  });

  describe('updateDOM', () => {
    it('should handle className', () => {
      const container = document.createElement('div');
      ReactDOM.render(<div style={{}} />, container);

      ReactDOM.render(<div className={'foo'} />, container);
      expect(container.firstChild.className).toEqual('foo');
      ReactDOM.render(<div className={'bar'} />, container);
      expect(container.firstChild.className).toEqual('bar');
      ReactDOM.render(<div className={null} />, container);
      expect(container.firstChild.className).toEqual('');
    });

    it('should gracefully handle various style value types', () => {
      const container = document.createElement('div');
      ReactDOM.render(<div style={{}} />, container);
      const stubStyle = container.firstChild.style;

      // set initial style
      const setup = {
        display: 'block',
        left: '1px',
        top: 2,
        fontFamily: 'Arial',
      };
      ReactDOM.render(<div style={setup} />, container);
      expect(stubStyle.display).toEqual('block');
      expect(stubStyle.left).toEqual('1px');
      // expect(stubStyle.top).toEqual('2px');
      expect(stubStyle.fontFamily).toEqual('Arial');

      // reset the style to their default state
      const reset = {display: '', left: null, top: false, fontFamily: true};
      ReactDOM.render(<div style={reset} />, container);
      expect(stubStyle.display).toEqual('');
      expect(stubStyle.left).toEqual('');
      expect(stubStyle.top).toEqual('');
      expect(stubStyle.fontFamily).toEqual('');
    });

    it('should not update styles when mutating a proxy style object', () => {
      const styleStore = {
        display: 'none',
        fontFamily: 'Arial',
        lineHeight: 1.2,
      };
      // We use a proxy style object so that we can mutate it even if it is
      // frozen in DEV.
      const styles = {
        get display() {
          return styleStore.display;
        },
        set display(v) {
          styleStore.display = v;
        },
        get fontFamily() {
          return styleStore.fontFamily;
        },
        set fontFamily(v) {
          styleStore.fontFamily = v;
        },
        get lineHeight() {
          return styleStore.lineHeight;
        },
        set lineHeight(v) {
          styleStore.lineHeight = v;
        },
      };
      const container = document.createElement('div');
      ReactDOM.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;
      stubStyle.display = styles.display;
      stubStyle.fontFamily = styles.fontFamily;

      styles.display = 'block';

      ReactDOM.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      styles.fontFamily = 'Helvetica';

      ReactDOM.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      styles.lineHeight = 0.5;

      ReactDOM.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      ReactDOM.render(<div style={undefined} />, container);
      expect(stubStyle.display).toBe('');
      expect(stubStyle.fontFamily).toBe('');
      expect(stubStyle.lineHeight).toBe('');
    });

    it('should throw when mutating style objects', () => {
      const style = {border: '1px solid black'};

      class App extends React.Component {
        state = {style: style};

        render() {
          return <div style={this.state.style}>asd</div>;
        }
      }

      ReactTestUtils.renderIntoDocument(<App />);
    });

    xit('should warn for unknown prop', () => {
      const container = document.createElement('div');
      expect(() =>
        ReactDOM.render(<div foo={() => {}} />, container),
      ).toErrorDev(
        'Warning: Invalid value for prop `foo` on <div> tag.',
      );
    });

    xit('should group multiple unknown prop warnings together', () => {
      const container = document.createElement('div');
      expect(() =>
        ReactDOM.render(<div foo={() => {}} baz={() => {}} />, container),
      ).toErrorDev(
        'Warning: Invalid value for prop `foo`, `baz` on <div> tag.'
      );
    });

    it('should warn for unknown function event handlers', () => {
      const container = document.createElement('div');
      expect(() =>
        ReactDOM.render(<div onunknown={function() {}} />, container),
      ).toErrorDev(
        'Warning: Invalid event property `onunknown`, events use the camelCase name.',
      );
      expect(container.firstChild.hasAttribute('onunknown')).toBe(false);
      expect(container.firstChild.onunknown).toBe(undefined);
      expect(() =>
        ReactDOM.render(<div on-unknown={function() {}} />, container),
      ).toErrorDev(
        'Warning: Invalid event property `on-unknown`, events use the camelCase name.',
      );
      expect(container.firstChild.hasAttribute('on-unknown')).toBe(false);
      expect(container.firstChild['on-unknown']).toBe(undefined);
    });

    it('should warn for badly cased React attributes', () => {
      const container = document.createElement('div');
      expect(() => ReactDOM.render(<div CHILDREN="5" />, container)).not.toThrow();
      expect(container.firstChild.getAttribute('CHILDREN')).toBe('5');
    });

    it('should not warn for "0" as a unitless style value', () => {
      class Component extends React.Component {
        render() {
          return <div style={{margin: '0'}} />;
        }
      }

      ReactTestUtils.renderIntoDocument(<Component />);
    });

    it('should warn nicely about NaN in style', () => {
      const style = {fontSize: NaN};
      const div = document.createElement('div');
      expect(() => ReactDOM.render(<span style={style} />, div)).not.toThrow();
      ReactDOM.render(<span style={style} />, div);
    });

    it('should update styles if initially null', () => {
      let styles = null;
      const container = document.createElement('div');
      ReactDOM.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {display: 'block'};

      ReactDOM.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');
    });

    it('should update styles if updated to null multiple times', () => {
      let styles = null;
      const container = document.createElement('div');
      ReactDOM.render(<div style={styles} />, container);

      styles = {display: 'block'};
      const stubStyle = container.firstChild.style;

      ReactDOM.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');

      ReactDOM.render(<div style={null} />, container);
      expect(stubStyle.display).toEqual('');

      ReactDOM.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');

      ReactDOM.render(<div style={null} />, container);
      expect(stubStyle.display).toEqual('');
    });

    it('should allow named slot projection on both web components and regular DOM elements', () => {
      const container = document.createElement('div');

      ReactDOM.render(
        <my-component>
          <my-second-component slot="first" />
          <button slot="second">Hello</button>
        </my-component>,
        container,
      );

      const lightDOM = container.firstChild.childNodes;

      expect(lightDOM[0].getAttribute('slot')).toBe('first');
      expect(lightDOM[1].getAttribute('slot')).toBe('second');
    });

    xit('should skip reserved props on web components', () => {
      const container = document.createElement('div');

      ReactDOM.render(
        <my-component
          children={['foo']}
          suppressContentEditableWarning={true}
          suppressHydrationWarning={true}
        />,
        container,
      );
      expect(container.firstChild.hasAttribute('children')).toBe(false);
      expect(
        container.firstChild.hasAttribute('suppressContentEditableWarning'),
      ).toBe(false);
      expect(
        container.firstChild.hasAttribute('suppressHydrationWarning'),
      ).toBe(false);

      ReactDOM.render(
        <my-component
          children={['bar']}
          suppressContentEditableWarning={false}
          suppressHydrationWarning={false}
        />,
        container,
      );
      expect(container.firstChild.hasAttribute('children')).toBe(false);
      expect(
        container.firstChild.hasAttribute('suppressContentEditableWarning'),
      ).toBe(false);
      expect(
        container.firstChild.hasAttribute('suppressHydrationWarning'),
      ).toBe(false);
    });

    it('should skip dangerouslySetInnerHTML on web components', () => {
      const container = document.createElement('div');

      ReactDOM.render(
        <my-component dangerouslySetInnerHTML={{__html: 'hi'}} />,
        container,
      );
      expect(container.firstChild.hasAttribute('dangerouslySetInnerHTML')).toBe(
        false,
      );

      ReactDOM.render(
        <my-component dangerouslySetInnerHTML={{__html: 'bye'}} />,
        container,
      );
      expect(container.firstChild.hasAttribute('dangerouslySetInnerHTML')).toBe(
        false,
      );
    });

    it('should render null and undefined as empty but print other falsy values', () => {
      const container = document.createElement('div');

      ReactDOM.render(
        <div dangerouslySetInnerHTML={{__html: 'textContent'}} />,
        container,
      );
      expect(container.textContent).toEqual('textContent');

      ReactDOM.render(<div dangerouslySetInnerHTML={{__html: 0}} />, container);
      expect(container.textContent).toEqual('0');

      ReactDOM.render(
        <div dangerouslySetInnerHTML={{__html: false}} />,
        container,
      );
      expect(container.textContent).toEqual('false');

      ReactDOM.render(
        <div dangerouslySetInnerHTML={{__html: ''}} />,
        container,
      );
      expect(container.textContent).toEqual('');

      ReactDOM.render(
        <div dangerouslySetInnerHTML={{__html: null}} />,
        container,
      );
      expect(container.textContent).toEqual('');

      ReactDOM.render(
        <div dangerouslySetInnerHTML={{__html: undefined}} />,
        container,
      );
      expect(container.textContent).toEqual('');
    });

    it('should remove attributes', () => {
      const container = document.createElement('div');
      ReactDOM.render(<img height="17" />, container);

      expect(container.firstChild.hasAttribute('height')).toBe(true);
      ReactDOM.render(<img />, container);
      expect(container.firstChild.hasAttribute('height')).toBe(false);
    });

    it('should remove properties', () => {
      const container = document.createElement('div');
      ReactDOM.render(<div className="monkey" />, container);

      expect(container.firstChild.className).toEqual('monkey');
      ReactDOM.render(<div />, container);
      expect(container.firstChild.className).toEqual('');
    });

    it('should not set null/undefined attributes', () => {
      const container = document.createElement('div');
      // Initial render.
      ReactDOM.render(<img src={null} data-foo={undefined} />, container);
      const node = container.firstChild;
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Update in one direction.
      ReactDOM.render(<img src={undefined} data-foo={null} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Update in another direction.
      ReactDOM.render(<img src={null} data-foo={undefined} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Removal.
      ReactDOM.render(<img />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Addition.
      ReactDOM.render(<img src={undefined} data-foo={null} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
    });

    it('should apply React-specific aliases to HTML elements', () => {
      const container = document.createElement('div');
      ReactDOM.render(<form acceptCharset="foo" />, container);
      const node = container.firstChild;
      // Test attribute initialization.
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute update.
      ReactDOM.render(<form acceptCharset="boo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('boo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal by setting to null.
      ReactDOM.render(<form acceptCharset={null} />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Restore.
      ReactDOM.render(<form acceptCharset="foo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal by setting to undefined.
      ReactDOM.render(<form acceptCharset={undefined} />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Restore.
      ReactDOM.render(<form acceptCharset="foo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal.
      ReactDOM.render(<form />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
    });

    it('should apply React-specific aliases to SVG elements', () => {
      const container = document.createElement('div');
      ReactDOM.render(<svg arabicForm="foo" />, container);
      const node = container.firstChild;
      // Test attribute initialization.
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute update.
      ReactDOM.render(<svg arabicForm="boo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('boo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal by setting to null.
      ReactDOM.render(<svg arabicForm={null} />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Restore.
      ReactDOM.render(<svg arabicForm="foo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal by setting to undefined.
      ReactDOM.render(<svg arabicForm={undefined} />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Restore.
      ReactDOM.render(<svg arabicForm="foo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal.
      ReactDOM.render(<svg />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
    });

    it('should properly update custom attributes on custom elements', () => {
      const container = document.createElement('div');
      ReactDOM.render(<some-custom-element foo="bar" />, container);
      ReactDOM.render(<some-custom-element bar="buzz" />, container);
      const node = container.firstChild;
      expect(node.hasAttribute('foo')).toBe(false);
      expect(node.getAttribute('bar')).toBe('buzz');
    });

    it('should not apply React-specific aliases to custom elements', () => {
      const container = document.createElement('div');
      ReactDOM.render(<some-custom-element arabicForm="foo" />, container);
      const node = container.firstChild;
      // Should not get transformed to arabic-form as SVG would be.
      expect(node.getAttribute('arabicForm')).toBe('foo');
      expect(node.hasAttribute('arabic-form')).toBe(false);
      // Test attribute update.
      ReactDOM.render(<some-custom-element arabicForm="boo" />, container);
      expect(node.getAttribute('arabicForm')).toBe('boo');
      // Test attribute removal and addition.
      ReactDOM.render(<some-custom-element acceptCharset="buzz" />, container);
      // Verify the previous attribute was removed.
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Should not get transformed to accept-charset as HTML would be.
      expect(node.getAttribute('acceptCharset')).toBe('buzz');
      expect(node.hasAttribute('accept-charset')).toBe(false);
    });

    it('should clear a single style prop when changing `style`', () => {
      let styles = {display: 'none', color: 'red'};
      const container = document.createElement('div');
      ReactDOM.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {color: 'green'};
      ReactDOM.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('');
      expect(stubStyle.color).toEqual('green');
    });

    it('should update arbitrary attributes for tags containing dashes', () => {
      const container = document.createElement('div');

      const beforeUpdate = React.createElement('x-foo-component', {}, null);
      ReactDOM.render(beforeUpdate, container);

      const afterUpdate = <x-foo-component myattr="myval" />;
      ReactDOM.render(afterUpdate, container);

      expect(container.childNodes[0].getAttribute('myattr')).toBe('myval');
    });

    it('should clear all the styles when removing `style`', () => {
      const styles = {display: 'none', color: 'red'};
      const container = document.createElement('div');
      ReactDOM.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      ReactDOM.render(<div />, container);
      expect(stubStyle.display).toEqual('');
      expect(stubStyle.color).toEqual('');
    });

    it('should update styles when `style` changes from null to object', () => {
      const container = document.createElement('div');
      const styles = {color: 'red'};
      ReactDOM.render(<div style={styles} />, container);
      ReactDOM.render(<div />, container);
      ReactDOM.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;
      expect(stubStyle.color).toEqual('red');
    });

    it('should not reset innerHTML for when children is null', () => {
      const container = document.createElement('div');
      ReactDOM.render(<div />, container);
      container.firstChild.innerHTML = 'bonjour';
      expect(container.firstChild.innerHTML).toEqual('bonjour');

      ReactDOM.render(<div />, container);
      expect(container.firstChild.innerHTML).toEqual('bonjour');
    });

    it('should reset innerHTML when switching from a direct text child to an empty child', () => {
      const transitionToValues = [null, undefined, false];
      transitionToValues.forEach(transitionToValue => {
        const container = document.createElement('div');
        ReactDOM.render(<div>bonjour</div>, container);
        expect(container.firstChild.innerHTML).toEqual('bonjour');

        ReactDOM.render(<div>{transitionToValue}</div>, container);
        expect(container.firstChild.innerHTML).toEqual('');
      });
    });

    it('should empty element when removing innerHTML', () => {
      const container = document.createElement('div');
      ReactDOM.render(
        <div dangerouslySetInnerHTML={{__html: ':)'}} />,
        container,
      );

      expect(container.firstChild.innerHTML).toEqual(':)');
      ReactDOM.render(<div />, container);
      expect(container.firstChild.innerHTML).toEqual('');
    });

    it('should transition from string content to innerHTML', () => {
      const container = document.createElement('div');
      ReactDOM.render(<div>hello</div>, container);

      expect(container.firstChild.innerHTML).toEqual('hello');
      ReactDOM.render(
        <div dangerouslySetInnerHTML={{__html: 'goodbye'}} />,
        container,
      );
      expect(container.firstChild.innerHTML).toEqual('goodbye');
    });

    it('should transition from innerHTML to string content', () => {
      const container = document.createElement('div');
      ReactDOM.render(
        <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />,
        container,
      );

      expect(container.firstChild.innerHTML).toEqual('bonjour');
      ReactDOM.render(<div>adieu</div>, container);
      expect(container.firstChild.innerHTML).toEqual('adieu');
    });

    it('should transition from innerHTML to children in nested el', () => {
      const container = document.createElement('div');
      ReactDOM.render(
        <div>
          <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />
        </div>,
        container,
      );

      expect(container.textContent).toEqual('bonjour');
      ReactDOM.render(
        <div>
          <div>
            <span>adieu</span>
          </div>
        </div>,
        container,
      );
      expect(container.textContent).toEqual('adieu');
    });

    it('should transition from children to innerHTML in nested el', () => {
      const container = document.createElement('div');
      ReactDOM.render(
        <div>
          <div>
            <span>adieu</span>
          </div>
        </div>,
        container,
      );

      expect(container.textContent).toEqual('adieu');
      ReactDOM.render(
        <div>
          <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />
        </div>,
        container,
      );
      expect(container.textContent).toEqual('bonjour');
    });

    it('should not incur unnecessary DOM mutations for attributes', () => {
      const container = document.createElement('div');
      ReactDOM.render(<div id="" />, container);

      const node = container.firstChild;
      const nodeSetAttribute = node.setAttribute;
      node.setAttribute = jest.fn();
      node.setAttribute.mockImplementation(nodeSetAttribute);

      const nodeRemoveAttribute = node.removeAttribute;
      node.removeAttribute = jest.fn();
      node.removeAttribute.mockImplementation(nodeRemoveAttribute);

      ReactDOM.render(<div id="" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(0);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      ReactDOM.render(<div id="foo" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      ReactDOM.render(<div id="foo" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      ReactDOM.render(<div />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(1);

      ReactDOM.render(<div id="" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(2);
      expect(node.removeAttribute).toHaveBeenCalledTimes(1);

      ReactDOM.render(<div />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(2);
      expect(node.removeAttribute).toHaveBeenCalledTimes(2);
    });

    it('should not incur unnecessary DOM mutations for string properties', () => {
      const container = document.createElement('div');
      ReactDOM.render(<div value="" />, container);

      const node = container.firstChild;

      const nodeValueSetter = jest.fn();

      const oldSetAttribute = node.setAttribute.bind(node);
      node.setAttribute = function(key, value) {
        oldSetAttribute(key, value);
        nodeValueSetter(key, value);
      };

      ReactDOM.render(<div value="foo" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      ReactDOM.render(<div value="foo" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      ReactDOM.render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      ReactDOM.render(<div value={null} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      ReactDOM.render(<div value="" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);

      ReactDOM.render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);
    });

    it('should not incur unnecessary DOM mutations for boolean properties', () => {
      const container = document.createElement('div');
      ReactDOM.render(<div checked={true} />, container);

      const node = container.firstChild;
      let nodeValue = true;
      const nodeValueSetter = jest.fn();
      Object.defineProperty(node, 'checked', {
        get: function() {
          return nodeValue;
        },
        set: nodeValueSetter.mockImplementation(function(newValue) {
          nodeValue = newValue;
        }),
      });

      ReactDOM.render(<div checked={true} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(0);

      ReactDOM.render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      ReactDOM.render(<div checked={false} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);

      ReactDOM.render(<div checked={true} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(3);
    });

    it('should ignore attribute list for elements with the "is" attribute', () => {
      const container = document.createElement('div');
      ReactDOM.render(<button is="test" cowabunga="chevynova" />, container);
      expect(container.firstChild.hasAttribute('cowabunga')).toBe(true);
    });

    it('should not update when switching between null/undefined', () => {
      const container = document.createElement('div');
      const node = ReactDOM.render(<div />, container);

      const setter = jest.fn();
      node.setAttribute = setter;

      ReactDOM.render(<div dir={null} />, container);
      ReactDOM.render(<div dir={undefined} />, container);
      ReactDOM.render(<div />, container);
      expect(setter).toHaveBeenCalledTimes(0);
      ReactDOM.render(<div dir="ltr" />, container);
      expect(setter).toHaveBeenCalledTimes(1);
    });

    it('handles multiple child updates without interference', () => {
      // This test might look like it's just testing ReactMultiChild but the
      // last bug in this was actually in DOMChildrenOperations so this test
      // needs to be in some DOM-specific test file.
      const container = document.createElement('div');

      // ABCD
      ReactDOM.render(
        <div>
          <div key="one">
            <div key="A">A</div>
            <div key="B">B</div>
          </div>
          <div key="two">
            <div key="C">C</div>
            <div key="D">D</div>
          </div>
        </div>,
        container,
      );
      // BADC
      ReactDOM.render(
        <div>
          <div key="one">
            <div key="B">B</div>
            <div key="A">A</div>
          </div>
          <div key="two">
            <div key="D">D</div>
            <div key="C">C</div>
          </div>
        </div>,
        container,
      );

      expect(container.textContent).toBe('BADC');
    });
  });

  describe('mountComponent', () => {
    let mountComponent;

    beforeEach(() => {
      mountComponent = function(props) {
        const container = document.createElement('div');
        ReactDOM.render(<div {...props} />, container);
      };
    });

    it('should work error event on <source> element', () => {
      spyOnDevAndProd(console, 'log');
      const container = document.createElement('div');
      ReactDOM.render(
        <video>
          <source
            src="http://example.org/video"
            type="video/mp4"
            onError={e => console.log('onError called')}
          />
        </video>,
        container,
      );

      const errorEvent = document.createEvent('Event');
      errorEvent.initEvent('error', false, false);
      container.getElementsByTagName('source')[0].dispatchEvent(errorEvent);

    });

    xit('should warn on upper case HTML tags, not SVG nor custom tags', () => {
      ReactTestUtils.renderIntoDocument(
        React.createElement('svg', null, React.createElement('PATH')),
      );
      ReactTestUtils.renderIntoDocument(React.createElement('CUSTOM-TAG'));

      expect(() =>
        ReactTestUtils.renderIntoDocument(React.createElement('IMG')),
      ).toErrorDev(
        '<IMG /> is incorrect casing.',
      );
    });

    xit('should warn if the tag is unrecognized', () => {
      let realToString;
      try {
        realToString = Object.prototype.toString;
        const wrappedToString = function() {
          // Emulate browser behavior which is missing in jsdom
          if (this instanceof window.HTMLUnknownElement) {
            return '[object HTMLUnknownElement]';
          }
          return realToString.apply(this, arguments);
        };
        Object.prototype.toString = wrappedToString; // eslint-disable-line no-extend-native

        expect(() => ReactTestUtils.renderIntoDocument(<bar />)).toErrorDev(
          'The tag <bar> is unknown in this browser',
        );
        // Test deduplication
        expect(() => ReactTestUtils.renderIntoDocument(<foo />)).toErrorDev(
          'The tag <foo> is unknown in this browser',
        );
        ReactTestUtils.renderIntoDocument(<foo />);
        ReactTestUtils.renderIntoDocument(<time />);
        // Corner case. Make sure out deduplication logic doesn't break with weird tag.
        expect(() =>
          ReactTestUtils.renderIntoDocument(<hasOwnProperty />),
        ).toErrorDev([
          '<hasOwnProperty /> is incorrect casing.',
          'The tag <hasOwnProperty> is unknown in this browser',
        ]);
      } finally {
        Object.prototype.toString = realToString; // eslint-disable-line no-extend-native
      }
    });

    xit('should validate use of dangerouslySetInnerHTML', () => {
      expect(function() {
        mountComponent({dangerouslySetInnerHTML: '<span>Hi Jim!</span>'});
      }).toThrowError(
        '`dangerouslySetInnerHTML` format error. ',
      );
    });

    xit('should validate use of dangerouslySetInnerHTML', () => {
      expect(function() {
        mountComponent({dangerouslySetInnerHTML: {foo: 'bar'}});
      }).toThrowError(
        '`dangerouslySetInnerHTML` format error. ',
      );
    });

    it('should allow {__html: null}', () => {
      expect(function() {
        mountComponent({dangerouslySetInnerHTML: {__html: null}});
      }).not.toThrow();
    });

    xit('should warn about contentEditable and children', () => {
      expect(() =>
        mountComponent({contentEditable: true, children: ''}),
      ).toErrorDev(
        'Warning: component with `contentEditable` and contains `children` ' +
          'should not modified or duplicated.',
      );
    });

    xit('should respect suppressContentEditableWarning', () => {
      mountComponent({
        contentEditable: true,
        children: '',
        suppressContentEditableWarning: true,
      });
    });

    it('should validate against invalid styles', () => {
      expect(function() {
        mountComponent({style: 'display: none'});
      }).toThrowError(
        'style should be a object.',
      );
    });

    xit('should support custom elements which extend native elements', () => {
      const container = document.createElement('div');
      spyOnDevAndProd(document, 'createElement').and.callThrough();
      ReactDOM.render(<div is="custom-div" />, container);
      expect(document.createElement).toHaveBeenCalledWith('div', {
        is: 'custom-div',
      });
    });

    it('should work load and error events on <image> element in SVG', () => {
      spyOnDevAndProd(console, 'log');
      const container = document.createElement('div');
      ReactDOM.render(
        <svg>
          <image
            xlinkHref="http://example.org/image"
            onError={e => console.log('onError called')}
            onLoad={e => console.log('onLoad called')}
          />
        </svg>,
        container,
      );

      const loadEvent = document.createEvent('Event');
      const errorEvent = document.createEvent('Event');

      loadEvent.initEvent('load', false, false);
      errorEvent.initEvent('error', false, false);

      container.getElementsByTagName('image')[0].dispatchEvent(errorEvent);
      container.getElementsByTagName('image')[0].dispatchEvent(loadEvent);
    });

    it('should receive a load event on <link> elements', () => {
      const container = document.createElement('div');
      const onLoad = jest.fn();

      ReactDOM.render(
        <link href="http://example.org/link" onLoad={onLoad} />,
        container,
      );

      const loadEvent = document.createEvent('Event');
      const link = container.getElementsByTagName('link')[0];

      loadEvent.initEvent('load', false, false);
      link.dispatchEvent(loadEvent);

      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('should receive an error event on <link> elements', () => {
      const container = document.createElement('div');
      const onError = jest.fn();

      ReactDOM.render(
        <link href="http://example.org/link" onError={onError} />,
        container,
      );

      const errorEvent = document.createEvent('Event');
      const link = container.getElementsByTagName('link')[0];

      errorEvent.initEvent('error', false, false);
      link.dispatchEvent(errorEvent);

      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateComponent', () => {
    let container;

    beforeEach(() => {
      container = document.createElement('div');
    });

    xit('should validate against multiple children props', () => {
      ReactDOM.render(<div />, container);

      expect(function() {
        ReactDOM.render(
          <div children="" dangerouslySetInnerHTML={{__html: ''}} />,
          container,
        );
      }).toThrowError(
        'set either `children` or `dangerouslySetInnerHTML`.',
      );
    });

    xit('should warn about contentEditable and children', () => {
      expect(() => {
        ReactDOM.render(
          <div contentEditable={true}>
            <div />
          </div>,
          container,
        );
      }).toErrorDev('contentEditable');
    });

    it('should validate against invalid styles', () => {
      ReactDOM.render(<div />, container);

      expect(function() {
        ReactDOM.render(<div style={1} />, container);
      }).toThrowError(
        'style should be a object.',
      );
    });

    it('should report component containing invalid styles', () => {
      class Animal extends React.Component {
        render() {
          return <div style={1} />;
        }
      }

      expect(() => {
        ReactDOM.render(<Animal />, container);
      }).toThrowError(
        'style should be a object.',
      );
    });
  });

  describe('unmountComponent', () => {
    it('unmounts children before unsetting DOM node info', () => {
      class Inner extends React.Component {
        render() {
          return <span />;
        }

        componentWillUnmount() {
          // Should not throw
          expect(ReactDOM.findDOMNode(this).nodeName).toBe('SPAN');
        }
      }

      const container = document.createElement('div');
      ReactDOM.render(
        <div>
          <Inner />
        </div>,
        container,
      );
      ReactDOM.unmountComponentAtNode(container);
    });
  });

  describe('tag sanitization', () => {

    it('should throw when an invalid tag name is used', () => {
      const hackzor = React.createElement('script tag');
      expect(() => ReactTestUtils.renderIntoDocument(hackzor)).toThrow();
    });

    it('should throw when an attack vector is used', () => {
      const hackzor = React.createElement('div><img /><div');
      expect(() => ReactTestUtils.renderIntoDocument(hackzor)).toThrow();
    });
  });

  describe('nesting validation', () => {
    it('should warn about incorrect casing on properties', () => {
      expect(() => {
        ReactTestUtils.renderIntoDocument(
          React.createElement('input', {type: 'text', tabindex: '1'}),
        );
      }).not.toThrow();
    });

    it('should warn about class', () => {
      expect(() => {
        ReactTestUtils.renderIntoDocument(
          React.createElement('div', {class: 'muffins'}),
        );
      }).not.toThrow();
    });

    it('gives source code refs for unknown prop warning', () => {
      expect(() =>
        ReactTestUtils.renderIntoDocument(<div class="paladin" />),
      ).not.toThrow();
    });

    it('gives source code refs for unknown prop warning for update render', () => {
      const container = document.createElement('div');

      ReactTestUtils.renderIntoDocument(<div className="paladin" />, container);
      expect(() =>
        ReactTestUtils.renderIntoDocument(<div class="paladin" />, container),
      ).not.toThrow();
    });

    it('gives source code refs for unknown prop warning for exact elements', () => {
      expect(() =>
        ReactTestUtils.renderIntoDocument(
          <div className="foo1">
            <span class="foo2" />
            <div onClick={() => {}} />
            <strong onclick={() => {}} />
            <div className="foo5" />
            <div className="foo6" />
          </div>,
        ),
      ).toErrorDev([
        'Warning: Invalid event property `onclick`, events use the camelCase name.',
      ]);
    });
  });

  describe('whitespace', () => {
    it('renders innerHTML and preserves whitespace', () => {
      const container = document.createElement('div');
      const html = '\n  \t  <span>  \n  testContent  \t  </span>  \n  \t';
      const elem = <div dangerouslySetInnerHTML={{__html: html}} />;

      ReactDOM.render(elem, container);
      expect(container.firstChild.innerHTML).toBe(html);
    });

    it('render and then updates innerHTML and preserves whitespace', () => {
      const container = document.createElement('div');
      const html = '\n  \t  <span>  \n  testContent1  \t  </span>  \n  \t';
      const elem = <div dangerouslySetInnerHTML={{__html: html}} />;
      ReactDOM.render(elem, container);

      const html2 = '\n  \t  <div>  \n  testContent2  \t  </div>  \n  \t';
      const elem2 = <div dangerouslySetInnerHTML={{__html: html2}} />;
      ReactDOM.render(elem2, container);

      expect(container.firstChild.innerHTML).toBe(html2);
    });
  });

  describe('Attributes with aliases', function() {
    it('sets aliased attributes on HTML attributes', function() {
      let el;
      expect(() => {
        el = ReactTestUtils.renderIntoDocument(<div class="test" />);
      }).not.toThrow();

      expect(el.className).toBe('test');
    });

    it('sets incorrectly cased aliased attributes on HTML attributes with a warning', function() {
      let el;
      expect(() => {
        el = ReactTestUtils.renderIntoDocument(<div cLASS="test" />);
      }).not.toThrow();

      expect(el.className).toBe('test');
    });

    it('sets aliased attributes on SVG elements with a warning', function() {
      let el;
      expect(() => {
        el = ReactTestUtils.renderIntoDocument(
          <svg>
            <text arabic-form="initial" />
          </svg>,
        );
      }).not.toThrow();
      const text = el.querySelector('text');

      expect(text.hasAttribute('arabic-form')).toBe(true);
    });

    it('sets aliased attributes on custom elements', function() {
      const el = ReactTestUtils.renderIntoDocument(
        <div is="custom-element" class="test" />,
      );

      expect(el.getAttribute('class')).toBe('test');
    });

    it('aliased attributes on custom elements with bad casing', function() {
      const el = ReactTestUtils.renderIntoDocument(
        <div is="custom-element" claSS="test" />,
      );

      expect(el.getAttribute('class')).toBe('test');
    });

    it('updates aliased attributes on custom elements', function() {
      const container = document.createElement('div');
      ReactDOM.render(<div is="custom-element" class="foo" />, container);
      ReactDOM.render(<div is="custom-element" class="bar" />, container);

      expect(container.firstChild.getAttribute('class')).toBe('bar');
    });
  });

  describe('Custom attributes', function() {
    it('allows assignment of custom attributes with string values', function() {
      const el = ReactTestUtils.renderIntoDocument(<div whatever="30" />);

      expect(el.getAttribute('whatever')).toBe('30');
    });

    it('removes custom attributes', function() {
      const container = document.createElement('div');
      ReactDOM.render(<div whatever="30" />, container);

      expect(container.firstChild.getAttribute('whatever')).toBe('30');

      ReactDOM.render(<div whatever={null} />, container);

      expect(container.firstChild.hasAttribute('whatever')).toBe(false);
    });

    it('assigns a numeric custom attributes as a string', function() {
      const el = ReactTestUtils.renderIntoDocument(<div whatever={3} />);

      expect(el.getAttribute('whatever')).toBe('3');
    });

    xit('will not assign a function custom attributes', function() {
      let el;
      expect(() => {
        el = ReactTestUtils.renderIntoDocument(<div whatever={() => {}} />);
      }).toErrorDev('Warning: Invalid value for prop `whatever` on <div> tag');

      expect(el.hasAttribute('whatever')).toBe(false);
    });

    it('will assign an object custom attributes', function() {
      const el = ReactTestUtils.renderIntoDocument(<div whatever={{}} />);
      expect(el.getAttribute('whatever')).toBe('[object Object]');
    });

    it('allows cased data attributes', function() {
      let el;
      expect(() => {
        el = ReactTestUtils.renderIntoDocument(<div data-fooBar="true" />);
      }).not.toThrow();
      expect(el.getAttribute('data-foobar')).toBe('true');
    });

    it('allows cased custom attributes', function() {
      let el;
      expect(() => {
        el = ReactTestUtils.renderIntoDocument(<div fooBar="true" />);
      }).not.toThrow();
      expect(el.getAttribute('foobar')).toBe('true');
    });

    xit('removes a property when it becomes invalid', function() {
      const container = document.createElement('div');
      ReactDOM.render(<div whatever={0} />, container);
      expect(() =>
        ReactDOM.render(<div whatever={() => {}} />, container),
      ).toErrorDev('Warning: Invalid value for prop `whatever` on <div> tag.');
      const el = container.firstChild;
      expect(el.hasAttribute('whatever')).toBe(false);
    });

    it('warns on bad casing of known HTML attributes', function() {
      let el;
      expect(() => {
        el = ReactTestUtils.renderIntoDocument(<div SiZe="30" />);
      }).not.toThrow();

      expect(el.getAttribute('size')).toBe('30');
    });
  });

  describe('Object stringification', function() {
    it('allows objects on known properties', function() {
      const el = ReactTestUtils.renderIntoDocument(<div acceptCharset={{}} />);
      expect(el.getAttribute('accept-charset')).toBe('[object Object]');
    });

    it('should pass objects as attributes if they define toString', () => {
      const obj = {
        toString() {
          return 'hello';
        },
      };
      const container = document.createElement('div');

      ReactDOM.render(<img src={obj} />, container);
      expect(container.firstChild.src).toBe('http://localhost/hello');

      ReactDOM.render(<svg arabicForm={obj} />, container);
      expect(container.firstChild.getAttribute('arabic-form')).toBe('hello');

      ReactDOM.render(<div unknown={obj} />, container);
      expect(container.firstChild.getAttribute('unknown')).toBe('hello');
    });

    it('passes objects on known SVG attributes if they do not define toString', () => {
      const obj = {};
      const container = document.createElement('div');

      ReactDOM.render(<svg arabicForm={obj} />, container);
      expect(container.firstChild.getAttribute('arabic-form')).toBe(
        '[object Object]',
      );
    });

    it('passes objects on custom attributes if they do not define toString', () => {
      const obj = {};
      const container = document.createElement('div');

      ReactDOM.render(<div unknown={obj} />, container);
      expect(container.firstChild.getAttribute('unknown')).toBe(
        '[object Object]',
      );
    });

    it('allows objects that inherit a custom toString method', function() {
      const parent = {toString: () => 'hello.jpg'};
      const child = Object.create(parent);
      const el = ReactTestUtils.renderIntoDocument(<img src={child} />);

      expect(el.src).toBe('http://localhost/hello.jpg');
    });

    it('assigns ajaxify (an important internal FB attribute)', function() {
      const options = {toString: () => 'ajaxy'};
      const el = ReactTestUtils.renderIntoDocument(<div ajaxify={options} />);

      expect(el.getAttribute('ajaxify')).toBe('ajaxy');
    });
  });

  describe('String boolean attributes', function() {

    it('stringifies the boolean true for allowed attributes', function() {
      const el = ReactTestUtils.renderIntoDocument(<div spellCheck={true} />);

      expect(el.getAttribute('spellCheck')).toBe('true');
    });

    it('stringifies the boolean false for allowed attributes', function() {
      const el = ReactTestUtils.renderIntoDocument(<div spellCheck={false} />);

      expect(el.getAttribute('spellCheck')).toBe('false');
    });

    it('stringifies implicit booleans for allowed attributes', function() {
      // eslint-disable-next-line react/jsx-boolean-value
      const el = ReactTestUtils.renderIntoDocument(<div spellCheck />);

      expect(el.getAttribute('spellCheck')).toBe('true');
    });
  });

  // These tests mostly verify the existing behavior.
  // It may not always makes sense but we can't change it in minors.
  describe('Custom elements', () => {
    it('does not strip unknown boolean attributes', () => {
      const container = document.createElement('div');
      ReactDOM.render(<some-custom-element foo={true} />, container);
      const node = container.firstChild;
      expect(node.getAttribute('foo')).toBe('true');
      ReactDOM.render(<some-custom-element foo={false} />, container);
      expect(node.getAttribute('foo')).toBe('false');
      ReactDOM.render(<some-custom-element />, container);
      expect(node.hasAttribute('foo')).toBe(false);
      ReactDOM.render(<some-custom-element foo={true} />, container);
      expect(node.hasAttribute('foo')).toBe(true);
    });
  });

  it('receives events in specific order', () => {
    const eventOrder = [];
    const track = tag => () => eventOrder.push(tag);
    const outerRef = React.createRef();
    const innerRef = React.createRef();

    function OuterReactApp() {
      return (
        <div
          ref={outerRef}
          onClick={track('outer bubble')}
          onClickCapture={track('outer capture')}
        />
      );
    }

    function InnerReactApp() {
      return (
        <div
          ref={innerRef}
          onClick={track('inner bubble')}
          onClickCapture={track('inner capture')}
        />
      );
    }

    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      ReactDOM.render(<OuterReactApp />, container);
      ReactDOM.render(<InnerReactApp />, outerRef.current);

      document.addEventListener('click', track('document bubble'));
      document.addEventListener('click', track('document capture'), true);

      innerRef.current.click();

      expect(eventOrder).toEqual([
        'document capture',
        'outer capture',
        'inner capture',
        'inner bubble',
        'outer bubble',
        'document bubble',
      ]);
    } finally {
      document.body.removeChild(container);
    }
  });
});
