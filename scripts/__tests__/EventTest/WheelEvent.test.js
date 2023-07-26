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

describe('合成滚轮事件', () => {
  const LogUtils = getLogUtils();

  it('onWheel', () => {
    const realNode = Inula.render(
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
    const realNode = Inula.render(
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
