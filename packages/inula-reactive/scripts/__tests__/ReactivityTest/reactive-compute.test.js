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
  createRef,
  For,
  reactive,
  render,
  useCompute,
  useReactive,
  computed,
} from '../../../src/index';

describe('computed 基本使用', () => {
  it('computed 返回的是一个响应式对象，用到的响应式对象是原始类型', () => {
    const rObj = reactive('123');
    const comp = computed(() => {
      return rObj.get() + '!!!';
    });
    expect(comp.get()).toEqual('123!!!');

    rObj.set('456');
    expect(comp.get()).toEqual('456!!!');
  });

  it('computed 返回的是一个响应式对象，用到两个响应式对象', () => {
    const rObj1 = reactive({ name: 'xiaoming' });
    const rObj2 = reactive({ age: 18 });
    const comp = computed(() => {
      return rObj1.name.get() + ' is ' + rObj2.age.get();
    });
    expect(comp.get()).toEqual('xiaoming is 18');
    rObj1.name.set('xiaowang');
    rObj2.set(prev => ({ age: prev.age + 2 }));
    expect(comp.get()).toEqual('xiaowang is 20');
  });

  it('computed 返回的是一个复杂响应式对象', () => {
    const rObj = reactive({ array: [1, 2, 3, 4, 5, 6] });
    const comp = computed(() => {
      return { newArray: rObj.array.get().filter(x => x > 4) };
    });
    expect(comp.get()).toEqual({ newArray: [5, 6] });
    expect(comp.newArray.get()).toEqual([5, 6]);
    rObj.array.push(...[100]);
    expect(comp.get()).toEqual({ newArray: [5, 6, 100] });
  });

  it('computed 返回的是一个响应式对象，用到的响应式对象是对象类型', () => {
    const rObj = reactive({ array: [1, 2, 3, 4, 5, 6] });
    const comp = computed(() => {
      return rObj.array.get().filter(x => x > 4);
    });
    expect(comp.get()).toEqual([5, 6]);

    rObj.array.set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(comp.get()).toEqual([5, 6, 7, 8, 9]);

    rObj.array.push(...[10, 11]);
    expect(comp.get()).toEqual([5, 6, 7, 8, 9, 10, 11]);

    rObj.set({ array: [100, 101, 102] });
    expect(comp.get()).toEqual([100, 101, 102]);
  });

  it('computed 返回的是一个复杂响应式对象2', () => {
    const rObj = reactive({ array: [1, 2, 3, 4, 5, 6] });
    const comp = computed(() => {
      return { newArray: rObj.array.get().filter(x => x > 4) };
    });
    expect(comp.newArray.get()).toEqual([5, 6]);
    rObj.array.push(...[7, 8]);
    expect(comp.newArray.get()).toEqual([5, 6, 7, 8]);
    rObj.array.set([1, 100, 101, 102]);
    expect(comp.newArray.get()).toEqual([100, 101, 102]);
    expect(comp.get()).toEqual({ newArray: [100, 101, 102] });
  });
});

describe('测试 useCompute', () => {
  it('useComputed基本使用 使用get方法(组件式更新)', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('123');
      rObj = _rObj;

      const _cObj = useCompute(() => {
        return _rObj.get() + '!!!';
      });
      fn();

      return <div ref={ref}>{_cObj.get()}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('123!!!');
    expect(fn).toHaveBeenCalledTimes(1);
    rObj.set('456');
    expect(ref.current.innerHTML).toEqual('456!!!');
    expect(fn).toHaveBeenCalledTimes(2);
    rObj.set('789');
    expect(ref.current.innerHTML).toEqual('789!!!');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('useComputed基本使用 直接使用对象(Dom级更新)', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const App = () => {
      const _rObj = useReactive('123');
      rObj = _rObj;

      const _cObj = useCompute(() => {
        return _rObj.get() + '!!!';
      });
      fn();

      return <div ref={ref}>{_cObj}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('123!!!');
    expect(fn).toHaveBeenCalledTimes(1);
    rObj.set('456');
    expect(ref.current.innerHTML).toEqual('456!!!');
    rObj.set('789');
    expect(ref.current.innerHTML).toEqual('789!!!');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('useComputed 基本使用2', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const compFn = jest.fn();
    const App = () => {
      const _rObj = useReactive({ array: [1, 2, 3, 4, 5, 6] });
      rObj = _rObj;

      const cObj = useCompute(() => {
        compFn();
        return { len: _rObj.array.get().filter(x => x >= 4).length };
      });

      fn();

      return <div ref={ref}>{cObj.len}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('3');
    rObj.array.push(...[7, 8]);
    expect(ref.current.innerHTML).toEqual('5');
    expect(fn).toHaveBeenCalledTimes(1);
    rObj.array.unshift(...[0, 100]);
    expect(ref.current.innerHTML).toEqual('6');
    rObj.set({ array: [1, 100, 101, 102, 103] });
    expect(ref.current.innerHTML).toEqual('4');
    expect(compFn).toHaveBeenCalledTimes(4);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('连锁useComputed使用', () => {
    let rObj;
    const ref = createRef();
    const fn = jest.fn();
    const compFn = jest.fn();
    const App = () => {
      const _rObj = useReactive(1);
      rObj = _rObj;

      const double = useCompute(() => _rObj.get() * 2);
      const dd = useCompute(() => {
        compFn();
        return double.get() * 2;
      });

      fn();

      return <div ref={ref}>{dd}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('4');
    expect(compFn).toHaveBeenCalledTimes(1);
    rObj.set('2');
    expect(ref.current.innerHTML).toEqual('8');
    expect(compFn).toHaveBeenCalledTimes(2);
    rObj.set('4');
    expect(ref.current.innerHTML).toEqual('16');
    expect(compFn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('useComputed中使用到了两个响应式对象', () => {
    let _rObj1;
    let _rObj2;
    const ref = createRef();
    const fn = jest.fn();
    const compFn = jest.fn();
    const App = () => {
      const rObj1 = useReactive({ name: 'xiaoming' });
      const rObj2 = useReactive({ age: 18 });
      _rObj1 = rObj1;
      _rObj2 = rObj2;

      const words = useCompute(() => {
        compFn();
        return `${rObj1.name.get()} is ${rObj2.age.get()}`;
      });

      fn();

      return <div ref={ref}>{words}</div>;
    };

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('xiaoming is 18');
    expect(compFn).toHaveBeenCalledTimes(1);
    _rObj1.name.set('xiaowang');
    expect(ref.current.innerHTML).toEqual('xiaowang is 18');
    expect(compFn).toHaveBeenCalledTimes(2);
    _rObj2.set({ age: 20 });
    expect(ref.current.innerHTML).toEqual('xiaowang is 20');
    expect(compFn).toHaveBeenCalledTimes(3);
    _rObj1.name.set('laowang');
    _rObj2.set({ age: 30 });
    expect(ref.current.innerHTML).toEqual('laowang is 30');
    expect(compFn).toHaveBeenCalledTimes(5);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('多个reactive的compute', () => {
    let a;
    const ref = createRef();
    const compFn = jest.fn();
    const computeFn = jest.fn();
    const App = () => {
      const _a = useReactive('a');
      const b = useReactive('b');
      const cond = useReactive(true);
      a = _a;
      const compute = useCompute(() => {
        computeFn();
        return cond.get() ? _a.get() : b.get();
      });

      compFn();

      return (
        <button
          ref={ref}
          className={compute}
          onClick={() => {
            cond.set(false);
          }}
        >
          {compute}
        </button>
      );
    };
    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('a');
    ref.current.click();
    expect(ref.current.innerHTML).toEqual('b');
    a.set('aa');

    expect(computeFn).toHaveBeenCalledTimes(3);

    expect(ref.current.innerHTML).toEqual('b');
  });

  it('useCompute返回一个数组对象', () => {
    let rObj;
    let cObj;
    let ref = createRef();
    let appFn = jest.fn();
    let itemFn = jest.fn();

    const App = () => {
      const _rObj = useReactive([
        { id: 'id-1', name: 'p1' },
        { id: 'id-2', name: 'p2' },
        { id: 'id-3', name: 'p3' },
      ]);
      rObj = _rObj;

      const _cObj = useCompute(() => {
        return _rObj.get().slice();
      });
      cObj = _cObj;

      appFn();

      return (
        <div ref={ref}>
          <For each={_cObj}>
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

    rObj.push({ id: 'id-4', name: 'p4' });

    items = container.querySelectorAll('li');
    expect(items.length).toEqual(4);

    // rObj[1].name.get();
    rObj[1].set({ id: 'id-2', name: 'p222' });
    let li = container.querySelector('#id-2');

    expect(li.innerHTML).toEqual('p222');

    // // 更新
    // cObj.set([true]);
    //
    // items = container.querySelectorAll('li');
    // expect(items.length).toEqual(1);
    // expect(appFn).toHaveBeenCalledTimes(1);
    //
    // // 第一次渲染执行3次，更新也触发了1次
    // expect(itemFn).toHaveBeenCalledTimes(4);
  });

  xit('测试compute在checkbox中的使用', () => {
    let a;
    const ref = createRef();
    const compFn = jest.fn();
    const computeFn = jest.fn();
    const App = () => {
      const rObj = useReactive({ checked: true });
      const checked = useCompute(() => {
        return rObj.checked.get();
      });

      compFn();

      return <Checkbox checked={checked} />;
    };
    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('a');
    ref.current.click();
    expect(ref.current.innerHTML).toEqual('b');
    a.set('aa');

    expect(computeFn).toHaveBeenCalledTimes(3);

    expect(ref.current.innerHTML).toEqual('b');
  });
});
