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
import { useEffect, useLayoutEffect, useRef } from 'openinula';
import { FN } from './types';

// 用于存储组件是否已挂载的状态
export const useIsMounted = () => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted.current;
};

export const onBeforeMount = (fn: FN) => {
  const isMounted = useIsMounted();
  if (!isMounted) {
    fn?.();
  }
};

export function onMounted(fn: FN) {
  useEffect(() => {
    fn?.();
  }, []);
}

export function onBeforeUpdate(fn: FN) {
  useEffect(() => {
    fn?.();
  });
}

export function onUpdated(fn: FN) {
  useEffect(() => {
    fn?.();
  });
}

export const onBeforeUnmount = (fn: FN) => {
  useLayoutEffect(() => {
    return () => {
      fn?.();
    };
  }, []);
};

export function onUnmounted(fn: FN) {
  useEffect(() => {
    return () => {
      fn?.();
    };
  }, []);
}
