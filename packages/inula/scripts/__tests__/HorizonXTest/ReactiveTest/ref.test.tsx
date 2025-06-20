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

import { vueReactive, RefType } from '../../../../src';
import { nextTick } from '../../../../src/inulax/proxy/Scheduler';

const { ref, isRef, isReactive, reactive, watchEffect, unref, shallowRef, isShallow, computed } = vueReactive;

describe('test ref', () => {
  it('should validate the value holding capability', () => {
    const testRef = ref(3);
    expect(testRef.value).toBe(3);
    testRef.value = 4;
    expect(testRef.value).toBe(4);
  });

  it('should maintain reactivity', async () => {
    const testRef = ref(3);
    let testVar;
    const testFn = jest.fn(() => {
      testVar = testRef.value;
    });
    watchEffect(testFn);
    expect(testFn).toHaveBeenCalledTimes(1);
    expect(testVar).toBe(3);
    testRef.value = 4;
    await nextTick();
    expect(testFn).toHaveBeenCalledTimes(2);
    expect(testVar).toBe(4);
    testRef.value = 4;
    await nextTick();
    expect(testFn).toHaveBeenCalledTimes(2);
  });

  it('should verify the reactivity of nested properties', async () => {
    const testRef = ref({
      num: 3,
    });
    let testValue;
    watchEffect(() => {
      testValue = testRef.value.num;
    });
    expect(testValue).toBe(3);
    testRef.value.num = 4;
    await nextTick();
    expect(testValue).toBe(4);
  });

  it('should function correctly without an initial value', async () => {
    const testRef = ref();
    let testValue;
    watchEffect(() => {
      testValue = testRef.value;
    });
    expect(testValue).toBe(undefined);
    testRef.value = 3;
    await nextTick();
    expect(testValue).toBe(3);
  });

  it('should operate as a standard property when nested within a reactive structure', async () => {
    const initialRef = ref(2);
    const reactiveObj = reactive({
      initialRef,
      nested: {
        innerRef: initialRef,
      },
    });

    let first: number;
    let second: number;

    watchEffect(() => {
      first = reactiveObj.initialRef;
      second = reactiveObj.nested.innerRef;
    });

    const validateDummies = (val: number) => [first, second].forEach(dummy => expect(dummy).toBe(val));

    validateDummies(2);
    initialRef.value += 2;
    await nextTick();
    validateDummies(4);
    reactiveObj.initialRef += 2;
    await nextTick();
    validateDummies(6);
    reactiveObj.nested.innerRef += 2;
    await nextTick();
    validateDummies(8);
  });

  it('should confirm nested ref types', () => {
    const primaryRef = ref(2);
    const secondaryRef = ref(primaryRef);

    expect(typeof (secondaryRef.value + 3)).toBe('number');
  });

  it('should validate nested values in ref types', () => {
    const data = {
      key: ref(2),
    };

    const refData = ref(data);

    expect(typeof (refData.value.key + 3)).toBe('number');
  });

  it('should validate ref types within array structures', () => {
    const arrayData = ref([2, ref(4)]).value;
    expect(isRef(arrayData[0])).toBe(false);
    expect(isRef(arrayData[1])).toBe(true);
    expect((arrayData[1] as RefType).value).toBe(4);
  });

  it('should preserve tuple data types', () => {
    const tupleData: [number, string, { a: number }, () => number, RefType<number>] = [
      0,
      '1',
      { a: 1 },
      () => 0,
      ref(0),
    ];
    const refTuple = ref(tupleData);

    refTuple.value[0] += 1;
    expect(refTuple.value[0]).toEqual(1);
    refTuple.value[1] = refTuple.value[1].concat('1');
    expect(refTuple.value[1]).toEqual('11');
    refTuple.value[2].a += 1;
    expect(refTuple.value[2].a).toEqual(2);
    expect(refTuple.value[3]()).toEqual(0);
    refTuple.value[4].value += 1;
    expect(refTuple.value[4].value).toEqual(1);
  });

  it('should correctly unref values', () => {
    expect(unref(1)).toEqual(1);
    expect(unref(ref(1))).toEqual(1);
  });

  it('should verify the reactivity of a shallowRef', async () => {
    const shallowReference = shallowRef({ key: 1 });
    expect(isReactive(shallowReference.value)).toBe(false);

    let result;
    watchEffect(() => {
      result = shallowReference.value.key;
    });

    expect(result).toBe(1);

    shallowReference.value = { key: 2 };
    await nextTick();
    expect(isReactive(shallowReference.value)).toBe(false);
    expect(result).toBe(2);
  });

  it('should be isShallow', () => {
    const shallowReference = shallowRef({ key: 1 });
    expect(isShallow(shallowReference)).toBe(true);
  });

  it('should return true when isRef is called with a ref', () => {
    const testRef = ref(1);
    expect(isRef(testRef)).toBe(true);
  });

  it('should return true when isRef is called with a computed ref', () => {
    const computedRef = computed(() => 1);
    expect(isRef(computedRef)).toBe(true);
  });

  it('should return false when isRef is called with non-ref values', () => {
    expect(isRef(0)).toBe(false);
    expect(isRef(1)).toBe(false);
    const obj = { value: 0 };
    expect(isRef(obj)).toBe(false);
  });

  it('should ref not react when assigned the same proxy', () => {
    const reactiveObj = reactive({ num: 0 });

    const refInstance = ref(reactiveObj);
    const watchFn1 = jest.fn(() => refInstance.value);

    watchEffect(watchFn1);

    refInstance.value = reactiveObj;
    expect(watchFn1).toBeCalledTimes(1);
  });

  it('should shallowRef not react when assigned the same proxy', () => {
    const reactiveObj = reactive({ num: 0 });

    const shallowRefInstance = shallowRef(reactiveObj);
    const watchFn2 = jest.fn(() => shallowRefInstance.value);

    watchEffect(watchFn2);

    shallowRefInstance.value = reactiveObj;
    expect(watchFn2).toBeCalledTimes(1);
  });
});
