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

import { useEffect, useState, useRef } from 'openinula';
import { throttle } from 'lodash';

export function SizeObserver(props: any) {
  const { children, ...rest } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const resizeFn = throttle((entries: ResizeObserverEntry[]) => {
    entries.forEach(entry => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
  }, 300);

  const observer = useRef<ResizeObserver>(new ResizeObserver(entries => resizeFn(entries)));

  useEffect(() => {
    const { offsetWidth, offsetHeight } = containerRef.current;
    setSize({ width: offsetWidth, height: offsetHeight });
    observer.current.observe(containerRef.current);
    return () => {
      observer.current.unobserve(containerRef.current);
    };
  }, []);

  const wrapper = size ? children(size.width, size.height) : null;

  return (
    <div ref={containerRef} {...rest}>
      {wrapper}
    </div>
  );
}
