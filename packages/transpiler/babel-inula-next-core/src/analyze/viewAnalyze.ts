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

import { Visitor } from './types';
import { type types as t, type NodePath } from '@babel/core';
import { parseView as parseJSX } from 'jsx-view-parser';
import { getBabelApi } from '../babelTypes';
import { parseReactivity } from '@openinula/reactivity-parser';
import { reactivityFuncNames } from '../const';

/**
 * Analyze the watch in the function component
 */
export function viewAnalyze(): Visitor {
  return {
    ReturnStatement(path: NodePath<t.ReturnStatement>, { htmlTags, current }) {
      const returnNode = path.get('argument');
      if (returnNode.isJSXElement() || returnNode.isJSXFragment()) {
        const viewUnits = parseJSX(returnNode.node, {
          babelApi: getBabelApi(),
          htmlTags,
          parseTemplate: false,
        });
        const [viewParticles, usedPropertySet] = parseReactivity(viewUnits, {
          babelApi: getBabelApi(),
          availableProperties: current.availableProperties,
          dependencyMap: current.dependencyMap,
          reactivityFuncNames,
        });
      }
    },
  };
}
