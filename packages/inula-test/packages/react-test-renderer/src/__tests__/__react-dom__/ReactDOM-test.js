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

describe('ReactDOM', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('horizon-external');
    ReactDOM = require('horizon');
    ReactTestUtils = require('react-test-renderer/test-utils');
  });

  it('should bubble onSubmit', function() {
    const container = document.createElement('div');

    let count = 0;
    let buttonRef;

    function Parent() {
      return (
        <div
          onSubmit={event => {
            event.preventDefault();
            count++;
          }}>
          <Child />
        </div>
      );
    }

    function Child() {
      return (
        <form>
          <input type="submit" ref={button => (buttonRef = button)} />
        </form>
      );
    }

    document.body.appendChild(container);
    try {
      ReactDOM.render(<Parent />, container);
      buttonRef.click();
      expect(count).toBe(1);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('allows a DOM element to be used with a string', () => {
    const element = React.createElement('div', {className: 'foo'});
    const node = ReactTestUtils.renderIntoDocument(element);
    expect(node.tagName).toBe('DIV');
  });

  it('should allow children to be passed as an argument', () => {
    const argNode = ReactTestUtils.renderIntoDocument(
      React.createElement('div', null, 'child'),
    );
    expect(argNode.innerHTML).toBe('child');
  });

  it('should overwrite props.children with children argument', () => {
    const conflictNode = ReactTestUtils.renderIntoDocument(
      React.createElement('div', {children: 'fakechild'}, 'child'),
    );
    expect(conflictNode.innerHTML).toBe('child');
  });

  /**
   * We need to make sure that updates occur to the actual node that's in the
   * DOM, instead of a stale cache.
   */
  it('should purge the DOM cache when removing nodes', () => {
    let myDiv = ReactTestUtils.renderIntoDocument(
      <div>
        <div key="theDog" className="dog" />,
        <div key="theBird" className="bird" />
      </div>,
    );
    // Warm the cache with theDog
    myDiv = ReactTestUtils.renderIntoDocument(
      <div>
        <div key="theDog" className="dogbeforedelete" />,
        <div key="theBird" className="bird" />,
      </div>,
    );
    // Remove theDog - this should purge the cache
    myDiv = ReactTestUtils.renderIntoDocument(
      <div>
        <div key="theBird" className="bird" />,
      </div>,
    );
    // Now, put theDog back. It's now a different DOM node.
    myDiv = ReactTestUtils.renderIntoDocument(
      <div>
        <div key="theDog" className="dog" />,
        <div key="theBird" className="bird" />,
      </div>,
    );
    // Change the className of theDog. It will use the same element
    myDiv = ReactTestUtils.renderIntoDocument(
      <div>
        <div key="theDog" className="bigdog" />,
        <div key="theBird" className="bird" />,
      </div>,
    );
    const dog = myDiv.childNodes[0];
    expect(dog.className).toBe('bigdog');
  });

  it('preserves focus', () => {
    let input;
    let input2;
    class A extends React.Component {
      render() {
        return (
          <div>
            <input id="one" ref={r => (input = input || r)} />
            {this.props.showTwo && (
              <input id="two" ref={r => (input2 = input2 || r)} />
            )}
          </div>
        );
      }

      componentDidUpdate() {
        // Focus should have been restored to the original input
        expect(document.activeElement.id).toBe('one');
        input2.focus();
        expect(document.activeElement.id).toBe('two');
        log.push('input2 focused');
      }
    }

    const log = [];
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      ReactDOM.render(<A showTwo={false} />, container);
      input.focus();

      // When the second input is added, let's simulate losing focus, which is
      // something that could happen when manipulating DOM nodes (but is hard to
      // deterministically force without relying intensely on React DOM
      // implementation details)
      const div = container.firstChild;
      ['appendChild', 'insertBefore'].forEach(name => {
        const mutator = div[name];
        div[name] = function() {
          if (input) {
            input.blur();
            expect(document.activeElement.tagName).toBe('BODY');
            log.push('input2 inserted');
          }
          return mutator.apply(this, arguments);
        };
      });

      expect(document.activeElement.id).toBe('one');
      ReactDOM.render(<A showTwo={true} />, container);
      // input2 gets added, which causes input to get blurred. Then
      // componentDidUpdate focuses input2 and that should make it down to here,
      // not get overwritten by focus restoration.
      expect(document.activeElement.id).toBe('two');
      expect(log).toEqual(['input2 inserted', 'input2 focused']);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('calls focus() on autoFocus elements after they have been mounted to the DOM', () => {
    const originalFocus = HTMLElement.prototype.focus;

    try {
      let focusedElement;
      let inputFocusedAfterMount = false;

      // This test needs to determine that focus is called after mount.
      // Can't check document.activeElement because PhantomJS is too permissive;
      // It doesn't require element to be in the DOM to be focused.
      HTMLElement.prototype.focus = function() {
        focusedElement = this;
        inputFocusedAfterMount = !!this.parentNode;
      };

      const container = document.createElement('div');
      document.body.appendChild(container);
      ReactDOM.render(
        <div>
          <h1>Auto-focus Test</h1>
          <input autoFocus={true} />
          <p>The above input should be focused after mount.</p>
        </div>,
        container,
      );

      expect(inputFocusedAfterMount).toBe(true);
      expect(focusedElement.tagName).toBe('INPUT');
    } finally {
      HTMLElement.prototype.focus = originalFocus;
    }
  });

  it("shouldn't fire duplicate event handler while handling other nested dispatch", () => {
    const actual = [];

    class Wrapper extends React.Component {
      componentDidMount() {
        this.ref1.click();
      }

      render() {
        return (
          <div>
            <div
              onClick={() => {
                actual.push('1st node clicked');
                this.ref2.click();
              }}
              ref={ref => (this.ref1 = ref)}
            />
            <div
              onClick={ref => {
                actual.push("2nd node clicked imperatively from 1st's handler");
              }}
              ref={ref => (this.ref2 = ref)}
            />
          </div>
        );
      }
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      ReactDOM.render(<Wrapper />, container);

      const expected = [
        '1st node clicked',
        "2nd node clicked imperatively from 1st's handler",
      ];

      expect(actual).toEqual(expected);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should not crash with devtools installed', () => {
    try {
      global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        inject: function() {},
        onCommitFiberRoot: function() {},
        onCommitFiberUnmount: function() {},
        supportsFiber: true,
      };
      jest.resetModules();
      React = require('horizon-external');
      ReactDOM = require('horizon');
      class Component extends React.Component {
        render() {
          return <div />;
        }
      }
      ReactDOM.render(<Component />, document.createElement('container'));
    } finally {
      delete global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    }
  });

  it('should not crash calling findDOMNode inside a function component', () => {
    const container = document.createElement('div');

    class Component extends React.Component {
      render() {
        return <div />;
      }
    }

    const instance = ReactTestUtils.renderIntoDocument(<Component />);
    const App = () => {
      ReactDOM.findDOMNode(instance);
      return <div />;
    };

    if (isDev) {
      ReactDOM.render(<App />, container);
    }
  });
});
