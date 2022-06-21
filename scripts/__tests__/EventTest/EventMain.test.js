import * as Horizon from '@cloudsop/horizon/index.ts';
import * as TestUtils from '../jest/testUtils';

describe('事件', () => {
  const LogUtils = TestUtils.getLogUtils();
  it('根节点挂载全量事件', () => {
    const App = () => {
      return <div />;
    };
    Horizon.render(<App />, container);
    console.log(TestUtils.getEventListeners(container));
    //expect(TestUtils.getEventListeners(container)).toBe(true);
  });

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
    Horizon.render(<App />, container);
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
    const node = Horizon.render(
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
    Horizon.render(<App />, container);
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
    Horizon.render(<App />, container);
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
    Horizon.render(<App />, container);
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
    let inputRef = Horizon.createRef();

    function Test() {
      const [inputProps, setProps] = Horizon.useState({});
      update = setProps;
      return <input ref={inputRef} {...inputProps} />;
    }

    Horizon.render(<Test />, container);
    update({
      onChange: () => {
        LogUtils.log('change');
      },
    });

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(inputRef.current, 'test');

    inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));

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

    const radio1Ref = Horizon.createRef();
    const radio2Ref = Horizon.createRef();

    Horizon.render(
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
});
