import * as Horizon from '@cloudsop/horizon/index.ts';
import { Text } from '../jest/commonComponents';
import { getLogUtils } from '../jest/testUtils';

describe('LazyComponent Test', () => {
  const LogUtils = getLogUtils();
  const mockImport = jest.fn(async (component) => {
    return { default: component };
  });

  it('Horizon.lazy()', async () => {
    class LazyComponent extends Horizon.Component {
      static defaultProps = { language: 'Java' };

      render() {
        const text = `${this.props.greeting}: ${this.props.language}`;
        return <span>{text}</span>;
      }
    }

    const Lazy = Horizon.lazy(() => mockImport(LazyComponent));

    Horizon.render(
      <Horizon.Suspense fallback={<Text text="Loading..." />}>
        <Lazy greeting="Hi" />
      </Horizon.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Loading...']);
    expect(container.textContent).toBe('Loading...');
    expect(container.querySelector('span')).toBe(null);

    await Promise.resolve();
    Horizon.render(
      <Horizon.Suspense fallback={<Text text="Loading..." />}>
        <Lazy greeting="Goodbye" />
      </Horizon.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual([]);
    expect(container.querySelector('span').innerHTML).toBe('Goodbye: Java');
  });

  it('同步解析', async () => {
    const LazyApp = Horizon.lazy(() => ({
      then(cb) {
        cb({ default: Text });
      },
    }));

    Horizon.render(
      <Horizon.Suspense fallback={<div>Loading...</div>}>
        <LazyApp text="Lazy" />
      </Horizon.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Lazy']);
    expect(container.textContent).toBe('Lazy');
  });

  it('异常捕获边界', async () => {
    class ErrorBoundary extends Horizon.Component {
      state = {};
      static getDerivedStateFromError(error) {
        return { message: error.message };
      }
      render() {
        return this.state.message
          ? <h2>Error: {this.state.message}</h2>
          : this.props.children;
      }
    }

    const LazyComponent = () => {
      const [num, setNum] = Horizon.useState(0);
      if (num === 2) {
        throw new Error('num is 2');
      } else {
        return (
          <>
            <p id="p">{num}</p>
            <button onClick={() => setNum(num + 1)} />
          </>
        );
      }
    };

    const LazyApp = Horizon.lazy(() => mockImport(LazyComponent));

    Horizon.render(
      <ErrorBoundary>
        <Horizon.Suspense fallback={<div>Loading...</div>}>
          <LazyApp />
        </Horizon.Suspense>
      </ErrorBoundary>,
      container
    );
    expect(container.textContent).toBe('Loading...');

    await Promise.resolve();
    Horizon.render(
      <ErrorBoundary>
        <Horizon.Suspense fallback={<Text text="Loading..." />}>
          <LazyApp />
        </Horizon.Suspense>
      </ErrorBoundary>,
      container
    );
    expect(container.textContent).toBe('0');
    container.querySelector('button').click();
    expect(container.textContent).toBe('1');
    jest.spyOn(console, 'error').mockImplementation();
    container.querySelector('button').click();
    expect(container.textContent).toBe('Error: num is 2');
  });

  it('componentDidCatch捕获异常', async () => {
    class ErrorBoundary extends Horizon.Component {
      state = {
        catchError: false,
        error: null,
        componentStack: null
      };
      componentDidCatch(error, info) {
        if(error){
          this.setState({
            catchError: true,
            error,
            componentStack: info.componentStack
          });
        }

      }
      render() {
        return this.state.catchError
          ? <h2>Error: {this.state.error.message}</h2>
          : this.props.children;
      }
    }

    const LazyComponent = () => {
      const [num, setNum] = Horizon.useState(0);
      if (num === 2) {
        throw new Error('num is 2');
      } else {
        return (
          <>
            <p id="p">{num}</p>
            <button onClick={() => setNum(num + 1)} />
          </>
        );
      }
    };

    const LazyApp = Horizon.lazy(() => mockImport(LazyComponent));

    Horizon.render(
      <ErrorBoundary>
        <Horizon.Suspense fallback={<div>Loading...</div>}>
          <LazyApp />
        </Horizon.Suspense>
      </ErrorBoundary>,
      container
    );
    expect(container.textContent).toBe('Loading...');

    await Promise.resolve();
    Horizon.render(
      <ErrorBoundary>
        <Horizon.Suspense fallback={<Text text="Loading..." />}>
          <LazyApp />
        </Horizon.Suspense>
      </ErrorBoundary>,
      container
    );

    expect(container.textContent).toBe('0');
    container.querySelector('button').click();
    expect(container.textContent).toBe('1');
    jest.spyOn(console, 'error').mockImplementation();
    container.querySelector('button').click();
    expect(container.textContent).toBe('Error: num is 2');
  });
});
