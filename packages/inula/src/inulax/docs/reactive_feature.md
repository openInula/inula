### reactive() 接口差异：

1、当前不支持markRaw接口。
```js
const obj = reactive({
  foo: { a: 1 },
  bar: markRaw({ b: 2 }),
});
expect(isReactive(obj.foo)).toBe(true);
expect(isReactive(obj.bar)).toBe(false);
```

2、对non-extensible属性当前会报错，不支持。
```js
it('should not observe non-extensible objects', () => {
  const obj = reactive({
    foo: Object.preventExtensions({ a: 1 }),
    // sealed or frozen objects are considered non-extensible as well
    bar: Object.freeze({ a: 1 }),
    baz: Object.seal({ a: 1 }),
  });
  expect(isReactive(obj.foo)).toBe(false);
  expect(isReactive(obj.bar)).toBe(false);
  expect(isReactive(obj.baz)).toBe(false);
});
```

3、不支持shallowReactive。
```js
it('should not make non-reactive properties reactive', () => {
  const props = shallowReactive({ n: { foo: 1 } })
  expect(isReactive(props.n)).toBe(false)
})
```


### ref() 接口差异：
1、不支持triggerRef。
```js
test('shallowRef force trigger', () => {
  const sref = shallowRef({ a: 1 })
  let dummy
  effect(() => {
    dummy = sref.value.a
  })
  expect(dummy).toBe(1)

  sref.value.a = 2
  expect(dummy).toBe(1) // should not trigger yet

  // force trigger
  triggerRef(sref)
  expect(dummy).toBe(2)
})
```

2、不支持toRef。
```js
it.skip('toRef on array', () => {
  const a = reactive(['a', 'b']);
  const r = toRef(a, 1);
  expect(r.value).toBe('b');
  r.value = 'c';
  expect(r.value).toBe('c');
  expect(a[1]).toBe('c');
});
```

3、不支持toRefs。
```js
it('toRefs', () => {
  const a = reactive({
    x: 1,
    y: 2,
  });

  const {x, y} = toRefs(a);

  expect(isRef(x)).toBe(true);
  expect(isRef(y)).toBe(true);
  expect(x.value).toBe(1);
  expect(y.value).toBe(2);
});
```
4、不支持customRef。
```js
it('customRef', () => {
  let value = 1;
  let _trigger: () => void;

  const custom = customRef((track, trigger) => ({
    get() {
      track();
      return value;
    },
    set(newValue: number) {
      value = newValue;
      _trigger = trigger;
    },
  }));

  expect(isRef(custom)).toBe(true);
});
```

### computed接口差异：
1、不是延迟计算，而是立即计算，这与vue的computed不同。
```js
it('should not compute lazily', () => {
  const value = reactive<{ foo?: number }>({});
  const getter = vi.fn(() => value.foo);
  const cValue = computed(getter);

  // not lazy
  expect(getter).toHaveBeenCalledTimes(1);
});
```

2、不支持setter。
```js
it('should not support setter', () => {
  const n = ref(1);
  const plusOne = computed({
    get: () => n.value + 1,
    set: val => {
      n.value = val - 1;
    },
  });
});
```

3、不是延时计算，会有副作用，每个数据变化都会触发。
```js
it('should trigger by each data changed', () => {
  const n = ref(0);
  const plusOne = computed(() => n.value + 1);
  const fn = vi.fn(() => {
    n.value;
    plusOne.value;
  });
  effect(fn);
  n.value++;
  // should call fn 3 times, 1 for init, 1 for n, 1 for plusOne
  expect(fn).toBeCalledTimes(3);
});
```

4、不支持isReadonly。
```js
it('should not support isReadonly', () => {
  const n = ref(1);
  const c = computed(() => n.value);
  expect(isReadonly(c)).toBe(false);
});
```

5. computed中不支持第二个参数debugOptions。
```js
const c = computed(() => 1, {
  onTrack, // 不支持
});
```

6. computed.effect.stop 改为 computed.stop。
```js
it('should no longer update when stopped', () => {
  const value = reactive<{ foo?: number }>({});
  const cValue = computed(() => value.foo);
  let dummy;
  effect(() => {
    dummy = cValue.value;
  });
  expect(dummy).toBe(undefined);
  value.foo = 1;
  expect(dummy).toBe(1);
  cValue.stop(); // cValue.effect.stop 改为 cValue.stop
  value.foo = 2;
  expect(dummy).toBe(1);
});
```

watch接口差异：
1、不支持deep，可以只传一个函数，那样会自动跟踪。
```js
it('deep', async () => {
  const state = reactive({
    nested: {
      count: ref(0),
    },
    array: [1, 2, 3],
    map: new Map([
      ['a', 1],
      ['b', 2],
    ]),
    set: new Set([1, 2, 3]),
  });

  let dummy;
  watch(
    () => state,
    state => {
      dummy = [
        state.nested.count,
        state.array[0],
        state.map.get('a'),
        state.set.has(1),
      ]
    }
  )

  state.nested.count++;
  expect(dummy).toEqual(undefined);

  // 改成：
  watch(
    () => {
      dummy = [
        state.nested.count,
        state.array[0],
        state.map.get('a'),
        state.set.has(1),
      ]
    }
  )
});
```
2、不支持immediate。
```js
it('immediate', async () => {
    const count = ref(0);
    const cb = vi.fn();
    watch(count, cb, { immediate: true });
    expect(cb).toHaveBeenCalledTimes(0);
  })
```
