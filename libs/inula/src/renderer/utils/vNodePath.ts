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

import { VNode } from '../vnode/VNode';

const PATH_DELIMITER = ',';

/**
 * 标记VNode在VNode树中的路径
 * @param vNode
 */
export function markVNodePath(vNode: VNode) {
  vNode.path = `${vNode.parent!.path}${PATH_DELIMITER}${vNode.cIndex}`;
}

export function getPathArr(vNode: VNode) {
  return vNode.path.split(PATH_DELIMITER);
}
