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

describe('Declare state', () => {
  it('Should correctly declare and render a string state variable', ({ container }) => {
    function StringState() {
      let str = 'Hello, World!';
      return <p>{str}</p>;
    }
    render(StringState, container);
    expect(container.innerHTML).toBe('<p>Hello, World!</p>');
  });

  it('Should correctly declare and render a number state variable', ({ container }) => {
    function NumberState() {
      let num = 42;
      return <p>{num}</p>;
    }
    render(NumberState, container);
    expect(container.innerHTML).toBe('<p>42</p>');
  });

  it('Should correctly declare and render a boolean state variable', ({ container }) => {
    function BooleanState() {
      let bool = true;
      return <p>{bool.toString()}</p>;
    }
    render(BooleanState, container);
    expect(container.innerHTML).toBe('<p>true</p>');
  });

  it('Should correctly declare and render an array state variable', ({ container }) => {
    function ArrayState() {
      let arr = [1, 2, 3];
      return <p>{arr.join(', ')}</p>;
    }
    render(ArrayState, container);
    expect(container.innerHTML).toBe('<p>1, 2, 3</p>');
  });

  it('Should correctly declare and render an object state variable', ({ container }) => {
    function ObjectState() {
      let obj = { name: 'John', age: 30 };
      return <p>{`${obj.name}, ${obj.age}`}</p>;
    }
    render(ObjectState, container);
    expect(container.innerHTML).toBe('<p>John, 30</p>');
  });

  it('Should correctly declare and render a map state variable', ({ container }) => {
    function MapState() {
      let map = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
      return (
        <p>
          {Array.from(map)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')}
        </p>
      );
    }
    render(MapState, container);
    expect(container.innerHTML).toBe('<p>key1:value1, key2:value2</p>');
  });

  it('Should correctly declare and render a set state variable', ({ container }) => {
    function SetState() {
      let set = new Set([1, 2, 3]);
      return <p>{Array.from(set).join(', ')}</p>;
    }
    render(SetState, container);
    expect(container.innerHTML).toBe('<p>1, 2, 3</p>');
  });
});

describe('Update state', () => {
  it('Should correctly update and render a string state variable', ({ container }) => {
    let updateStr: () => void;
    function StringState() {
      let str = 'Hello';
      updateStr = () => {
        str = 'Hello, World!';
      };
      return <p>{str}</p>;
    }
    render(StringState, container);
    expect(container.innerHTML).toBe('<p>Hello</p>');
    updateStr();
    expect(container.innerHTML).toBe('<p>Hello, World!</p>');
  });

  it('Should correctly update and render a number state variable', ({ container }) => {
    let updateNum: () => void;
    function NumberState() {
      let num = 42;
      updateNum = () => {
        num = 84;
      };
      return <p>{num}</p>;
    }
    render(NumberState, container);
    expect(container.innerHTML).toBe('<p>42</p>');
    updateNum();
    expect(container.innerHTML).toBe('<p>84</p>');
  });

  it('Should correctly update and render a boolean state variable', ({ container }) => {
    let toggleBool: () => void;
    function BooleanState() {
      let bool = true;
      toggleBool = () => {
        bool = !bool;
      };
      return <p>{bool.toString()}</p>;
    }
    render(BooleanState, container);
    expect(container.innerHTML).toBe('<p>true</p>');
    toggleBool();
    expect(container.innerHTML).toBe('<p>false</p>');
  });

  it('Should correctly update and render an object state variable', ({ container }) => {
    let updateObj: () => void;
    function ObjectState() {
      let obj = { name: 'John', age: 30 };
      updateObj = () => {
        obj.age = 31;
      };
      return <p>{`${obj.name}, ${obj.age}`}</p>;
    }
    render(ObjectState, container);
    expect(container.innerHTML).toBe('<p>John, 30</p>');
    updateObj();
    expect(container.innerHTML).toBe('<p>John, 31</p>');
  });

  it('Should correctly handle increment operations (n++)', ({ container }) => {
    let increment: () => void;
    function IncrementState() {
      let count = 0;
      increment = () => {
        count++;
      };
      return <p>{count}</p>;
    }
    render(IncrementState, container);
    expect(container.innerHTML).toBe('<p>0</p>');
    increment();
    expect(container.innerHTML).toBe('<p>1</p>');
  });

  it('Should correctly handle decrement operations (n--)', ({ container }) => {
    let decrement: () => void;
    function DecrementState() {
      let count = 5;
      decrement = () => {
        count--;
      };
      return <p>{count}</p>;
    }
    render(DecrementState, container);
    expect(container.innerHTML).toBe('<p>5</p>');
    decrement();
    expect(container.innerHTML).toBe('<p>4</p>');
  });

  it('Should correctly handle operations (+=)', ({ container }) => {
    let addValue: (value: number) => void;
    function AdditionAssignmentState() {
      let count = 10;
      addValue = (value: number) => {
        count += value;
      };
      return <p>{count}</p>;
    }
    render(AdditionAssignmentState, container);
    expect(container.innerHTML).toBe('<p>10</p>');
    addValue(5);
    expect(container.innerHTML).toBe('<p>15</p>');
    addValue(-3);
    expect(container.innerHTML).toBe('<p>12</p>');
  });

  it('Should correctly handle operations (-=)', ({ container }) => {
    let subtractValue: (value: number) => void;
    function SubtractionAssignmentState() {
      let count = 20;
      subtractValue = (value: number) => {
        count -= value;
      };
      return <p>{count}</p>;
    }
    render(SubtractionAssignmentState, container);
    expect(container.innerHTML).toBe('<p>20</p>');
    subtractValue(7);
    expect(container.innerHTML).toBe('<p>13</p>');
    subtractValue(-4);
    expect(container.innerHTML).toBe('<p>17</p>');
  });

  it('Should correctly update and render a state variable as an index of array', ({ container }) => {
    let updateIndex: () => void;
    function ArrayIndexState() {
      const items = ['Apple', 'Banana', 'Cherry', 'Date'];
      let index = 0;
      updateIndex = () => {
        index = (index + 1) % items.length;
      };
      return <p>{items[index]}</p>;
    }
    render(ArrayIndexState, container);
    expect(container.innerHTML).toBe('<p>Apple</p>');
    updateIndex();
    expect(container.innerHTML).toBe('<p>Banana</p>');
    updateIndex();
    expect(container.innerHTML).toBe('<p>Cherry</p>');
    updateIndex();
    expect(container.innerHTML).toBe('<p>Date</p>');
    updateIndex();
    expect(container.innerHTML).toBe('<p>Apple</p>');
  });

  it('Should correctly update and render a state variable as a property of an object', ({ container }) => {
    let updatePerson: () => void;
    function ObjectPropertyState() {
      let person = { name: 'Alice', age: 30, job: 'Engineer' };
      updatePerson = () => {
        person.age += 1;
        person.job = 'Senior Engineer';
      };
      return (
        <div>
          <p>Name: {person.name}</p>
          <p>Age: {person.age}</p>
          <p>Job: {person.job}</p>
        </div>
      );
    }
    render(ObjectPropertyState, container);
    expect(container.innerHTML).toBe('<div><p>Name: Alice</p><p>Age: 30</p><p>Job: Engineer</p></div>');
    updatePerson();
    expect(container.innerHTML).toBe('<div><p>Name: Alice</p><p>Age: 31</p><p>Job: Senior Engineer</p></div>');
  });

  it('Should correctly update and render an array state variable - push operation', ({ container }) => {
    let pushItem: () => void;
    function ArrayPushState() {
      let items = ['Apple', 'Banana'];
      pushItem = () => {
        items.push('Cherry');
      };
      return <p>{items.join(', ')}</p>;
    }
    render(ArrayPushState, container);
    expect(container.innerHTML).toBe('<p>Apple, Banana</p>');
    pushItem();
    expect(container.innerHTML).toBe('<p>Apple, Banana, Cherry</p>');
  });

  it('Should correctly update and render an array state variable - pop operation', ({ container }) => {
    let popItem: () => void;
    function ArrayPopState() {
      let items = ['Apple', 'Banana', 'Cherry'];
      popItem = () => {
        items.pop();
      };
      return <p>{items.join(', ')}</p>;
    }
    render(ArrayPopState, container);
    expect(container.innerHTML).toBe('<p>Apple, Banana, Cherry</p>');
    popItem();
    expect(container.innerHTML).toBe('<p>Apple, Banana</p>');
  });

  it('Should correctly update and render an array state variable - unshift operation', ({ container }) => {
    let unshiftItem: () => void;
    function ArrayUnshiftState() {
      let items = ['Banana', 'Cherry'];
      unshiftItem = () => {
        items.unshift('Apple');
      };
      return <p>{items.join(', ')}</p>;
    }
    render(ArrayUnshiftState, container);
    expect(container.innerHTML).toBe('<p>Banana, Cherry</p>');
    unshiftItem();
    expect(container.innerHTML).toBe('<p>Apple, Banana, Cherry</p>');
  });

  it('Should correctly update and render an array state variable - shift operation', ({ container }) => {
    let shiftItem: () => void;
    function ArrayShiftState() {
      let items = ['Apple', 'Banana', 'Cherry'];
      shiftItem = () => {
        items.shift();
      };
      return <p>{items.join(', ')}</p>;
    }
    render(ArrayShiftState, container);
    expect(container.innerHTML).toBe('<p>Apple, Banana, Cherry</p>');
    shiftItem();
    expect(container.innerHTML).toBe('<p>Banana, Cherry</p>');
  });

  it('Should correctly update and render an array state variable - splice operation', ({ container }) => {
    let spliceItems: () => void;
    function ArraySpliceState() {
      let items = ['Apple', 'Banana', 'Cherry', 'Date'];
      spliceItems = () => {
        items.splice(1, 2, 'Elderberry', 'Fig');
      };
      return <p>{items.join(', ')}</p>;
    }
    render(ArraySpliceState, container);
    expect(container.innerHTML).toBe('<p>Apple, Banana, Cherry, Date</p>');
    spliceItems();
    expect(container.innerHTML).toBe('<p>Apple, Elderberry, Fig, Date</p>');
  });

  it('Should correctly update and render an array state variable - filter operation', ({ container }) => {
    let filterItems: () => void;
    function ArrayFilterState() {
      let items = ['Apple', 'Banana', 'Cherry', 'Date'];
      filterItems = () => {
        items = items.filter(item => item.length > 5);
      };
      return <p>{items.join(', ')}</p>;
    }
    render(ArrayFilterState, container);
    expect(container.innerHTML).toBe('<p>Apple, Banana, Cherry, Date</p>');
    filterItems();
    expect(container.innerHTML).toBe('<p>Banana, Cherry</p>');
  });

  it('Should correctly update and render an array state variable - map operation', ({ container }) => {
    let mapItems: () => void;
    function ArrayMapState() {
      let items = ['apple', 'banana', 'cherry'];
      mapItems = () => {
        items = items.map(item => item.toUpperCase());
      };
      return <p>{items.join(', ')}</p>;
    }
    render(ArrayMapState, container);
    expect(container.innerHTML).toBe('<p>apple, banana, cherry</p>');
    mapItems();
    expect(container.innerHTML).toBe('<p>APPLE, BANANA, CHERRY</p>');
  });
});
