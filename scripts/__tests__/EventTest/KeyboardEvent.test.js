import * as Horizon from '@cloudsop/horizon/index.ts';
import * as LogUtils from '../jest/logUtils';

describe('Keyboard Event', () => {

  it('keydown,keypress,keyup的keycode,charcode', () => {
    const node = Horizon.render(
      <input
        onKeyUp={(e) => {
          LogUtils.log('onKeyUp: keycode: ' + e.keyCode + ',charcode: ' + e.charCode);
        }}
        onKeyDown={(e) => {
          LogUtils.log('onKeyDown: keycode: ' + e.keyCode + ',charcode: ' + e.charCode)
        }}
      />,
      container,
    );
    node.dispatchEvent(
      new KeyboardEvent('keydown', {
        keyCode: 50,
        code: 'Digit2',
        bubbles: true,
        cancelable: true,
      }),
    );
    node.dispatchEvent(
      new KeyboardEvent('keyup', {
        keyCode: 50,
        code: 'Digit2',
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(LogUtils.getAndClear()).toEqual([
      'onKeyDown: keycode: 50,charcode: 0',
      'onKeyUp: keycode: 50,charcode: 0'
    ]);
  });

  it('keypress的keycode,charcode', () => {
    const node = Horizon.render(
      <input
        onKeyPress={(e) => {
          LogUtils.log('onKeyPress: keycode: ' + e.keyCode + ',charcode: ' + e.charCode);
        }}
      />,
      container,
    );
    node.dispatchEvent(
      new KeyboardEvent('keypress', {
        charCode: 50,
        code: 'Digit2',
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(LogUtils.getAndClear()).toEqual([
      'onKeyPress: keycode: 0,charcode: 50'
    ]);
  });

  it('当charcode为13,且不设置keycode的时候', () => {
    const node = Horizon.render(
      <input
        onKeyPress={(e) => {
          LogUtils.log('onKeyPress: keycode: ' + e.keyCode + ',charcode: ' + e.charCode);
        }}
      />,
      container,
    );
    node.dispatchEvent(
      new KeyboardEvent('keypress', {
        charCode: 13,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(LogUtils.getAndClear()).toEqual([
      'onKeyPress: keycode: 0,charcode: 13'
    ]);
  });

  it('keydown,keypress,keyup的code', () => {
    const node = Horizon.render(
      <input
        onKeyUp={(e) => {
          LogUtils.log('onKeyUp: code: ' + e.code);
        }}
        onKeyPress={(e) => {
          LogUtils.log('onKeyPress: code: ' + e.code);
        }}
        onKeyDown={(e) => {
          LogUtils.log('onKeyDown: code: ' + e.code);
        }}
      />,
      container,
    );
    node.dispatchEvent(
      new KeyboardEvent('keydown', {
        code: 'Digit2',
        bubbles: true,
        cancelable: true,
      }),
    );

    node.dispatchEvent(
      new KeyboardEvent('keypress', {
        keyCode: 50,
        code: 'Digit2',
        bubbles: true,
        cancelable: true,
      }),
    );

    node.dispatchEvent(
      new KeyboardEvent('keyup', {
        code: 'Digit2',
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(LogUtils.getAndClear()).toEqual([
      'onKeyDown: code: Digit2',
      'onKeyPress: code: Digit2',
      'onKeyUp: code: Digit2'
    ]);
  });

  it('可以执行preventDefault和 stopPropagation', () => {
    const keyboardProcessing = e => {
      expect(e.isDefaultPrevented()).toBe(false);
      e.preventDefault();
      expect(e.isDefaultPrevented()).toBe(true);

      expect(e.isPropagationStopped()).toBe(false);
      e.stopPropagation();
      expect(e.isPropagationStopped()).toBe(true);
      LogUtils.log(e.type + ' handle');
    };
    const div = Horizon.render(
      <div
        onKeyDown={keyboardProcessing}
        onKeyUp={keyboardProcessing}
        onKeyPress={keyboardProcessing}
      />,
      container,
    );

    div.dispatchEvent(
      new KeyboardEvent('keydown', {
        keyCode: 40,
        bubbles: true,
        cancelable: true,
      }),
    );
    div.dispatchEvent(
      new KeyboardEvent('keyup', {
        keyCode: 40,
        bubbles: true,
        cancelable: true,
      }),
    );
    div.dispatchEvent(
      new KeyboardEvent('keypress', {
        charCode: 40,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(LogUtils.getAndClear()).toEqual([
      'keydown handle',
      'keyup handle',
      'keypress handle'
    ]);
  });
});
