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
      'div bubble'
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
      container,
    );
    node.dispatchEvent(
      new KeyboardEvent('keypress', {
        keyCode: 65,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(keyCode).toBe(65);
  });

  it('阻止事件冒泡', () => {
    const App = () => {
      return (
        <>
          <div onClickCapture={() => LogUtils.log('div capture')} onClick={() => LogUtils.log('div bubble')}>
            <p onClickCapture={() => LogUtils.log('p capture')} onClick={() => LogUtils.log('p bubble')}>
              <button onClickCapture={() => LogUtils.log('btn capture')} onClick={(e) => TestUtils.stopBubbleOrCapture(e, 'btn bubble')} />
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
      'btn bubble'
    ]);
  });

  it('阻止事件捕获', () => {
    const App = () => {
      return (
        <>
          <div onClickCapture={(e) => TestUtils.stopBubbleOrCapture(e, 'div capture')} onClick={() => LogUtils.log('div bubble')}>
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
      'div capture'
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
    container.querySelector('div').addEventListener('click', () => {
      LogUtils.log('div bubble');
    }, false);
    container.querySelector('p').addEventListener('click', () => {
      LogUtils.log('p bubble');
    }, false);
    container.querySelector('button').addEventListener('click', (e) => {
      LogUtils.log('btn bubble');
      e.stopPropagation();
    }, false);
    container.querySelector('button').click();
    expect(LogUtils.getAndClear()).toEqual([
      'btn bubble'
    ]);
  });
});
