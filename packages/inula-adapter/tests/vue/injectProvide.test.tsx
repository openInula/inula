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

import { createApp } from '../../src/vue/globalAPI';
import { provide, inject } from '../../src/vue/injectProvide';
import '../utils/globalSetup';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('api: inject/provide', () => {
  beforeEach(() => {});

  it('basic usage', () => {
    // each of ProvA and ProvB component implements different context value
    const ProvA = () => {
      provide('val', 'A');
      return (
        <div>
          <Inj />
        </div>
      );
    };
    const ProvB = () => {
      provide('val', 'B');
      return (
        <div>
          <Inj />
        </div>
      );
    };
    // inj compoenent injects provided context value defined in ancestor element
    const Inj = () => {
      const val = inject('val');
      return <div>{val}</div>;
    };
    const Comp = () => {
      return (
        <div id="app">
          <ProvA />
          <ProvB />
        </div>
      );
    };

    const app = createApp(<Comp />);
    app.mount(global.container);

    expect(document.querySelector('#app')?.textContent).toBe('AB');
  });

  it('default value', () => {
    // Injects value that was not provided before. should fallback to default value
    const Inj = () => {
      const val = inject('this should fail', 'defaultValue');
      return <div id="Inj">{val}</div>;
    };
    const Comp = () => {
      return (
        <div id="app">
          <Inj />
        </div>
      );
    };

    const app = createApp(<Comp />);
    app.mount(global.container);

    expect(document.querySelector('#Inj')?.innerHTML).toBe('defaultValue');
  });

  it('symbol keys', () => {
    // Uses symbol key instead of string.
    const contextKey = Symbol();

    const ProvA = () => {
      provide(contextKey, 'A');
      return (
        <div id="ProvA">
          <Inj />
        </div>
      );
    };
    const Inj = () => {
      const val = inject(contextKey);
      return <div>{val}</div>;
    };
    const Comp = () => {
      return (
        <div id="app">
          <ProvA />
        </div>
      );
    };

    const app = createApp(<Comp />);
    app.mount(global.container);

    expect(document.querySelector('#ProvA')?.textContent).toBe('A');
  });
});
