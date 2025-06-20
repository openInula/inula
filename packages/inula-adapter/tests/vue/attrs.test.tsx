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

import { describe, it, vi, expect } from 'vitest';
import { render, act, vueReactive, useState, Component, memo, forwardRef } from 'openinula';
import '../utils/globalSetup';
import { createApp, useReactiveProps } from '../../src/vue';

describe('$attrs: style and css inheritance', () => {
  it('Should inherit css', () => {
    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <div id="child" />;
    };

    const App = () => {
      return <Parent className="red" />;
    };

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(Array.from(document.querySelector('#child').classList).includes('red')).toBe(true);
  });

  it('Should merge css', () => {
    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <div className="blue" id="child" />;
    };

    const App = () => {
      return <Parent className="red" />;
    };

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(Array.from(document.querySelector('#child').classList).includes('red')).toBe(true);
    expect(Array.from(document.querySelector('#child').classList).includes('blue')).toBe(true);
  });

  it('Should merge style', () => {
    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <div style={{ color: 'blue' }} id="child" />;
    };

    const App = () => {
      return <Parent style={{ width: '100px' }} />;
    };

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(document.querySelector('#child').style.width).toBe('100px');
    expect(document.querySelector('#child').style.color).toBe('blue');
  });

  it('Should prefer child style', () => {
    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <div style={{ color: 'blue' }} id="child" />;
    };

    const App = () => {
      return <Parent style={{ color: 'red', width: '100px' }} />;
    };

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(document.querySelector('#child').style.width).toBe('100px');
    expect(document.querySelector('#child').style.color).toBe('red');
  });
});

describe('$attrs: $attrs object', () => {
  it('should deep merge classes', () => {
    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <Child className="two" />;
    };

    const Child = rawProps => {
      useReactiveProps(rawProps, {});
      return <GrandChild className="three" />;
    };

    const GrandChild = rawProps => {
      useReactiveProps(rawProps, {});
      return <div id="child" className="four" />;
    };

    const App = () => {
      return <Parent className="one" />;
    };

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(Array.from(document.querySelector('#child').classList).includes('four')).toBe(true);
    expect(Array.from(document.querySelector('#child').classList).includes('three')).toBe(true);
    expect(Array.from(document.querySelector('#child').classList).includes('two')).toBe(true);
    expect(Array.from(document.querySelector('#child').classList).includes('one')).toBe(true);
  });

  it('should deep merge styles', () => {
    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <Child style={{ width: '100%' }} />;
    };

    const Child = rawProps => {
      useReactiveProps(rawProps, {});
      return <GrandChild style={{ color: 'red' }} />;
    };

    const GrandChild = rawProps => {
      useReactiveProps(rawProps, {});
      return <div id="child" style={{ display: 'inline-block', color: 'blue' }} />;
    };

    const App = () => {
      return <Parent style="background-color:yellow" />;
    };

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(document.querySelector('#child').style.width).toBe('100%');
    expect(document.querySelector('#child').style.color).toBe('red');
    expect(document.querySelector('#child').style.display).toBe('inline-block');
    expect(document.querySelector('#child').style.backgroundColor).toBe('yellow');
  });

  it('should deep merge styles by order when styles updated', () => {
    let updateWidth = () => {};
    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <Child style={{ width: '100%' }} />;
    };

    const Child = rawProps => {
      useReactiveProps(rawProps, {});
      return <GrandChild style={{ color: 'red' }} />;
    };

    const GrandChild = rawProps => {
      const [width, setWidth] = useState(50);
      updateWidth = () => {
        setWidth(width + 1);
      };
      useReactiveProps(rawProps, {});
      return <div id="child" style={{ display: 'inline-block', color: 'blue', width }} />;
    };

    const App = () => {
      return <Parent style="background-color:yellow" />;
    };

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(document.querySelector('#child').style.width).toBe('100%');
    expect(document.querySelector('#child').style.color).toBe('red');
    expect(document.querySelector('#child').style.display).toBe('inline-block');
    expect(document.querySelector('#child').style.backgroundColor).toBe('yellow');
    updateWidth();
    expect(document.querySelector('#child').style.width).toBe('100%');
  });

  it('should deep merge styles when use classComponent', () => {
    let updateWidth = () => {};
    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <Child />;
    };

    const Child = rawProps => {
      useReactiveProps(rawProps, {});
      return <GrandChild style={{ color: 'red' }} />;
    };

    const GrandChild = rawProps => {
      const [width, setWidth] = useState(50);
      updateWidth = () => {
        setWidth(width + 1);
      };
      useReactiveProps(rawProps, {});
      return <div id="child" style={{ display: 'inline-block', color: 'blue', width }} />;
    };

    class App extends Component {
      constructor(props) {
        super(props);
      }
      render() {
        return <Parent style="background-color:yellow; width: 100%" />;
      }
    }

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(document.querySelector('#child').style.width).toBe('100%');
    expect(document.querySelector('#child').style.color).toBe('red');
    expect(document.querySelector('#child').style.display).toBe('inline-block');
    expect(document.querySelector('#child').style.backgroundColor).toBe('yellow');
    updateWidth();
    expect(document.querySelector('#child').style.width).toBe('100%');
  });

  it('should deep merge styles when use Memo', async () => {
    let updateWidth = () => {};
    function Parent(rawProps) {
      useReactiveProps(rawProps, {});
      return <Child />;
    }

    const Child = memo(rawProps => {
      useReactiveProps(rawProps, {});
      return <GrandChild style={{ color: 'red' }} />;
    });

    const GrandChild = memo(rawProps => {
      const [width, setWidth] = useState(50);
      updateWidth = () => {
        setWidth(width + 1);
      };
      useReactiveProps(rawProps, {});
      return <div id="child" style={{ display: 'inline-block', color: 'blue', width }} />;
    });

    class App extends Component {
      constructor(props) {
        super(props);
      }
      render() {
        return <Parent style="background-color:yellow; width: 100%" />;
      }
    }

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(document.querySelector('#child').style.width).toBe('100%');
    expect(document.querySelector('#child').style.color).toBe('red');
    expect(document.querySelector('#child').style.display).toBe('inline-block');
    expect(document.querySelector('#child').style.backgroundColor).toBe('yellow');
    updateWidth();
    expect(document.querySelector('#child').style.width).toBe('100%');
  });

  it('should deep merge styles when use forwardRef', async () => {
    let updateWidth = () => {};
    function Parent(rawProps) {
      useReactiveProps(rawProps, {});
      return <Child />;
    }

    const Child = forwardRef(rawProps => {
      useReactiveProps(rawProps, {});
      return <GrandChild style={{ color: 'red' }} />;
    });

    const GrandChild = memo(rawProps => {
      const [width, setWidth] = useState(50);
      updateWidth = () => {
        setWidth(width + 1);
      };
      useReactiveProps(rawProps, {});
      return <div id="child" style={{ display: 'inline-block', color: 'blue', width }} />;
    });

    class App extends Component {
      constructor(props) {
        super(props);
      }
      render() {
        return <Parent style="background-color:yellow; width: 100%" />;
      }
    }

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(document.querySelector('#child').style.width).toBe('100%');
    expect(document.querySelector('#child').style.color).toBe('red');
    expect(document.querySelector('#child').style.display).toBe('inline-block');
    expect(document.querySelector('#child').style.backgroundColor).toBe('yellow');
    updateWidth();
    expect(document.querySelector('#child').style.width).toBe('100%');
  });
});

describe('$attrs: $attrs object', async resolve => {
  it('Should inherit scope', () => {
    const GrandChild = rawProps => {
      useReactiveProps(rawProps, {});
      return (
        <div id="child" data-v-ghjk1569>
          <p id="inner" data-v-ghjk1569>
            Inner element
          </p>
        </div>
      );
    };

    const Child = rawProps => {
      useReactiveProps(rawProps, {});
      return <GrandChild data-v-qrst3456 />;
    };

    const Parent = rawProps => {
      useReactiveProps(rawProps, {});
      return <Child data-v-abcd1234 />;
    };

    const App = () => {
      return <Parent data-v-wxyz6789 />;
    };

    const app = createApp(<App />);
    act(() => {
      app.mount(global.container);
    });

    expect(document.querySelector('#child')?.getAttribute('data-v-ghjk1569')).toBe('true');
    expect(document.querySelector('#child')?.getAttribute('data-v-abcd1234')).toBe('true');
    expect(document.querySelector('#child')?.getAttribute('data-v-wxyz6789')).toBe('true');
    expect(document.querySelector('#child')?.getAttribute('data-v-qrst3456')).toBe('true');
    expect(document.querySelector('#inner')?.getAttribute('data-v-abcd1234')).not.toBe('true');
    expect(document.querySelector('#inner')?.getAttribute('data-v-wxyz6789')).not.toBe('true');
    expect(document.querySelector('#inner')?.getAttribute('data-v-qrst3456')).not.toBe('true');
    expect(document.querySelector('#inner')?.getAttribute('data-v-ghjk1569')).toBe('true');
  });
});
