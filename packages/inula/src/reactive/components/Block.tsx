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
import { calculateReactive } from '../Utils';

/**
 * Block可以控制更新范围，若View的children函数中通过get()使用了响应式数据，当响应式数据变化时，children函数会被重新执行，不会影响父组件。
 * <Block>
   {() => {
      const count = _rObj.count.get();
      return <>
        <div>{count}</div>
      </>;
    }}
   </Block>
 * @param children
 */
export function Block({ children }: { children: () => JSXElement }): any {
  const result = calculateReactive(children);

  return result;
}
