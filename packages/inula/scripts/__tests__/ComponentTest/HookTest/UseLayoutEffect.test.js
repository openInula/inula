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
import { getLogUtils } from '../../jest/testUtils';
import { Text } from '../../jest/commonComponents';

describe('useLayoutEffect Hook Test', () => {
  const {
    useState,
    useEffect,
    useLayoutEffect,
    act,
  } = Inula;
  const LogUtils = getLogUtils();
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
    Inula.render(<App />, container);
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
    Inula.render(<App num={1} />, container, () => LogUtils.log('Sync effect'));
    expect(LogUtils.getAndClear()).toEqual([
      1,
      // 同步在渲染之后
      'LayoutEffect',
      'Sync effect'
    ]);
    expect(container.querySelector('p').innerHTML).toBe('1');
    // 更新
    Inula.render(<App num={2} />, container, () => LogUtils.log('Sync effect'));
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
      Inula.render(<App num={0} />, container, () => LogUtils.log('callback effect'));
      expect(LogUtils.getAndClear()).toEqual([
        'num: 0',
        'num Layouteffect [0]',
        'callback effect'
      ]);
      expect(container.textContent).toBe('num: 0');
    });

    // 更新
    act(() => {
      Inula.render(<App num={1} />, container, () => LogUtils.log('callback effect'));
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
      Inula.render(null, container, () => LogUtils.log('callback effect'));
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
