/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { CompNode } from './CompNode.js';
import { inMount } from './index.js';

export class HookNode extends CompNode {
  /**
   *
   * @param {HookNode | CompNode} currentComp
   * @param {number}bitMap
   */
  constructor(currentComp, bitMap) {
    super();
    this.parent = currentComp;
    this.bitMap = bitMap;
  }

  /**
   * update prop
   * @param {string} propName
   * @param {any }value
   */
  updateHook(propName, value) {
    this.update();
  }

  emitUpdate() {
    // the new value is not used in the `updateDerived`, just pass a null
    this.parent.updateDerived(null, this.bitMap);
  }

  setUpdateFunc({ value, ...updater }) {
    super.setUpdateFunc(updater);
    this.value = value;
  }

  updateProp(...args) {
    if (!inMount()) {
      super.updateProp(...args);
    }
  }
}
