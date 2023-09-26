/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

function emptyFunction() {
}

describe('ReactDOMTextarea', () => {
  let React;
  let ReactDOM;
  let ReactTestUtils;

  let renderTextarea;


  beforeEach(() => {
    jest.resetModules();

    React = require('horizon-external');
    ReactDOM = require('horizon');
    ReactTestUtils = require('react-test-renderer/test-utils');

    renderTextarea = function(component, container) {
      if (!container) {
        container = document.createElement('div');
      }
      const node = ReactDOM.render(component, container);

      // Fixing jsdom's quirky behavior -- in reality, the parser should strip
      // off the leading newline but we need to do it by hand here.
      node.defaultValue = node.innerHTML.replace(/^\n/, '');
      return node;
    };
  });

  it('should allow setting `defaultValue`', () => {
    const container = document.createElement('div');
    const node = renderTextarea(<textarea defaultValue="giraffe" />, container);

    expect(node.value).toBe('giraffe');

    // Changing `defaultValue` should do nothing.
    renderTextarea(<textarea defaultValue='gorilla' />, container);
    expect(node.value).toEqual('giraffe');

    node.value = 'cat';

    renderTextarea(<textarea defaultValue='monkey' />, container);
    expect(node.value).toEqual('cat');
  });

  it('should display `defaultValue` of number 0', () => {
    const stub = <textarea defaultValue={0} />;
    const node = renderTextarea(stub);

    expect(node.value).toBe('0');
  });

  it('should display "false" for `defaultValue` of `false`', () => {
    const stub = <textarea defaultValue={false} />;
    const node = renderTextarea(stub);

    expect(node.value).toBe('false');
  });

  it('should display "foobar" for `defaultValue` of `objToString`', () => {
    const objToString = {
      toString: function() {
        return 'foobar';
      },
    };

    const stub = <textarea defaultValue={objToString} />;
    const node = renderTextarea(stub);

    expect(node.value).toBe('foobar');
  });

  xit('should set defaultValue', () => {
    const container = document.createElement('div');
    ReactDOM.render(<textarea defaultValue='foo' />, container);
    ReactDOM.render(<textarea defaultValue='bar' />, container);
    ReactDOM.render(<textarea defaultValue='noise' />, container);
    expect(container.firstChild.defaultValue).toBe('noise');
  });

  it('should not render value as an attribute', () => {
    const stub = <textarea value='giraffe' onChange={emptyFunction} />;
    const node = renderTextarea(stub);

    expect(node.getAttribute('value')).toBe(null);
  });

  it('should display `value` of number 0', () => {
    const stub = <textarea value={0} onChange={emptyFunction} />;
    const node = renderTextarea(stub);

    expect(node.value).toBe('0');
  });

  xit('should update defaultValue to empty string', () => {
    const container = document.createElement('div');
    ReactDOM.render(<textarea defaultValue={'foo'} />, container);
    ReactDOM.render(<textarea defaultValue={''} />, container);
    expect(container.firstChild.defaultValue).toBe('');
  });

  it('should allow setting `value` to `giraffe`', () => {
    const container = document.createElement('div');
    let stub = <textarea value='giraffe' onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    stub = ReactDOM.render(
      <textarea value='gorilla' onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('gorilla');
  });

  it('will not initially assign an empty value (covers case where firefox throws a validation error when required attribute is set)', () => {
    const container = document.createElement('div');

    let counter = 0;
    const originalCreateElement = document.createElement;
    spyOnDevAndProd(document, 'createElement').and.callFake(function(type) {
      const el = originalCreateElement.apply(this, arguments);
      let value = '';
      if (type === 'textarea') {
        Object.defineProperty(el, 'value', {
          get: function() {
            return value;
          },
          set: function(val) {
            value = '' + val;
            counter++;
          },
        });
      }
      return el;
    });

    ReactDOM.render(<textarea value='' readOnly={true} />, container);

    expect(counter).toEqual(0);
  });

  it('should allow setting `value` to `true`', () => {
    const container = document.createElement('div');
    let stub = <textarea value='giraffe' onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    stub = ReactDOM.render(
      <textarea value={true} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('true');
  });

  it('should allow setting `value` to `false`', () => {
    const container = document.createElement('div');
    let stub = <textarea value='giraffe' onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    stub = ReactDOM.render(
      <textarea value={false} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('false');
  });

  it('should allow setting `value` to `objToString`', () => {
    const container = document.createElement('div');
    let stub = <textarea value='giraffe' onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    const objToString = {
      toString: function() {
        return 'foo';
      },
    };
    stub = ReactDOM.render(
      <textarea value={objToString} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('foo');
  });

  it('should take updates to `defaultValue` for uncontrolled textarea', () => {
    const container = document.createElement('div');

    const node = ReactDOM.render(<textarea defaultValue='0' />, container);

    expect(node.value).toBe('0');

    ReactDOM.render(<textarea defaultValue='1' />, container);

    expect(node.value).toBe('0');
  });

  it('should take updates to children in lieu of `defaultValue` for uncontrolled textarea', () => {
    const container = document.createElement('div');

    const node = ReactDOM.render(<textarea defaultValue='0' />, container);

    expect(node.value).toBe('0');

    ReactDOM.render(<textarea>1</textarea>, container);

    expect(node.value).toBe('0');
  });

  it('should not incur unnecessary DOM mutations', () => {
    const container = document.createElement('div');
    ReactDOM.render(<textarea value='a' onChange={emptyFunction} />, container);

    const node = container.firstChild;
    let nodeValue = 'a';
    const nodeValueSetter = jest.fn();
    Object.defineProperty(node, 'value', {
      get: function() {
        return nodeValue;
      },
      set: nodeValueSetter.mockImplementation(function(newValue) {
        nodeValue = newValue;
      }),
    });

    ReactDOM.render(<textarea value='a' onChange={emptyFunction} />, container);
    expect(nodeValueSetter).toHaveBeenCalledTimes(0);

    ReactDOM.render(<textarea value='b' onChange={emptyFunction} />, container);
    expect(nodeValueSetter).toHaveBeenCalledTimes(1);
  });

  // @gate enableControlledValue
  it('should properly control a value of number `0`', () => {
    const stub = <textarea value={0} onChange={emptyFunction} />;
    const setUntrackedValue = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    ).set;

    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      const node = renderTextarea(stub, container);

      setUntrackedValue.call(node, 'giraffe');
      node.dispatchEvent(
        new Event('input', {bubbles: true, cancelable: false}),
      );
      expect(node.value).toBe('0');
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should treat children like `defaultValue`', () => {
    const container = document.createElement('div');
    let stub = <textarea>giraffe</textarea>;
    const node = renderTextarea(stub, container);;

    expect(node.value).toBe('giraffe');

    // Changing children should do nothing, it functions like `defaultValue`.
    stub = ReactDOM.render(<textarea>gorilla</textarea>, container);
    expect(node.value).toEqual('giraffe');
  });

  it('should keep value when switching to uncontrolled element if not changed', () => {
    const container = document.createElement('div');

    const node = renderTextarea(
      <textarea value='kitten' onChange={emptyFunction} />,
      container,
    );

    expect(node.value).toBe('kitten');

    ReactDOM.render(<textarea defaultValue='gorilla' />, container);

    expect(node.value).toEqual('kitten');
  });

  it('should keep value when switching to uncontrolled element if changed', () => {
    const container = document.createElement('div');

    const node = renderTextarea(
      <textarea value='kitten' onChange={emptyFunction} />,
      container,
    );

    expect(node.value).toBe('kitten');

    ReactDOM.render(
      <textarea value='puppies' onChange={emptyFunction} />,
      container,
    );

    expect(node.value).toBe('puppies');

    ReactDOM.render(<textarea defaultValue='gorilla' />, container);

    expect(node.value).toEqual('puppies');
  });


  it('should allow numbers as children', () => {
    const node = renderTextarea(<textarea>{17}</textarea>);
    expect(node.value).toBe('17');
  });


  it('should allow booleans as children', () => {
    const node = renderTextarea(<textarea>{false}</textarea>);
    expect(node.value).toBe('false');
  });


  it('should allow objects as children', () => {
    const obj = {
      toString: function() {
        return 'sharkswithlasers';
      },
    };
    const node = renderTextarea(<textarea>{obj}</textarea>);;
    expect(node.value).toBe('sharkswithlasers');
  });

  it('should throw with multiple or invalid children', () => {
    expect(() => {
      expect(() =>
        ReactTestUtils.renderIntoDocument(
          <textarea>
              {'hello'}
            {'there'}
            </textarea>,
        ),
      ).not.toThrow();
    }).not.toThrow();

    let node;
    expect(() => {
      expect(
        () =>
          (node = renderTextarea(
            <textarea>
                <strong />
              </textarea>,
          )),
      ).not.toThrow();
    }).not.toThrow();

    expect(node.value).toBe('[object Object]');
  });

  it('should unmount', () => {
    const container = document.createElement('div');
    renderTextarea(<textarea />, container);
    ReactDOM.unmountComponentAtNode(container);
  });

  xit('should warn if value is null', () => {
    expect(() =>
      ReactTestUtils.renderIntoDocument(<textarea value={null} />),
    ).toErrorDev(
      '`value` prop on `textarea` should not be null, please use an empty string.',
    );

    // No additional warnings are expected
    ReactTestUtils.renderIntoDocument(<textarea value={null} />);
  });

  it('should warn if value and defaultValue are specified', () => {
    const InvalidComponent = () => (
      <textarea value='foo' defaultValue='bar' readOnly={true} />
    );
    expect(() =>
      ReactTestUtils.renderIntoDocument(<InvalidComponent />),
    ).not.toThrow();

    // No additional warnings are expected
    ReactTestUtils.renderIntoDocument(<InvalidComponent />);
  });

  it('should not warn about missing onChange in uncontrolled textareas', () => {
    const container = document.createElement('div');
    ReactDOM.render(<textarea />, container);
    ReactDOM.unmountComponentAtNode(container);
    ReactDOM.render(<textarea value={undefined} />, container);
  });

  it('does not set textContent if value is unchanged', () => {
    const container = document.createElement('div');
    let node;
    let instance;
    // Setting defaultValue on a textarea is equivalent to setting textContent,
    // and is the method we currently use, so we can observe if defaultValue is
    // is set to determine if textContent is being recreated.
    // https://html.spec.whatwg.org/#the-textarea-element
    let defaultValue;
    const set = jest.fn(value => {
      defaultValue = value;
    });
    const get = jest.fn(value => {
      return defaultValue;
    });

    class App extends React.Component {
      state = {count: 0, text: 'foo'};

      componentDidMount() {
        instance = this;
      }

      render() {
        return (
          <div>
            <span>{this.state.count}</span>
            <textarea
              ref={n => (node = n)}
              value='foo'
              onChange={emptyFunction}
            />
          </div>
        );
      }
    }

    ReactDOM.render(<App />, container);
    defaultValue = node.defaultValue;
    Object.defineProperty(node, 'defaultValue', {get, set});
    instance.setState({count: 1});
    expect(set.mock.calls.length).toBe(0);
  });
});
