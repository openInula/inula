import Inula, {render, createRef, useReactive, useWatch, useCompute, For} from '../../../src/index';

describe('测试 watch', () => {
  it('watch 一个参数', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive(1);
      useWatch(() => {
        _rObj.get();
        fn();
      });

      rObj = _rObj;

      return <div ref={ref}>{_rObj}</div>;
    };

    render(<App />, container);
    rObj.set('2');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('watch 2个参数', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive(1);
      useWatch(_rObj, () => {
        fn();
      });
      rObj = _rObj;

      return <div ref={ref}>{_rObj}</div>;
    };

    render(<App />, container);
    rObj.set('2');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('watch 2个参数，第一个是函数', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive(1);
      useWatch(
        () => {
          _rObj.get();
        },
        () => {
          fn();
        }
      );
      rObj = _rObj;

      return <div ref={ref}>{_rObj}</div>;
    };

    render(<App />, container);
    rObj.set('2');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('响应式数据的孩子变更，watch也应该被触发', () => {
    let rObj;
    let ref = createRef();
    let fn = jest.fn();
    let appFn = jest.fn();
    let itemFn = jest.fn();

    const App = () => {
      const _rObj = useReactive([
        { id: 'id-1', name: 'p1' },
        { id: 'id-2', name: 'p2' },
        { id: 'id-3', name: 'p3' },
      ]);
      rObj = _rObj;

      useWatch(() => {
        _rObj.get();
        fn();
      });

      appFn();

      return (
        <div ref={ref}>
          <For each={_rObj}>
            {item => {
              itemFn();
              return (
                <li id={item.id} key={item.id}>
                  {item.name}
                </li>
              );
            }}
          </For>
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);
    expect(fn).toHaveBeenCalledTimes(1);

    rObj.push({ id: 'id-4', name: 'p4' });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);
    expect(fn).toHaveBeenCalledTimes(2);

    rObj[1].set({ id: 'id-2', name: 'p222' });
    let li = container.querySelector('#id-2');
    expect(li.innerHTML).toEqual('p222');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
