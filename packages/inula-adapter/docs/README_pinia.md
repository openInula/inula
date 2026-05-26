## pinia接口差异

1、不支createPinia的相关函数，使用了是没有效果的
```js
it('not support createPinia', () => {
  const pinia = createPinia(); // 接口可以调用，但是没有效果
  const store = useStore(pinia); // 传入pinia也没有效果

  expect(store.name).toBe('a');
  expect(store.$state.name).toBe('a');
  expect(pinia.state.value.main.name).toBe('a'); // 不能通过pinia.state.value.main获取store
});
```

2、因为不支持createPinia，同样也不支持setActivePinia、getActivePinia()

3、不支持store.$patch
```js
it('can not be set with patch', () => {
  const pinia = createPinia();
  const store = useStore(pinia);

  store.$patch({ name: 'a' }); // 不支持
  // 改成
  store.$state.name = 'a'; // 可以改成直接赋值

  expect(store.name).toBe('a');
});
```

4、不支持store.$reset();
```ts
it('can not reset the state', () => {
  const store = useStore();
  store.name = 'Ed';
  store.nested.n++;
  store.$reset(); // 不支持
  expect(store.$state).toEqual({
    counter: 0,
    name: 'Eduardo',
    nested: {
      n: 0,
    },
  });
});
```

5、不支持store.$dispose，可以用store.$unsubscribe代替
```js
it('can not be disposed', () => {
  const useStore = defineStore({
    id: 'main',
    state: () => ({ n: 0 }),
  });

  const store = useStore();
  const spy = vi.fn();

  store.$subscribe(spy, { flush: 'sync' });
  store.$state.n++;
  expect(spy).toHaveBeenCalledTimes(1);

  expect(useStore()).toBe(store);

  // store.$dispose();
  // 改成
  store.$unsubscribe(spy);

  store.$state.n++;

  expect(spy).toHaveBeenCalledTimes(1);
});
```

6、支持$subscribe，不需要flush，默认就是sync
```js
it('can be $unsubscribe', () => {
  const useStore = defineStore({
    id: 'main',
    state: () => ({ n: 0 }),
  });

  const store = useStore();
  const spy = vi.fn();

  // store.$subscribe(spy, { flush: 'sync' });
  // 不需要flush，默认就是sync
  store.$subscribe(spy, { flush: 'sync' });
  store.$state.n++;
  expect(spy).toHaveBeenCalledTimes(1);

  expect(useStore()).toBe(store);
  store.$unsubscribe(spy);
  store.$state.n++;

  expect(spy).toHaveBeenCalledTimes(1);
});
```



