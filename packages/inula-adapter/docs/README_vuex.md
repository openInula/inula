## vuex接口差异

1、createStore接口中的，state、mutations、actions、getters不能用相同名字属性
```js
it('dispatching actions, sync', () => {
  const store = createStore({
    state: {
      a: 1
    },
    mutations: {
      [TEST] (state, n) {
        state.a += n
      }
    },
    actions: {
      [TEST] ({ commit }, n) {
        commit(TEST, n)
      }
    }
  })
  store.dispatch(TEST, 2)
  expect(store.state.a).toBe(3)
})
```

2、createStore接口不支持strict属性
```js
const store = createStore({
  state: {
    a: 1
  },
  mutations: {
    [TEST] (state, n) {
      state.a += n
    }
  },
  actions: {
    [TEST] ({ commit }, n) {
      commit(TEST, n)
    }
  },
  strict: true
})
```

3、store.registerModule不支持传入数组，只支持一层的module注册
```js
it('dynamic module registration with namespace inheritance', () => {
  const store = createStore({
    modules: {
      a: {
        namespaced: true,
      },
    },
  });
  const actionSpy = vi.fn();
  const mutationSpy = vi.fn();
  store.registerModule(['a', 'b'], {
    state: { value: 1 },
    getters: { foo: state => state.value },
    actions: { foo: actionSpy },
    mutations: { foo: mutationSpy },
  });

  expect(store.state.a.b.value).toBe(1);
  expect(store.getters['a/foo']).toBe(1);

  store.dispatch('a/foo');
  expect(actionSpy).toHaveBeenCalled();

  store.commit('a/foo');
  expect(mutationSpy).toHaveBeenCalled();
});
```
4、createStore不支持多层mudule注册
```js
it('module: mutation', function () {
  const mutations = {
    [TEST](state, n) {
      state.a += n;
    },
  };
  const store = createStore({
    state: {
      a: 1,
    },
    mutations,
    modules: { // 第一层module，支持
      nested: {
        state: {a: 2},
        mutations,
        modules: { // 第二层module，不支持
          one: {
            state: {a: 3},
            mutations,
          },
          nested: {
            modules: {  // 第三层module，不支持
              two: {
                state: {a: 4},
                mutations,
              },
              three: {
                state: {a: 5},
                mutations,
              },
            },
          },
        },
      },
      four: {
        state: {a: 6},
        mutations,
      },
    },
  });
});
```

4、不支持store.replaceState
```js
const store = createStore({});
store.replaceState({ a: { foo: 'state' } });
```
5、store.registerModule不支持传入options参数
```js
store.registerModule(
  'a',
  {
    namespaced: true,
    getters: { foo: state => state.foo },
    actions: { foo: actionSpy },
    mutations: { foo: mutationSpy },
  },
  { preserveState: true }
);
```

5、dispatch不支持传入options参数
```js
dispatch('foo', null, {root: true});
```

6、不支持action中的root属性，action需要是个函数
```js
const store = createStore({
  modules: {
    a: {
      namespaced: true,
      actions: {
        [TEST]: {
          root: true,
          handler() {
            return 1;
          },
        },
      },
    },
  }
});
```

7、createStore中不支持plugins
```js
const store = createStore({
  state: {
    a: 1,
  },
  mutations: {
    [TEST](state, n) {
      state.a += n;
    },
  },
  actions: {
    [TEST]: actionSpy,
  },
  plugins: [ // 不支持plugins
    store => {
      initState = store.state;
      store.subscribe((mut, state) => {
        expect(state).toBe(state);
        mutations.push(mut);
      });
      store.subscribeAction(subscribeActionSpy);
    },
  ],
});
```
