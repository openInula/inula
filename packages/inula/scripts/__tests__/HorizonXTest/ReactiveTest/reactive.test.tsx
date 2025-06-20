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

const { reactive, isReactive, toRaw, ref, isRef, computed, watchEffect, markRaw } = vueReactive;

describe('test reactive', () => {
  it('should validate the reactivity of an object', () => {
    const original = { key1: 10 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
    expect(observed.key1).toBe(10);
    expect('key1' in observed).toBe(true);
    expect(Object.keys(observed)).toEqual(['key1']);
  });

  it('should validate the prototype reactivity', () => {
    const obj = {};
    const reactiveObj = reactive(obj);
    expect(isReactive(reactiveObj)).toBe(true);

    const otherObj = { data: ['b'] };
    expect(isReactive(otherObj)).toBe(false);
    const reactiveOther = reactive(otherObj);
    expect(isReactive(reactiveOther)).toBe(true);
    expect(reactiveOther.data[0]).toBe('b');
  });

  it('should validate nested reactivity', () => {
    const original = {
      nested: {
        key2: 10,
      },
      array: [{ key3: 20 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });

  it('should observe subtypes of IterableCollections (MyMap, MySet)', async () => {
    class MyMap extends Map {}

    const myMap = reactive(new MyMap());

    expect(myMap).toBeInstanceOf(Map);
    expect(isReactive(myMap)).toBe(true);

    myMap.set('newKey', {});
    expect(isReactive(myMap.get('newKey'))).toBe(true);

    class MySet extends Set {}

    const mySet = reactive(new MySet());

    expect(mySet).toBeInstanceOf(Set);
    expect(isReactive(mySet)).toBe(true);

    let testValue;
    watchEffect(() => (testValue = mySet.has('newValue')));
    expect(testValue).toBe(false);
    mySet.add('newValue');
    await nextTick();
    expect(testValue).toBe(true);
    mySet.delete('newValue');
    await nextTick();
    expect(testValue).toBe(false);
  });

  it('should observe subtypes of WeakCollections (CustomWeakMap, CustomWeakSet)', async () => {
    class CustomWeakMap extends WeakMap {}

    const wmap = reactive(new CustomWeakMap());

    expect(wmap).toBeInstanceOf(WeakMap);
    expect(isReactive(wmap)).toBe(true);

    const customKey = {};
    wmap.set(customKey, {});
    expect(isReactive(wmap.get(customKey))).toBe(true);

    class CustomWeakSet extends WeakSet {}

    const wset = reactive(new CustomWeakSet());

    expect(wset).toBeInstanceOf(WeakSet);
    expect(isReactive(wset)).toBe(true);

    let testValue;
    watchEffect(() => (testValue = wset.has(customKey)));
    expect(testValue).toBe(false);
    wset.add(customKey);
    await nextTick();
    expect(testValue).toBe(true);
    wset.delete(customKey);
    await nextTick();
    expect(testValue).toBe(false);
  });

  it('should validate that changes in the observed value are reflected in the original (Object)', () => {
    const original: any = { baz: 5 };
    const observed = reactive(original);

    observed.qux = 7;
    expect(observed.qux).toBe(7);
    expect(original.qux).toBe(7);

    delete observed.baz;
    expect('baz' in observed).toBe(false);
    expect('baz' in original).toBe(false);
  });

  it('should validate that changes in the original value are reflected in the observed value (Object)', () => {
    const initialData: any = { key1: 2 };
    const reactiveData = reactive(initialData);

    initialData.key2 = 3;
    expect(initialData.key2).toBe(3);
    expect(reactiveData.key2).toBe(3);

    delete initialData.key1;
    expect('key1' in initialData).toBe(false);
    expect('key1' in reactiveData).toBe(false);
  });

  it('should verify that assigning an unobserved value to a property results in a reactive wrap', () => {
    const reactiveObj = reactive<{ key?: object }>({});
    const rawObj = {};
    reactiveObj.key = rawObj;
    expect(reactiveObj.key).not.toBe(rawObj);
    expect(isReactive(reactiveObj.key)).toBe(true);
  });

  it('should affirm that reactivity checks on an already reactive object yield the same Proxy', () => {
    const initialData = { key: 3 };
    const reactiveData1 = reactive(initialData);
    const reactiveData2 = reactive(reactiveData1);
    expect(reactiveData2).toBe(reactiveData1);
  });

  it('should confirm that multiple observations of the same value return identical Proxies', () => {
    const initialData = { key: 2 };
    const reactiveData1 = reactive(initialData);
    const reactiveData2 = reactive(initialData);
    expect(reactiveData2).toBe(reactiveData1);
  });

  it('should ensure original object remains unaffected by Proxies', () => {
    const initialObject: any = { key: 3 };
    const secondaryObject = { key2: 4 };
    const reactiveObject1 = reactive(initialObject);
    const reactiveObject2 = reactive(secondaryObject);
    reactiveObject1.key2 = reactiveObject2;
    expect(reactiveObject1.key2).toBe(reactiveObject2);
  });

  it('should ensure that mutations on objects using reactive as prototype do not trigger', async () => {
    const reactiveObject = reactive({ key: 1 });
    const originalObject = Object.create(reactiveObject);
    let testValue;
    watchEffect(() => (testValue = originalObject.key));
    expect(testValue).toBe(1);
    reactiveObject.key = 3;
    await nextTick();
    expect(testValue).toBe(3);
  });

  it('should validate the identity of the original object after toRaw operation', () => {
    const initialObject = { key: 2 };
    const reactiveObject = reactive(initialObject);
    expect(toRaw(reactiveObject)).toBe(initialObject);
    expect(toRaw(initialObject)).toBe(initialObject);
  });

  it('should validate the non-mutability of original object when wrapped by user Proxy', () => {
    const initialObject = {};
    const reactiveObject = reactive(initialObject);
    const proxyObject = new Proxy(reactiveObject, {});
    const rawObject = toRaw(proxyObject);
    expect(rawObject).toBe(initialObject);
  });

  it('should confirm the non-unwrapping of Ref<T>', () => {
    const alphaRef = reactive(ref(2));
    const betaRef = reactive(ref({ key: 2 }));

    expect(isRef(alphaRef)).toBe(true);
    expect(isRef(betaRef)).toBe(true);
  });

  it('should validate the property reassignment from one ref to another', () => {
    const alpha = ref(2);
    const beta = ref(3);
    const observedObject = reactive({ key: alpha });
    const computedValue = computed(() => observedObject.key);
    expect(computedValue.value).toBe(2);

    // @ts-expect-error
    observedObject.key = beta;
    expect(computedValue.value).toBe(3);

    beta.value += 2;
    expect(computedValue.value).toBe(5);
  });

  test('markRaw', () => {
    const obj = reactive({
      foo: { a: 1 },
      bar: markRaw({ b: 2 }),
    });
    expect(isReactive(obj.foo)).toBe(true);
    expect(isReactive(obj.bar)).toBe(false);
  });

  test('markRaw should skip non-extensible objects', () => {
    const obj = Object.seal({ foo: 1 });
    expect(() => markRaw(obj)).not.toThrowError();
  });
});
