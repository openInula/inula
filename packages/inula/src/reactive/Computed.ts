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

import { Computed } from './types';
import { createReactiveObj, setRNodeVal } from './RNode';
import { calculateReactive, getRNode, isPromise } from './Utils';
import { RContext } from './RContext';

function computed<T = any>(fn: () => T | Promise<T>): Computed<T> {
  const setComputed = (value: any, trigger: boolean) => {
    root.readOnly = false;
    const raw = getRNode(rObj);
    setRNodeVal(raw, value, trigger);
    root.readOnly = true;
  };

  // 依赖的响应式数据变化时调用
  const update = (trigger: boolean) => {
    const value = calculateReactive(fn);
    if (isPromise(value)) {
      value.then(val => setComputed(val, trigger));
    } else {
      setComputed(value, trigger);
    }
  };

  const rContext = new RContext(() => update(true));
  const end = rContext.start();
  // 首次更新不触发usedRContexts
  const value = calculateReactive(fn);
  end();

  const rObj = createReactiveObj(value);

  const rawNode = getRNode(rObj);
  const root = rawNode.root;
  // 默认readOnly为true
  root.readOnly = true;

  return rObj as Computed<T>;
}

export { computed };
