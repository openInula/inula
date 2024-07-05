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

import { ComponentNode, Visitor } from '../types';
import { type NodePath } from '@babel/core';
import { parseView as parseJSX } from '@openinula/jsx-view-parser';
import { types as t, getBabelApi } from '@openinula/babel-api';
import { parseReactivity } from '@openinula/reactivity-parser';
import { reactivityFuncNames } from '../../constants';
import { setViewChild } from '../nodeFactory';
import { assertComponentNode } from '../utils';

/**
 * Analyze the watch in the function component
 */
export function viewAnalyze(): Visitor {
  return {
    ReturnStatement(path: NodePath<t.ReturnStatement>, { htmlTags, current }) {
      const returnNode = path.get('argument');
      if (returnNode.isJSXElement() || returnNode.isJSXFragment()) {
        assertComponentNode(current);

        const viewUnits = parseJSX(returnNode.node, {
          babelApi: getBabelApi(),
          htmlTags,
          parseTemplate: false,
        });

        const [viewParticles, usedBit] = parseReactivity(viewUnits, {
          babelApi: getBabelApi(),
          depMaskMap: current._reactiveBitMap,
          reactivityFuncNames,
        });

        setViewChild(current, viewParticles, usedBit);
      }
    },
  };
}
