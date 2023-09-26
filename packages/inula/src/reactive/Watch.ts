/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import { RContext } from './RContext';
import { calculateReactive } from './Utils';
import { Reactive } from './types';

export function watch(fn: () => any | Reactive, callback?: () => void): any {
  // 有两个参数，第一个是要监听数据/函数，第二个是回调
  if (typeof callback === 'function') {
    const effect = new RContext(() => {
      callback();
    });

    const endEffect = effect.start();

    calculateReactive(fn);

    endEffect();
  } else {
    // 只有一个参数
    const effect = new RContext(fn);

    const endEffect = effect.start();

    fn();

    endEffect();
  }
}
