/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import * as Horizon from '@cloudsop/horizon/index.ts';
import { getLogUtils } from '../jest/testUtils';

describe('合成焦点事件', () => {
  const LogUtils = getLogUtils();

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
  });
});
