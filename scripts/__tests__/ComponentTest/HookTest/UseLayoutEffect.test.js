import * as Horizon from '@cloudsop/horizon/index.ts';
import * as LogUtils from '../../jest/logUtils';
import { Text } from '../../jest/commonComponents';

describe('useLayoutEffect Hook Test', () => {
  const {
    useState,
    useEffect,
    useLayoutEffect,
    act,
  } = Horizon;

  it('简单使用useLayoutEffect', () => {
    const App = () => {
      const [num, setNum] = useState(0);
      useLayoutEffect(() => {
        document.getElementById('p').style.display = num === 0 ? 'none' : 'inline';
      });
      return (
        <>
          <p style={{ display: 'block' }} id="p">{num}</p>
          <button onClick={() => setNum(num + 1)} />
        </>
      );
    };
    Horizon.render(<App />, container);
    expect(document.getElementById('p').style.display).toBe('none');
    container.querySelector('button').click();
    expect(container.querySelector('p').style.display).toBe('inline');
  });

  it('useLayoutEffect的触发时序', () => {
    const App = (props) => {
      useLayoutEffect(() => {
        LogUtils.log('LayoutEffect');
      });
      return <Text text={props.num} />;
    };
    Horizon.render(<App num={1} />, container, () => LogUtils.log('Sync effect'));
    expect(LogUtils.getAndClear()).toEqual([
      1,
      // 同步在渲染之后
      'LayoutEffect',
      'Sync effect'
    ]);
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 更新
    Horizon.render(<App num={2} />, container, () => LogUtils.log('Sync effect'));
    expect(LogUtils.getAndClear()).toEqual([
      2,
      'LayoutEffect',
      'Sync effect'
    ]);
    expect(container.querySelector('p').innerHTML).toBe('2');
  });

  it('创建，销毁useLayoutEffect', () => {
    const App = (props) => {
      useEffect(() => {
        LogUtils.log(`num effect [${props.num}]`);
        return () => {
          LogUtils.log('num effect destroy');
        };
      }, [props.num]);
      useLayoutEffect(() => {
        LogUtils.log(`num Layouteffect [${props.num}]`);
        return () => {
          LogUtils.log(`num [${props.num}] Layouteffect destroy`);
        };
      }, [props.num]);
      return <Text text={'num: ' + props.num} />;
    };

    act(() => {
      Horizon.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0',
        'num Layouteffect [0]',
        'callback effect'
      ]);
      expect(container.textContent).toBe('num: 0');
    });

    // 更新
    act(() => {
      Horizon.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      // 异步effect
      'num effect [0]',
      'num: 1',
      // 旧Layouteffect销毁
      'num [0] Layouteffect destroy',
      // 新Layouteffect建立
      'num Layouteffect [1]',
      'callback effect',
      // 异步旧的effect销毁
      'num effect destroy',
      // 异步新的effect建立
      'num effect [1]'
    ]);

    act(() => {
      Horizon.render(null, container, () => LogUtils.log('callback effect'));
    });
    expect(LogUtils.getAndClear()).toEqual([
      // 同步Layouteffect销毁
      'num [1] Layouteffect destroy',
      'callback effect',
      // 最后执行异步effect销毁
      'num effect destroy',
    ]);
  });
});
