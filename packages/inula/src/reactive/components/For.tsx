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

import { JSXElement } from '../../renderer/Types';
import { createElement } from '../../external/JSXElement';
import { useMemo } from '../../renderer/hooks/HookExternal';
import { memo } from '../../renderer/components/Memo';
import { shallowCompare } from '../../renderer/utils/compare';
import { ArrayState } from '../types';
import { GET_R_NODE } from '../proxy/RProxyHandler';

/**
 * For组件用于循环渲染数据
 * @param each 包含要循环的数据的可观察对象
 * @param children 渲染每个数据项的子组件
 * @returns 返回JSX元素或null
 */
export function For<T>({
  each,
  children,
}: {
  each: any;
  children?: (value: any, index: number) => JSXElement;
}): JSXElement[] | null {
  // 获取可观察对象中的数据数组
  const reactiveArr = each.get();

  if (!reactiveArr || !reactiveArr.length) {
    return null;
  }

  const rNode = each[GET_R_NODE];
  const states = rNode.states !== undefined ? rNode.states : [];

  let Item: Partial<JSXElement> | null = null;

  if (children) {
    Item = useMemo(() => {
      return memo(({ item, index }) => children(item, index), itemCompare);
    }, []);
  }

  const ret: JSXElement[] = [];
  const len = reactiveArr.length;
  for (let i = 0; i < len; i++) {
    const state = states[i];
    const isFresh = state === ArrayState.Fresh;

    // 创建并添加JSX元素
    ret.push(createElement(Item, { isFresh, item: each[i], index: i }));
  }

  // 用完，重置
  rNode.states = [];

  // 合并多次的diffOperator
  if (rNode.diffOperators) {
    rNode.diffOperators.forEach(() => {

    });
  }

  ret.diffOperator = rNode.diffOperator;
  // 用完，删除
  delete rNode.diffOperators;
  delete rNode.diffOperator;

  // 返回JSX元素数组
  return ret;
}

// 如果属性中有isFresh，就优先判断isFresh
function itemCompare(oldProps, newProps) {
  if (newProps.isFresh !== undefined) {
    return Boolean(newProps.isFresh);
  } else {
    return shallowCompare(oldProps, newProps);
  }
}
