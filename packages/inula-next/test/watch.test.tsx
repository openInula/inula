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

import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { render, View } from '../src';

vi.mock('../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('Watch', () => {
  it('Should correctly watch variable', ({ container }) => {
    let increment: () => void;
    function TrafficLight() {
      let lightIndex = 0;
      let index = 0;
      increment = () => {
        lightIndex = lightIndex + 1;
      };

      watch(() => {
        index = lightIndex;
      });
      return <div>{index}</div>;
    }
    render(TrafficLight, container);
    expect(container.innerHTML).toBe('<div>0</div>');
    increment();
    expect(container.innerHTML).toBe('<div>1</div>');
  });
  it('Should correctly watch and update based on string state changes', ({ container }) => {
    let updateState: (newState: string) => void;
    function StringComponent() {
      let state = 'initial';
      let watchedState = '';
      updateState = (newState: string) => {
        state = newState;
      };
      watch(() => {
        watchedState = state;
      });
      return <div>{watchedState}</div>;
    }
    render(StringComponent, container);
    expect(container.innerHTML).toBe('<div>initial</div>');
    updateState('updated');
    expect(container.innerHTML).toBe('<div>updated</div>');
  });

  it('Should correctly watch and update based on number state changes', ({ container }) => {
    let updateState: (newState: number) => void;
    function NumberComponent() {
      let state = 0;
      let watchedState = 0;
      updateState = (newState: number) => {
        state = newState;
      };
      watch(() => {
        watchedState = state;
      });
      return <div>{watchedState}</div>;
    }
    render(NumberComponent, container);
    expect(container.innerHTML).toBe('<div>0</div>');
    updateState(42);
    expect(container.innerHTML).toBe('<div>42</div>');
  });

  it('Should correctly watch and update based on boolean state changes', ({ container }) => {
    let updateState: (newState: boolean) => void;
    function BooleanComponent() {
      let state = false;
      let watchedState = false;
      updateState = (newState: boolean) => {
        state = newState;
      };
      watch(() => {
        watchedState = state;
      });
      return <div>{watchedState.toString()}</div>;
    }
    render(BooleanComponent, container);
    expect(container.innerHTML).toBe('<div>false</div>');
    updateState(true);
    expect(container.innerHTML).toBe('<div>true</div>');
  });

  it('Should correctly watch and update based on array state changes', ({ container }) => {
    let updateState: (newState: number[]) => void;
    function ArrayComponent() {
      let state: number[] = [];
      let watchedState: number[] = [];
      updateState = (newState: number[]) => {
        state = newState;
      };
      watch(() => {
        watchedState = [...state];
      });
      return <div>{watchedState.join(',')}</div>;
    }
    render(ArrayComponent, container);
    expect(container.innerHTML).toBe('<div></div>');
    updateState([1, 2, 3]);
    expect(container.innerHTML).toBe('<div>1,2,3</div>');
  });

  it('Should correctly watch and update based on object state changes', ({ container }) => {
    let updateState: (newState: { [key: string]: any }) => void;
    function ObjectComponent() {
      let state = {};
      let watchedState = {};
      updateState = (newState: { [key: string]: any }) => {
        state = newState;
      };
      watch(() => {
        watchedState = { ...state };
      });
      return <div>{JSON.stringify(watchedState)}</div>;
    }
    render(ObjectComponent, container);
    expect(container.innerHTML).toBe('<div>{}</div>');
    updateState({ key: 'value' });
    expect(container.innerHTML).toBe('<div>{"key":"value"}</div>');
  });

  it('Should correctly watch conditional expressions', ({ container }) => {
    let updateX: (value: number) => void;
    function ConditionalComponent() {
      let x = 5;
      let result = '';
      updateX = (value: number) => {
        x = value;
      };
      watch(() => {
        result = x > 10 ? 'Greater than 10' : 'Less than or equal to 10';
      });
      return <div>{result}</div>;
    }
    render(ConditionalComponent, container);
    expect(container.innerHTML).toBe('<div>Less than or equal to 10</div>');
    updateX(15);
    expect(container.innerHTML).toBe('<div>Greater than 10</div>');
  });

  it('Should correctly watch template strings', ({ container }) => {
    let updateName: (value: string) => void;
    let updateAge: (value: number) => void;
    function TemplateStringComponent() {
      let name = 'John';
      let age = 30;
      let message = '';
      updateName = (value: string) => {
        name = value;
      };
      updateAge = (value: number) => {
        age = value;
      };
      watch(() => {
        message = `${name} is ${age} years old`;
      });
      return <div>{message}</div>;
    }
    render(TemplateStringComponent, container);
    expect(container.innerHTML).toBe('<div>John is 30 years old</div>');
    updateName('Jane');
    updateAge(25);
    expect(container.innerHTML).toBe('<div>Jane is 25 years old</div>');
  });

  it('Should correctly watch arithmetic operations', ({ container }) => {
    let updateX: (value: number) => void;
    let updateY: (value: number) => void;
    function ArithmeticComponent() {
      let x = 5;
      let y = 3;
      let result = 0;
      updateX = (value: number) => {
        x = value;
      };
      updateY = (value: number) => {
        y = value;
      };
      watch(() => {
        result = x + y * 2 - x / y;
      });
      return <div>{result}</div>;
    }
    render(ArithmeticComponent, container);
    expect(container.innerHTML).toBe('<div>9.333333333333334</div>');
    updateX(10);
    updateY(5);
    expect(container.innerHTML).toBe('<div>18</div>');
  });

  it('Should correctly watch property access and indexing', ({ container }) => {
    let updateObj: (value: { [key: string]: any }) => void;
    let updateArr: (value: number[]) => void;
    function AccessComponent() {
      let obj = { a: 1, b: 2 };
      let arr = [1, 2, 3];
      let result = 0;
      updateObj = (value: { [key: string]: any }) => {
        obj = value;
      };
      updateArr = (value: number[]) => {
        arr = value;
      };
      watch(() => {
        result = obj.a + arr[1];
      });
      return <div>{result}</div>;
    }
    render(AccessComponent, container);
    expect(container.innerHTML).toBe('<div>3</div>');
    updateObj({ a: 5, b: 6 });
    updateArr([0, 10, 20]);
    expect(container.innerHTML).toBe('<div>15</div>');
  });

  it('Should correctly watch function calls', ({ container }) => {
    let updateX: (value: number) => void;
    function FunctionCallComponent() {
      let x = 5;
      let result = 0;
      const square = (n: number) => n * n;
      updateX = (value: number) => {
        x = value;
      };
      watch(() => {
        result = square(x);
      });
      return <div>{result}</div>;
    }
    render(FunctionCallComponent, container);
    expect(container.innerHTML).toBe('<div>25</div>');
    updateX(10);
    expect(container.innerHTML).toBe('<div>100</div>');
  });

  it('Should correctly watch various number operations', ({ container }) => {
    let updateX: (value: number) => void;
    function NumberOpsComponent() {
      let x = 16;
      let result = '';
      updateX = (value: number) => {
        x = value;
      };
      watch(() => {
        result = `sqrt: ${Math.sqrt(x)}, floor: ${Math.floor(x / 3)}, pow: ${Math.pow(x, 2)}`;
      });
      return <div>{result}</div>;
    }
    render(NumberOpsComponent, container);
    expect(container.innerHTML).toBe('<div>sqrt: 4, floor: 5, pow: 256</div>');
    updateX(25);
    expect(container.innerHTML).toBe('<div>sqrt: 5, floor: 8, pow: 625</div>');
  });

  it('Should correctly watch map operations', ({ container }) => {
    let updateArr: (value: number[]) => void;
    function MapComponent() {
      let arr = [1, 2, 3, 4, 5];
      let result: number[] = [];
      updateArr = (value: number[]) => {
        arr = value;
      };
      watch(() => {
        result = arr.map(x => x * 2);
      });
      return <div>{result.join(', ')}</div>;
    }
    render(MapComponent, container);
    expect(container.innerHTML).toBe('<div>2, 4, 6, 8, 10</div>');
    updateArr([10, 20, 30]);
    expect(container.innerHTML).toBe('<div>20, 40, 60</div>');
  });

  it('Should correctly watch multiple variables', ({ container }) => {
    let updateX: (value: number) => void;
    let updateY: (value: string) => void;
    let updateZ: (value: boolean) => void;
    function MultiWatchComponent() {
      let x = 5;
      let y = 'hello';
      let z = true;
      let result = '';
      updateX = (value: number) => {
        x = value;
      };
      updateY = (value: string) => {
        y = value;
      };
      updateZ = (value: boolean) => {
        z = value;
      };
      watch(() => {
        result = `x: ${x}, y: ${y}, z: ${z}`;
      });
      return <div>{result}</div>;
    }
    render(MultiWatchComponent, container);
    expect(container.innerHTML).toBe('<div>x: 5, y: hello, z: true</div>');
    updateX(10);
    updateY('world');
    updateZ(false);
    expect(container.innerHTML).toBe('<div>x: 10, y: world, z: false</div>');
  });
});
