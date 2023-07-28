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
import {getLogUtils} from '../jest/testUtils';

describe('Keyboard Event', () => {
  const LogUtils = getLogUtils();
  const getKeyboardEvent = (type, keyCode, code, charCode) => {
    return new KeyboardEvent(type, {
      keyCode: keyCode ?? undefined,
      code: code ?? undefined,
      charCode: charCode ?? undefined,
      bubbles: true,
      cancelable: true,
    });
  };

  it('keydown,keypress,keyup的keycode,charcode', () => {
    const node = Inula.render(
      <input
        onKeyUp={(e) => {
          LogUtils.log('onKeyUp: keycode: ' + e.keyCode + ',charcode: ' + e.charCode);
        }}
        onKeyDown={(e) => {
          LogUtils.log('onKeyDown: keycode: ' + e.keyCode + ',charcode: ' + e.charCode);
        }}
      />,
      container,
    );
    node.dispatchEvent(getKeyboardEvent('keydown', 50, 'Digit2'));
    node.dispatchEvent(getKeyboardEvent('keyup', 50, 'Digit2'));

    expect(LogUtils.getAndClear()).toEqual([
      'onKeyDown: keycode: 50,charcode: 0',
      'onKeyUp: keycode: 50,charcode: 0',
    ]);
  });

  it('keypress的keycode,charcode', () => {
    const node = Inula.render(
      <input
        onKeyPress={(e) => {
          LogUtils.log('onKeyPress: keycode: ' + e.keyCode + ',charcode: ' + e.charCode);
        }}
      />,
      container,
    );
    node.dispatchEvent(getKeyboardEvent('keypress', undefined, 'Digit2', 50));

    expect(LogUtils.getAndClear()).toEqual([
      'onKeyPress: keycode: 0,charcode: 50',
    ]);
  });

  it('当charcode为13,且不设置keycode的时候', () => {
    const node = Inula.render(
      <input
        onKeyPress={(e) => {
          LogUtils.log('onKeyPress: keycode: ' + e.keyCode + ',charcode: ' + e.charCode);
        }}
      />,
      container,
    );
    node.dispatchEvent(getKeyboardEvent('keypress', undefined, undefined, 13));
    expect(LogUtils.getAndClear()).toEqual([
      'onKeyPress: keycode: 0,charcode: 13',
    ]);
  });

  it('keydown,keypress,keyup的code', () => {
    const node = Inula.render(
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
    node.dispatchEvent(getKeyboardEvent('keydown', undefined, 'Digit2'));
    node.dispatchEvent(getKeyboardEvent('keypress', undefined, 'Digit2', 50));

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
      'onKeyUp: code: Digit2',
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
    const div = Inula.render(
      <div
        onKeyDown={keyboardProcessing}
        onKeyUp={keyboardProcessing}
        onKeyPress={keyboardProcessing}
      />,
      container,
    );
    div.dispatchEvent(getKeyboardEvent('keydown', 40));
    div.dispatchEvent(getKeyboardEvent('keyup', 40));
    div.dispatchEvent(getKeyboardEvent('keypress', 40));

    expect(LogUtils.getAndClear()).toEqual([
      'keydown handle',
      'keyup handle',
      'keypress handle',
    ]);
  });
});
