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

import * as Inula from '../../../libs/inula/index';
import { getLogUtils } from '../jest/testUtils';

describe('MouseEvent Test', () => {
  const LogUtils = getLogUtils();

  describe('onClick Test', () => {
    it('绑定this', () => {
      class App extends Inula.Component {
        constructor(props) {
          super(props);
          this.state = {
            num: this.props.num,
            price: this.props.price,
          };
        }

        setNum() {
          this.setState({ num: this.state.num + 1 });
        }

        setPrice = e => {
          this.setState({ num: this.state.price + 1 });
        };

        render() {
          return (
            <>
              <p>{this.state.num}</p>
              <p id="p">{this.state.price}</p>
              <button onClick={this.setNum.bind(this)}>button</button>
              <button id="btn" onClick={() => this.setPrice()}>
                button
              </button>
            </>
          );
        }
      }

      Inula.render(<App num={0} price={100} />, container);
      expect(container.querySelector('p').innerHTML).toBe('0');
      expect(container.querySelector('#p').innerHTML).toBe('100');
      // 点击按钮触发num加1
      container.querySelector('button').click();
      expect(container.querySelector('p').innerHTML).toBe('1');

      container.querySelector('#btn').click();
      expect(container.querySelector('p').innerHTML).toBe('101');
    });

    it('点击触发', () => {
      const handleClick = jest.fn();
      Inula.render(<button onClick={handleClick}>Click Me</button>, container);
      container.querySelector('button').click();
      expect(handleClick).toHaveBeenCalledTimes(1);
      for (let i = 0; i < 5; i++) {
        container.querySelector('button').click();
      }
      expect(handleClick).toHaveBeenCalledTimes(6);
    });

    it('disable不触发click', () => {
      const handleClick = jest.fn();
      const spanRef = Inula.createRef();
      Inula.render(
        <button onClick={handleClick} disabled={true}>
          <span ref={spanRef}>Click Me</span>
        </button>,
        container
      );
      spanRef.current.click();

      expect(handleClick).toHaveBeenCalledTimes(0);
    });
  });

  const test = (name, config) => {
    const node = Inula.render(config, container);
    let event = new MouseEvent(name, {
      relatedTarget: null,
      bubbles: true,
      screenX: 1,
    });
    node.dispatchEvent(event);

    expect(LogUtils.getAndClear()).toEqual([`${name} capture`, `${name} bubble`]);

    event = new MouseEvent(name, {
      relatedTarget: null,
      bubbles: true,
      screenX: 2,
    });
    node.dispatchEvent(event);

    // 再次触发新事件
    expect(LogUtils.getAndClear()).toEqual([`${name} capture`, `${name} bubble`]);
  };

  describe('合成鼠标事件', () => {
    it('onMouseMove', () => {
      const onMouseMove = () => {
        LogUtils.log('mousemove bubble');
      };
      const onMouseMoveCapture = () => {
        LogUtils.log('mousemove capture');
      };
      test('mousemove', <div onMouseMove={onMouseMove} onMouseMoveCapture={onMouseMoveCapture} />);
    });

    it('onMouseDown', () => {
      const onMousedown = () => {
        LogUtils.log('mousedown bubble');
      };
      const onMousedownCapture = () => {
        LogUtils.log('mousedown capture');
      };
      test('mousedown', <div onMousedown={onMousedown} onMousedownCapture={onMousedownCapture} />);
    });

    it('onMouseUp', () => {
      const onMouseUp = () => {
        LogUtils.log('mouseup bubble');
      };
      const onMouseUpCapture = () => {
        LogUtils.log('mouseup capture');
      };
      test('mouseup', <div onMouseUp={onMouseUp} onMouseUpCapture={onMouseUpCapture} />);
    });

    it('onMouseOut', () => {
      const onMouseOut = () => {
        LogUtils.log('mouseout bubble');
      };
      const onMouseOutCapture = () => {
        LogUtils.log('mouseout capture');
      };
      test('mouseout', <div onMouseOut={onMouseOut} onMouseOutCapture={onMouseOutCapture} />);
    });

    it('onMouseOver', () => {
      const onMouseOver = () => {
        LogUtils.log('mouseover bubble');
      };
      const onMouseOverCapture = () => {
        LogUtils.log('mouseover capture');
      };
      test('mouseover', <div onMouseOver={onMouseOver} onMouseOverCapture={onMouseOverCapture} />);
    });

    it('KeyboardEvent.getModifierState should not fail', () => {
      const input = Inula.render(<input
        onMouseDown={(e) => {
          e.getModifierState('CapsLock');
        }}
      />, container);
      const event = new MouseEvent('mousedown', {
        relatedTarget: null,
        bubbles: true,
        screenX: 1,
      });

      expect(() => {
        input.dispatchEvent(event);
      }).not.toThrow();
    });
  });
});
