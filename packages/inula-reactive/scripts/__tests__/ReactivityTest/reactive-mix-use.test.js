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

import Inula, {createRef, render, useReactive, useState, useEffect, useRef, Show} from '../../../src/index';

describe('传统API和响应式API混合使用', () => {
  it('混合使用1', () => {
    let rObj, isShow, update;
    const ref = createRef();
    const fn = jest.fn();

    const App = () => {
      const _isShow = useReactive(true);
      isShow = _isShow;

      const [_, setState] = useState({});

      update = () => setState({});
      return (
        <Show if={isShow}>
          <Child />
        </Show>
      );
    };

    const Child = () => {
      const _rObj = useReactive('blue');
      rObj = _rObj;

      fn();

      return <div ref={ref} className={_rObj}></div>;
    };

    render(<App />, container);
    expect(ref.current.className).toEqual('blue');

    // 改变了DOM结构
    isShow.set(false);
    expect(ref.current).toEqual(null);

    update();

    expect(ref.current).toEqual(null);
  });


  it('混合使用2', () => {
    // 全局变量来监听更新次数
    let guid = 0;

    function ReactiveComponent() {
      const data = useReactive({ count: 0 });
      const [count, setCount] = useState(0);

      const [dir, setDir] = useState("asc"); // 用于排序方向

      function add() {
        data.count.set((c) => c + 1);
      }
      function addCount() {
        setCount((c) => c + 1);
      }

      function toggleDir() {
        setDir((d) => (d === "asc" ? "desc" : "asc"));
      }

      const vnode1 = <div id={"count"}>我是静态数据：{count}</div>;

      const vnode2 = <div id={"rCount"}>我是响应数据：{data.count}</div>;


      return (
        <div>
          <button id={"reorder"} onClick={toggleDir}>点击切换顺序</button>
          <button id={"addRCount"} onClick={add}>点击++</button>
          <button id={"addCount"} onClick={addCount}>点击 count++</button>
          <div id={"content"}>
            {dir === "asc" ? [vnode1, vnode2] : [vnode2, vnode1]}
          </div>
        </div>
      );
    }

    render(<ReactiveComponent />, container);

    // 点击按钮触发reactive count加1
    container.querySelector('#addRCount').click();
    expect(container.querySelector('#rCount').innerHTML).toEqual('我是响应数据：1');

    // // 点击按钮触发count加1
    container.querySelector('#addCount').click();
    container.querySelector('#addCount').click();
    container.querySelector('#addCount').click();
    expect(container.querySelector('#count').innerHTML).toEqual('我是静态数据：3');
    expect(container.querySelector('#rCount').innerHTML).toEqual('我是响应数据：1');

    expect(container.querySelector('#content').innerHTML).toEqual('<div id="count">我是静态数据：3</div><div id="rCount">我是响应数据：1</div>');

    container.querySelector('#reorder').click();

    expect(container.querySelector('#content').innerHTML).toEqual('<div id="rCount">我是响应数据：1</div><div id="count">我是静态数据：3</div>');

  });


  it('混合使用3', () => {
    // 全局变量来监听更新次数
    let guid = 0;

    function ReactiveComponent() {
      const renderCount = ++useRef(0).current;

      const data = useReactive({ count: 0 });
      const [state, setState] = useState(0);

      const showData = useReactive({show:true});


      // 切换显示
      function handleClick() {
        showData.show.set(s=> !s)
      }
      function add() {
        data.count.set((c) => c + 1);
      }
      function addState() {
        setState((c) => c + 1);
      }
      // 监听生命周期
      const mounted = useRef();

      useEffect(() => {
        if (!mounted.current) {
          console.log("组件Mounted", guid++);
          mounted.current = true;
        } else {
          console.log("组件Updated", guid++);
        }
      });

      return (
        <div>
          <div>响应式数据：{data.count} </div>
          <div>传统state: {state}</div>
          <div>
            组件渲染次数renderCount:{renderCount} 或guid=：{guid}
          </div>
          <hr />
          <button onClick={handleClick}>点击切换显示</button>
          <button onClick={add}>点击++</button>
          <button onClick={addState}>点击state++</button>
          <hr />
          <div className="border">
            <Show if={showData.show}>
              <div>
                <h1>我会被隐藏</h1>
                <div>  我是响应式数据:{data.count}</div>
              </div>
            </Show>

            {showData.show.get() && (
              <div>
                <h1>我会被隐藏</h1>
                <div>  我是响应式数据:{data.count}</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    render(<ReactiveComponent />, container);

  });
});
