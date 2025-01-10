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
/**
 * @jsxImportSource @openinula/next
 */

import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render } from '../../src';

vi.mock('../../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('early return', () => {
  it('should support single if early return', ({ container }) => {
    let add: () => void;
    const App = () => {
      let count = 1;
      add = () => count++;

      if (count > 1) {
        return <div>{count} is bigger than is 1</div>;
      }

      return <div>{count} is smaller than 1</div>;
    };

    render(App(), container);
    expect(container.innerHTML).toBe('<div>1 is smaller than 1</div>');

    add!();
    expect(container.innerHTML).toBe('<div>2 is bigger than is 1</div>');
  });

  it('should support multiple consecutive if early returns', ({ container }) => {
    let setValue: (newValue: number) => void;

    const App = () => {
      let value = -1;
      setValue = newValue => (value = newValue);

      if (value < 0) {
        return <div>negative number</div>;
      }

      if (value === 0) {
        return <div>zero</div>;
      }

      if (value > 100) {
        return <div>too large</div>;
      }

      return <div>normal number</div>;
    };

    render(App(), container);
    expect(container.innerHTML).toBe('<div>negative number</div>');

    setValue!(0);
    expect(container.innerHTML).toBe('<div>zero</div>');

    setValue!(101);
    expect(container.innerHTML).toBe('<div>too large</div>');

    setValue!(50);
    expect(container.innerHTML).toBe('<div>normal number</div>');
  });

  it('should support if-else early returns without final return', ({ container }) => {
    let setAge: (newAge: number) => void;

    const App = () => {
      let age = 20;
      setAge = newAge => (age = newAge);

      if (age >= 18) {
        return <div>adult</div>;
      } else {
        return <div>minor</div>;
      }
    };

    render(App(), container);
    expect(container.innerHTML).toBe('<div>adult</div>');

    setAge!(16);
    expect(container.innerHTML).toBe('<div>minor</div>');
  });

  it('should support nested if early returns', ({ container }) => {
    let updateUser: (
      updates: Partial<{
        type: string;
        age: number;
      }>
    ) => void;

    const App = () => {
      let user = { type: 'vip', age: 65 };
      updateUser = updates => {
        user = { ...user, ...updates };
      };

      if (user.type === 'vip') {
        if (user.age > 60) {
          return <div>senior vip</div>;
        }
        return <div>normal vip</div>;
      }

      if (user.age < 18) {
        return <div>young user</div>;
      }

      return <div>normal user</div>;
    };

    render(App(), container);
    expect(container.innerHTML).toBe('<div>senior vip</div>');

    updateUser!({ age: 30 });
    expect(container.innerHTML).toBe('<div>normal vip</div>');

    updateUser!({ type: 'normal', age: 16 });
    expect(container.innerHTML).toBe('<div>young user</div>');

    updateUser!({ age: 20 });
    expect(container.innerHTML).toBe('<div>normal user</div>');
  });

  it('should support combined condition early returns', ({ container }) => {
    let updateUser: (
      updates: Partial<{
        type: string;
        age: number;
      }>
    ) => void;

    const App = () => {
      let user = { isVip: true, isSenior: true, age: 65 };
      updateUser = updates => {
        user = { ...user, ...updates };
      };

      if (user.isVip && user.isSenior) {
        return <div>senior vip user</div>;
      }

      // if (user.isVip || user.isSenior) {
      //   return <div>privileged user</div>;
      // }
      //
      // if (!user.age || user.age < 18) {
      //   return <div>restricted user</div>;
      // }

      return <div>normal user</div>;
    };

    render(App(), container);
    expect(container.innerHTML).toBe('<div>senior vip user</div>');

    // updateUser!({ isSenior: false });
    // expect(container.innerHTML).toBe('<div>privileged user</div>');
    //
    // updateUser!({ isVip: false, isSenior: true });
    // expect(container.innerHTML).toBe('<div>privileged user</div>');
    //
    // updateUser!({ isVip: false, isSenior: false, age: 16 });
    // expect(container.innerHTML).toBe('<div>restricted user</div>');

    updateUser!({ age: 20 });
    expect(container.innerHTML).toBe('<div>normal user</div>');
  });
});
