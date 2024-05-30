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

import { ComponentNode } from '../analyze/types';
import { generateView } from '@openinula/view-generator/src';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { importMap, alterAttributeMap, defaultAttributeMap } from '../constants';

export function generateUpdateViews(root: ComponentNode) {
  if (root.children) {
    return generateView(root.children, {
      babelApi: getBabelApi(),
      importMap,
      attributeMap: defaultAttributeMap,
      alterAttributeMap,
      templateIdx: -1,
    });
  }

  return null;
}
