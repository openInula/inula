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

import {
  createApp,
  defineAsyncComponent,
  GlobalComponent,
  Plugin,
  registerComponent,
  useGlobalProperties,
  useProvide,
} from '../../src/vue/globalAPI';
import { createStore, registerStore, useStore } from '../../src/vuex';
import { act, lazy, Suspense } from 'openinula';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import '../utils/globalSetup';

describe('api: createApp', () => {
  beforeEach(() => {
    const store = createStore({
      modules: {
        foo: {
          state: { counter: 1 },
          mutations: {
            inc: state => {
              state.counter++;
            },
          },
          actions: { inc: ({ commit }) => commit('inc') },
          getters: { double: state => state.counter * 2 },
        },
      },
    });
    registerStore(store);
  });

  it('mount', () => {
    const Comp = () => {
      const store = useStore();

      return (
        <>
          <div>
            counter: <span id={'counter'}>{store.state.foo.counter}</span>
          </div>
          <div>
            double: <span id={'double'}>{store.getters.double}</span>
          </div>
          <button onClick={() => store.commit('foo/inc')}>Inc</button>
        </>
      );
    };

    const app = createApp(Comp);
    app.mount(global.container);

    expect(document.querySelector('#counter')!.innerHTML).toBe('1');
    expect(document.querySelector('#double')!.innerHTML).toBe('2');

    act(() => {
      global.container.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.querySelector('#counter')!.innerHTML).toBe('2');
    expect(document.querySelector('#double')!.innerHTML).toBe('4');
  });

  it('unmount', () => {
    const Comp = () => {
      const store = useStore();

      return (
        <>
          <div>
            counter: <span id={'counter'}>{store.state.foo.counter}</span>
          </div>
          <div>
            double: <span id={'double'}>{store.getters.double}</span>
          </div>
          <button onClick={() => store.commit('foo/inc')}>Inc</button>
        </>
      );
    };

    const app = createApp(<Comp />);
    app.mount(global.container);

    expect(document.querySelector('#counter')!.innerHTML).toBe('1');
    expect(document.querySelector('#double')!.innerHTML).toBe('2');

    app.unmount();

    expect(document.querySelector('#counter')).toBeNull();
  });

  it('use', () => {
    const PluginA: Plugin = app => app.provide('foo', 1);
    const PluginB: Plugin = {
      install: (app, arg1, arg2) => app.provide('bar', arg1 + arg2),
    };

    class PluginC {
      someProperty = {};

      static install() {
        app.provide('baz', 2);
      }
    }

    const Comp = () => {
      const foo = useProvide('foo');
      const bar = useProvide('bar');
      const baz = useProvide('baz');

      return (
        <div>
          <span id={'provide'}>
            {foo},{bar},{baz}
          </span>
        </div>
      );
    };

    const app = createApp(<Comp />);
    app.use(PluginA);
    app.use(PluginB, 1, 1);
    app.use(PluginC);

    app.mount(global.container);
    expect(document.querySelector('#provide')!.innerHTML).toBe('1,2,2');
  });

  it('provide', () => {
    const Comp = () => {
      const foo = useProvide('foo');
      const bar = useProvide('bar');
      return (
        <div>
          <span id={'foo'}>
            {foo},{bar}
          </span>
        </div>
      );
    };

    const app = createApp(<Comp />);

    app.provide('foo', 1);
    app.provide('bar', 2);

    app.mount(global.container);

    expect(document.querySelector('#foo')!.innerHTML).toBe('1,2');
  });

  it('config.globalProperties', () => {
    const Comp = () => {
      // this.foo 转成：
      const foo = useGlobalProperties('foo');
      const { bar, fn } = useGlobalProperties();
      fn();
      return (
        <div>
          <span id={'foo'}>
            {foo}, {bar}
          </span>
        </div>
      );
    };

    const app = createApp(<Comp />);

    app.config.globalProperties.foo = 'hello';
    app.config.globalProperties.bar = 'inula';
    app.config.globalProperties.fn = () => {
      // 不支持this
      return this.foo;
    };
    app.mount(global.container);

    expect(document.querySelector('#foo')!.innerHTML).toBe('hello, inula');
  });

  it('app.component', () => {
    const Child = () => {
      return <div id={'child'}>child</div>;
    };
    const Child2 = () => {
      return <div id={'child2'}>child2</div>;
    };

    const Comp = () => {
      return (
        <div>
          <GlobalComponent componentName={'child'} />
          <GlobalComponent componentName={'child2'} />
        </div>
      );
    };

    const app = createApp(<Comp />);
    app.component('child', Child);
    registerComponent('child2', Child2);
    app.mount(global.container);

    expect(document.querySelector('#child')!.innerHTML).toBe('child');
    expect(document.querySelector('#child2')!.innerHTML).toBe('child2');
  });

  it('app.component', () => {
    const Child = () => {
      return <div id={'child'}>child</div>;
    };
    const Child2 = () => {
      return <div id={'child2'}>child2</div>;
    };

    const Comp = () => {
      return (
        <div>
          <GlobalComponent componentName={'child'} />
          <GlobalComponent componentName={'child2'} />
        </div>
      );
    };

    const app = createApp(<Comp />);
    app.component('child', Child);
    registerComponent('child2', Child2);
    app.mount(global.container);

    expect(document.querySelector('#child')!.innerHTML).toBe('child');
    expect(document.querySelector('#child2')!.innerHTML).toBe('child2');
  });

  it('Should work in multiple apps', () => {
    const Comp1 = () => {
      const foo = useGlobalProperties('foo');
      return (
        <div>
          <span id={'comp1'}>{foo}</span>
        </div>
      );
    };

    const Comp2 = () => {
      const foo = useGlobalProperties('foo');
      return (
        <div>
          <span id={'comp2'}>{foo}</span>
        </div>
      );
    };

    const div1 = document.createElement('div');
    document.body.appendChild(div1);
    const app1 = createApp(<Comp1 />);

    app1.config.globalProperties.foo = 'hello app1';
    app1.mount(div1);

    const div2 = document.createElement('div');
    document.body.appendChild(div2);
    const app2 = createApp(<Comp2 />);

    app2.config.globalProperties.foo = 'hello app2';
    app2.mount(div2);

    expect(document.querySelector('#comp1')!.innerHTML).toBe('hello app1');
    expect(document.querySelector('#comp2')!.innerHTML).toBe('hello app2');
  });

  it('Should lazy Suspense work', async () => {
    let _resolve: () => void;

    const mockImport = component => {
      return new Promise(resolve => {
        _resolve = () => {
          resolve({ default: component });
        };
      });
    };

    function AsyncComp(props) {
      return <div id={'async'}>{props.text}</div>;
    }

    const Comp = () => {
      return (
        <div>
          <Suspense fallback={<div id={'loading'}>Loading...</div>}>
            <GlobalComponent componentName={'AsyncComp'} text={'I am AsyncComp'}></GlobalComponent>
          </Suspense>
        </div>
      );
    };

    const app = createApp(<Comp />);

    // 通过：mockImport(AsyncComp)，模拟写法：import('./AsyncComp')
    app.component(
      'AsyncComp',
      lazy(() => mockImport(AsyncComp))
    );

    app.mount(global.container);

    expect(document.querySelector('#loading')!.innerHTML).toBe('Loading...');

    await act(async () => {
      _resolve();
    });

    expect(document.querySelector('#async')!.innerHTML).toBe('I am AsyncComp');
  });

  it('Should defineAsyncComponent work', async () => {
    let _resolve: () => void;

    const mockImport = component => {
      return new Promise(resolve => {
        _resolve = () => {
          resolve({ default: component });
        };
      });
    };

    function AsyncComp(props) {
      return <div id={'async'}>{props.text}</div>;
    }

    const Comp = () => {
      return (
        <div>
          <GlobalComponent componentName={'AsyncComp'} text={'I am AsyncComp'}></GlobalComponent>
        </div>
      );
    };

    const app = createApp(<Comp />);

    // 通过：mockImport(AsyncComp)，模拟写法：import('./AsyncComp')
    app.component(
      'AsyncComp',
      defineAsyncComponent(() => mockImport(AsyncComp))
    );

    app.mount(global.container);

    await act(async () => {
      _resolve();
    });

    expect(document.querySelector('#async')!.innerHTML).toBe('I am AsyncComp');
  });
});
