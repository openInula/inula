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

/* eslint-disable @typescript-eslint/no-empty-function */
import * as Horizon from '@cloudsop/horizon/index.ts';
import { getLogUtils } from '../jest/testUtils';

describe('Dom Input', () => {
  const { act } = Horizon;
  const LogUtils = getLogUtils();

  describe('type checkbox', () => {
    it('没有设置checked属性时，控制台不会报错', () => {
      expect(() =>
        Horizon.render(<input type='checkbox' value={false} />, container),
      ).not.toThrow();
    });

    it('checked属性为undefined或null时且没有onChange属性或没有readOnly={true}，控制台不会报错', () => {
      expect(() =>
        Horizon.render(<input type='checkbox' checked={undefined} />, container),
      ).not.toThrow();
      expect(() =>
        Horizon.render(<input type='checkbox' checked={null} />, container),
      ).not.toThrow();
    });

    it('复选框的value属性值可以改变', () => {
      Horizon.render(
        <input type='checkbox' value='' onChange={() => {
          LogUtils.log('checkbox click');
        }} />,
        container,
      );
      Horizon.render(
        <input type='checkbox' value={0} onChange={() => {
          LogUtils.log('checkbox click');
        }} />,
        container,
      );
      expect(LogUtils.getAndClear()).toEqual([]);
      expect(container.querySelector('input').value).toBe('0');
      expect(container.querySelector('input').getAttribute('value')).toBe('0');
    });

    it('复选框不设置value属性值时会设置value为"on"', () => {
      Horizon.render(
        <input type='checkbox' defaultChecked={true} />,
        container,
      );
      expect(container.querySelector('input').value).toBe('on');
      expect(container.querySelector('input').hasAttribute('value')).toBe(false);
    });

    it('测试defaultChecked与更改defaultChecked', () => {
      Horizon.render(
        <input type='checkbox' defaultChecked={0} />,
        container,
      );
      expect(container.querySelector('input').value).toBe('on');
      expect(container.querySelector('input').checked).toBe(false);

      Horizon.render(
        <input type='checkbox' defaultChecked={1} />,
        container,
      );
      expect(container.querySelector('input').value).toBe('on');
      expect(container.querySelector('input').checked).toBe(true);

      Horizon.render(
        <input type='checkbox' defaultChecked={'1'} />,
        container,
      );
      expect(container.querySelector('input').value).toBe('on');
      expect(container.querySelector('input').checked).toBe(true);
    });
  });

  describe('type text', () => {
    it('value属性为undefined或null时且没有onChange属性或没有readOnly={true}，控制台不会报错', () => {
      expect(() =>
        Horizon.render(<input type='text' value={undefined} />, container),
      ).not.toThrow();
      expect(() =>
        Horizon.render(<input type='text' value={null} />, container),
      ).not.toThrow();
      expect(() =>
        Horizon.render(<input type='text' />, container),
      ).not.toThrow();
    });

    it('value值会转为字符串', () => {
      const realNode = Horizon.render(<input type='text' value={1} />, container);
      expect(realNode.value).toBe('1');
    });

    it('value值可以被设置为true/false', () => {
      let realNode = Horizon.render(<input type='text' value={1} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('1');
      realNode = Horizon.render(<input type='text' value={true} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('true');
      realNode = Horizon.render(<input type='text' value={false} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('false');
    });

    it('value值可以被设置为object', () => {
      let realNode = Horizon.render(<input type='text' value={1} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('1');
      const value = {
        toString: () => {
          return 'value';
        }
      };
      realNode = Horizon.render(<input type='text' value={value} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('value');
    });

    it('设置defaultValue', () => {
      let realNode = Horizon.render(<input type='text' defaultValue={1} />, container);
      expect(realNode.value).toBe('1');
      expect(realNode.getAttribute('value')).toBe('1');
      Horizon.unmountComponentAtNode(container);
      // 测试defaultValue为boolean类型
      realNode = Horizon.render(<input type='text' defaultValue={true} />, container);
      expect(realNode.value).toBe('true');
      expect(realNode.getAttribute('value')).toBe('true');

      Horizon.unmountComponentAtNode(container);
      realNode = Horizon.render(<input type='text' defaultValue={false} />, container);
      expect(realNode.value).toBe('false');
      expect(realNode.getAttribute('value')).toBe('false');

      Horizon.unmountComponentAtNode(container);
      const value = {
        toString: () => {
          return 'default';
        }
      };
      realNode = Horizon.render(<input type='text' defaultValue={value} />, container);
      expect(realNode.value).toBe('default');
      expect(realNode.getAttribute('value')).toBe('default');
    });

    it('value为0、defaultValue为1，input 的value应该为0', () => {
      const input = Horizon.render(<input defaultValue={1} value={0} />, container);
      expect(input.getAttribute('value')).toBe('0');
    });

    it('name属性', () => {
      let realNode = Horizon.render(<input type='text' name={'name'} />, container);
      expect(realNode.name).toBe('name');
      expect(realNode.getAttribute('name')).toBe('name');
      Horizon.unmountComponentAtNode(container);
      // 没有设置name属性
      realNode = Horizon.render(<input type='text' defaultValue={true} />, container);
      expect(realNode.name).toBe('');
      expect(realNode.getAttribute('name')).toBe(null);
    });

    it('受控input可以触发onChange', () => {
      let realNode = Horizon.render(<input type='text' value={'name'} onChange={LogUtils.log('text change')} />, container);
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set.call(realNode, 'abcd');
      // 再触发事件
      realNode.dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: true,
        }),
      );
      // 触发onChange
      expect(LogUtils.getAndClear()).toEqual(['text change']);
    });
  });

  describe('type radio', () => {
    it('radio的value可以更新', () => {
      let realNode = Horizon.render(<input type='radio' value={''} />, container);
      expect(realNode.value).toBe('');
      expect(realNode.getAttribute('value')).toBe('');
      realNode = Horizon.render(<input type='radio' value={false} />, container);
      expect(realNode.value).toBe('false');
      expect(realNode.getAttribute('value')).toBe('false');
      realNode = Horizon.render(<input type='radio' value={true} />, container);
      expect(realNode.value).toBe('true');
      expect(realNode.getAttribute('value')).toBe('true');
    });

    it('相同name且在同一表单的radio互斥', () => {
      Horizon.render(
        <>
          <input id='a' type='radio' name='num' onChange={LogUtils.log('a change')} defaultChecked={true} />
          <input id='b' type='radio' name='num' onChange={LogUtils.log('b change')} />
          <input id='c' type='radio' name='num' onChange={LogUtils.log('c change')} />
          <form>
            <input id='d' type='radio' name='num' onChange={() => { }} defaultChecked={true} />
          </form>
        </>, container);
      expect(container.querySelector('input').checked).toBe(true);
      expect(document.getElementById('b').checked).toBe(false);
      expect(document.getElementById('c').checked).toBe(false);
      expect(document.getElementById('d').checked).toBe(true);
      // 模拟点击id为b的单选框，b为选中状态，ac为非选中状态
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'checked',
      ).set.call(document.getElementById('b'), true);
      expect(LogUtils.getAndClear()).toEqual([
        'a change',
        'b change',
        'c change'
      ]);
      expect(container.querySelector('input').checked).toBe(false);
      expect(document.getElementById('b').checked).toBe(true);
      expect(document.getElementById('c').checked).toBe(false);
      expect(document.getElementById('d').checked).toBe(true);
    });

    it('name改变不影响相同name的radio', () => {
      const inputRef = Horizon.createRef();
      const App = () => {
        const [isNum, setNum] = Horizon.useState(false);
        const inputName = isNum ? 'secondName' : 'firstName';

        const buttonClick = () => {
          setNum(true);
        };

        return (
          <div>
            <button type="button" onClick={() => buttonClick()} />
            <input
              type="radio"
              name={inputName}
              onChange={() => { }}
              checked={isNum === true}
            />
            <input
              ref={inputRef}
              type="radio"
              name={inputName}
              onChange={() => { }}
              checked={isNum === false}
            />
          </div>
        );
      };
      Horizon.render(<App />, container);
      expect(container.querySelector('input').checked).toBe(false);
      expect(inputRef.current.checked).toBe(true);
      // 点击button，触发setNum
      container.querySelector('button').click();
      expect(container.querySelector('input').checked).toBe(true);
      expect(inputRef.current.checked).toBe(false);
    });
  });

  describe('type submit', () => {
    it('type submit value', () => {
      Horizon.render(<input type="submit" />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(false);
      Horizon.unmountComponentAtNode(container);

      Horizon.render(<input type="submit" value='' />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('');

      Horizon.render(<input type="submit" value='submit' />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('submit');
    });
  });

  describe('type reset', () => {
    it('type reset value', () => {
      Horizon.render(<input type="reset" />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(false);
      Horizon.unmountComponentAtNode(container);

      Horizon.render(<input type="reset" value='' />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('');

      Horizon.render(<input type="reset" value='reset' />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('reset');
    });
  });

  describe('type number', () => {
    it('value值会把number类型转为字符串，且.xx转为0.xx', () => {
      Horizon.render(<input type="number" value={.12} />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('0.12');
    });

    it('value值会把number类型转为字符串，且.xx转为0.xx', () => {
      Horizon.render(<input type="number" value={.12} />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('0.12');
    });

    it('改变node.value值', () => {
      let setNum;
      const App = () => {
        const [num, _setNum] = Horizon.useState('');
        setNum = _setNum;
        return <input type="number" value={num} readOnly={true} />;
      };
      Horizon.render(<App />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('');
      act(() => {
        setNum(0);
      });
      expect(container.querySelector('input').value).toBe('0');
    });

    it('node.value精度', () => {
      let setNum;
      const App = () => {
        const [num, _setNum] = Horizon.useState(0.0000);
        setNum = _setNum;
        return <input type="number" value={num} readOnly={true} />;
      };
      Horizon.render(<App />, container);
      expect(container.querySelector('input').getAttribute('value')).toBe('0');
      act(() => {
        setNum(1.0000);
      });
      expect(container.querySelector('input').getAttribute('value')).toBe('0');
      expect(container.querySelector('input').value).toBe('1');
    });

    it('node.value与Attrubute value', () => {
      const App = () => {
        return <input type="number" defaultValue={1} />;
      };
      Horizon.render(<App />, container);
      expect(container.querySelector('input').getAttribute('value')).toBe('1');
      expect(container.querySelector('input').value).toBe('1');

      // 先修改
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set.call(container.querySelector('input'), '8');
      // 再触发事件
      container.querySelector('input').dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: true,
        }),
      );
      // Attrubute value不会改变，node.value会改变
      expect(container.querySelector('input').getAttribute('value')).toBe('1');
      expect(container.querySelector('input').value).toBe('8');
    });
  });

  describe('type reset', () => {
    it('type reset的value值', () => {
      Horizon.render(<input type="reset" value={.12} />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('0.12');

      Horizon.unmountComponentAtNode(container);
      Horizon.render(<input type="reset" value={''} />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('');

      Horizon.unmountComponentAtNode(container);
      Horizon.render(<input type="reset" />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(false);
    });
  });
});
