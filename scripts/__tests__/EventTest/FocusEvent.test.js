import * as Horizon from '@cloudsop/horizon/index.ts';
import * as LogUtils from '../jest/logUtils';

describe('合成焦点事件', () => {

  it('onFocus', () => {
    const realNode = Horizon.render(
      <input
        onFocus={event => LogUtils.log(`onFocus: ${event.type}`)}
        onFocusCapture={event => LogUtils.log(`onFocusCapture: ${event.type}`)}
      />, container);

    realNode.dispatchEvent(
      new FocusEvent('focusin', {
        bubbles: true,
        cancelable: false,
      }),
    );

    expect(LogUtils.getAndClear()).toEqual([
      'onFocusCapture: focus',
      'onFocus: focus',
    ]);
  });

  it('onBlur', () => {
    const realNode = Horizon.render(
      <input
        onBlur={event => LogUtils.log(`onBlur: ${event.type}`)}
        onBlurCapture={event => LogUtils.log(`onBlurCapture: ${event.type}`)}
      />, container);

    realNode.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        cancelable: false,
      }),
    );

    expect(LogUtils.getAndClear()).toEqual([
      'onBlurCapture: blur',
      'onBlur: blur',
    ]);
  })
})
