/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import * as Inula from '../../../../libs/inula/index';

describe('useCallback Hook Test', () => {
  const { useState, useCallback } = Inula;

  it('测试useCallback', () => {
    const App = (props) => {
      const [num, setNum] = useState(0);
      const NumUseCallback = useCallback(() => {
        setNum(num + props.text);
      }, [props]);
      return (
        <>
          <p>{num}</p>
          <button onClick={NumUseCallback} />
        </>
      );
    };
    Inula.render(<App text={1} />, container);
    expect(container.querySelector('p').innerHTML).toBe('0');
    // 点击按钮触发num加1
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 再次点击，依赖项没变，num不增加
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('1');

    Inula.render(<App text={2} />, container);
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 依赖项有变化，点击按钮num增加
    container.querySelector('button').click();
    expect(container.querySelector('p').innerHTML).toBe('3');
  });
});
