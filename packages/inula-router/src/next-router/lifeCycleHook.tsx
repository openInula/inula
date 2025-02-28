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

import { didUnmount, useLayoutEffect, didMount } from '@openinula/next';

export type LifeCycleProps = {
  onMount?: () => void;
  onUpdate?: (prevProps?: LifeCycleProps) => void;
  onUnmount?: () => void;
  data?: any;
};

export function LifeCycle({ onMount, onUpdate, onUnmount }: LifeCycleProps) {
  let isMount = false;

  didMount(() => {
    // 首次挂载 模拟componentDidMount
    if (!isMount) {
      isMount = true;
      if (onMount) {
        onMount();
      }
    } else {
      // 不是首次渲染 模拟componentDidUpdate
      if (onUpdate) {
        onUpdate();
      }
    }
  });

  didUnmount(() => {
    if (onUnmount) {
      onUnmount();
    }
  });

  return <div></div>;
}
