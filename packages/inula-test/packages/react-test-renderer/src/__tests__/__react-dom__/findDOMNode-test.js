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
const ReactTestUtils = require('react-test-renderer/test-utils');

describe('findDOMNode', () => {
  it('findDOMNode should return null if passed null', () => {
    expect(ReactDOM.findDOMNode(null)).toBe(null);
  });

  it('findDOMNode should find dom element', () => {
    class MyNode extends React.Component {
      render() {
        return (
          <div>
            <span>Noise</span>
          </div>
        );
      }
    }

    const myNode = ReactTestUtils.renderIntoDocument(<MyNode />);
    const myDiv = ReactDOM.findDOMNode(myNode);
    const mySameDiv = ReactDOM.findDOMNode(myDiv);
    expect(myDiv.tagName).toBe('DIV');
    expect(mySameDiv).toBe(myDiv);
  });

  it('findDOMNode should find dom element after an update from null', () => {
    function Bar({flag}) {
      if (flag) {
        return <span>A</span>;
      }
      return null;
    }
    class MyNode extends React.Component {
      render() {
        return <Bar flag={this.props.flag} />;
      }
    }

    const container = document.createElement('div');

    const myNodeA = ReactDOM.render(<MyNode />, container);
    const a = ReactDOM.findDOMNode(myNodeA);
    expect(a).toBe(null);

    const myNodeB = ReactDOM.render(<MyNode flag={true} />, container);
    expect(myNodeA === myNodeB).toBe(true);

    const b = ReactDOM.findDOMNode(myNodeB);
    expect(b.tagName).toBe('SPAN');
  });

  it('findDOMNode should reject random objects', () => {
    expect(function() {
      ReactDOM.findDOMNode({foo: 'bar'});
    }).toThrowError('Unable to find the vNode by class instance.');
  });

  it('findDOMNode should reject unmounted objects with render func', () => {
    class Foo extends React.Component {
      render() {
        return <div />;
      }
    }

    const container = document.createElement('div');
    const inst = ReactDOM.render(<Foo />, container);
    ReactDOM.unmountComponentAtNode(container);

    // expect(() => ReactDOM.findDOMNode(inst)).toThrowError(
    //   'This is an unmounted component.',
    // );
    expect(ReactDOM.findDOMNode(inst)).toBe(null);
  });

  it('findDOMNode should not throw an error when called within a component that is not mounted', () => {
    class Bar extends React.Component {
      UNSAFE_componentWillMount() {
        expect(ReactDOM.findDOMNode(this)).toBeNull();
      }

      render() {
        return <div />;
      }
    }
    expect(() => ReactTestUtils.renderIntoDocument(<Bar />)).not.toThrow();
  });
});
