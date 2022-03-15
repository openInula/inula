/* eslint-disable no-undef */
import * as React from '../../../../libs/horizon/src/external/Horizon';
import * as HorizonDOM from '../../../../libs/horizon/src/dom/DOMExternal';

describe('useCallback Hook Test', () => {
  const { useState, useCallback } = React;

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
    HorizonDOM.render(<App text={1} />, container);
    expect(container.querySelector('p').innerHTML).toBe('0');
    // 点击按钮触发num加1
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 再次点击，依赖项没变，num不增加
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('1');

    HorizonDOM.render(<App text={2} />, container);
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 依赖项有变化，点击按钮num增加
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('3');
  });
});
