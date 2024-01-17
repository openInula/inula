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
import { addResizeListener, removeResizeListener } from './resizeEvent';

export function SizeObserver(props) {
  const { children, ...rest } = props;
  const containerRef = useRef<HTMLDivElement>();
  const [size, setSize] = useState<{ width: number; height: number }>();
  const notifyChild = element => {
    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  };

  useEffect(() => {
    const element = containerRef.current!;
    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
    addResizeListener(element, notifyChild);
    return () => {
      removeResizeListener(element, notifyChild);
    };
  }, []);
  const myChild = size ? children(size.width, size.height) : null;

  return (
    <div ref={containerRef} {...rest}>
      {myChild}
    </div>
  );
}
