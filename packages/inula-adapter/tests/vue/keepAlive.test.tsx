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
  KeepAlive,
  useActivatePro as onActivated,
  useUnActivatePro as onDeactivated,
} from '../../src/vue/keepAlive/index';
import { createApp } from '../../src/vue/globalAPI';
import '../utils/globalSetup';
import { describe, expect, it, beforeEach } from 'vitest';
import { DynamicComponent } from '../../src/vue';
import { useState, act } from 'openinula';

describe('component: KeepAlive', () => {
  beforeEach(() => {});

  let toggle, increment;

  const CompCount = () => {
    const [count, setCount] = useState(0);
    increment = () => {
      setCount(count + 1);
    };
    return <div>{count}</div>;
  };

  const CompA = () => {
    return <div>A</div>;
  };

  const CompB = () => {
    return <div>B</div>;
  };

  const CompC = () => {
    return <div>C</div>;
  };

  it('basic usage', async () => {
    const Comp = () => {
      const [display, setDisplay] = useState(true);
      toggle = () => setDisplay(!display);

      return (
        <div id="app">
          <KeepAlive>
            <DynamicComponent is={display ? CompCount : CompB}></DynamicComponent>
          </KeepAlive>
        </div>
      );
    };

    const app = createApp(<Comp />);
    act(() => {
      app.mount(global.container);
    });

    // await wait(10);
    expect(document.querySelector('#app')?.innerHTML).toBe('<div>0</div><div style="display: none;"></div>');
    increment();
    increment();
    increment();
    expect(document.querySelector('#app')?.innerHTML).toBe('<div>3</div><div style="display: none;"></div>');
    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div style="display: none;"><div>3</div></div><div>B</div><div style="display: none;"></div>'
    );
    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div>3</div><div style="display: none;"></div><div style="display: none;"><div>B</div></div>'
    );
  });

  it('limits max instances', async () => {
    const Comp = () => {
      const componentLookup = [CompCount, CompB, CompC];

      const [display, setDisplay] = useState(0);
      toggle = () => setDisplay((display + 1) % 3);

      return (
        <div id="app">
          <KeepAlive max={2}>
            <DynamicComponent is={componentLookup[display]}></DynamicComponent>
          </KeepAlive>
        </div>
      );
    };

    const app = createApp(<Comp />);
    act(() => {
      app.mount(global.container);
    });
    expect(document.querySelector('#app')?.innerHTML).toBe('<div>0</div><div style="display: none;"></div>');
    increment();
    increment();
    increment();
    expect(document.querySelector('#app')?.innerHTML).toBe('<div>3</div><div style="display: none;"></div>');

    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div style="display: none;"><div>3</div></div><div>B</div><div style="display: none;"></div>'
    );
    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div style="display: none;"><div>B</div></div><div>C</div><div style="display: none;"></div>'
    );
    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div style="display: none;"><div>C</div></div><div>0</div><div style="display: none;"></div>'
    );
  });

  it('include ', async () => {
    const Comp = () => {
      const componentLookup = [CompA, CompB, CompC];

      const [display, setDisplay] = useState(0);
      toggle = () => setDisplay((display + 1) % 3);

      return (
        <div id="app">
          <KeepAlive include={['CompA,CompD', /CompB/]}>
            <DynamicComponent is={componentLookup[display]}></DynamicComponent>
          </KeepAlive>
        </div>
      );
    };

    const app = createApp(<Comp />);
    act(() => {
      app.mount(global.container);
    });
    expect(document.querySelector('#app')?.innerHTML).toBe('<div>A</div><div style="display: none;"></div>');

    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div style="display: none;"><div>A</div></div><div>B</div><div style="display: none;"></div>'
    );
    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div style="display: none;"><div>A</div></div><div style="display: none;"><div>B</div></div><div>C</div>'
    );
    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div>A</div><div style="display: none;"></div><div style="display: none;"><div>B</div></div>'
    );
  });

  it('exclude ', async () => {
    const Comp = () => {
      const componentLookup = [CompA, CompB, CompC];

      const [display, setDisplay] = useState(0);
      toggle = () => setDisplay((display + 1) % 3);

      return (
        <div id="app">
          <KeepAlive exclude={['CompA', /CompB/]}>
            <DynamicComponent is={componentLookup[display]}></DynamicComponent>
          </KeepAlive>
        </div>
      );
    };

    const app = createApp(<Comp />);
    act(() => {
      app.mount(global.container);
    });
    expect(document.querySelector('#app')?.innerHTML).toBe('<div>A</div>');

    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe('<div>B</div>');
    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe('<div>C</div><div style="display: none;"></div>');
    act(() => {
      toggle();
    });
    expect(document.querySelector('#app')?.innerHTML).toBe(
      '<div style="display: none;"><div>C</div></div><div>A</div>'
    );
  });

  it('activated/deactivated ', async () => {
    let activationCounter = 0;
    let deactivationCounter = 0;
    const CompActivate = () => {
      onActivated(() => {
        activationCounter++;
      });
      onDeactivated(() => {
        deactivationCounter++;
      });
      return <div>{activationCounter}</div>;
    };

    const Comp = () => {
      const [display, setDisplay] = useState(false);
      toggle = () => setDisplay(!display);

      return (
        <div id="app">
          <KeepAlive exclude={['CompA']}>
            <DynamicComponent is={display ? CompActivate : CompA}></DynamicComponent>
          </KeepAlive>
        </div>
      );
    };

    const app = createApp(<Comp />);
    act(() => {
      app.mount(global.container);
    });
    expect(activationCounter).toBe(0);
    expect(deactivationCounter).toBe(0);

    act(() => {
      toggle();
    });
    expect(activationCounter).toBe(1);
    expect(deactivationCounter).toBe(0);
    act(() => {
      toggle();
    });
    expect(activationCounter).toBe(1);
    expect(deactivationCounter).toBe(1);
    act(() => {
      toggle();
    });
    expect(activationCounter).toBe(2);
    expect(deactivationCounter).toBe(1);
    act(() => {
      toggle();
    });
    expect(activationCounter).toBe(2);
    expect(deactivationCounter).toBe(2);
  });
});
