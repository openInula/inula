import * as Horizon from '@cloudsop/horizon/index.ts';
describe('FunctionComponent Test', () => {
  it('渲染无状态组件', () => {
    const App = (props) => {
      return <p>{props.text}</p>;
    };

    Horizon.render(<App text='app' />, container);
    expect(container.querySelector('p').innerHTML).toBe('app');
  });

  it('更新无状态组件', () => {
    const App = (props) => {
      return <p>{props.text}</p>;
    };

    Horizon.render(<App text='app' />, container);
    expect(container.querySelector('p').innerHTML).toBe('app');

    Horizon.render(<App text='ABC' />, container);
    expect(container.querySelector('p').innerHTML).toBe('ABC');

    Horizon.render(<App text='abc' />, container);
    expect(container.querySelector('p').innerHTML).toBe('abc');
  });

  it('卸载无状态组件', () => {
    const App = (props) => {
      return <p>{props.text}</p>;
    };

    Horizon.render(<App text='app' />, container);
    expect(container.querySelector('p').innerHTML).toBe('app');

    Horizon.unmountComponentAtNode(container);
    expect(container.querySelector('p')).toBe(null);
  });

  it('渲染空组件返回空子节点', () => {
    const App = () => {
      return <div />;
    };

    const realNode = Horizon.render(<App />, container);
    expect(realNode).toBe(null);
  });

}); 