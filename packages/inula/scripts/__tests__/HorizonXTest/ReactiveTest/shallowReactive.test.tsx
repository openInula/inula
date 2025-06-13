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
import { shallowReactive } from '../../../../src/inulax/reactive/Reactive';
import { isShallow } from '../../../../src/inulax/CommonUtils';

const { reactive, isReactive, toRaw, ref, isRef, computed, watchEffect } = vueReactive;

describe('test shallowReactive', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReactive({ n: { foo: 1 } });
    expect(isReactive(props.n)).toBe(false);
  });

  test('should keep reactive properties reactive', () => {
    const props: any = shallowReactive({ n: reactive({ foo: 1 }) });
    props.n = reactive({ foo: 2 });
    expect(isReactive(props.n)).toBe(true);
  });

  // 当前逻辑无法通过这用例
  xtest('should allow shallow and normal reactive for same target', () => {
    const original = { foo: {} };
    const shallowProxy = shallowReactive(original);
    const reactiveProxy = reactive(original);
    expect(isReactive(shallowProxy.foo)).toBe(false);
    expect(isReactive(reactiveProxy.foo)).toBe(true);
  });

  test('isShallow', () => {
    expect(isShallow(shallowReactive({}))).toBe(true);
  });

  // #5271
  test('should respect shallow reactive nested inside reactive on reset', () => {
    const r = reactive({ foo: shallowReactive({ bar: {} }) });
    expect(isShallow(r.foo)).toBe(true);
    expect(isReactive(r.foo.bar)).toBe(false);

    r.foo = shallowReactive({ bar: {} });
    expect(isShallow(r.foo)).toBe(true);
    expect(isReactive(r.foo.bar)).toBe(false);
  });

  test('should not unwrap refs', () => {
    const foo = shallowReactive({
      bar: ref(123),
    });
    expect(isRef(foo.bar)).toBe(true);
    expect(foo.bar.value).toBe(123);
  });

  test('should respect shallow/deep versions of same target on access', () => {
    const original = {};
    const shallow = shallowReactive(original);
    const deep = reactive(original);
    const r = reactive({ shallow, deep });
    expect(r.shallow).toBe(shallow);
    expect(r.deep).toBe(deep);
  });
});
