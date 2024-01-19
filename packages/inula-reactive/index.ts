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

import { createComputed as computed, createReactive as reactive, createWatch as watch} from './src/RNodeCreator';
import { isReactiveObj } from './src/Utils';
import { RNode, untrack } from './src/RNode';

export interface Index {
  reactive<T>(initialValue: T): RNode<T>;

  watch(fn: () => void): void;

  computed<T>(fn: () => T): RNode<T>;
}

export {
  reactive,
  watch,
  computed,
  isReactiveObj,
  untrack
}
