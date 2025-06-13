优化内容：
1. 抽取getValOrProxy函数，减少18处重复代码
2. 抽取watchProp函数，减少7处重复代码
3. 抽取watchEffect函数
4. 抽取registerListener函数
5. 删除无用代码，hookObserver其实并没有使用
```js
const boundHandler = {};
  Object.entries(handler).forEach(([id, val]) => {
    boundHandler[id] = (...args: any[]) => {
      return (val as any)(...args, hookObserver);
    };
  });
  return new Proxy(rawObj, { ...boundHandler });
```
6. 统一抽取常量，如：
```js
```
7. 增加watchEffect函数
8. 删除WeakMapProxy中handler的add和clear方法，因为WeakMap并不存在这两个方法
9. ObjectProxy中的handler增加deleteProperty方法，处理delete操作
```js
  let dummy;
  const obj = reactive<{
    prop?: string;
  }>({ prop: 'value' });
  effect(() => (dummy = obj.prop));

  expect(dummy).toBe('value');
  delete obj.prop;
  expect(dummy).toBe(undefined);
```
10. ObjectProxy中的handler增加has方法，处理in操作
```js
  let dummy;
  const obj = reactive<{ prop?: string | number }>({ prop: 'value' });
  effect(() => {
    dummy = 'prop' in obj;
  });

  expect(dummy).toBe(true);
  delete obj.prop;
  expect(dummy).toBe(false);
  obj.prop = 12;
  expect(dummy).toBe(true);
```
11. 当前不支持for (let key in numbers)这种写法
```js
it('should observe enumeration', () => {
  let dummy = 0;
  const numbers = reactive<Record<string, number>>({ num1: 3 });
  effect(() => {
    dummy = 0;
    for (let key in numbers) {
      dummy += numbers[key];
    }
  });

  expect(dummy).toBe(3);
  numbers.num2 = 4;
  expect(dummy).toBe(7);
  delete numbers.num1;
  expect(dummy).toBe(4);
});
```

12. watchEffect中的watcher不支持第二个参数options
```js
const runner = effect(
  () => {
    dummy = obj.foo;
  },
  { onTrigger }
);
```
13. 不支持readonly
