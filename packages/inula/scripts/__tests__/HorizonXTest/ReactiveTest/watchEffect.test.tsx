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

import { vueReactive } from '../../../../src';
import { nextTick } from '../../../../src/inulax/proxy/Scheduler';

const { reactive, toRaw, watchEffect } = vueReactive;

function stop(stopHandle: () => void) {
  stopHandle();
}

describe('test watchEffect', () => {
  it('should run the passed function once (wrapped by a effect)', () => {
    const fnSpy = jest.fn();
    watchEffect(fnSpy);
    expect(fnSpy).toHaveBeenCalledTimes(1);
  });

  it('should observe basic properties', async () => {
    let dummy;
    const counter = reactive({ num: 0 });
    watchEffect(() => {
      dummy = counter.num;
    });

    expect(dummy).toBe(0);
    counter.num = 7;
    await nextTick();
    expect(dummy).toBe(7);
  });

  it('should observe multiple properties', async () => {
    let dummy;
    const counter = reactive({ num1: 0, num2: 0 });
    watchEffect(() => (dummy = counter.num1 + counter.num1 + counter.num2));

    expect(dummy).toBe(0);
    counter.num1 = counter.num2 = 7;
    await nextTick();
    expect(dummy).toBe(21);
  });

  it('should handle multiple effects', async () => {
    let dummy1, dummy2;
    const counter = reactive({ num: 0 });
    watchEffect(() => (dummy1 = counter.num));
    watchEffect(() => (dummy2 = counter.num));

    expect(dummy1).toBe(0);
    expect(dummy2).toBe(0);
    counter.num++;
    await nextTick();
    expect(dummy1).toBe(1);
    expect(dummy2).toBe(1);
  });

  it('should observe nested properties', async () => {
    let dummy;
    const counter = reactive({ nested: { num: 0 } });
    watchEffect(() => (dummy = counter.nested.num));

    expect(dummy).toBe(0);
    counter.nested.num = 8;
    await nextTick();
    expect(dummy).toBe(8);
  });

  it('should observe delete operations', async () => {
    let dummy;
    const obj = reactive<{
      prop?: string;
    }>({ prop: 'value' });
    watchEffect(() => (dummy = obj.prop));

    expect(dummy).toBe('value');
    delete obj.prop;
    await nextTick();
    expect(dummy).toBe(undefined);
  });

  it('should observe has operations', async () => {
    let dummy;
    const obj = reactive<{ prop?: string | number }>({ prop: 'value' });
    watchEffect(() => {
      dummy = 'prop' in obj;
    });

    expect(dummy).toBe(true);
    delete obj.prop;
    await nextTick();
    expect(dummy).toBe(false);
    obj.prop = 12;
    await nextTick();
    expect(dummy).toBe(true);
  });

  it('should observe properties on the prototype chain', async () => {
    let dummy;
    const counter = reactive<{ num?: number }>({ num: 0 });
    const parentCounter = reactive({ num: 2 });
    Object.setPrototypeOf(counter, parentCounter);
    watchEffect(() => (dummy = counter.num));

    expect(dummy).toBe(0);
    delete counter.num;
    await nextTick();
    expect(dummy).toBe(2);
    parentCounter.num = 4;
    await nextTick();
    expect(dummy).toBe(4);
    counter.num = 3;
    await nextTick();
    expect(dummy).toBe(3);
  });

  it('should observe has operations on the prototype chain', async () => {
    let dummy;
    const counter = reactive<{ num?: number }>({ num: 0 });
    const parentCounter = reactive<{ num?: number }>({ num: 2 });
    Object.setPrototypeOf(counter, parentCounter);
    watchEffect(() => (dummy = 'num' in counter));

    expect(dummy).toBe(true);
    delete counter.num;
    await nextTick();
    expect(dummy).toBe(true);
    delete parentCounter.num;
    await nextTick();
    expect(dummy).toBe(false);
    counter.num = 3;
    await nextTick();
    expect(dummy).toBe(true);
  });

  it('should observe inherited property accessors', async () => {
    let dummy, parentDummy, hiddenValue: any;
    const obj = reactive<{ prop?: number }>({});
    const parent = reactive({
      set prop(value) {
        hiddenValue = value;
      },
      get prop() {
        return hiddenValue;
      },
    });
    Object.setPrototypeOf(obj, parent);
    watchEffect(() => (dummy = obj.prop));
    watchEffect(() => (parentDummy = parent.prop));

    expect(dummy).toBe(undefined);
    expect(parentDummy).toBe(undefined);
    obj.prop = 4;
    await nextTick();
    expect(dummy).toBe(4);
    // this doesn't work, should it?
    // expect(parentDummy).toBe(4)
    parent.prop = 2;
    await nextTick();
    expect(dummy).toBe(2);
    expect(parentDummy).toBe(2);
  });

  it('should observe function call chains', async () => {
    let dummy;
    const counter = reactive({ num: 0 });
    watchEffect(() => (dummy = getNum()));

    function getNum() {
      return counter.num;
    }

    expect(dummy).toBe(0);
    counter.num = 2;
    await nextTick();
    expect(dummy).toBe(2);
  });

  it('should observe iteration', async () => {
    let dummy;
    const list = reactive(['Hello']);
    watchEffect(() => (dummy = list.join(' ')));

    expect(dummy).toBe('Hello');
    list.push('World!');
    await nextTick();
    expect(dummy).toBe('Hello World!');
    list.shift();
    await nextTick();
    expect(dummy).toBe('World!');
  });

  it('should observe implicit array length changes', async () => {
    let dummy;
    const list = reactive(['Hello']);
    watchEffect(() => (dummy = list.join(' ')));

    expect(dummy).toBe('Hello');
    list[1] = 'World!';
    await nextTick();
    expect(dummy).toBe('Hello World!');
    list[3] = 'Hello!';
    await nextTick();
    expect(dummy).toBe('Hello World!  Hello!');
  });

  it('should observe sparse array mutations', async () => {
    let dummy;
    const list = reactive<string[]>([]);
    list[1] = 'World!';
    watchEffect(() => (dummy = list.join(' ')));

    expect(dummy).toBe(' World!');
    list[0] = 'Hello';
    await nextTick();
    expect(dummy).toBe('Hello World!');
    list.pop();
    await nextTick();
    expect(dummy).toBe('Hello');
  });

  it('should observe enumeration', async () => {
    let dummy = 0;
    const numbers = reactive<Record<string, number>>({ num1: 3 });
    watchEffect(() => {
      dummy = 0;
      for (const key in numbers) {
        dummy += numbers[key];
      }
    });

    expect(dummy).toBe(3);
    numbers.num2 = 4;
    await nextTick();
    expect(dummy).toBe(7);
    delete numbers.num1;
    await nextTick();
    expect(dummy).toBe(4);
  });

  it('should observe symbol keyed properties', async () => {
    const key = Symbol('symbol keyed prop');
    let dummy, hasDummy;
    const obj = reactive<{ [key]?: string }>({ [key]: 'value' });
    watchEffect(() => (dummy = obj[key]));
    watchEffect(() => (hasDummy = key in obj));

    expect(dummy).toBe('value');
    expect(hasDummy).toBe(true);
    obj[key] = 'newValue';
    await nextTick();
    expect(dummy).toBe('newValue');
    delete obj[key];
    await nextTick();
    expect(dummy).toBe(undefined);
    expect(hasDummy).toBe(false);
  });

  it('should not observe well-known symbol keyed properties', async () => {
    const key = Symbol.isConcatSpreadable;
    let dummy;
    const array: any = reactive([]);
    watchEffect(() => (dummy = array[key]));

    expect(array[key]).toBe(undefined);
    expect(dummy).toBe(undefined);
    array[key] = true;
    await nextTick();
    expect(array[key]).toBe(true);
    expect(dummy).toBe(undefined);
  });

  it('should observe function valued properties', async () => {
    const oldFunc = () => {};
    const newFunc = () => {};

    let dummy;
    const obj = reactive({ func: oldFunc });
    watchEffect(() => {
      dummy = obj.func;
    });

    expect(dummy).toBe(oldFunc);
    obj.func = newFunc;
    await nextTick();
    expect(dummy).toBe(newFunc);
  });

  it('should observe chained getters relying on this', async () => {
    const obj = reactive({
      a: 1,
      get b() {
        return this.a;
      },
    });

    let dummy;
    watchEffect(() => (dummy = obj.b));
    expect(dummy).toBe(1);
    obj.a++;
    await nextTick();
    expect(dummy).toBe(2);
  });

  it('should observe methods relying on this', async () => {
    const obj = reactive({
      a: 1,
      b() {
        return this.a;
      },
    });

    let dummy;
    watchEffect(() => (dummy = obj.b()));
    expect(dummy).toBe(1);
    obj.a++;
    await nextTick();
    expect(dummy).toBe(2);
  });

  it('should not observe set operations without a value change', async () => {
    let hasDummy, getDummy;
    const obj = reactive({ prop: 'value' });

    const getSpy = jest.fn(() => (getDummy = obj.prop));
    const hasSpy = jest.fn(() => (hasDummy = 'prop' in obj));
    watchEffect(getSpy);
    watchEffect(hasSpy);

    expect(getDummy).toBe('value');
    expect(hasDummy).toBe(true);
    obj.prop = 'value';
    await nextTick();
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(hasSpy).toHaveBeenCalledTimes(1);
    expect(getDummy).toBe('value');
    expect(hasDummy).toBe(true);
  });

  it('should not observe raw mutations', async () => {
    let dummy;
    const obj = reactive<{ prop?: string }>({});
    watchEffect(() => (dummy = toRaw(obj).prop));

    expect(dummy).toBe(undefined);
    obj.prop = 'value';
    await nextTick();
    expect(dummy).toBe(undefined);
  });

  it('should not be triggered by raw mutations', async () => {
    let dummy;
    const obj = reactive<{ prop?: string }>({});
    watchEffect(() => (dummy = obj.prop));

    expect(dummy).toBe(undefined);
    toRaw(obj).prop = 'value';
    await nextTick();
    expect(dummy).toBe(undefined);
  });

  it('should not be triggered by inherited raw setters', async () => {
    let dummy, parentDummy, hiddenValue: any;
    const obj = reactive<{ prop?: number }>({});
    const parent = reactive({
      set prop(value) {
        hiddenValue = value;
      },
      get prop() {
        return hiddenValue;
      },
    });
    Object.setPrototypeOf(obj, parent);
    watchEffect(() => (dummy = obj.prop));
    watchEffect(() => (parentDummy = parent.prop));

    expect(dummy).toBe(undefined);
    expect(parentDummy).toBe(undefined);
    toRaw(obj).prop = 4;
    await nextTick();
    expect(dummy).toBe(undefined);
    expect(parentDummy).toBe(undefined);
  });

  it('should avoid implicit infinite recursive loops with itself', async () => {
    const counter = reactive({ num: 0 });

    const counterSpy = jest.fn(() => {
      counter.num++;
    });
    watchEffect(counterSpy);
    expect(counter.num).toBe(1);
    expect(counterSpy).toHaveBeenCalledTimes(1);
    counter.num = 4;
    await nextTick();
    expect(counter.num).toBe(5);
    expect(counterSpy).toHaveBeenCalledTimes(2);
  });

  it('should allow explicitly recursive raw function loops', async () => {
    const counter = reactive({ num: 0 });
    const numSpy = jest.fn(() => {
      counter.num++;
      if (counter.num < 10) {
        numSpy();
      }
    });
    watchEffect(numSpy);
    expect(counter.num).toEqual(10);
    expect(numSpy).toHaveBeenCalledTimes(10);
  });

  it('should avoid infinite loops with other effects', async () => {
    const nums = reactive({ num1: 0, num2: 1 });

    const spy1 = jest.fn(() => (nums.num1 = nums.num2));
    const spy2 = jest.fn(() => (nums.num2 = nums.num1));
    watchEffect(spy1);
    watchEffect(spy2);
    expect(nums.num1).toBe(1);
    expect(nums.num2).toBe(1);
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
    nums.num2 = 4;
    await nextTick();
    expect(nums.num1).toBe(4);
    expect(nums.num2).toBe(4);
    expect(spy1).toHaveBeenCalledTimes(2);
    expect(spy2).toHaveBeenCalledTimes(2);
    nums.num1 = 10;
    await nextTick();
    expect(nums.num1).toBe(10);
    expect(nums.num2).toBe(10);
    expect(spy1).toHaveBeenCalledTimes(3);
    expect(spy2).toHaveBeenCalledTimes(3);
  });

  it('should return a new reactive version of the function', async () => {
    function greet() {
      return 'Hello World';
    }

    const effect1 = watchEffect(greet);
    const effect2 = watchEffect(greet);
    expect(typeof effect1).toBe('function');
    expect(typeof effect2).toBe('function');
    expect(effect1).not.toBe(greet);
    expect(effect1).not.toBe(effect2);
  });

  it('should discover new branches while running automatically', async () => {
    let dummy;
    const obj = reactive({ prop: 'value', run: false });

    const conditionalSpy = jest.fn(() => {
      dummy = obj.run ? obj.prop : 'other';
    });
    watchEffect(conditionalSpy);

    expect(dummy).toBe('other');
    expect(conditionalSpy).toHaveBeenCalledTimes(1);
    obj.prop = 'Hi';
    await nextTick();
    expect(dummy).toBe('other');
    expect(conditionalSpy).toHaveBeenCalledTimes(1);
    obj.run = true;
    await nextTick();
    expect(dummy).toBe('Hi');
    expect(conditionalSpy).toHaveBeenCalledTimes(2);
    obj.prop = 'World';
    await nextTick();
    expect(dummy).toBe('World');
    expect(conditionalSpy).toHaveBeenCalledTimes(3);
  });

  it('should not be triggered by mutating a property, which is used in an inactive branch', async () => {
    let dummy;
    const obj = reactive({ prop: 'value', run: true });

    const conditionalSpy = jest.fn(() => {
      dummy = obj.run ? obj.prop : 'other';
    });
    watchEffect(conditionalSpy);

    expect(dummy).toBe('value');
    expect(conditionalSpy).toHaveBeenCalledTimes(1);
    obj.run = false;
    await nextTick();
    expect(dummy).toBe('other');
    expect(conditionalSpy).toHaveBeenCalledTimes(2);
    obj.prop = 'value2';
    await nextTick();
    expect(dummy).toBe('other');
    expect(conditionalSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle deep effect recursion using cleanup fallback', async () => {
    const results = reactive([0]);
    const effects = [];
    for (let i = 1; i < 40; i++) {
      (index => {
        const fx = watchEffect(() => {
          results[index] = results[index - 1] * 2;
        });
        effects.push({ fx, index });
      })(i);
    }

    expect(results[39]).toBe(0);
    results[0] = 1;
    await nextTick();
    expect(results[39]).toBe(Math.pow(2, 39));
  });

  it('should run multiple times for a single mutation', async () => {
    let dummy;
    const obj = reactive<Record<string, number>>({});
    const fnSpy = jest.fn(() => {
      for (const key in obj) {
        dummy = obj[key];
      }
      dummy = obj.prop;
    });
    watchEffect(fnSpy);

    expect(fnSpy).toHaveBeenCalledTimes(1);
    obj.prop = 16;
    await nextTick();
    expect(dummy).toBe(16);
    expect(fnSpy).toHaveBeenCalledTimes(2);
  });

  it('should observe class method invocations', async () => {
    class Model {
      count: number;

      constructor() {
        this.count = 0;
      }

      inc() {
        this.count++;
      }
    }

    const model = reactive(new Model());
    let dummy;
    watchEffect(() => {
      dummy = model.count;
    });
    expect(dummy).toBe(0);
    model.inc();
    await nextTick();
    expect(dummy).toBe(1);
  });

  it('stop', async () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = watchEffect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    await nextTick();
    expect(dummy).toBe(2);
    stop(runner);
    obj.prop = 3;
    await nextTick();
    expect(dummy).toBe(2);
  });

  it('stop: a stopped effect is nested in a normal effect', async () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = watchEffect(() => {
      dummy = obj.prop;
    });
    runner();
    obj.prop = 2;
    await nextTick();
    expect(dummy).toBe(1);
  });

  it('should trigger all effects when array length is set to 0', async () => {
    const observed: any = reactive([1]);
    let dummy, record;
    watchEffect(() => {
      dummy = observed.length;
    });
    watchEffect(() => {
      record = observed[0];
    });
    expect(dummy).toBe(1);
    expect(record).toBe(1);

    observed[1] = 2;
    await nextTick();
    expect(observed[1]).toBe(2);

    observed.unshift(3);
    await nextTick();
    expect(dummy).toBe(3);
    expect(record).toBe(3);

    observed.length = 0;
    await nextTick();
    expect(dummy).toBe(0);
    expect(record).toBeUndefined();
  });

  it('should be triggered when set length with string', async () => {
    let ret1 = 'idle';
    let ret2 = 'idle';
    const arr1 = reactive(new Array(11).fill(0));
    const arr2 = reactive(new Array(11).fill(0));
    watchEffect(() => {
      ret1 = arr1[10] === undefined ? 'arr[10] is set to empty' : 'idle';
    });
    watchEffect(() => {
      ret2 = arr2[10] === undefined ? 'arr[10] is set to empty' : 'idle';
    });
    arr1.length = 2;
    arr2.length = '2' as any;
    await nextTick();
    expect(ret1).toBe(ret2);
  });

  it('should track hasOwnProperty', async () => {
    const obj: any = reactive({});
    let has = false;
    const fnSpy = jest.fn();

    watchEffect(() => {
      fnSpy();
      // eslint-disable-next-line no-prototype-builtins
      has = obj.hasOwnProperty('foo');
    });
    expect(fnSpy).toHaveBeenCalledTimes(1);
    expect(has).toBe(false);

    obj.foo = 1;
    await nextTick();
    expect(fnSpy).toHaveBeenCalledTimes(2);
    expect(has).toBe(true);

    delete obj.foo;
    await nextTick();
    expect(fnSpy).toHaveBeenCalledTimes(3);
    expect(has).toBe(false);

    // should not trigger on unrelated key
    obj.bar = 2;
    await nextTick();
    expect(fnSpy).toHaveBeenCalledTimes(3);
    expect(has).toBe(false);
  });
});
