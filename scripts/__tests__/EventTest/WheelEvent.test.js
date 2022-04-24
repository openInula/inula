import * as Horizon from '@cloudsop/horizon/index.ts';
import { getLogUtils } from '../jest/testUtils';

describe('合成滚轮事件', () => {
  const LogUtils = getLogUtils();

  it('onWheel', () => {
    const realNode = Horizon.render(
      <div
        onWheel={event => LogUtils.log(`onWheel: ${event.type}`)}
        onWheelCapture={event => LogUtils.log(`onWheelCapture: ${event.type}`)}
      />, container);

    realNode.dispatchEvent(
      new MouseEvent('wheel', {
        bubbles: true,
        cancelable: false,
      }),
    );

    expect(LogUtils.getAndClear()).toEqual([
      'onWheelCapture: wheel',
      'onWheel: wheel'
    ]);
  });

  it('可以执行preventDefault和stopPropagation', () => {
    const eventHandler = e => {
      expect(e.isDefaultPrevented()).toBe(false);
      e.preventDefault();
      expect(e.isDefaultPrevented()).toBe(true);

      expect(e.isPropagationStopped()).toBe(false);
      e.stopPropagation();
      expect(e.isPropagationStopped()).toBe(true);
      LogUtils.log(e.type + ' handle');
    };
    const realNode = Horizon.render(
      <div onWheel={eventHandler} />,
      container
    );

    realNode.dispatchEvent(
      new MouseEvent('wheel', {
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(LogUtils.getAndClear()).toEqual([
      'wheel handle'
    ]);
  });

});