/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

//@ts-ignore
import * as Inula from '../../../../libs/inula/index';
import { createStore } from '../../../../libs/inula/src/inulax/store/StoreHandler';
import { triggerClickEvent } from '../../jest/commonComponents';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const { unmountComponentAtNode } = Inula;

function postpone(timer, func) {
  return new Promise(resolve => {
    window.setTimeout(function () {
      console.log('resolving postpone');
      resolve(func());
    }, timer);
  });
}

describe('Asynchronous store', () => {
  const getStore = createStore({
    state: {
      counter: 0,
      check: false,
    },
    actions: {
      increment: function (state) {
        return new Promise(resolve => {
          window.setTimeout(() => {
            state.counter++;
            resolve(true);
          }, 10);
        });
      },
      toggle: function (state) {
        state.check = !state.check;
      },
      reset: function (state) {
        state.check = false;
        state.counter = 0;
      },
    },
    computed: {
      value: state => {
        return (state.check ? 'true' : 'false') + state.counter;
      },
    },
  });

  beforeEach(() => {
    getStore().reset();
  });

  it('should return promise when queued function is called', () => {
    jest.useFakeTimers();

    const store = getStore();

    return new Promise(resolve => {
      store.$queue.increment().then(() => {
        expect(store.counter == 1);
        resolve(true);
      });

      jest.advanceTimersByTime(150);
    });
  });

  it('should queue async functions', () => {
    jest.useFakeTimers();
    return new Promise(resolve => {
      const store = getStore();

      // initial value
      expect(store.value).toBe('false0');

      // no blocking action action
      store.$queue.toggle();
      expect(store.value).toBe('true0');

      // store is not updated before blocking action is resolved
      store.$queue.increment();
      const togglePromise = store.$queue.toggle();
      expect(store.value).toBe('true0');

      // fast action is resolved immediatelly
      store.toggle();
      expect(store.value).toBe('false0');

      // queued action waits for blocking action to resolve
      togglePromise.then(() => {
        expect(store.value).toBe('true1');
        resolve();
      });

      jest.advanceTimersByTime(150);
    });
  });
});
