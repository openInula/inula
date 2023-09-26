/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

describe('forwardRef', () => {
  let PropTypes;
  let React;
  let ReactNoop;
  let Scheduler;

  beforeEach(() => {
    jest.resetModules();
    ReactNoop = require('react-noop-renderer');
    PropTypes = require('prop-types');
    React = require('horizon-external');
    Scheduler = require('scheduler');
  });

  it('should update refs when switching between children', () => {
    function FunctionComponent({forwardedRef, setRefOnDiv}) {
      return (
        <section>
          <div ref={setRefOnDiv ? forwardedRef : null}>First</div>
          <span ref={setRefOnDiv ? null : forwardedRef}>Second</span>
        </section>
      );
    }

    const RefForwardingComponent = React.forwardRef((props, ref) => (
      <FunctionComponent {...props} forwardedRef={ref} />
    ));

    const ref = React.createRef();

    ReactNoop.render(<RefForwardingComponent ref={ref} setRefOnDiv={true} />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(ref.current.type).toBe('div');

    ReactNoop.render(<RefForwardingComponent ref={ref} setRefOnDiv={false} />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(ref.current.type).toBe('span');
  });

  it('should support rendering null', () => {
    const RefForwardingComponent = React.forwardRef((props, ref) => null);

    const ref = React.createRef();

    ReactNoop.render(<RefForwardingComponent ref={ref} />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(ref.current).toBe(null);
  });

  it('should support rendering null for multiple children', () => {
    const RefForwardingComponent = React.forwardRef((props, ref) => null);

    const ref = React.createRef();

    ReactNoop.render(
      <div>
        <div />
        <RefForwardingComponent ref={ref} />
        <div />
      </div>,
    );
    expect(Scheduler).toFlushWithoutYielding();
    expect(ref.current).toBe(null);
  });

  it('should not warn if the render function provided does not use any parameter', () => {
    React.forwardRef(function arityOfZero() {
      return <div ref={arguments[1]} />;
    });
  });

  it('should not warn if the render function provided use exactly two parameters', () => {
    const arityOfTwo = (props, ref) => <div {...props} ref={ref} />;
    React.forwardRef(arityOfTwo);
  });

  it('should not bailout if forwardRef is not wrapped in memo', () => {
    const Component = props => <div {...props} />;

    let renderCount = 0;

    const RefForwardingComponent = React.forwardRef((props, ref) => {
      renderCount++;
      return <Component {...props} forwardedRef={ref} />;
    });

    const ref = React.createRef();

    ReactNoop.render(<RefForwardingComponent ref={ref} optional="foo" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(1);

    ReactNoop.render(<RefForwardingComponent ref={ref} optional="foo" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(2);
  });

  it('should bailout if forwardRef is wrapped in memo', () => {
    const Component = props => <div ref={props.forwardedRef} />;

    let renderCount = 0;

    const RefForwardingComponent = React.memo(
      React.forwardRef((props, ref) => {
        renderCount++;
        return <Component {...props} forwardedRef={ref} />;
      }),
    );

    const ref = React.createRef();

    ReactNoop.render(<RefForwardingComponent ref={ref} optional="foo" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(1);

    expect(ref.current.type).toBe('div');

    ReactNoop.render(<RefForwardingComponent ref={ref} optional="foo" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(1);

    const differentRef = React.createRef();

    ReactNoop.render(
      <RefForwardingComponent ref={differentRef} optional="foo" />,
    );
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(2);

    expect(ref.current).toBe(null);
    expect(differentRef.current.type).toBe('div');

    ReactNoop.render(<RefForwardingComponent ref={ref} optional="bar" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(3);
  });

  it('should custom memo comparisons to compose', () => {
    const Component = props => <div ref={props.forwardedRef} />;

    let renderCount = 0;

    const RefForwardingComponent = React.memo(
      React.forwardRef((props, ref) => {
        renderCount++;
        return <Component {...props} forwardedRef={ref} />;
      }),
      (o, p) => o.a === p.a && o.b === p.b,
    );

    const ref = React.createRef();

    ReactNoop.render(<RefForwardingComponent ref={ref} a="0" b="0" c="1" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(1);

    expect(ref.current.type).toBe('div');

    // Changing either a or b rerenders
    ReactNoop.render(<RefForwardingComponent ref={ref} a="0" b="1" c="1" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(2);

    // Changing c doesn't rerender
    ReactNoop.render(<RefForwardingComponent ref={ref} a="0" b="1" c="2" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(2);

    const ComposedMemo = React.memo(
      RefForwardingComponent,
      (o, p) => o.a === p.a && o.c === p.c,
    );

    ReactNoop.render(<ComposedMemo ref={ref} a="0" b="0" c="0" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(3);

    // Changing just b no longer updates
    ReactNoop.render(<ComposedMemo ref={ref} a="0" b="1" c="0" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(3);

    // Changing just a and c updates
    ReactNoop.render(<ComposedMemo ref={ref} a="2" b="2" c="2" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(4);

    // Changing just c does not update
    ReactNoop.render(<ComposedMemo ref={ref} a="2" b="2" c="3" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(4);

    // Changing ref still rerenders
    const differentRef = React.createRef();

    ReactNoop.render(<ComposedMemo ref={differentRef} a="2" b="2" c="3" />);
    expect(Scheduler).toFlushWithoutYielding();
    expect(renderCount).toBe(5);

    expect(ref.current).toBe(null);
    expect(differentRef.current.type).toBe('div');
  });

  xit('warns on forwardRef(memo(...))', () => {
    expect(() => {
      React.forwardRef(
        React.memo((props, ref) => {
          return null;
        }),
      );
    }).toErrorDev(
      [
        'Warning: forwardRef requires a render function but received a `memo` ' +
        'component. Instead of forwardRef(memo(...)), use ' +
        'memo(forwardRef(...)).',
      ],
      {withoutStack: true},
    );
  });
});
