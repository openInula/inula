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

const { ref, reactive, watchEffect, computed, watch } = vueReactive;

describe('test computed', () => {
  it('should correctly update the computed value', async () => {
    const data = reactive<{ bar?: string }>({});
    const computedData = computed(() => {
      return data.bar;
    });
    expect(computedData.value).toBe(undefined);
    data.bar = 'test';
    await nextTick();
    expect(computedData.value).toBe('test');
  });

  it('should validate the effect trigger', async () => {
    const data = reactive<{ key?: number }>({});
    const computedData = computed(() => {
      return data.key;
    });
    let result;
    watchEffect(() => {
      result = computedData.value;
    });
    expect(result).toBe(undefined);

    data.key = 2;
    await nextTick();
    expect(result).toBe(2);
  });

  it('should validate the computation chain', async () => {
    const data = reactive({ bar: 0 });
    const c1 = computed(() => data.bar);
    const c2 = computed(() => c1.value + 2);
    expect(c2.value).toBe(2);
    expect(c1.value).toBe(0);
    data.bar += 2;
    await nextTick();
    expect(c2.value).toBe(4);
    expect(c1.value).toBe(2);
  });

  it('should validate the computation sequence', async () => {
    const data = reactive({ key: 0 });
    const getter1 = jest.fn(() => data.key);
    const getter2 = jest.fn(() => {
      return c1.value + 3;
    });
    const c1 = computed(getter1);
    const c2 = computed(getter2);

    let result;
    watchEffect(() => {
      result = c2.value;
    });
    expect(result).toBe(3);
    expect(getter1).toHaveBeenCalledTimes(1);
    expect(getter2).toHaveBeenCalledTimes(1);
    data.key += 2;
    await nextTick();
    expect(result).toBe(5);

    expect(getter1).toHaveBeenCalledTimes(2);
    expect(getter2).toHaveBeenCalledTimes(2);
  });

  it('should validate the computation process', async () => {
    const reactiveData = reactive({ key: 0 });
    const getterFunc1 = jest.fn(() => reactiveData.key);
    const getterFunc2 = jest.fn(function () {
      return computedValue1.value + 2;
    });
    const computedValue1 = computed(getterFunc1);
    const computedValue2 = computed(getterFunc2);

    let computedResult;
    watchEffect(() => {
      computedResult = computedValue1.value + computedValue2.value;
    });
    expect(computedResult).toBe(2);

    expect(getterFunc1).toHaveBeenCalledTimes(1);
    expect(getterFunc2).toHaveBeenCalledTimes(1);
    reactiveData.key++;
    await nextTick();
    expect(computedResult).toBe(4);

    expect(getterFunc1).toHaveBeenCalledTimes(2);
    expect(getterFunc2).toHaveBeenCalledTimes(2);
  });

  it('should validate the computation halt', async function () {
    const reactiveObj = reactive<{ key1?: number }>({});
    const computedObj = computed(() => {
      return reactiveObj.key1;
    });
    let resultValue;
    watchEffect(() => {
      resultValue = computedObj.value;
    });
    expect(resultValue).toBe(undefined);
    reactiveObj.key1 = 3;
    await nextTick();
    expect(resultValue).toBe(3);
    computedObj.stop();
    reactiveObj.key1 = 4;
    await nextTick();
    expect(resultValue).toBe(3);
  });

  it('should validate the computation changes', async () => {
    const numRef = ref(0);
    const increment = computed(() => numRef.value + 2);
    const testFn = jest.fn(() => {
      numRef.value;
      increment.value;
    });
    watchEffect(testFn);
    numRef.value += 3;
    await nextTick();
    // should call testFn 2 times, 1 for init, 1 for numRef
    expect(testFn).toBeCalledTimes(2);
  });

  it('should validate the computation stop', () => {
    const reactiveObj = reactive<{ key1?: number }>({ key1: 1 });
    const computedObj = computed(() => reactiveObj.key1);
    computedObj.stop();
    expect(computedObj.value).toBe(1);
  });

  it('should validate data changes in a non-lazy manner', async () => {
    const spyFunction = jest.fn();

    const refData = ref<null | { num: number }>({
      num: 3,
    });
    const computedData1 = computed(() => {
      return refData.value;
    });
    const computedData2 = computed(() => {
      spyFunction();
      return computedData1.value?.num;
    });
    const computedData3 = computed(() => {
      if (computedData1.value) {
        return computedData2.value;
      }
      return 0;
    });

    computedData3.value;
    expect(spyFunction).toHaveBeenCalledTimes(1);
    refData.value!.num = 4;
    computedData3.value;
    expect(spyFunction).toHaveBeenCalledTimes(2);
  });

  it('should validate the computation of item status', async () => {
    let statusMessage: string | undefined;

    const itemList = ref<number[]>();
    const isNotEmpty = computed(() => {
      return !!itemList.value;
    });
    const status = computed(() => {
      if (isNotEmpty.value) {
        return 'Items are available';
      } else {
        return 'No items available';
      }
    });

    watchEffect(() => {
      statusMessage = status.value;
    });

    itemList.value = [4, 5, 6];
    itemList.value = [7, 8, 9];
    itemList.value = undefined;

    await nextTick();

    expect(statusMessage).toBe('No items available');
  });

  it('chained computed dirty reallocation after trigger computed getter', async () => {
    let _msg: string | undefined;

    const items = ref<number[]>();
    const isLoaded = computed(() => {
      return !!items.value;
    });
    const msg = computed(() => {
      if (isLoaded.value) {
        return 'The items are loaded';
      } else {
        return 'The items are not loaded';
      }
    });

    _msg = msg.value;
    items.value = [1, 2, 3];
    isLoaded.value; // <- trigger computed getter
    _msg = msg.value;
    items.value = undefined;
    await nextTick();

    _msg = msg.value;

    expect(_msg).toBe('The items are not loaded');
  });

  it('should trigger by the second computed that maybe dirty', async () => {
    const cSpy = jest.fn();

    const src1 = ref(0);
    const src2 = ref(0);
    const c1 = computed(() => src1.value);
    const c2 = computed(() => (src1.value % 2) + src2.value);
    const c3 = computed(() => {
      cSpy();
      c1.value;
      c2.value;
    });

    c3.value;
    src1.value = 2;
    c3.value;
    expect(cSpy).toHaveBeenCalledTimes(2);
    src2.value = 1;
    c3.value;
    expect(cSpy).toHaveBeenCalledTimes(3);
  });

  it('should trigger the second effect', async () => {
    const fnSpy = jest.fn();
    const v = ref(1);
    const c = computed(() => v.value);

    watchEffect(() => {
      c.value;
    });
    watchEffect(() => {
      c.value;
      fnSpy();
    });

    expect(fnSpy).toBeCalledTimes(1);
    v.value = 2;
    await nextTick();
    expect(fnSpy).toBeCalledTimes(2);
  });

  it('should support setter', async () => {
    const n = ref(1);
    const plusOne = computed({
      get: () => n.value + 1,
      set: val => {
        n.value = val - 1;
      },
    });

    expect(plusOne.value).toBe(2);
    n.value++;
    expect(plusOne.value).toBe(3);

    plusOne.value = 0;
    expect(n.value).toBe(-1);
  });

  it('should trigger effect w/ setter', async () => {
    const n = ref(1);
    const plusOne = computed({
      get: () => n.value + 1,
      set: val => {
        n.value = val - 1;
      },
    });

    let dummy;
    watch(() => {
      dummy = n.value;
    });
    expect(dummy).toBe(1);

    plusOne.value = 0;
    await nextTick();
    expect(dummy).toBe(-1);
  });
});
