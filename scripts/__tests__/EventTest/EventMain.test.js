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
import * as TestUtils from '../jest/testUtils';

function dispatchChangeEvent(input) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputValueSetter.call(input, 'test');

  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('事件', () => {
  const LogUtils = TestUtils.getLogUtils();

  it('事件捕获与冒泡', () => {
    const App = () => {
      return (
        <>
          <div onClickCapture={() => LogUtils.log('div capture')} onClick={() => LogUtils.log('div bubble')}>
            <p onClickCapture={() => LogUtils.log('p capture')} onClick={() => LogUtils.log('p bubble')}>
              <button onClickCapture={() => LogUtils.log('btn capture')} onClick={() => LogUtils.log('btn bubble')} />
            </p>
          </div>
        </>
      );
    };
    Inula.render(<App />, container);
    const a = container.querySelector('button');
    a.click();
    expect(LogUtils.getAndClear()).toEqual([
      // 从外到内先捕获再冒泡
      'div capture',
      'p capture',
      'btn capture',
      'btn bubble',
      'p bubble',
      'div bubble',
    ]);
  });

  it('returns 0', () => {
    let keyCode = null;
    const node = Inula.render(
      <input
        onKeyPress={e => {
          keyCode = e.keyCode;
        }}
      />,
      container
    );
    node.dispatchEvent(
      new KeyboardEvent('keypress', {
        keyCode: 65,
        bubbles: true,
        cancelable: true,
      })
    );
    expect(keyCode).toBe(65);
  });

  it('阻止事件冒泡', () => {
    const App = () => {
      return (
        <>
          <div onClickCapture={() => LogUtils.log('div capture')} onClick={() => LogUtils.log('div bubble')}>
            <p onClickCapture={() => LogUtils.log('p capture')} onClick={() => LogUtils.log('p bubble')}>
              <button
                onClickCapture={() => LogUtils.log('btn capture')}
                onClick={e => TestUtils.stopBubbleOrCapture(e, 'btn bubble')}
              />
            </p>
          </div>
        </>
      );
    };
    Inula.render(<App />, container);
    container.querySelector('button').click();

    expect(LogUtils.getAndClear()).toEqual([
      // 到button时停止冒泡
      'div capture',
      'p capture',
      'btn capture',
      'btn bubble',
    ]);
  });

  it('阻止事件捕获', () => {
    const App = () => {
      return (
        <>
          <div
            onClickCapture={e => TestUtils.stopBubbleOrCapture(e, 'div capture')}
            onClick={() => LogUtils.log('div bubble')}
          >
            <p onClickCapture={() => LogUtils.log('p capture')} onClick={() => LogUtils.log('p bubble')}>
              <button onClickCapture={() => LogUtils.log('btn capture')} onClick={() => LogUtils.log('btn bubble')} />
            </p>
          </div>
        </>
      );
    };
    Inula.render(<App />, container);
    container.querySelector('button').click();

    expect(LogUtils.getAndClear()).toEqual([
      // 阻止捕获，不再继续向下执行
      'div capture',
    ]);
  });

  it('阻止原生事件冒泡', () => {
    const App = () => {
      return (
        <div>
          <p>
            <button />
          </p>
        </div>
      );
    };
    Inula.render(<App />, container);
    container.querySelector('div').addEventListener(
      'click',
      () => {
        LogUtils.log('div bubble');
      },
      false
    );
    container.querySelector('p').addEventListener(
      'click',
      () => {
        LogUtils.log('p bubble');
      },
      false
    );
    container.querySelector('button').addEventListener(
      'click',
      e => {
        LogUtils.log('btn bubble');
        e.stopPropagation();
      },
      false
    );
    container.querySelector('button').click();
    expect(LogUtils.getAndClear()).toEqual(['btn bubble']);
  });

  it('动态增加事件', () => {
    let update;
    let inputRef = Inula.createRef();

    function Test() {
      const [inputProps, setProps] = Inula.useState({});
      update = setProps;
      return <input ref={inputRef} {...inputProps} />;
    }

    Inula.render(<Test />, container);
    update({
      onChange: () => {
        LogUtils.log('change');
      },
    });
    dispatchChangeEvent(inputRef.current);

    expect(LogUtils.getAndClear()).toEqual(['change']);
  });

  it('Radio change事件', () => {
    let radio1Called = 0;
    let radio2Called = 0;

    function onChange1() {
      radio1Called++;
    }

    function onChange2() {
      radio2Called++;
    }

    const radio1Ref = Inula.createRef();
    const radio2Ref = Inula.createRef();

    Inula.render(
      <>
        <input type="radio" ref={radio1Ref} name="name" onChange={onChange1} />
        <input type="radio" ref={radio2Ref} name="name" onChange={onChange2} />
      </>,
      container
    );

    function clickRadioAndExpect(radio, [expect1, expect2]) {
      radio.click();
      expect(radio1Called).toBe(expect1);
      expect(radio2Called).toBe(expect2);
    }

    // 先选择选项1
    clickRadioAndExpect(radio1Ref.current, [1, 0]);

    // 再选择选项1
    clickRadioAndExpect(radio2Ref.current, [1, 1]);

    // 先选择选项1，radio1应该重新触发onchange
    clickRadioAndExpect(radio1Ref.current, [2, 1]);
  });

  it('多根节点下，事件挂载正确', () => {
    const root1 = document.createElement('div');
    const root2 = document.createElement('div');
    root1.key = 'root1';
    root2.key = 'root2';
    let input1, input2, update1, update2;

    function App1() {
      const [props, setProps] = Inula.useState({});
      update1 = setProps;
      return (
        <input
          {...props}
          ref={n => (input1 = n)}
          onChange={() => {
            LogUtils.log('input1 changed');
          }}
        />
      );
    }

    function App2() {
      const [props, setProps] = Inula.useState({});
      update2 = setProps;

      return (
        <input
          {...props}
          ref={n => (input2 = n)}
          onChange={() => {
            LogUtils.log('input2 changed');
          }}
        />
      );
    }

    // 多根mount阶段挂载onChange事件
    Inula.render(<App1 key={1} />, root1);
    Inula.render(<App2 key={2} />, root2);

    dispatchChangeEvent(input1);
    expect(LogUtils.getAndClear()).toEqual(['input1 changed']);
    dispatchChangeEvent(input2);
    expect(LogUtils.getAndClear()).toEqual(['input2 changed']);

    // 多根update阶段挂载onClick事件
    update1({
      onClick: () => LogUtils.log('input1 clicked'),
    });
    update2({
      onClick: () => LogUtils.log('input2 clicked'),
    });

    input1.click();
    expect(LogUtils.getAndClear()).toEqual(['input1 clicked']);
    input2.click();
    expect(LogUtils.getAndClear()).toEqual(['input2 clicked']);
  });
});
