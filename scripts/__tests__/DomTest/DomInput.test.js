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
import * as Inula from '../../../libs/inula/index';
import { getLogUtils } from '../jest/testUtils';

describe('Dom Input', () => {
  const { act } = Inula;
  const LogUtils = getLogUtils();

  describe('type checkbox', () => {
    it('没有设置checked属性时，控制台不会报错', () => {
      expect(() =>
        Inula.render(<input type='checkbox' value={false} />, container),
      ).not.toThrow();
    });

    it('checked属性为undefined或null时且没有onChange属性或没有readOnly={true}，控制台不会报错', () => {
      expect(() =>
        Inula.render(<input type='checkbox' checked={undefined} />, container),
      ).not.toThrow();
      expect(() =>
        Inula.render(<input type='checkbox' checked={null} />, container),
      ).not.toThrow();
    });

    it('复选框的value属性值可以改变', () => {
      Inula.render(
        <input type='checkbox' value='' onChange={() => {
          LogUtils.log('checkbox click');
        }} />,
        container,
      );
      Inula.render(
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
      Inula.render(
        <input type='checkbox' defaultChecked={true} />,
        container,
      );
      expect(container.querySelector('input').value).toBe('on');
      expect(container.querySelector('input').hasAttribute('value')).toBe(false);
    });

    it('测试defaultChecked与更改defaultChecked', () => {
      Inula.render(
        <input type='checkbox' defaultChecked={0} />,
        container,
      );
      expect(container.querySelector('input').value).toBe('on');
      expect(container.querySelector('input').checked).toBe(false);

      Inula.render(
        <input type='checkbox' defaultChecked={1} />,
        container,
      );
      expect(container.querySelector('input').value).toBe('on');
      expect(container.querySelector('input').checked).toBe(true);

      Inula.render(
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
        Inula.render(<input type='text' value={undefined} />, container),
      ).not.toThrow();
      expect(() =>
        Inula.render(<input type='text' value={null} />, container),
      ).not.toThrow();
      expect(() =>
        Inula.render(<input type='text' />, container),
      ).not.toThrow();
    });

    it('value值会转为字符串', () => {
      const realNode = Inula.render(<input type='text' value={1} />, container);
      expect(realNode.value).toBe('1');
    });

    it('value值可以被设置为true/false', () => {
      let realNode = Inula.render(<input type='text' value={1} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('1');
      realNode = Inula.render(<input type='text' value={true} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('true');
      realNode = Inula.render(<input type='text' value={false} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('false');
    });

    it('value值可以被设置为object', () => {
      let realNode = Inula.render(<input type='text' value={1} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('1');
      const value = {
        toString: () => {
          return 'value';
        }
      };
      realNode = Inula.render(<input type='text' value={value} onChange={jest.fn()} />, container);
      expect(realNode.value).toBe('value');
    });

    it('设置defaultValue', () => {
      let realNode = Inula.render(<input type='text' defaultValue={1} />, container);
      expect(realNode.value).toBe('1');
      expect(realNode.getAttribute('value')).toBe('1');
      Inula.unmountComponentAtNode(container);
      // 测试defaultValue为boolean类型
      realNode = Inula.render(<input type='text' defaultValue={true} />, container);
      expect(realNode.value).toBe('true');
      expect(realNode.getAttribute('value')).toBe('true');

      Inula.unmountComponentAtNode(container);
      realNode = Inula.render(<input type='text' defaultValue={false} />, container);
      expect(realNode.value).toBe('false');
      expect(realNode.getAttribute('value')).toBe('false');

      Inula.unmountComponentAtNode(container);
      const value = {
        toString: () => {
          return 'default';
        }
      };
      realNode = Inula.render(<input type='text' defaultValue={value} />, container);
      expect(realNode.value).toBe('default');
      expect(realNode.getAttribute('value')).toBe('default');
    });

    it('value为0、defaultValue为1，input 的value应该为0', () => {
      const input = Inula.render(<input defaultValue={1} value={0} />, container);
      expect(input.getAttribute('value')).toBe('0');
    });

    it('name属性', () => {
      let realNode = Inula.render(<input type='text' name={'name'} />, container);
      expect(realNode.name).toBe('name');
      expect(realNode.getAttribute('name')).toBe('name');
      Inula.unmountComponentAtNode(container);
      // 没有设置name属性
      realNode = Inula.render(<input type='text' defaultValue={true} />, container);
      expect(realNode.name).toBe('');
      expect(realNode.getAttribute('name')).toBe(null);
    });

    it('受控input可以触发onChange', () => {
      let realNode = Inula.render(<input type='text' value={'name'} onChange={LogUtils.log('text change')} />, container);
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
      let realNode = Inula.render(<input type='radio' value={''} />, container);
      expect(realNode.value).toBe('');
      expect(realNode.getAttribute('value')).toBe('');
      realNode = Inula.render(<input type='radio' value={false} />, container);
      expect(realNode.value).toBe('false');
      expect(realNode.getAttribute('value')).toBe('false');
      realNode = Inula.render(<input type='radio' value={true} />, container);
      expect(realNode.value).toBe('true');
      expect(realNode.getAttribute('value')).toBe('true');
    });

    it('相同name且在同一表单的radio互斥', () => {
      Inula.render(
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
      const inputRef = Inula.createRef();
      const App = () => {
        const [isNum, setNum] = Inula.useState(false);
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
      Inula.render(<App />, container);
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
      Inula.render(<input type="submit" />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(false);
      Inula.unmountComponentAtNode(container);

      Inula.render(<input type="submit" value='' />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('');

      Inula.render(<input type="submit" value='submit' />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('submit');
    });
  });

  describe('type reset', () => {
    it('type reset value', () => {
      Inula.render(<input type="reset" />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(false);
      Inula.unmountComponentAtNode(container);

      Inula.render(<input type="reset" value='' />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('');

      Inula.render(<input type="reset" value='reset' />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('reset');
    });
  });

  describe('type number', () => {
    it('value值会把number类型转为字符串，且.xx转为0.xx', () => {
      Inula.render(<input type="number" value={.12} />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('0.12');
    });

    it('value值会把number类型转为字符串，且.xx转为0.xx', () => {
      Inula.render(<input type="number" value={.12} />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('0.12');
    });

    it('改变node.value值', () => {
      let setNum;
      const App = () => {
        const [num, _setNum] = Inula.useState('');
        setNum = _setNum;
        return <input type="number" value={num} readOnly={true} />;
      };
      Inula.render(<App />, container);
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
        const [num, _setNum] = Inula.useState(0.0000);
        setNum = _setNum;
        return <input type="number" value={num} readOnly={true} />;
      };
      Inula.render(<App />, container);
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
      Inula.render(<App />, container);
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
      Inula.render(<input type="reset" value={.12} />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('0.12');

      Inula.unmountComponentAtNode(container);
      Inula.render(<input type="reset" value={''} />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(true);
      expect(container.querySelector('input').getAttribute('value')).toBe('');

      Inula.unmountComponentAtNode(container);
      Inula.render(<input type="reset" />, container);
      expect(container.querySelector('input').hasAttribute('value')).toBe(false);
    });
  });
});
