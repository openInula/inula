/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

describe('ReactDOMEventListener', () => {
  let React;
  let ReactDOM;

  beforeEach(() => {
    jest.resetModules();
    React = require('horizon-external');
    ReactDOM = require('horizon');
  });

  describe('Propagation', () => {
    it('should propagate events one level down', () => {
      const mouseOut = jest.fn();
      const onMouseOut = event => mouseOut(event.currentTarget);

      const childContainer = document.createElement('div');
      const parentContainer = document.createElement('div');
      const childNode = ReactDOM.render(
        <div onMouseOut={onMouseOut}>Child</div>,
        childContainer,
      );
      const parentNode = ReactDOM.render(
        <div onMouseOut={onMouseOut}>div</div>,
        parentContainer,
      );
      parentNode.appendChild(childContainer);
      document.body.appendChild(parentContainer);

      try {
        const nativeEvent = document.createEvent('Event');
        nativeEvent.initEvent('mouseout', true, true);
        childNode.dispatchEvent(nativeEvent);

        expect(mouseOut).toBeCalled();
        expect(mouseOut).toHaveBeenCalledTimes(2);
        expect(mouseOut.mock.calls[0][0]).toEqual(childNode);
        expect(mouseOut.mock.calls[1][0]).toEqual(parentNode);
      } finally {
        document.body.removeChild(parentContainer);
      }
    });

    it('should propagate events two levels down', () => {
      const mouseOut = jest.fn();
      const onMouseOut = event => mouseOut(event.currentTarget);

      const childContainer = document.createElement('div');
      const parentContainer = document.createElement('div');
      const grandParentContainer = document.createElement('div');
      const childNode = ReactDOM.render(
        <div onMouseOut={onMouseOut}>Child</div>,
        childContainer,
      );
      const parentNode = ReactDOM.render(
        <div onMouseOut={onMouseOut}>Parent</div>,
        parentContainer,
      );
      const grandParentNode = ReactDOM.render(
        <div onMouseOut={onMouseOut}>Parent</div>,
        grandParentContainer,
      );
      parentNode.appendChild(childContainer);
      grandParentNode.appendChild(parentContainer);

      document.body.appendChild(grandParentContainer);

      try {
        const nativeEvent = document.createEvent('Event');
        nativeEvent.initEvent('mouseout', true, true);
        childNode.dispatchEvent(nativeEvent);

        expect(mouseOut).toBeCalled();
        expect(mouseOut).toHaveBeenCalledTimes(3);
        expect(mouseOut.mock.calls[0][0]).toEqual(childNode);
        expect(mouseOut.mock.calls[1][0]).toEqual(parentNode);
        expect(mouseOut.mock.calls[2][0]).toEqual(grandParentNode);
      } finally {
        document.body.removeChild(grandParentContainer);
      }
    });

    // Regression test for https://github.com/facebook/react/issues/1105
    it('should not get confused by disappearing elements', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      try {
        class MyComponent extends React.Component {
          state = {clicked: false};
          handleClick = () => {
            this.setState({clicked: true});
          };
          componentDidMount() {
            expect(ReactDOM.findDOMNode(this)).toBe(container.firstChild);
          }
          componentDidUpdate() {
            expect(ReactDOM.findDOMNode(this)).toBe(container.firstChild);
          }
          render() {
            if (this.state.clicked) {
              return <span>clicked!</span>;
            } else {
              return (
                <button onClick={this.handleClick}>not yet clicked</button>
              );
            }
          }
        }
        ReactDOM.render(<MyComponent />, container);
        container.firstChild.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
          }),
        );
        expect(container.firstChild.textContent).toBe('clicked!');
      } finally {
        document.body.removeChild(container);
      }
    });

    it('should batch between handlers from different roots', () => {
      const mock = jest.fn();

      const childContainer = document.createElement('div');
      const handleChildMouseOut = () => {
        ReactDOM.render(<div>1</div>, childContainer);
        mock(childNode.textContent);
      };

      const parentContainer = document.createElement('div');
      const handleParentMouseOut = () => {
        ReactDOM.render(<div>2</div>, childContainer);
        mock(childNode.textContent);
      };

      const childNode = ReactDOM.render(
        <div onMouseOut={handleChildMouseOut}>Child</div>,
        childContainer,
      );
      const parentNode = ReactDOM.render(
        <div onMouseOut={handleParentMouseOut}>Parent</div>,
        parentContainer,
      );
      parentNode.appendChild(childContainer);
      document.body.appendChild(parentContainer);

      try {
        const nativeEvent = document.createEvent('Event');
        nativeEvent.initEvent('mouseout', true, true);
        childNode.dispatchEvent(nativeEvent);

        // Child and parent should both call from event handlers.
        expect(mock).toHaveBeenCalledTimes(2);
        // The first call schedules a render of '1' into the 'Child'.
        // However, we're batching so it isn't flushed yet.
        expect(mock.mock.calls[0][0]).toBe('Child');
        // As we have two roots, it means we have two event listeners.
        // This also means we enter the event batching phase twice,
        // flushing the child to be 1.

        // We don't have any good way of knowing if another event will
        // occur because another event handler might invoke
        // stopPropagation() along the way. After discussions internally
        // with Sebastian, it seems that for now over-flushing should
        // be fine, especially as the new event system is a breaking
        // change anyway. We can maybe revisit this later as part of
        // the work to refine this in the scheduler (maybe by leveraging
        // isInputPending?).
        expect(mock.mock.calls[1][0]).toBe('1');
        // By the time we leave the handler, the second update is flushed.
        expect(childNode.textContent).toBe('2');
      } finally {
        document.body.removeChild(parentContainer);
      }
    });
  });

  it('should not fire duplicate events for a React DOM tree', () => {
    const mouseOut = jest.fn();
    const onMouseOut = event => mouseOut(event.target);

    class Wrapper extends React.Component {
      getInner = () => {
        return this.refs.inner;
      };

      render() {
        const inner = <div ref="inner">Inner</div>;
        return (
          <div>
            <div onMouseOut={onMouseOut} id="outer">
              {inner}
            </div>
          </div>
        );
      }
    }

    const container = document.createElement('div');
    const instance = ReactDOM.render(<Wrapper />, container);

    document.body.appendChild(container);

    try {
      const nativeEvent = document.createEvent('Event');
      nativeEvent.initEvent('mouseout', true, true);
      instance.getInner().dispatchEvent(nativeEvent);

      expect(mouseOut).toBeCalled();
      expect(mouseOut).toHaveBeenCalledTimes(1);
      expect(mouseOut.mock.calls[0][0]).toEqual(instance.getInner());
    } finally {
      document.body.removeChild(container);
    }
  });

  // Regression test for https://github.com/facebook/react/pull/12877
  it('should not fire form events twice', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const formRef = React.createRef();
    const inputRef = React.createRef();

    const handleInvalid = jest.fn();
    const handleReset = jest.fn();
    const handleSubmit = jest.fn();
    ReactDOM.render(
      <form ref={formRef} onReset={handleReset} onSubmit={handleSubmit}>
        <input ref={inputRef} onInvalid={handleInvalid} />
      </form>,
      container,
    );

    inputRef.current.dispatchEvent(
      new Event('invalid', {
        // https://developer.mozilla.org/en-US/docs/Web/Events/invalid
        bubbles: false,
      }),
    );
    expect(handleInvalid).toHaveBeenCalledTimes(1);

    formRef.current.dispatchEvent(
      new Event('reset', {
        // https://developer.mozilla.org/en-US/docs/Web/Events/reset
        bubbles: true,
      }),
    );
    expect(handleReset).toHaveBeenCalledTimes(1);

    formRef.current.dispatchEvent(
      new Event('submit', {
        // https://developer.mozilla.org/en-US/docs/Web/Events/submit
        bubbles: true,
      }),
    );
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    formRef.current.dispatchEvent(
      new Event('submit', {
        // Might happen on older browsers.
        bubbles: true,
      }),
    );
    expect(handleSubmit).toHaveBeenCalledTimes(2); // It already fired in this test.

    document.body.removeChild(container);
  });

  it('should dispatch load for embed elements', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      const ref = React.createRef();
      const handleLoad = jest.fn();

      ReactDOM.render(
        <div>
          <embed ref={ref} onLoad={handleLoad} />
        </div>,
        container,
      );

      ref.current.dispatchEvent(
        new ProgressEvent('load', {
          bubbles: false,
        }),
      );

      expect(handleLoad).toHaveBeenCalledTimes(1);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should bubble non-native bubbling toggle events', () => {
    const container = document.createElement('div');
    const ref = React.createRef();
    const onToggle = jest.fn();
    document.body.appendChild(container);
    try {
      ReactDOM.render(
        <div onToggle={onToggle}>
          <details ref={ref} onToggle={onToggle} />
        </div>,
        container,
      );
      ref.current.dispatchEvent(
        new Event('toggle', {
          bubbles: false,
        }),
      );
      expect(onToggle).toHaveBeenCalledTimes(1);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should bubble non-native bubbling cancel/close events', () => {
    const container = document.createElement('div');
    const ref = React.createRef();
    const onCancel = jest.fn();
    const onClose = jest.fn();
    document.body.appendChild(container);
    try {
      ReactDOM.render(
        <div onCancel={onCancel} onClose={onClose}>
          <dialog ref={ref} onCancel={onCancel} onClose={onClose} />
        </div>,
        container,
      );
      ref.current.dispatchEvent(
        new Event('cancel', {
          bubbles: false,
        }),
      );
      ref.current.dispatchEvent(
        new Event('close', {
          bubbles: false,
        }),
      );
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should not bubble non-native bubbling invalid events', () => {
    const container = document.createElement('div');
    const ref = React.createRef();
    const onInvalid = jest.fn();
    document.body.appendChild(container);
    try {
      ReactDOM.render(
        <form onInvalid={onInvalid}>
          <input ref={ref} onInvalid={onInvalid} />
        </form>,
        container,
      );
      ref.current.dispatchEvent(
        new Event('invalid', {
          bubbles: false,
        }),
      );
      expect(onInvalid).toHaveBeenCalledTimes(1);
    } finally {
      document.body.removeChild(container);
    }
  });


  // We're moving towards aligning more closely with the browser.
  // Currently we emulate bubbling for all non-bubbling events except scroll.
  // We may expand this list in the future, removing emulated bubbling altogether.
  it('should not emulate bubbling of scroll events', () => {
    const container = document.createElement('div');
    const ref = React.createRef();
    const log = [];
    const onScroll = jest.fn(e =>
      log.push(['bubble', e.currentTarget.className]),
    );
    const onScrollCapture = jest.fn(e =>
      log.push(['capture', e.currentTarget.className]),
    );
    document.body.appendChild(container);
    try {
      ReactDOM.render(
        <div
          className="grand"
          onScroll={onScroll}
          onScrollCapture={onScrollCapture}>
          <div
            className="parent"
            onScroll={onScroll}
            onScrollCapture={onScrollCapture}>
            <div
              className="child"
              onScroll={onScroll}
              onScrollCapture={onScrollCapture}
              ref={ref}
            />
          </div>
        </div>,
        container,
      );
      ref.current.dispatchEvent(
        new Event('scroll', {
          bubbles: false,
        }),
      );
      expect(log).toEqual([
        ['capture', 'grand'],
        ['capture', 'parent'],
        ['capture', 'child'],
        ['bubble', 'child'],
      ]);
    } finally {
      document.body.removeChild(container);
    }
  });

  // We're moving towards aligning more closely with the browser.
  // Currently we emulate bubbling for all non-bubbling events except scroll.
  // We may expand this list in the future, removing emulated bubbling altogether.
  it('should not emulate bubbling of scroll events (no own handler)', () => {
    const container = document.createElement('div');
    const ref = React.createRef();
    const log = [];
    const onScroll = jest.fn(e =>
      log.push(['bubble', e.currentTarget.className]),
    );
    const onScrollCapture = jest.fn(e =>
      log.push(['capture', e.currentTarget.className]),
    );
    document.body.appendChild(container);
    try {
      ReactDOM.render(
        <div
          className="grand"
          onScroll={onScroll}
          onScrollCapture={onScrollCapture}>
          <div
            className="parent"
            onScroll={onScroll}
            onScrollCapture={onScrollCapture}>
            {/* Intentionally no handler on the child: */}
            <div className="child" ref={ref} />
          </div>
        </div>,
        container,
      );
      ref.current.dispatchEvent(
        new Event('scroll', {
          bubbles: false,
        }),
      );
      expect(log).toEqual([
        ['capture', 'grand'],
        ['capture', 'parent'],
      ]);
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should subscribe to scroll during updates', () => {
    const container = document.createElement('div');
    const ref = React.createRef();
    const log = [];
    const onScroll = jest.fn(e =>
      log.push(['bubble', e.currentTarget.className]),
    );
    const onScrollCapture = jest.fn(e =>
      log.push(['capture', e.currentTarget.className]),
    );
    document.body.appendChild(container);
    try {
      ReactDOM.render(
        <div>
          <div>
            <div />
          </div>
        </div>,
        container,
      );
      ReactDOM.render(
        <div
          className="grand"
          onScroll={onScroll}
          onScrollCapture={onScrollCapture}>
          <div
            className="parent"
            onScroll={onScroll}
            onScrollCapture={onScrollCapture}>
            <div
              className="child"
              onScroll={onScroll}
              onScrollCapture={onScrollCapture}
              ref={ref}
            />
          </div>
        </div>,
        container,
      );
      ref.current.dispatchEvent(
        new Event('scroll', {
          bubbles: false,
        }),
      );
      expect(log).toEqual([
        ['capture', 'grand'],
        ['capture', 'parent'],
        ['capture', 'child'],
        ['bubble', 'child'],
      ]);
    } finally {
      document.body.removeChild(container);
    }
  });
});
