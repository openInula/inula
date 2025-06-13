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

import { beforeEach, describe, it, vi, expect } from 'vitest';
import { defineStore, storeToRefs } from '../../src/pinia/pinia';
import { vueReactive } from '@cloudsop/horizon';

const { ref, computed, reactive } = vueReactive;

let id = 0;
describe('storeToRefs', () => {
  beforeEach(() => {});

  function objectOfRefs<O extends Record<any, any>>(o: O) {
    return Object.keys(o).reduce((newO, key) => {
      // @ts-expect-error: we only need to match
      newO[key] = expect.objectContaining({ value: o[key] });
      return newO;
    }, {});
  }

  it('empty state', () => {
    expect(storeToRefs(defineStore(String(id++), {})())).toEqual({});
    expect(storeToRefs(defineStore({ id: String(id++) })())).toEqual({});
  });

  it('plain values', () => {
    const store = defineStore(String(id++), {
      state: () => ({ a: null as null | undefined, b: false, c: 1, d: 'd' }),
    })();

    const { a, b, c, d } = storeToRefs(store);

    expect(a.value).toBe(null);
    expect(b.value).toBe(false);
    expect(c.value).toBe(1);
    expect(d.value).toBe('d');

    a.value = undefined;
    expect(a.value).toBe(undefined);

    b.value = true;
    expect(b.value).toBe(true);

    c.value = 2;
    expect(c.value).toBe(2);

    d.value = 'e';
    expect(d.value).toBe('e');
  });

  it('setup store', () => {
    const store = defineStore(String(id++), () => {
      return {
        a: ref<null | undefined>(null),
        b: ref(false),
        c: ref(1),
        d: ref('d'),
        r: reactive({ n: 1 }),
      };
    })();

    const { a, b, c, d, r } = storeToRefs(store);

    expect(a.value).toBe(null);
    expect(b.value).toBe(false);
    expect(c.value).toBe(1);
    expect(d.value).toBe('d');
    expect(r.value).toEqual({ n: 1 });

    a.value = undefined;
    expect(a.value).toBe(undefined);

    b.value = true;
    expect(b.value).toBe(true);

    c.value = 2;
    expect(c.value).toBe(2);

    d.value = 'e';
    expect(d.value).toBe('e');

    r.value.n++;
    expect(r.value).toEqual({ n: 2 });
    expect(store.r).toEqual({ n: 2 });
    store.r.n++;
    expect(r.value).toEqual({ n: 3 });
    expect(store.r).toEqual({ n: 3 });
  });

  it('empty getters', () => {
    expect(
      storeToRefs(
        defineStore(String(id++), {
          state: () => ({ n: 0 }),
        })()
      )
    ).toEqual(objectOfRefs({ n: 0 }));
    expect(
      storeToRefs(
        defineStore(String(id++), () => {
          return { n: ref(0) };
        })()
      )
    ).toEqual(objectOfRefs({ n: 0 }));
  });

  it('contains getters', () => {
    const refs = storeToRefs(
      defineStore(String(id++), {
        state: () => ({ n: 1 }),
        getters: {
          double: state => state.n * 2,
        },
      })()
    );
    expect(refs).toEqual(objectOfRefs({ n: 1, double: 2 }));

    const setupRefs = storeToRefs(
      defineStore(String(id++), () => {
        const n = ref(1);
        const double = computed(() => n.value * 2);
        return { n, double };
      })()
    );

    expect(setupRefs).toEqual(objectOfRefs({ n: 1, double: 2 }));
  });
});
