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

const { ref, reactive, watch, watchEffect, computed } = vueReactive;

describe('test watch', () => {
  it('should watch effect', async () => {
    const state = reactive({ count: 0 });
    let dummy;
    watch(() => {
      dummy = state.count;
    });
    expect(dummy).toBe(0);

    state.count++;
    await nextTick();
    expect(dummy).toBe(1);
  });

  it('should watching single source: getter', async () => {
    const state = reactive({ count: 0 });
    let dummy;
    watch(
      () => state.count,
      (count, prevCount) => {
        dummy = [count, prevCount];
        // assert types
        count + 1;
        if (prevCount) {
          prevCount + 1;
        }
      }
    );
    state.count++;
    await nextTick();
    expect(dummy).toMatchObject([1, 0]);
  });

  it('should watching single source: ref', async () => {
    const count = ref(0);
    let dummy;
    const spy = jest.fn();
    watch(count, (count, prevCount) => {
      spy();
      dummy = [count, prevCount];
    });
    count.value++;
    await nextTick();
    expect(dummy).toMatchObject([1, 0]);
    expect(spy).toBeCalledTimes(1);
  });

  it('watching single source: array', async () => {
    const array = reactive([]);
    const spy = jest.fn((val, prevVal) => {
      let a = 1;
    });
    watch(array, spy);
    array.push(1);
    await nextTick();

    expect(spy).toBeCalledTimes(1);
  });

  it('watching single source: array1', async () => {
    const obj = reactive({ items: [2] });
    const spy = jest.fn((val, prevVal) => {});

    watch(() => obj.items, spy);

    expect(spy).toBeCalledTimes(0);

    obj.items = [1];
    await nextTick();

    expect(spy).toBeCalledTimes(1);
  });

  it('should not fire if watched getter result did not change', async () => {
    const spy = jest.fn();
    const n = ref(0);
    watch(() => n.value % 2, spy);

    n.value++;
    await nextTick();
    expect(spy).toBeCalledTimes(1);

    n.value += 2;
    await nextTick();
    // should not be called again because getter result did not change
    expect(spy).toBeCalledTimes(1);
  });

  it('watching single source: computed ref', async () => {
    const count = ref(0);
    const plus = computed(() => count.value + 1);
    let dummy;
    watch(plus, (count, prevCount) => {
      dummy = [count, prevCount];
      // assert types
      count + 1;
      if (prevCount) {
        prevCount + 1;
      }
    });
    count.value++;
    await nextTick();
    expect(dummy).toMatchObject([2, 1]);
  });

  it('watching primitive with deep: true', async () => {
    const count = ref(0);
    let dummy;
    watch(count, (c, prevCount) => {
      dummy = [c, prevCount];
    });
    count.value++;
    await nextTick();
    expect(dummy).toMatchObject([1, 0]);
  });

  it('directly watching reactive object (with automatic deep: true)', async () => {
    const src = reactive({
      count: 0,
    });
    let dummy;
    watch(src, ({ count }) => {
      dummy = count;
    });
    src.count++;
    await nextTick();
    expect(dummy).toBe(1);
  });

  it('directly watching reactive object with explicit deep: true', async () => {
    const src = reactive({
      state: {
        count: 0,
      },
    });
    let dummy;
    watch(
      src,
      ({ state }) => {
        dummy = state?.count;
      },
      { deep: true }
    );

    // nested should not trigger
    src.state.count++;
    await nextTick();
    expect(dummy).toBe(1);

    // root level should trigger
    src.state = { count: 2 };
    await nextTick();
    expect(dummy).toBe(2);
  });

  it('watching multiple sources', async () => {
    const spy = jest.fn();
    const state = reactive({ count: 1 });
    const count = ref(1);
    const plus = computed(() => count.value + 1);

    let dummy;
    watch([() => state.count, count, plus], (vals, oldVals) => {
      spy();
      dummy = [vals, oldVals];
      // assert types
      vals.concat(1);
      oldVals.concat(1);
    });

    state.count++;
    await nextTick();
    expect(dummy).toMatchObject([
      [2, 1, 2],
      [1, 1, 2],
    ]);
    expect(spy).toBeCalledTimes(1);

    count.value++;
    await nextTick();
    // count触发一次，plus触发一次
    expect(spy).toBeCalledTimes(3);
  });

  it('watching multiple sources: readonly array', async () => {
    const state = reactive({ count: 1 });
    const status = ref(false);

    let dummy;
    watch([() => state.count, status] as const, (vals, oldVals) => {
      dummy = [vals, oldVals];
      const [count] = vals;
      const [, oldStatus] = oldVals;
      // assert types
      count + 1;
      oldStatus === true;
    });

    state.count++;
    await nextTick();
    expect(dummy).toMatchObject([
      [2, false],
      [1, false],
    ]);
    status.value = true;
    await nextTick();
    expect(dummy).toMatchObject([
      [2, true],
      [2, false],
    ]);
  });

  it('watching multiple sources: reactive object (with automatic deep: true)', async () => {
    const src = reactive({ count: 0 });
    let dummy;
    watch([src], ([state]) => {
      dummy = state;
      // assert types
      state.count === 1;
    });
    src.count++;
    await nextTick();
    expect(dummy).toMatchObject({ count: 1 });
  });

  it('stopping the watcher (effect)', async () => {
    const state = reactive({ count: 0 });
    let dummy;
    const stop = watch(() => {
      dummy = state.count;
    });
    expect(dummy).toBe(0);

    stop();
    state.count++;
    await nextTick();
    // should not update
    expect(dummy).toBe(0);
  });

  it('stopping the watcher (with source)', async () => {
    const state = reactive({ count: 0 });
    let dummy;
    const stop = watch(
      () => state.count,
      count => {
        dummy = count;
      }
    );

    state.count++;
    await nextTick();
    expect(dummy).toBe(1);

    stop();
    state.count++;
    await nextTick();
    // should not update
    expect(dummy).toBe(1);
  });

  it('deep watch effect', async () => {
    const state = reactive({
      nested: {
        count: 0,
      },
      array: [1, 2, 3],
      map: new Map([
        ['a', 1],
        ['b', 2],
      ]),
      set: new Set([1, 2, 3]),
    });

    let dummy;
    watch(() => {
      dummy = [state.nested.count, state.array[0], state.map.get('a'), state.set.has(1)];
    });

    state.nested.count++;
    await nextTick();
    expect(dummy).toEqual([1, 1, 1, true]);

    // nested array mutation
    state.array[0] = 2;
    await nextTick();
    expect(dummy).toEqual([1, 2, 1, true]);

    // nested map mutation
    state.map.set('a', 2);
    await nextTick();
    expect(dummy).toEqual([1, 2, 2, true]);

    // nested set mutation
    state.set.delete(1);
    await nextTick();
    expect(dummy).toEqual([1, 2, 2, false]);
  });

  it('watching deep ref', async () => {
    const count = ref(0);
    const double = computed(() => count.value * 2);
    const state = reactive([count, double]);

    let dummy;
    watch(() => {
      dummy = [state[0].value, state[1].value];
    });

    count.value++;
    await nextTick();
    expect(dummy).toEqual([1, 2]);
  });

  it('warn and not respect deep option when using effect', async () => {
    const arr = ref([1, [2]]);
    const spy = jest.fn();
    watch(() => {
      spy();
      return arr;
    });
    expect(spy).toHaveBeenCalledTimes(1);
    (arr.value[1] as Array<number>)[0] = 3;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    // expect(`"deep" option is only respected`).toHaveBeenWarned()
  });

  test('watchEffect should not recursively trigger itself', async () => {
    const spy = jest.fn();
    const price = ref(10);
    const history = ref<number[]>([]);
    watch(() => {
      history.value.push(price.value);
      spy();
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('computed refs should not trigger watch if value has no change', async () => {
    const spy = jest.fn();
    const source = ref(0);
    const price = computed(() => source.value === 0);
    watch(price, spy);
    source.value++;
    source.value++;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('watching multiple sources: computed', async () => {
    let count = 0;
    const value = ref('1');
    const plus = computed(() => !!value.value);
    watch([plus], () => {
      count++;
    });
    value.value = '2';
    await nextTick();
    expect(plus.value).toBe(true);
    expect(count).toBe(0);
  });

  it('watch deep', async () => {
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
        dummy = [state.nested.count, state.array[0], state.map.get('a'), state.set.has(1)];
      },
      { deep: true }
    );

    state.nested.count++;
    await nextTick();
    expect(dummy).toEqual([1, 1, 1, true]);

    // nested array mutation
    state.array[0] = 2;
    await nextTick();
    expect(dummy).toEqual([1, 2, 1, true]);

    // nested map mutation
    state.map.set('a', 2);
    await nextTick();
    expect(dummy).toEqual([1, 2, 2, true]);

    // nested set mutation
    state.set.delete(1);
    await nextTick();
    expect(dummy).toEqual([1, 2, 2, false]);
  });

  it('watch deep, reset array', async () => {
    const spy = jest.fn();

    const state = reactive({
      array: [{ a: 1 }, 2, 3],
    });

    const ar = computed(() => {
      return state.array;
    });
    watch(() => ar, spy, { deep: true });

    expect(spy).toHaveBeenCalledTimes(0);

    state.array.push(4);
    await nextTick();

    expect(spy).toHaveBeenCalledTimes(1);

    state.array = [4, 3, 2, 1];
    await nextTick();

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('watch deep, listen child', async () => {
    const spy = jest.fn(() => {
      return true;
    });

    const dataReactive = reactive({
      inputItemsWithTip: {},
    });

    const obj = dataReactive.inputItemsWithTip;
    watch(() => obj, spy, { deep: true });

    expect(spy).toHaveBeenCalledTimes(0);

    dataReactive.inputItemsWithTip.array = [4, 3, 2, 1];
    await nextTick();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('immediate', async () => {
    const count = ref(0);
    const cb = jest.fn();
    watch(count, cb, { immediate: true });
    expect(cb).toHaveBeenCalledTimes(1);
    count.value++;
    await nextTick();
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('immediate: triggers when initial value is null', async () => {
    const state = ref(null);
    const spy = jest.fn();
    watch(() => state.value, spy, { immediate: true });
    expect(spy).toHaveBeenCalled();
  });

  it('immediate: triggers when initial value is undefined', async () => {
    const state = ref();
    const spy = jest.fn();
    watch(() => state.value, spy, { immediate: true });
    expect(spy).toHaveBeenCalledTimes(1);
    state.value = 3;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
    // testing if undefined can trigger the watcher
    state.value = undefined;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(3);
    // it shouldn't trigger if the same value is set
    state.value = undefined;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('warn immediate option when using effect', async () => {
    const count = ref(0);
    let dummy;
    watchEffect(
      () => {
        dummy = count.value;
      },
      // @ts-expect-error
      { immediate: false }
    );
    expect(dummy).toBe(0);
    // expect(`"immediate" option is only respected`).toHaveBeenWarned()

    count.value++;
    await nextTick();
    expect(dummy).toBe(1);
  });

  it('watching multiple sources: undefined initial values and immediate: true', async () => {
    const a = ref();
    const b = ref();
    let called = false;
    watch(
      [a, b],
      ([newA, newB], [oldA, oldB]) => {
        called = true;
        expect([newA, newB]).toMatchObject([undefined, undefined]);
        expect([oldA, oldB]).toMatchObject([undefined, undefined]);
      },
      { immediate: true }
    );
    await nextTick();
    expect(called).toBe(true);
  });
});
