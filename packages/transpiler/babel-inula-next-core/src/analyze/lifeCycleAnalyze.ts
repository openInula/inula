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

import { NodePath } from '@babel/core';
import { LifeCycle, Visitor } from './types';
import { addLifecycle } from './nodeFactory';
import * as t from '@babel/types';
import { ON_MOUNT, ON_UNMOUNT, WILL_MOUNT, WILL_UNMOUNT } from '../constants';
import { extractFnFromMacro, getFnBody } from '../utils';

function isLifeCycleName(name: string): name is LifeCycle {
  return [WILL_MOUNT, ON_MOUNT, WILL_UNMOUNT, ON_UNMOUNT].includes(name);
}
/**
 * Analyze the lifeCycle in the function component
 * 1. willMount
 * 2. onMount
 * 3. willUnMount
 * 4. onUnmount
 */
export function lifeCycleAnalyze(): Visitor {
  return {
    CallExpression(path: NodePath<t.CallExpression>, ctx) {
      const callee = path.get('callee');
      if (callee.isIdentifier(path)) {
        const lifeCycleName = callee.node.name;
        if (isLifeCycleName(lifeCycleName)) {
          const fnNode = extractFnFromMacro(path, lifeCycleName);
          addLifecycle(ctx.currentComponent, lifeCycleName, getFnBody(fnNode));
        }
      }
    },
  };
}
