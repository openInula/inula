/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { describe, it, expect, vi } from 'vitest';
import { createStore, registerStore } from '../../src/vuex/vuex';
import { useMapState, useMapMutations, useMapActions, useMapGetters } from '../../src/vuex/maps';
import { render } from '@cloudsop/horizon';
import '../utils/globalSetup';

describe('vuex maps API', () => {
  it('mapState (array)', () => {
    const store = createStore({
      state: {
        a: 1,
      },
      mutations: {
        inc: state => state.a++,
      },
    });
    registerStore(store);

    let _a;
    const Comp = () => {
      const { a } = useMapState(['a']);
      _a = a;

      return <>a: {a.value}</>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(_a.value).toBe(1);
    store.commit('inc');
    expect(_a.value).toBe(2);
  });

  it('mapState (object)', () => {
    const store = createStore({
      state: {
        a: 1,
      },
      getters: {
        b: () => 2,
      },
      mutations: {
        inc: state => state.a++,
      },
    });
    registerStore(store);

    let _a;
    const Comp = () => {
      const { a } = useMapState({
        a: (state, getters) => {
          return state.a + getters.b;
        },
      });
      _a = a;

      return <>a: {a.value}</>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(_a.value).toBe(3);
    store.commit('inc');
    expect(_a.value).toBe(4);
  });

  it('mapState (with namespace)', () => {
    const store = createStore({
      modules: {
        foo: {
          namespaced: true,
          state: { a: 1 },
          getters: {
            b: state => state.a + 1,
          },
          mutations: {
            inc: state => state.a++,
          },
        },
      },
    });
    registerStore(store);

    let _a;
    const Comp = () => {
      const { a } = useMapState('foo', {
        a: (state, getters) => {
          return state.a + getters.b;
        },
      });
      _a = a;

      return <>a: {a.value}</>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(_a.value).toBe(3);
    store.state.foo.a++;
    expect(_a.value).toBe(5);
  });

  it('mapMutations (array)', () => {
    const store = createStore({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--,
      },
    });
    registerStore(store);

    let _inc, _dec;
    const Comp = () => {
      const { inc, dec } = useMapMutations(['inc', 'dec']);
      _inc = inc;
      _dec = dec;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _inc();
    expect(store.state.count).toBe(1);
    _dec();
    expect(store.state.count).toBe(0);
  });

  it('mapMutations (object)', () => {
    const store = createStore({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--,
      },
    });
    registerStore(store);

    let _plus, _minus;
    const Comp = () => {
      const { plus, minus } = useMapMutations({
        plus: 'inc',
        minus: 'dec',
      });
      _plus = plus;
      _minus = minus;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _plus();
    expect(store.state.count).toBe(1);
    _minus();
    expect(store.state.count).toBe(0);
  });

  it('mapMutations (function)', () => {
    const store = createStore({
      state: { count: 0 },
      mutations: {
        inc(state, amount) {
          state.count += amount;
        },
      },
    });
    registerStore(store);

    let _plus;
    const Comp = () => {
      const { plus } = useMapMutations({
        plus(commit, amount) {
          commit('inc', amount + 1);
        },
      });
      _plus = plus;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _plus(42);
    expect(store.state.count).toBe(43);
  });

  it('mapMutations (with namespace)', () => {
    const store = createStore({
      modules: {
        foo: {
          namespaced: true,
          state: { count: 0 },
          mutations: {
            inc: state => state.count++,
            dec: state => state.count--,
          },
        },
      },
    });
    registerStore(store);

    let _plus, _minus;
    const Comp = () => {
      const { plus, minus } = useMapMutations('foo', {
        plus: 'inc',
        minus: 'dec',
      });
      _plus = plus;
      _minus = minus;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _plus();
    expect(store.state.foo.count).toBe(1);
    _minus();
    expect(store.state.foo.count).toBe(0);
  });

  it('mapMutations (function with namepsace)', () => {
    const store = createStore({
      modules: {
        foo: {
          namespaced: true,
          state: { count: 0 },
          mutations: {
            inc(state, amount) {
              state.count += amount;
            },
          },
        },
      },
    });
    registerStore(store);

    let _plus;
    const Comp = () => {
      const { plus } = useMapMutations('foo', {
        plus(commit, amount) {
          commit('inc', amount + 1);
        },
      });
      _plus = plus;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _plus(42);
    expect(store.state.foo.count).toBe(43);
  });

  it('mapGetters (array)', () => {
    const store = createStore({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--,
      },
      getters: {
        hasAny: ({ count }) => count > 0,
        negative: ({ count }) => count < 0,
      },
    });
    registerStore(store);

    let _hasAny, _negative;
    const Comp = () => {
      const { hasAny, negative } = useMapGetters(['hasAny', 'negative']);
      _hasAny = hasAny;
      _negative = negative;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(_hasAny.value).toBe(false);
    expect(_negative.value).toBe(false);
    store.commit('inc');
    expect(_hasAny.value).toBe(true);
    expect(_negative.value).toBe(false);
    store.commit('dec');
    store.commit('dec');
    expect(_hasAny.value).toBe(false);
    expect(_negative.value).toBe(true);
  });

  it('mapGetters (object)', () => {
    const store = createStore({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--,
      },
      getters: {
        hasAny: ({ count }) => count > 0,
        negative: ({ count }) => count < 0,
      },
    });
    registerStore(store);

    let _a, _b;
    const Comp = () => {
      const { a, b } = useMapGetters({
        a: 'hasAny',
        b: 'negative',
      });
      _a = a;
      _b = b;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(_a.value).toBe(false);
    expect(_b.value).toBe(false);
    store.commit('inc');
    expect(_a.value).toBe(true);
    expect(_b.value).toBe(false);
    store.commit('dec');
    store.commit('dec');
    expect(_a.value).toBe(false);
    expect(_b.value).toBe(true);
  });

  it('mapGetters (with namespace)', () => {
    const store = createStore({
      modules: {
        foo: {
          namespaced: true,
          state: { count: 0 },
          mutations: {
            inc: state => state.count++,
            dec: state => state.count--,
          },
          getters: {
            hasAny: ({ count }) => count > 0,
            negative: ({ count }) => count < 0,
          },
        },
      },
    });
    registerStore(store);

    let _a, _b;
    const Comp = () => {
      const { a, b } = useMapGetters('foo', {
        a: 'hasAny',
        b: 'negative',
      });
      _a = a;
      _b = b;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(_a.value).toBe(false);
    expect(_b.value).toBe(false);
    store.commit('foo/inc');
    expect(_a.value).toBe(true);
    expect(_b.value).toBe(false);
    store.commit('foo/dec');
    store.commit('foo/dec');
    expect(_a.value).toBe(false);
    expect(_b.value).toBe(true);
  });

  it('mapActions (array)', () => {
    const fna = vi.fn();
    const fnb = vi.fn();
    const store = createStore({
      actions: {
        a: fna,
        b: fnb,
      },
    });
    registerStore(store);

    let _a, _b;
    const Comp = () => {
      const { a, b } = useMapActions(['a', 'b']);
      _a = a;
      _b = b;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _a();
    expect(fna).toHaveBeenCalled();
    expect(fnb).not.toHaveBeenCalled();
    _b();
    expect(fnb).toHaveBeenCalled();
  });

  it('mapActions (object)', () => {
    const fna = vi.fn();
    const fnb = vi.fn();
    const store = createStore({
      actions: {
        a: fna,
        b: fnb,
      },
    });
    registerStore(store);

    let _foo, _bar;
    const Comp = () => {
      const { foo, bar } = useMapActions({
        foo: 'a',
        bar: 'b',
      });
      _foo = foo;
      _bar = bar;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _foo();
    expect(fna).toHaveBeenCalled();
    expect(fnb).not.toHaveBeenCalled();
    _bar();
    expect(fnb).toHaveBeenCalled();
  });

  it('mapActions (function)', () => {
    const fna = vi.fn();
    const store = createStore({
      actions: { a: fna },
    });
    registerStore(store);

    let _foo;
    const Comp = () => {
      const { foo } = useMapActions({
        foo(dispatch, arg) {
          dispatch('a', arg + 'bar');
        },
      });
      _foo = foo;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _foo('foo');
    expect(fna.mock.calls[0][1]).toBe('foobar');
  });

  it('mapActions (with namespace)', () => {
    const fna = vi.fn();
    const fnb = vi.fn();
    const store = createStore({
      modules: {
        foo: {
          namespaced: true,
          actions: {
            a: fna,
            b: fnb,
          },
        },
      },
    });
    registerStore(store);

    let _foo, _bar;
    const Comp = () => {
      const { foo, bar } = useMapActions('foo', {
        foo(dispatch, arg) {
          dispatch('a', arg + 'bar');
        },
        bar: 'b',
      });
      _foo = foo;
      _bar = bar;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _foo();
    expect(fna).toHaveBeenCalled();
    expect(fnb).not.toHaveBeenCalled();
    _bar();
    expect(fnb).toHaveBeenCalled();
  });

  it('mapActions (function with namespace)', () => {
    const fna = vi.fn();
    const store = createStore({
      modules: {
        foo: {
          namespaced: true,
          actions: { a: fna },
        },
      },
    });
    registerStore(store);

    let _foo;
    const Comp = () => {
      const { foo } = useMapActions('foo', {
        foo(dispatch, arg) {
          dispatch('a', arg + 'bar');
        },
      });
      _foo = foo;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    _foo('foo');
    expect(fna.mock.calls[0][1]).toBe('foobar');
  });

  it('should work together', () => {
    const actionAFn = vi.fn();
    const actionBFn = vi.fn();
    const store = createStore({
      modules: {
        foo: {
          namespaced: true,
          state: { count: 0 },
          getters: {
            isEven: state => state.count % 2 === 0,
          },
          mutations: {
            inc: state => state.count++,
            dec: state => state.count--,
          },
          actions: {
            actionA: actionAFn,
            actionB: actionBFn,
          },
        },
      },
    });
    registerStore(store);

    let _count, _isEven, _inc, _dec, _actionA, _actionB;
    const Comp = () => {
      const { count } = useMapState('foo', ['count']);
      _count = count;
      const { isEven } = useMapGetters('foo', ['isEven']);
      _isEven = isEven;
      const { inc, dec } = useMapMutations('foo', ['inc', 'dec']);
      _inc = inc;
      _dec = dec;
      const { actionA, actionB } = useMapActions('foo', ['actionA', 'actionB']);
      _actionA = actionA;
      _actionB = actionB;

      return <></>;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Comp />, container);

    expect(_count.value).toBe(0);
    expect(_isEven.value).toBe(true);
    store.state.foo.count++;
    expect(_count.value).toBe(1);
    expect(_isEven.value).toBe(false);
    _inc();
    expect(store.state.foo.count).toBe(2);
    expect(store.getters['foo/isEven']).toBe(true);
    _dec();
    expect(store.state.foo.count).toBe(1);
    expect(store.getters['foo/isEven']).toBe(false);
    _actionA();
    expect(actionAFn).toHaveBeenCalled();
    expect(actionBFn).not.toHaveBeenCalled();
    _actionB();
    expect(actionBFn).toHaveBeenCalled();
  });
});
