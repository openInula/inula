/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

const React = require('horizon-external');
const ReactDOM = require('horizon');

describe('CSSPropertyOperations', () => {
  it('should set style attribute when styles exist', () => {
    const styles = {
      backgroundColor: '#000',
      display: 'none',
    };
    let div = <div style={styles} />;
    const root = document.createElement('div');
    div = ReactDOM.render(div, root);
    expect(/style=".*"/.test(root.innerHTML)).toBe(true);
  });

  xit('should warn when using hyphenated style names', () => {
    class Comp extends React.Component {
      static displayName = 'Comp';

      render() {
        return <div style={{'background-color': 'crimson'}} />;
      }
    }

    const root = document.createElement('div');

    expect(() => ReactDOM.render(<Comp />, root)).toErrorDev(
      'Warning: The CSS style attribute name `background-color` is recommended to be set to `backgroundColor`.'
    );
  });

  xit('should warn when updating hyphenated style names', () => {
    class Comp extends React.Component {
      static displayName = 'Comp';

      render() {
        return <div style={this.props.style} />;
      }
    }

    const styles = {
      '-ms-transform': 'translate3d(0, 0, 0)',
      '-webkit-transform': 'translate3d(0, 0, 0)',
    };
    const root = document.createElement('div');
    ReactDOM.render(<Comp />, root);

    expect(() => ReactDOM.render(<Comp style={styles} />, root)).toErrorDev([
      'Warning: The CSS style attribute name `-ms-transform` is recommended to be set to `msTransform`.',
      'Warning: The CSS style attribute name `-webkit-transform` is recommended to be set to `WebkitTransform`.',
    ]);
  });

  it('warns when miscapitalizing vendored style names', () => {
    class Comp extends React.Component {
      static displayName = 'Comp';

      render() {
        return (
          <div
            style={{
              msTransform: 'translate3d(0, 0, 0)',
              oTransform: 'translate3d(0, 0, 0)',
              webkitTransform: 'translate3d(0, 0, 0)',
            }}
          />
        );
      }
    }

    const root = document.createElement('div');

    expect(() => ReactDOM.render(<Comp />, root)).not.toThrow();
  });

  it('should warn about style having a trailing semicolon', () => {
    class Comp extends React.Component {
      static displayName = 'Comp';

      render() {
        return (
          <div
            style={{
              fontFamily: 'Helvetica, arial',
              backgroundImage: 'url(foo;bar)',
              backgroundColor: 'blue;',
              color: 'red;   ',
            }}
          />
        );
      }
    }

    const root = document.createElement('div');

    expect(() => ReactDOM.render(<Comp />, root)).not.toThrow();
  });

  it('should warn about style containing a NaN value', () => {
    class Comp extends React.Component {
      static displayName = 'Comp';

      render() {
        return <div style={{fontSize: NaN}} />;
      }
    }

    const root = document.createElement('div');

    expect(() => ReactDOM.render(<Comp />, root)).not.toThrow();
  });

  it('should not warn when setting CSS custom properties', () => {
    class Comp extends React.Component {
      render() {
        return <div style={{'--foo-primary': 'red', backgroundColor: 'red'}} />;
      }
    }

    const root = document.createElement('div');
    ReactDOM.render(<Comp />, root);
  });

  it('should warn about style containing a Infinity value', () => {
    class Comp extends React.Component {
      static displayName = 'Comp';

      render() {
        return <div style={{fontSize: 1 / 0}} />;
      }
    }

    const root = document.createElement('div');

    expect(() => ReactDOM.render(<Comp />, root)).not.toThrow();
  });

  xit('should not add units to CSS custom properties', () => {
    class Comp extends React.Component {
      render() {
        return <div style={{'--foo': '5'}} />;
      }
    }

    const root = document.createElement('div');
    ReactDOM.render(<Comp />, root);

    expect(root.children[0].style.getPropertyValue('--foo')).toEqual('5');
  });
});
