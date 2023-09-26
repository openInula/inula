let PropTypes;
let React;
let ReactTestRenderer;
let Scheduler;
let Suspense;
let lazy;

function normalizeCodeLocInfo(str) {
  return (
    str &&
    str.replace(/\n +(?:at|in) ([\S]+)[^\n]*/g, function(m, name) {
      return '\n    in ' + name + ' (at **)';
    })
  );
}

describe('ReactLazy', () => {
  beforeEach(() => {
    jest.resetModules();

    PropTypes = require('prop-types');
    ReactTestRenderer = require('react-test-renderer');
    React = require('horizon-external');
    Suspense = React.Suspense;
    lazy = React.lazy;
    Scheduler = require('scheduler');
  });

  function Text(props) {
    Scheduler.unstable_yieldValue(props.text);
    return props.text;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
  }

  async function fakeImport(result) {
    return {default: result};
  }


  it('can resolve synchronously without suspending', async () => {
    const LazyText = lazy(() => ({
      then(cb) {
        cb({default: Text});
      },
    }));

    const root = ReactTestRenderer.create(
      <Suspense fallback={<Text text="Loading..." />}>
        <LazyText text="Hi" />
      </Suspense>,
    );

    expect(Scheduler).toHaveYielded(['Hi']);
    expect(root).toMatchRenderedOutput('Hi');
  });

  it('can reject synchronously without suspending', async () => {
    const LazyText = lazy(() => ({
      then(resolve, reject) {
        reject(new Error('oh no'));
      },
    }));

    class ErrorBoundary extends React.Component {
      state = {};
      static getDerivedStateFromError(error) {
        return {message: error.message};
      }
      render() {
        return this.state.message
          ? `Error: ${this.state.message}`
          : this.props.children;
      }
    }

    const root = ReactTestRenderer.create(
      <ErrorBoundary>
        <Suspense fallback={<Text text="Loading..." />}>
          <LazyText text="Hi" />
        </Suspense>
      </ErrorBoundary>,
    );
    expect(Scheduler).toHaveYielded([]);
    expect(root).toMatchRenderedOutput('Error: oh no');
  });

  it('sets defaultProps for legacy lifecycles', async () => {
    class C extends React.Component {
      static defaultProps = {text: 'A'};
      state = {};

      UNSAFE_componentWillMount() {
        Scheduler.unstable_yieldValue(
          `UNSAFE_componentWillMount: ${this.props.text}`,
        );
      }

      UNSAFE_componentWillUpdate(nextProps) {
        Scheduler.unstable_yieldValue(
          `UNSAFE_componentWillUpdate: ${this.props.text} -> ${nextProps.text}`,
        );
      }

      UNSAFE_componentWillReceiveProps(nextProps) {
        Scheduler.unstable_yieldValue(
          `UNSAFE_componentWillReceiveProps: ${this.props.text} -> ${nextProps.text}`,
        );
      }

      render() {
        return <Text text={this.props.text + this.props.num} />;
      }
    }

    const LazyClass = lazy(() => fakeImport(C));

    const root = ReactTestRenderer.create(
      <Suspense fallback={<Text text="Loading..." />}>
        <LazyClass num={1} />
      </Suspense>,
    );

    expect(Scheduler).toHaveYielded(['Loading...']);
    expect(Scheduler).toFlushAndYield([]);
    expect(root).toMatchRenderedOutput('Loading...');

    await Promise.resolve();

    expect(Scheduler).toHaveYielded([]);

    root.update(
      <Suspense fallback={<Text text="Loading..." />}>
        <LazyClass num={2} />
      </Suspense>,
    );

    expect(Scheduler).toHaveYielded(['UNSAFE_componentWillMount: A', 'A2']);
    expect(root).toMatchRenderedOutput('A2');

    root.update(
      <Suspense fallback={<Text text="Loading..." />}>
        <LazyClass num={3} />
      </Suspense>,
    );
    expect(Scheduler).toHaveYielded([
      'UNSAFE_componentWillReceiveProps: A -> A',
      'UNSAFE_componentWillUpdate: A -> A',
      'A3',
    ]);
    expect(Scheduler).toFlushAndYield([]);
    expect(root).toMatchRenderedOutput('A3');
  });

  it('should error with a component stack containing Lazy if unresolved', () => {
    let componentStackMessage;

    const LazyText = lazy(() => ({
      then(resolve, reject) {
        reject(new Error('oh no'));
      },
    }));

    class ErrorBoundary extends React.Component {
      state = {error: null};

      componentDidCatch(error, errMessage) {
        componentStackMessage = normalizeCodeLocInfo(errMessage.componentStack);
        this.setState({
          error,
        });
      }

      render() {
        return this.state.error ? null : this.props.children;
      }
    }

    ReactTestRenderer.create(
      <ErrorBoundary>
        <Suspense fallback={<Text text="Loading..." />}>
          <LazyText text="Hi" />
        </Suspense>
      </ErrorBoundary>,
    );

    expect(Scheduler).toHaveYielded([]);
  });

});
