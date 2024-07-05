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

import { Visitor } from '../types';
import { type NodePath } from '@babel/core';
import { parseView as parseJSX } from '@openinula/jsx-view-parser';
import { types as t, getBabelApi } from '@openinula/babel-api';
import { getDependenciesFromNode, parseReactivity } from '@openinula/reactivity-parser';
import { reactivityFuncNames } from '../../constants';
import { setReturnValue, setViewChild } from '../nodeFactory';
import { assertHookNode } from '../utils';

/**
 * Analyze the return in the hook
 */
export function hookReturnAnalyze(): Visitor {
  return {
    ReturnStatement(path: NodePath<t.ReturnStatement>, { current }) {
      const returnNode = path.node.argument;
      assertHookNode(current);
      if (returnNode) {
        const dependency = getDependenciesFromNode(returnNode, current._reactiveBitMap, reactivityFuncNames);
        setReturnValue(current, returnNode, dependency);
      }
    },
  };
}
