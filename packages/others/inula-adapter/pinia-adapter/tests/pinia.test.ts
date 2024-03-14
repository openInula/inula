/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck For the compiled code.

import { beforeEach, describe, it, expect } from 'vitest'
import {createPinia, defineStore} from '../src/pinia';

describe('pinia state', () => {
  beforeEach(() => {
  });

  const useStore = defineStore('main', {
    state: () => ({
      name: 'Eduardo',
      counter: 0,
      nested: {n: 0},
    }),
  });

  it('can directly access state at the store level', () => {
    const store = useStore();
    expect(store.name).toBe('Eduardo');
    store.name = 'Ed';
    expect(store.name).toBe('Ed');
  });

});
