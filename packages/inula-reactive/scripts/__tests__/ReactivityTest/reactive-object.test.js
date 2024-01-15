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

import Inula, {
  render,
  createRef,
  useReactive,
  useCompute,
  reactive,
  computed,
  watchReactive,
} from '../../../src/index';
import { GET_R_NODE } from '../../../src/reactive/proxy/RProxyHandler';
import { isAtom, isReactiveProxy, isRNode } from '../../../src/reactive/Utils';

describe('测试 useReactive(对象)', () => {
  it('reactive基本使用', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        color: 'blue',
      });
      rObj = _rObj;

      fn();

      return <div ref={ref}>{_rObj.color}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('blue');
    rObj.color.set('red');
    expect(rObj.color.get()).toEqual('red');
    expect(ref.current.innerHTML).toEqual('red');
    rObj.color.set(prev => prev + '!!');
    expect(rObj.color.get()).toEqual('red!!');
    expect(ref.current.innerHTML).toEqual('red!!');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('响应式对象赋值修改为一个对象', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        data: { framework: 'Vue' },
      });
      rObj = _rObj;

      fn();

      return <div ref={ref}>{_rObj.data.framework}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('Vue');
    rObj.data.set({ framework: 'React' });
    expect(rObj.data.framework.get()).toEqual('React');
    expect(ref.current.innerHTML).toEqual('React');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('赋值修改复杂响应式对象', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        data: { framework: { js: 'Vue' } },
      });
      rObj = _rObj;

      fn();

      return <div ref={ref}>{_rObj.data.framework.js}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('Vue');
    rObj.data.set({ framework: { js: 'React' } });
    expect(rObj.data.framework.get()).toEqual({ js: 'React' });
    expect(ref.current.innerHTML).toEqual('React');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('赋值修改响应式对象中Atom的值', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        rdata: { framework: 'Vue' },
      });
      rObj = _rObj;

      fn();

      return <div ref={ref}>{_rObj.rdata.framework}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('Vue');
    rObj.rdata.framework.set('React');
    expect(rObj.rdata.get()).toEqual({ framework: 'React' });
    expect(ref.current.innerHTML).toEqual('React');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('把响应式属性传递到子组件', () => {
    let rObj;
    const ref = createRef();
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    const App = () => {
      const _rObj = useReactive({
        data: {
          color: 'blue',
        },
      });
      rObj = _rObj;

      fn1();
      return <Child color={_rObj.data.color} />;
    };

    const Child = ({ color }) => {
      fn2();

      const cl = useCompute(() => {
        return 'cl-' + color.get();
      });

      return <div ref={ref} className={cl}></div>;
    };

    render(<App />, container);
    expect(ref.current.className).toEqual('cl-blue');
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    rObj.data.color.set('red');
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(ref.current.className).toEqual('cl-red');
  });

  it('reactive对象中“原始数据”被赋值为“对象”', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        data: 'blue',
      });
      rObj = _rObj;

      _rObj.data.set({ color: 'red' });

      fn();

      return <div ref={ref}>{_rObj.data.color}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('red');
    rObj.data.color.set('blue');
    expect(rObj.data.color.get()).toEqual('blue');
    expect(ref.current.innerHTML).toEqual('blue');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reactive对象中“对象”被赋值为“新对象”', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        data: {
          cl: 'blue',
        },
      });
      rObj = _rObj;

      _rObj.data.set({ color: 'red' });

      fn();

      return <div ref={ref}>{_rObj.data.color}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('red');
    rObj.data.color.set('blue');
    expect(rObj.data.color.get()).toEqual('blue');
    expect(ref.current.innerHTML).toEqual('blue');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('测试reactive数组', () => {
  it('reactive“数组”length的使用', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        data: [
          { name: 'p1', age: 1 },
          { name: 'p2', age: 2 },
        ],
      });
      rObj = _rObj;

      fn();

      // 在DOM中使用length无法精细响应式
      return <div ref={ref}>{_rObj.data.length}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('2');
    rObj.data.set([{ name: 'p1', age: 1 }]);
    expect(ref.current.innerHTML).toEqual('1');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('reactive“数组”的使用', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        data: [
          { name: 'p1', age: 1 },
          { name: 'p2', age: 2 },
        ],
      });
      rObj = _rObj;

      fn();

      return <div ref={ref}>{_rObj.data[0].name}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('p1');
    // 这种修改无法响应！
    // rObj.data.set([
    //   { name: 'p11', age: 1 },
    // ]);

    // 直接修改数组中被使用属性
    rObj.data[0].name.set('p11');
    expect(ref.current.innerHTML).toEqual('p11');
    // 在DOM中使用length无法精细响应式
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('jsx中通过items.get().map遍历reactive“数组”', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive({
        items: [
          { name: 'p1', id: 1 },
          { name: 'p2', id: 2 },
        ],
      });
      rObj = _rObj;

      fn();

      return (
        <div ref={ref}>
          {_rObj.items.get().map(item => {
            return <li key={item.id}>{item.name}</li>;
          })}
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);

    // 每次修改items都会触发整个组件刷新
    rObj.items.set([{ name: 'p11', age: 1 }]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(1);
    expect(fn).toHaveBeenCalledTimes(2);

    // 每次修改items都会触发整个组件刷新
    rObj.items.push({ name: 'p22', id: 2 });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('jsx中通过items.get().map遍历reactive“数组”，孩子是Item', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const Item = ({ item }) => {
      return <li key={item.id}>{item.name}</li>;
    };

    const App = () => {
      const _rObj = useReactive({
        items: [
          { name: 'p1', id: 1 },
          { name: 'p2', id: 2 },
        ],
      });
      rObj = _rObj;

      fn();

      return (
        <div ref={ref}>
          {/*items必须要调用get()才能map*/}
          {_rObj.items.get().map(item => {
            return <Item item={item} />;
          })}
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);
    expect(fn).toHaveBeenCalledTimes(1);

    // 每次修改items都会触发整个组件刷新
    rObj.items.set([{ name: 'p11', age: 1 }]);

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(1);
    expect(fn).toHaveBeenCalledTimes(2);

    // 每次修改items都会触发整个组件刷新
    rObj.items.push({ name: 'p22', id: 2 });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(2);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('jsx中通过items.map遍历reactive“数组”，具有响应式', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const Item = ({ item }) => {
      return <li key={item.id}>{item.name}</li>;
    };

    const App = () => {
      const _rObj = useReactive({
        items: [
          { name: 'p1', id: 1 },
          { name: 'p2', id: 2 },
          { name: 'p3', id: 3 },
        ],
      });
      rObj = _rObj;

      fn();

      return (
        <div ref={ref}>
          {_rObj.items.map(item => {
            return <Item item={item} />;
          })}
        </div>
      );
    };

    render(<App />, container);
    let items = container.querySelectorAll('li');
    expect(items.length).toEqual(3);
    expect(fn).toHaveBeenCalledTimes(1);

    rObj.items.set([
      { name: 'p11', age: 1 },
      { name: 'p22', age: 2 },
    ]);

    items = container.querySelectorAll('li');
    // 子元素不会响应式变化
    expect(items.length).toEqual(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('jsx中通过items.map遍历reactive“数组”，孩子是Item，Item对象具有响应式', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const Item = ({ item }) => {
      const id = useCompute(() => {
        return `id-${item.id.get()}`;
      });

      return (
        <li key={item.id} id={id}>
          {item.name}
        </li>
      );
    };

    const App = () => {
      const _rObj = useReactive({
        items: [
          { name: 'p1', id: 1 },
          { name: 'p2', id: 2 },
        ],
      });
      rObj = _rObj;

      fn();

      return (
        <div ref={ref}>
          {_rObj.items.map(item => {
            return <Item item={item} />;
          })}
        </div>
      );
    };

    render(<App />, container);
    let item = container.querySelector('#id-1');
    expect(item.innerHTML).toEqual('p1');
    expect(fn).toHaveBeenCalledTimes(1);

    rObj.items[0].name.set('p111');
    item = container.querySelector('#id-1');
    // 子元素会响应式变化
    expect(item.innerHTML).toEqual('p111');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('测试响应式数据', () => {
    const obj = reactive({
      data: [
        {
          id: '1',
          value: 'val-1',
        },
        {
          id: '2',
          value: 'val-2',
        },
      ],
    });

    // 使用，让创建children
    obj.data[1].value.read();

    obj.set({
      data: [
        {
          id: '11',
          value: 'val-11',
        },
      ],
    });

    obj.set({
      data: [
        {
          id: '111',
          value: 'val-111',
        },
        {
          id: '222',
          value: 'val-222',
        },
      ],
    });

    expect(obj.data[1].value.get()).toEqual('val-222');
  });

  it('响应式对象为复杂对象时，使用set重新设置', () => {
    const rObj = reactive({ data: [1, 2, 3, 4, 5, 6] });
    rObj.data.push(...[7, 8]);
    expect(rObj.data.get()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    rObj.data.set([100, 101]);
    expect(rObj.get()).toEqual({ data: [100, 101] });
  });

  it('使用set直接修改响应式对象数组中某个元素的值', () => {
    const rObj = reactive({ data: [1, 2, 3] });
    rObj.data.push(...[4, 5, 6]);
    expect(rObj.data.get()).toEqual([1, 2, 3, 4, 5, 6]);

    // 修改数组第4个元素
    rObj.data[1].set({ val: 2 });
    expect(rObj.get()).toEqual({ data: [1, { val: 2 }, 3, 4, 5, 6] });
  });

  it('使用set直接修改响应式对象数组中某个元素的值2', () => {
    const rObj = reactive({ data: [1, 2, 3] });
    rObj.data.push(...[4, 5, 6]);
    expect(rObj.data.get()).toEqual([1, 2, 3, 4, 5, 6]);

    // 修改数组第4个元素
    rObj.data[4].set({ val: 2 });
    expect(rObj.get()).toEqual({ data: [1, 2, 3, 4, { val: 2 }, 6] });
  });

  it('在删除数组中一个数字，再加一个对象，类型是RNode', () => {
    const rObj = reactive({ data: [1, 2, 3, 4] });
    // 使用最后一个数据，在children中创建出child
    rObj.data[3].get();
    // 删除最后一个数据
    rObj.data.set([1, 2, 3]);
    // 重新增加一个obj类型的数据
    rObj.data.set([1, 2, 3, { val: 4 }]);

    // rObj.data[3]是RNode
    expect(isRNode(rObj.data[3][GET_R_NODE])).toBeTruthy();

    expect(rObj.data[3].val.get()).toEqual(4);
  });

  xit('钻石问题', () => {
    const fn = jest.fn();
    const rObj = reactive(0);
    const evenOrOdd = computed(() => (rObj.get() % 2 === 0 ? 'even' : 'odd'));

    watchReactive(() => {
      fn();
      rObj.get();
      evenOrOdd.get();
    });

    rObj.set(1);

    // TODO
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('数组中的数据由“对象”变成“字符串”', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [
        { name: 'p1', id: 1 },
        { name: { n: 'p22' }, id: 2 },
      ],
    });

    watchReactive(rObj.items[1].name, () => {
      fn();
    });
    watchReactive(rObj.items[1].name.n, () => {
      fn1();
    });

    rObj.items.set([
      { name: 'p1', id: 1 },
      { name: 'p2', id: 2 }, // name 改为 基本数据类型
    ]);

    expect(fn).toHaveBeenCalledTimes(1);

    // 无法触发fn1
    expect(fn1).toHaveBeenCalledTimes(0);
  });

  it('数组中的数据由“字符串”变成“对象”', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [
        { name: 'p1', id: 1 },
        { name: 'p2', id: 2 },
      ],
    });

    watchReactive(rObj.items[1].name, () => {
      fn();
    });
    // 允许使用或监听没有定义的属性
    watchReactive(rObj.items[1].name.n, () => {
      fn1();
    });

    rObj.items.set([
      { name: 'p1', id: 1 },
      { name: { n: 'p22' }, id: 2 },
    ]);

    expect(fn).toHaveBeenCalledTimes(1);

    // 可以触发fn1
    expect(fn1).toHaveBeenCalledTimes(1);
  });

  it('访问一个不存在的属性，会抛出异常', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [{ name: 'p1' }, { name: 'p2' }],
    });

    watchReactive(() => {
      rObj.items[1].get();
      fn();
    });
    watchReactive(() => {
      // 会抛异常
      rObj.items[1].name.n.get();
      fn1();
    });

    rObj.items.set([{ name: 'p1' }, { name: { n: 'p22' } }]);

    expect(fn).toHaveBeenCalledTimes(2);

    // 无法触发fn1
    expect(fn1).toHaveBeenCalledTimes(2);
  });

  it('数组中的数据由“字符串”变成“对象”3', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [{ a: 1 }, 2, 3],
    });

    watchReactive(() => {
      rObj.items[1].get();
      fn();
    });

    rObj.items.set([2, 3, 4]);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('数组中的数据由“数字”变成“对象”', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [1, 2, 3],
    });

    watchReactive(() => {
      rObj.items[0].get();
      fn();
    });

    watchReactive(() => {
      rObj.get();
      fn1();
    });

    rObj.items.set([{ a: 1 }, 3, 4]);

    expect(fn).toHaveBeenCalledTimes(2);

    // 父数据也会触发
    expect(fn1).toHaveBeenCalledTimes(2);
  });

  it('数组中的数据由“对象”变成“数组”', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [{ a: 1 }, 2, 3],
    });

    watchReactive(() => {
      rObj.items[0].get();
      fn();
    });

    watchReactive(() => {
      rObj.get();
      fn1();
    });

    rObj.items.set([[1], 3, 4]);

    expect(fn).toHaveBeenCalledTimes(2);

    // 父数据也会触发
    expect(fn1).toHaveBeenCalledTimes(2);
  });

  it('数组中的数据由“空数组”变成“空数组”', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [[], 2, 3],
    });

    watchReactive(() => {
      rObj.items[0].get();
      fn();
    });

    watchReactive(() => {
      rObj.get();
      fn1();
    });

    rObj.items.set([[], 3, 4]);

    expect(fn).toHaveBeenCalledTimes(2);

    // 父数据也会触发
    expect(fn1).toHaveBeenCalledTimes(2);
  });

  it('数组中的2个数据由“对象”变成“对象”', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [{ a: { b: 1 }, b: { c: 2 } }, { a: 2 }, 3],
    });

    watchReactive(() => {
      rObj.items[0].a.get();
      rObj.items[0].b.get();
      fn();
    });

    watchReactive(() => {
      rObj.get();
      fn1();
    });

    // 第一个a 由{b: 1} -> {b: 2}能够精准更新
    rObj.items.set([{ a: { b: 2 }, b: { c: 3 } }, { a: 3 }, 4]);

    expect(fn).toHaveBeenCalledTimes(2);

    // 父数据也会触发
    expect(fn1).toHaveBeenCalledTimes(2);
  });

  it('数组中的2个数据由“对象”变成“对象”，前一个属性能精准更新，会触发后面那个', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    let fn2 = jest.fn();
    let fn3 = jest.fn();
    let fn4 = jest.fn();
    const rObj = reactive({
      items: [{ a: { b: 1 }, b: { c: 2 } }, { a: 2 }, 3],
    });

    watchReactive(() => {
      rObj.items[0].a.get();
      fn();
    });
    watchReactive(() => {
      // b由 { c: 2 } -> { c: 3 } 可以触发
      rObj.items[0].b.get();
      fn1();
    });
    watchReactive(() => {
      // b由 1 -> undefined 可以触发
      rObj.items[0].a.b.get();
      fn2();
    });
    watchReactive(() => {
      // c由 2 -> 3 可以触发
      rObj.items[0].b.c.get();
      fn3();
    });
    watchReactive(() => {
      rObj.get();
      fn4();
    });

    // 第一个a 由{b: 1} -> {d: 2}能够精准更新
    rObj.items.set([{ a: { d: 2 }, b: { c: 3 } }, { a: 3 }, 4]);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
    expect(fn3).toHaveBeenCalledTimes(2);

    // 父数据也会触发
    expect(fn4).toHaveBeenCalledTimes(2);
  });

  it('数组中的2个数据由“对象”变成“对象”，前一个属性不能精准更新，也不再触发后面那个', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    let fn2 = jest.fn();
    let fn3 = jest.fn();
    let fn4 = jest.fn();
    const rObj = reactive({
      items: [{ a: { b: 1 }, b: { c: 2 } }, { a: 2 }, 3],
    });

    watchReactive(() => {
      rObj.items[0].a.get();
      fn();
    });
    watchReactive(() => {
      // b由 { c: 2 } -> { c: 3 } 可以触发
      rObj.items[0].b.get();
      fn1();
    });
    watchReactive(() => {
      rObj.items[0].a.b.get();
      fn2();
    });
    watchReactive(() => {
      rObj.items[0].b.c.get();
      fn3();
    });
    watchReactive(() => {
      rObj.get();
      fn4();
    });

    // 第一个 a 由{b: 1} -> 1 不能够精准更新
    rObj.items.set([{ a: 1, b: { c: 3 } }, { a: 3 }, 4]);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn1).toHaveBeenCalledTimes(2);
    // 由 { b: 1 } -> 1 是不会触发 b 精准更新
    expect(fn2).toHaveBeenCalledTimes(1);
    // 前一个属性不能精准更新，也不触发后面那个的精准更新
    expect(fn3).toHaveBeenCalledTimes(1);

    // 父数据也会触发
    expect(fn4).toHaveBeenCalledTimes(2);
  });

  it('数组中的2个数据由“对象”变成“[]”，前一个属性不能精准更新，也不再触发后面那个', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    let fn2 = jest.fn();
    let fn3 = jest.fn();
    let fn4 = jest.fn();
    const rObj = reactive({
      items: [{ a: { b: 1 }, b: { c: 2 } }, { a: 2 }, 3],
    });

    watchReactive(() => {
      rObj.items[0].a.get();
      fn();
    });
    watchReactive(() => {
      // b由 { c: 2 } -> { c: 3 } 可以触发
      rObj.items[0].b.get();
      fn1();
    });
    watchReactive(() => {
      rObj.items[0].a.b.get();
      fn2();
    });
    watchReactive(() => {
      rObj.items[0].b.c.get();
      fn3();
    });
    watchReactive(() => {
      rObj.get();
      fn4();
    });

    // 第一个 a 由{b: 1} -> [] 不能够精准更新
    rObj.items.set([{ a: [], b: { c: 3 } }, { a: 3 }, 4]);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn1).toHaveBeenCalledTimes(2);
    // 由 { b: 1 } -> 1 是不会触发 b 精准更新
    expect(fn2).toHaveBeenCalledTimes(1);
    // 前一个属性不能精准更新，也不触发后面那个的精准更新
    expect(fn3).toHaveBeenCalledTimes(1);

    // 父数据也会触发
    expect(fn4).toHaveBeenCalledTimes(2);
  });

  it('数组中的2个数据由“对象”变成“null”，前一个属性不能精准更新，也不再触发后面那个', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    let fn2 = jest.fn();
    let fn3 = jest.fn();
    let fn4 = jest.fn();
    const rObj = reactive({
      items: [{ a: { b: 1 }, b: { c: 2 } }, { a: 2 }, 3],
    });

    watchReactive(() => {
      rObj.items[0].a.get();
      fn();
    });
    watchReactive(() => {
      // b由 { c: 2 } -> { c: 3 } 可以触发
      rObj.items[0].b.get();
      fn1();
    });
    watchReactive(() => {
      rObj.items[0].a.b.get();
      fn2();
    });
    watchReactive(() => {
      rObj.items[0].b.c.get();
      fn3();
    });
    watchReactive(() => {
      rObj.get();
      fn4();
    });

    // 第一个 a 由{b: 1} -> [] 不能够精准更新
    rObj.items.set([{ a: null, b: { c: 3 } }, { a: 3 }, 4]);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn1).toHaveBeenCalledTimes(2);
    // 由 { b: 1 } -> 1 是不会触发 b 精准更新
    expect(fn2).toHaveBeenCalledTimes(1);
    // 前一个属性不能精准更新，也不触发后面那个的精准更新
    expect(fn3).toHaveBeenCalledTimes(1);

    // 父数据也会触发
    expect(fn4).toHaveBeenCalledTimes(2);
  });

  it('执行基本数据数组的loop方法', () => {
    let fn = jest.fn();
    let fn1 = jest.fn();
    const rObj = reactive({
      items: [1, 2, 3, 4],
    });

    rObj.items.forEach(rItem => {
      expect(isReactiveProxy(rItem)).toBeTruthy();
    });

    watchReactive(() => {
      rObj.items.get();
      fn();
    });
    watchReactive(() => {
      rObj.get();
      fn1();
    });

    rObj.items.set([1, 2, 3]);

    expect(fn).toHaveBeenCalledTimes(2);

    // 父数据也会触发
    expect(fn1).toHaveBeenCalledTimes(2);
  });
});
