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

import Inula, { useComputed, useReactive, useRef } from '@cloudsop/horizon';

function ReactiveComponent() {
  const renderCount = ++useRef(0).current;

  const data = useReactive({ count: 0 });
  const countText = useComputed(() => {
    return `计时: ${data.count.get()}`;
  });

  setInterval(() => {
    data.count.set(c => c + 1);
  }, 1000);

  return (
    <div>
      <div>{countText}</div>
      <div>组件渲染次数:{renderCount}</div>
    </div>
  );
}

export default ReactiveComponent;
