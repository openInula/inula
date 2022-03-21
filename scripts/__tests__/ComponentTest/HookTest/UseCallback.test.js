import * as Horizon from '@cloudsop/horizon/index.ts';

describe('useCallback Hook Test', () => {
  const { useState, useCallback } = Horizon;

  it('测试useCallback', () => {
    const App = (props) => {
      const [num, setNum] = useState(0);
      const NumUseCallback = useCallback(() => {
        setNum(num + props.text)
      }, [props]);
      return (
        <>
          <p>{num}</p>
          <button onClick={NumUseCallback} />
        </>
      )
    }
    Horizon.render(<App text={1} />, container);
    expect(container.querySelector('p').innerHTML).toBe('0');
    // 点击按钮触发num加1
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 再次点击，依赖项没变，num不增加
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('1');

    Horizon.render(<App text={2} />, container);
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 依赖项有变化，点击按钮num增加
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('3');
  });
});
