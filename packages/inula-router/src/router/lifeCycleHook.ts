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

import { useLayoutEffect, useRef } from '@cloudsop/horizon';

export type LifeCycleProps = {
  onMount?: () => void;
  onUpdate?: (prevProps?: LifeCycleProps) => void;
  onUnmount?: () => void;
  data?: any;
};

export function LifeCycle(props: LifeCycleProps) {
  // 使用ref保存上一次的props，防止重新渲染
  const prevProps = useRef<LifeCycleProps | null>(null);
  const isMount = useRef(false);

  const { onMount, onUpdate, onUnmount } = props;

  useLayoutEffect(() => {
    // 首次挂载 模拟componentDidMount
    if (!isMount.current) {
      isMount.current = true;
      if (onMount) {
        onMount();
      }
    } else {
      // 不是首次渲染 模拟componentDidUpdate
      if (onUpdate) {
        prevProps.current ? onUpdate(prevProps.current) : onUpdate();
      }
    }
    prevProps.current = props;
  });

  // 模拟componentWillUnmount
  useLayoutEffect(() => {
    return () => {
      if (onUnmount) {
        onUnmount();
      }
    };
  }, []);

  return null;
}
