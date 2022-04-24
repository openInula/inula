import * as Horizon from '@cloudsop/horizon/index.ts';
import { getLogUtils } from '../../jest/testUtils';
import { Text } from '../../jest/commonComponents';

describe('useRef Hook Test', () => {
  const { useState, useRef } = Horizon;
  const LogUtils = getLogUtils();

  it('测试useRef', () => {
    const App = () => {
      const [num, setNum] = useState(1);
      const ref = useRef();
      if (!ref.current) {
        ref.current = num;
      }
      return (
        <>
          <p>{num}</p>
          <p id="sp">{ref.current}</p>
          <button onClick={() => setNum(num + 1)} />
        </>
      );
    };
    Horizon.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('1');
    expect(container.querySelector('#sp').innerHTML).toBe('1');
    // 点击按钮触发num加1,ref不变
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('2');
    expect(container.querySelector('#sp').innerHTML).toBe('1');
  });

  it('更新current值时不会re-render', () => {
    const App = () => {
      const ref = useRef(1);
      return (
        <>
          <button onClick={() => {
            ref.current += 1;
          }}>
            button
          </button>
          <Text text={ref.current} />;
        </>
      );
    };
    Horizon.render(<App />, container);
    expect(LogUtils.getAndClear()).toEqual([1]);
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 点击按钮触发ref.current加1
    container.querySelector('button').click();
    // ref.current改变不会触发重新渲染
    expect(LogUtils.getAndClear()).toEqual([]);
    expect(container.querySelector('p').innerHTML).toBe('1');
  });
});
