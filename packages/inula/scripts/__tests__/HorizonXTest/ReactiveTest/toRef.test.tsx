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

const { ref, isRef, reactive, unref, toRef, toRefs, isReadonly, watchEffect } = vueReactive;

describe('test toRef, toRefs', () => {
  it('toRef', async () => {
    const a = reactive({
      x: 1,
    });
    const x = toRef(a, 'x');
    expect(isRef(x)).toBe(true);
    expect(x.value).toBe(1);

    // source -> proxy
    a.x = 2;
    await nextTick();
    expect(x.value).toBe(2);

    // proxy -> source
    x.value = 3;
    await nextTick();
    expect(a.x).toBe(3);

    // reactivity
    let dummyX;
    watchEffect(() => {
      dummyX = x.value;
    });
    expect(dummyX).toBe(x.value);

    // mutating source should trigger effect using the proxy refs
    a.x = 4;
    await nextTick();
    expect(dummyX).toBe(4);

    // should keep ref
    const r = { x: ref(1) };
    expect(toRef(r, 'x')).toBe(r.x);
  });

  it('toRef on array', () => {
    const a = reactive(['a', 'b']);
    const r = toRef(a, 1);
    expect(r.value).toBe('b');
    r.value = 'c';
    expect(r.value).toBe('c');
    expect(a[1]).toBe('c');
  });

  it('toRef default value', () => {
    const a: { x: number | undefined } = { x: undefined };
    const x = toRef(a, 'x', 1);
    expect(x.value).toBe(1);

    a.x = 2;
    expect(x.value).toBe(2);

    a.x = undefined;
    expect(x.value).toBe(1);
  });

  it('toRef getter', () => {
    const x = toRef(() => 1);
    expect(x.value).toBe(1);
    expect(isRef(x)).toBe(true);
    expect(unref(x)).toBe(1);
    // @ts-expect-error
    expect(() => (x.value = 123)).toThrow();

    expect(isReadonly(x)).toBe(true);
  });

  it('toRefs', async () => {
    const a = reactive({
      x: 1,
      y: 2,
    });

    const { x, y } = toRefs(a);

    expect(isRef(x)).toBe(true);
    expect(isRef(y)).toBe(true);
    expect(x.value).toBe(1);
    expect(y.value).toBe(2);

    // source -> proxy
    a.x = 2;
    a.y = 3;
    await nextTick();
    expect(x.value).toBe(2);
    expect(y.value).toBe(3);

    // proxy -> source
    x.value = 3;
    y.value = 4;
    await nextTick();
    expect(a.x).toBe(3);
    expect(a.y).toBe(4);

    // reactivity
    let dummyX, dummyY;
    watchEffect(() => {
      dummyX = x.value;
      dummyY = y.value;
    });
    expect(dummyX).toBe(x.value);
    expect(dummyY).toBe(y.value);

    // mutating source should trigger effect using the proxy refs
    a.x = 4;
    a.y = 5;
    await nextTick();
    expect(dummyX).toBe(4);
    expect(dummyY).toBe(5);
  });

  it('toRefs reactive array', () => {
    const arr = reactive(['a', 'b', 'c']);
    const refs = toRefs(arr);

    expect(Array.isArray(refs)).toBe(true);

    refs[0].value = '1';
    expect(arr[0]).toBe('1');

    arr[1] = '2';
    expect(refs[1].value).toBe('2');
  });
});
