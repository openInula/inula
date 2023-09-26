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

describe('ReactMount', () => {
  beforeEach(() => {
    jest.resetModules();

    React = require('horizon-external');
    ReactDOM = require('horizon');
    ReactTestUtils = require('react-test-renderer/test-utils');
  });

  describe('unmountComponentAtNode', () => {
    it('returns false on non-React containers', () => {
      const d = document.createElement('div');
      d.innerHTML = '<b>hellooo</b>';
      expect(ReactDOM.unmountComponentAtNode(d)).toBe(false);
      expect(d.textContent).toBe('hellooo');
    });

    it('returns true on React containers', () => {
      const d = document.createElement('div');
      ReactDOM.render(<b>hellooo</b>, d);
      expect(d.textContent).toBe('hellooo');
      expect(ReactDOM.unmountComponentAtNode(d)).toBe(true);
      expect(d.textContent).toBe('');
    });
  });

  xit('warns when given a factory', () => {
    class Component extends React.Component {
      render() {
        return <div />;
      }
    }

    expect(() =>
      ReactTestUtils.renderIntoDocument(Component),
    ).toErrorDev(
      'horizon child can not be functions.  use string / object / array.',
      {withoutStack: true},
    );
  });

  it('should render different components in same root', () => {
    const container = document.createElement('container');
    document.body.appendChild(container);

    ReactDOM.render(<div />, container);
    expect(container.firstChild.nodeName).toBe('DIV');

    ReactDOM.render(<span />, container);
    expect(container.firstChild.nodeName).toBe('SPAN');
  });

  it('should unmount and remount if the key changes', () => {
    const container = document.createElement('container');

    const mockMount = jest.fn();
    const mockUnmount = jest.fn();

    class Component extends React.Component {
      componentDidMount = mockMount;
      componentWillUnmount = mockUnmount;
      render() {
        return <span>{this.props.text}</span>;
      }
    }

    expect(mockMount).toHaveBeenCalledTimes(0);
    expect(mockUnmount).toHaveBeenCalledTimes(0);

    ReactDOM.render(<Component text="orange" key="A" />, container);
    expect(container.firstChild.innerHTML).toBe('orange');
    expect(mockMount).toHaveBeenCalledTimes(1);
    expect(mockUnmount).toHaveBeenCalledTimes(0);

    // If we change the key, the component is unmounted and remounted
    ReactDOM.render(<Component text="green" key="B" />, container);
    expect(container.firstChild.innerHTML).toBe('green');
    expect(mockMount).toHaveBeenCalledTimes(2);
    expect(mockUnmount).toHaveBeenCalledTimes(1);

    // But if we don't change the key, the component instance is reused
    ReactDOM.render(<Component text="blue" key="B" />, container);
    expect(container.firstChild.innerHTML).toBe('blue');
    expect(mockMount).toHaveBeenCalledTimes(2);
    expect(mockUnmount).toHaveBeenCalledTimes(1);
  });

  it('should reuse markup if rendering to the same target twice', () => {
    const container = document.createElement('container');
    const instance1 = ReactDOM.render(<div />, container);
    const instance2 = ReactDOM.render(<div />, container);

    expect(instance1 === instance2).toBe(true);
  });

  it('should not warn if mounting into non-empty node', () => {
    const container = document.createElement('container');
    container.innerHTML = '<div></div>';

    ReactDOM.render(<div />, container);
  });

  it('should warn if the unmounted node was rendered by another copy of React', () => {
    jest.resetModules();
    const ReactDOMOther = require('horizon');
    const container = document.createElement('div');

    class Component extends React.Component {
      render() {
        return (
          <div>
            <div />
          </div>
        );
      }
    }

    ReactDOM.render(<Component />, container);
    // Make sure ReactDOM and ReactDOMOther are different copies
    expect(ReactDOM).not.toEqual(ReactDOMOther);

    // Don't throw a warning if the correct React copy unmounts the node
    ReactDOM.unmountComponentAtNode(container);
  });

  it('passes the correct callback context', () => {
    const container = document.createElement('div');
    let calls = 0;

    ReactDOM.render(<div />, container, function() {
      expect(this.nodeName).toBe('DIV');
      calls++;
    });

    // Update, no type change
    ReactDOM.render(<div />, container, function() {
      expect(this.nodeName).toBe('DIV');
      calls++;
    });

    // Update, type change
    ReactDOM.render(<span />, container, function() {
      expect(this.nodeName).toBe('SPAN');
      calls++;
    });

    // Batched update, no type change
    ReactDOM.unstable_batchedUpdates(function() {
      ReactDOM.render(<span />, container, function() {
        expect(this.nodeName).toBe('SPAN');
        calls++;
      });
    });

    // Batched update, type change
    ReactDOM.unstable_batchedUpdates(function() {
      ReactDOM.render(<article />, container, function() {
        expect(this.nodeName).toBe('ARTICLE');
        calls++;
      });
    });

    expect(calls).toBe(5);
  });

  it('initial mount is sync inside batchedUpdates, but task work is deferred until the end of the batch', () => {
    const container1 = document.createElement('div');
    const container2 = document.createElement('div');

    class Foo extends React.Component {
      state = {active: false};
      componentDidMount() {
        this.setState({active: true});
      }
      render() {
        return (
          <div>{this.props.children + (this.state.active ? '!' : '')}</div>
        );
      }
    }

    ReactDOM.render(<div>1</div>, container1);

    ReactDOM.unstable_batchedUpdates(() => {
      // Update. Does not flush yet.
      ReactDOM.render(<div>2</div>, container1);
      expect(container1.textContent).toEqual('1');

      // Initial mount on another root. Should flush immediately.
      ReactDOM.render(<Foo>a</Foo>, container2);
      // The update did not flush yet.
      expect(container1.textContent).toEqual('1');
      // The initial mount flushed, but not the update scheduled in cDM.
      expect(container2.textContent).toEqual('a');
    });
    // All updates have flushed.
    expect(container1.textContent).toEqual('2');
    expect(container2.textContent).toEqual('a!');
  });

  describe('mount point is a comment node', () => {
    let containerDiv;
    let mountPoint;

    beforeEach(() => {
      containerDiv = document.createElement('div');
      containerDiv.innerHTML = 'A<!-- react-mount-point-unstable -->B';
      mountPoint = containerDiv.childNodes[1];
      const comment = 8;
      expect(mountPoint.nodeType).toBe(comment);
    });

    xit('renders at a comment node', () => {
      function Char(props) {
        return props.children;
      }
      function list(chars) {
        return chars.split('').map(c => <Char key={c}>{c}</Char>);
      }

      ReactDOM.render(list('aeiou'), mountPoint);
      expect(containerDiv.innerHTML).toBe(
        'Aaeiou<!-- react-mount-point-unstable -->B',
      );

      ReactDOM.render(list('yea'), mountPoint);
      expect(containerDiv.innerHTML).toBe(
        'Ayea<!-- react-mount-point-unstable -->B',
      );

      ReactDOM.render(list(''), mountPoint);
      expect(containerDiv.innerHTML).toBe(
        'A<!-- react-mount-point-unstable -->B',
      );
    });
  });
});
