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

import { RContextCallback, RContextParam, Reactive } from './types';
import { VNode } from '../renderer/Types';
import { updateShouldUpdateOfTree } from '../renderer/vnode/VNodeShouldUpdate';

export interface BatchItem {
  callback: RContextCallback;
  params: RContextParam;
  reactive: Reactive;
}

let batchCount = 0;
let _batch: BatchItem[] = [];
let _batchMap = new Map();

export function addToBatch(item: BatchItem) {
  if (batchCount > 0) {
    const existing = _batchMap.get(item.callback);

    if (existing) {
      // const params = existing.params;
      // params.value = item.params.value;
    } else {
      _batch.push(item);
      _batchMap.set(item.callback, true);
    }
  } else {
    item.callback(item.params, item.reactive);
  }
}

export function startBatch() {
  batchCount++;
}

export function endBatch() {
  batchCount--;

  if (batchCount <= 0) {
    batchCount = 0;
    const batch = _batch;
    _batch = [];
    _batchMap = new Map();

    const toUpdateVNodes: VNode[] = [];
    const toUpdateVNodeItems: BatchItem[] = [];

    for (let i = 0; i < batch.length; i++) {
      const b = batch[i];

      // 如果要刷新的是组件（函数组件或类组件）
      if (b.params?.vNode) {
        // 设置vNode为shouldUpdate
        updateShouldUpdateOfTree(b.params.vNode);

        b.params.vNode.isStoreChange = true;

        toUpdateVNodes.push(b.params.vNode);
        toUpdateVNodeItems.push(b);
      }
    }

    for (let i = 0; i < batch.length; i++) {
      const b = batch[i];
      const { callback, reactive } = b;

      if (!b.params?.vNode) {
        callback(b.params, reactive);
      }
    }

    if (toUpdateVNodes.length) {
      const b = toUpdateVNodeItems[0];
      const { callback, reactive } = b;
      callback(b.params, reactive);
    }
  }
}
