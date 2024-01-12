/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import Inula, { render, createRef, useReactive, useComputed, For, Show, Switch } from '../../../../src/index';

describe('测试Switch、Show、For标签的组合使用时的组件渲染', () => {
  it('Show、For标签的组合使用', () => {
    const Item = ({ item }) => {
      return <li key={item.id}>{item.name}</li>;
    };

    let reactiveObj;
    const ref = createRef();
    const ref1 = createRef();
    const fn = jest.fn();

    const App = () => {
      const dataList = useReactive([]);
      reactiveObj = dataList;

      const listLen = useComputed(() => {
        return dataList.get().length;
      });

      fn();

      return (
        <>
          <Show if={() => dataList.get().length > 0} else={() => <div />}>
            <div ref={ref} style={{ display: 'flex' }}>
              <For each={dataList}>{item => <Item item={item} />}</For>
            </div>
          </Show>
          <div ref={ref1}>{listLen}</div>
        </>
      );
    };
    render(<App />, container);

    let liItems = container.querySelectorAll('li');
    expect(liItems.length).toEqual(0);

    reactiveObj.push({ id: 1, name: '1' });
    expect(reactiveObj.get().length).toEqual(1);
    liItems = container.querySelectorAll('li');
    expect(liItems.length).toEqual(1);

    reactiveObj.push({ id: 2, name: '2' });
    expect(reactiveObj.get().length).toEqual(2);
    liItems = container.querySelectorAll('li');
    expect(liItems.length).toEqual(2);

    expect(ref1.current.innerHTML).toEqual('2');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('Switch、Show和For标签的组合使用', () => {
    const Item = ({ item }) => {
      return <li key={item.id}>{item.name}</li>;
    };

    let reactiveObj;
    const ref = createRef();
    const App = () => {
      const dataList = useReactive([]);
      reactiveObj = dataList;

      return (
        <Switch>
          <Show if={() => dataList.get().length === 0}>
            <div />
          </Show>
          <Show if={() => dataList.get().length > 0}>
            <div ref={ref} style={{ display: 'flex' }}>
              <For each={dataList}>{item => <Item item={item} />}</For>
            </div>
          </Show>
        </Switch>
      );
    };
    render(<App />, container);

    let liItems = container.querySelectorAll('li');
    expect(liItems.length).toEqual(0);

    reactiveObj.push({ id: 1, name: '1' });
    expect(reactiveObj.get().length).toEqual(1);

    liItems = container.querySelectorAll('li');
    expect(liItems.length).toEqual(1);
  });
});
