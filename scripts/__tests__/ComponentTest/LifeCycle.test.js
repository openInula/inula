import * as Horizon from '@cloudsop/horizon/index.ts';
import { getLogUtils } from '../jest/testUtils';

describe('LifeCycle Test', () => {
  const LogUtils =getLogUtils();
  describe('LifeCycle function', () => {
    it('不能在componentWillMount里setState', () => {
      class App extends Horizon.Component {
        state = {};

        UNSAFE_componentWillMount() {
          this.setState = {
            num: 1
          };
        }

        render() {
          return <p>{this.state.num}</p>;
        }
      }

      const realNode = Horizon.render(<App />, container);
      // 不能在componentWillMount里setState
      expect(realNode.textContent).toBe(undefined);
    });

    it('componentDidMount里调用setState()将触发额外渲染', () => {
      class ChildApp extends Horizon.Component {
        constructor(props) {
          super(props);
        }

        componentDidMount() {
          LogUtils.log(this.props.isShow);
        }

        render() {
          return <p>{this.props.isShow}</p>;
        }
      }

      class App extends Horizon.Component {
        constructor(props) {
          super(props);
          LogUtils.log('constructor');
          this.state = { shouldShowChild: false };
        }

        componentDidMount() {
          LogUtils.log('componentDidMount');
          this.setState({ shouldShowChild: true });
        }

        render() {
          return (
            <div>
              {this.state.shouldShowChild ? <ChildApp isShow={this.state.shouldShowChild} /> : <div />}
            </div>
          );
        }
      }

      const realNode = Horizon.render(<App />, container);
      // 确实触发了额外渲染
      expect(LogUtils.getAndClear()).toEqual([
        'constructor',
        'componentDidMount',
        true
      ]);
      // 可以在 componentDidMount() 里直接调用 setState()。它将触发额外渲染，但此渲染会发生在浏览器更新屏幕之前
      expect(container.querySelector('p').innerHTML).toBe('');
      // 在 componentDidMount() 里可以更新state
      expect(realNode.state).toStrictEqual({ 'shouldShowChild': true });
    });

    it('调用 this.setState() 通常不会触发 UNSAFE_componentWillReceiveProps()', () => {
      class App extends Horizon.Component {
        state = {};

        update = () => {
          this.setState({ num: 4 });
        }

        UNSAFE_componentWillReceiveProps() {
          LogUtils.log('componentWillReceiveProps');
          this.setState = {
            num: 1
          };
        }

        render() {
          return <p>{this.state.num}</p>;
        }
      }

      const realNode = Horizon.render(<App />, container);
      expect(realNode.textContent).toBe(undefined);
      realNode.update();
      expect(LogUtils.getAndClear()).toEqual([]);
    });

    it('不能在componentWillReceiveProps里setState', () => {
      class ChildApp extends Horizon.Component {
        state = {};

        UNSAFE_componentWillReceiveProps() {
          this.state = { text: 'text' };
        }

        render() {
          LogUtils.log(this.state.text);
          return <div>{this.state.text}</div>;
        }
      }
      class App extends Horizon.Component {
        state = {};

        update = () => {
          this.setState({ num: 4 });
        }

        render() {
          return <ChildApp num={this.state.num} />;
        }
      }

      const realNode = Horizon.render(<App />, container);
      expect(realNode.textContent).toBe(undefined);
      realNode.update();
      expect(LogUtils.getAndClear()).toEqual([
        undefined,
        'text',
      ]);
      // 不能在componentWillMount里setState
      expect(realNode.textContent).toBe(undefined);
    });

    it('shouldComponentUpdate与getDerivedStateFromProps', () => {
      class App extends Horizon.Component {
        constructor(props) {
          super(props);
          this.state = {
            num: props.num,
          };
        }
        static getDerivedStateFromProps(nextProps, prevState) {
          if (nextProps.num === prevState.num) {
            return null;
          }
          return { num: nextProps.num };
        }

        shouldComponentUpdate(nextProps, nextState) {
          LogUtils.log('shouldComponentUpdate');
          return nextState.num !== this.state.num;
        }

        render() {
          return <p>{this.state.num}</p>;
        }
      }

      Horizon.render(<App num={1} />, container);
      // 初次渲染不会调用shouldComponentUpdate
      expect(LogUtils.getAndClear()).toEqual([]);
      expect(container.querySelector('p').innerHTML).toBe('1');

      Horizon.render(<App num={1} />, container);
      // getDerivedStateFromProps判断state没有变化时，会调用shouldComponentUpdate
      expect(LogUtils.getAndClear()).toEqual(['shouldComponentUpdate']);
      expect(container.querySelector('p').innerHTML).toBe('1');

      Horizon.render(<App num={2} />, container);
      // getDerivedStateFromProps判断state变化时，会调用shouldComponentUpdate
      expect(LogUtils.getAndClear()).toEqual(['shouldComponentUpdate']);
      expect(container.querySelector('p').innerHTML).toBe('2');
    });

    it('如果shouldComponentUpdate()返回值为false,则不会调用componentDidUpdate()', () => {
      class App extends Horizon.Component {
        constructor(props) {
          super(props);
          this.state = {
            num: props.num,
          };
        }
        static getDerivedStateFromProps(nextProps, prevState) {
          if (nextProps.num === prevState.num) {
            return null;
          }
          return { num: nextProps.num };
        }

        shouldComponentUpdate(nextProps, nextState) {
          return nextState.num !== this.state.num;
        }

        componentDidUpdate(){
          LogUtils.log('componentDidUpdate');
        }

        render() {
          return <p>{this.state.num}</p>;
        }
      }

      Horizon.render(<App num={1} />, container);
      expect(container.querySelector('p').innerHTML).toBe('1');

      Horizon.render(<App num={1} />, container);
      // 不会调用componentDidUpdate()
      expect(LogUtils.getAndClear()).toEqual([]);
      expect(container.querySelector('p').innerHTML).toBe('1');

      Horizon.render(<App num={2} />, container);
      // 调用componentDidUpdate()
      expect(LogUtils.getAndClear()).toEqual(['componentDidUpdate']);
      expect(container.querySelector('p').innerHTML).toBe('2');
    });

    it('getSnapshotBeforeUpdate()的返回值会作为componentDidUpdate()的第三个参数', () => {
      class App extends Horizon.Component {
        constructor(props) {
          super(props);
          this.state = {
            num: 0,
          };
        }
        static getDerivedStateFromProps(nextProps, prevState) {
          if (nextProps.num === prevState.num) {
            return null;
          }
          return { num: nextProps.num };
        }
        getSnapshotBeforeUpdate(prevProps, prevState) {
          LogUtils.log(
            `getSnapshotBeforeUpdate prevProps:${prevProps.num} prevState:${prevState.num}`,
          );
          return 'Snapshot';
        }
        componentDidUpdate(prevProps, prevState, snapshot) {
          LogUtils.log(
            `componentDidUpdate prevProps:${prevProps.num} prevState:${prevState.num} snapshot:${snapshot}`,
          );
        }

        render() {
          return <p>{this.state.num}</p>;
        }
      }
      Horizon.render(<App />, container);
      expect(LogUtils.getAndClear()).toEqual([]);
      expect(container.querySelector('p').innerHTML).toBe('');

      Horizon.render(<App num={1} />, container);
      // Snapshot作为componentDidUpdate()的第三个参数
      expect(LogUtils.getAndClear()).toEqual([
        'getSnapshotBeforeUpdate prevProps:undefined prevState:undefined',
        'componentDidUpdate prevProps:undefined prevState:undefined snapshot:Snapshot',
      ]);
      expect(container.querySelector('p').innerHTML).toBe('1');

      Horizon.render(<App num={1} />, container);
      expect(LogUtils.getAndClear()).toEqual([
        'getSnapshotBeforeUpdate prevProps:1 prevState:1',
        'componentDidUpdate prevProps:1 prevState:1 snapshot:Snapshot',
      ]);
      expect(container.querySelector('p').innerHTML).toBe('1');

      Horizon.render(<App num={2} />, container);
      expect(LogUtils.getAndClear()).toEqual([
        'getSnapshotBeforeUpdate prevProps:1 prevState:1',
        'componentDidUpdate prevProps:1 prevState:1 snapshot:Snapshot',
      ]);
      expect(container.querySelector('p').innerHTML).toBe('2');
    });

    it('无论什么原因触发了渲染,只要有渲染就会触发getDerivedStateFromProps',() => {
      class App extends Horizon.Component {
        constructor(props) {
          super(props);
          this.state = {
            num: 0,
          };
        }
        static getDerivedStateFromProps(nextProps, prevState) {
          LogUtils.log(
            `getDerivedStateFromProps nextProps:${nextProps.num} prevState:${prevState.num}`,
          );
        }

        render() {
          return <p>{this.state.num}</p>;
        }
      }
      let realNode = Horizon.render(<App />, container);
      realNode = Horizon.render(<App num={1} />, container);
      realNode.forceUpdate();
      // 触发了3次渲染
      expect(LogUtils.getAndClear()).toEqual([
        'getDerivedStateFromProps nextProps:undefined prevState:0',
        'getDerivedStateFromProps nextProps:1 prevState:0',
        'getDerivedStateFromProps nextProps:1 prevState:0',
      ]);
    });
  });

  it('生命周期执行顺序', () => {
    class InnerApp extends Horizon.Component {
      UNSAFE_componentWillMount() {
        LogUtils.log('Inner componentWillMount');
      }
      componentDidMount() {
        LogUtils.log('Inner componentDidMount');
      }
      UNSAFE_componentWillReceiveProps() {
        LogUtils.log('Inner componentWillReceiveProps');
      }
      shouldComponentUpdate(nextProps, nextState) {
        LogUtils.log('Inner shouldComponentUpdates');
        return this.props.number !== nextProps.number;
      }
      UNSAFE_componentWillUpdate() {
        LogUtils.log('Inner componentWillUpdate');
      }
      componentDidUpdate() {
        LogUtils.log('Inner componentDidUpdate');
      }
      componentWillUnmount() {
        LogUtils.log('Inner componentWillUnmount');
      }

      render() {
        return <p>{this.props.number}</p>;
      }
    }

    class App extends Horizon.Component {
      UNSAFE_componentWillMount() {
        LogUtils.log('componentWillMount');
      }
      componentDidMount() {
        LogUtils.log('componentDidMount');
      }
      UNSAFE_componentWillReceiveProps() {
        LogUtils.log('componentWillReceiveProps');
      }
      shouldComponentUpdate(nextProps, nextState) {
        LogUtils.log('shouldComponentUpdates');
        return this.props.num !== nextProps.num;
      }
      UNSAFE_componentWillUpdate() {
        LogUtils.log('componentWillUpdate');
      }
      componentDidUpdate() {
        LogUtils.log('componentDidUpdate');
      }
      componentWillUnmount() {
        LogUtils.log('componentWillUnmount');
      }

      render() {
        return <InnerApp number={this.props.num} />;
      }
    }

    Horizon.render(<App num={1} />, container);
    expect(container.textContent).toBe('1');
    expect(LogUtils.getAndClear()).toEqual([
      'componentWillMount',
      'Inner componentWillMount',
      'Inner componentDidMount',
      'componentDidMount'
    ]);
    Horizon.render(<App num={2} />, container);
    expect(container.textContent).toBe('2');
    expect(LogUtils.getAndClear()).toEqual([
      'componentWillReceiveProps',
      'shouldComponentUpdates',
      'componentWillUpdate',
      'Inner componentWillReceiveProps',
      'Inner shouldComponentUpdates',
      'Inner componentWillUpdate',
      'Inner componentDidUpdate',
      'componentDidUpdate'
    ]);
    Horizon.unmountComponentAtNode(container);
    expect(container.textContent).toBe('');
    expect(LogUtils.getAndClear()).toEqual([
      'componentWillUnmount',
      'Inner componentWillUnmount'
    ]);
  });

  it('新生命周期执行顺序', () => {
    class InnerApp extends Horizon.Component {
      static getDerivedStateFromProps(props, state) {
        LogUtils.log('Inner getDerivedStateFromProps');
      }
      componentDidMount() {
        LogUtils.log('Inner componentDidMount');
      }
      shouldComponentUpdate(nextProps, nextState) {
        LogUtils.log('Inner shouldComponentUpdates');
        return this.props.number !== nextProps.number;
      }
      componentDidUpdate() {
        LogUtils.log('Inner componentDidUpdate');
      }
      getSnapshotBeforeUpdate() {
        LogUtils.log('Inner getSnapshotBeforeUpdate');
      }
      componentWillUnmount() {
        LogUtils.log('Inner componentWillUnmount');
      }

      render() {
        return <p>{this.props.number}</p>;
      }
    }

    class App extends Horizon.Component {
      static getDerivedStateFromProps(props, state) {
        LogUtils.log('getDerivedStateFromProps');
      }
      componentDidMount() {
        LogUtils.log('componentDidMount');
      }
      shouldComponentUpdate(nextProps, nextState) {
        LogUtils.log('shouldComponentUpdates');
        return this.props.num !== nextProps.num;
      }
      getSnapshotBeforeUpdate() {
        LogUtils.log('getSnapshotBeforeUpdate');
      }
      componentDidUpdate() {
        LogUtils.log('componentDidUpdate');
      }
      componentWillUnmount() {
        LogUtils.log('componentWillUnmount');
      }

      render() {
        return <InnerApp number={this.props.num} />;
      }
    }

    Horizon.render(<App num={1} />, container);
    expect(container.textContent).toBe('1');
    expect(LogUtils.getAndClear()).toEqual([
      'getDerivedStateFromProps',
      'Inner getDerivedStateFromProps',
      'Inner componentDidMount',
      'componentDidMount'
    ]);
    Horizon.render(<App num={2} />, container);
    expect(container.textContent).toBe('2');
    expect(LogUtils.getAndClear()).toEqual([
      'getDerivedStateFromProps',
      'shouldComponentUpdates',
      'Inner getDerivedStateFromProps',
      'Inner shouldComponentUpdates',
      'Inner getSnapshotBeforeUpdate',
      'getSnapshotBeforeUpdate',
      'Inner componentDidUpdate',
      'componentDidUpdate'
    ]);
    Horizon.unmountComponentAtNode(container);
    expect(container.textContent).toBe('');
    expect(LogUtils.getAndClear()).toEqual([
      'componentWillUnmount',
      'Inner componentWillUnmount'
    ]);
  });
});
