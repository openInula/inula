/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import { Children } from '../../external/ChildrenUtil';
import { Props } from '../utils/Interface';

// 把 const a = 'a'; <option>gir{a}ffe</option> 转成 giraffe
function concatChildren(children) {
  let content = '';
  Children.forEach(children, function (child) {
    content += child;
  });

  return content;
}

export function getOptionPropsWithoutValue(dom: Element, props: Props) {
  const content = concatChildren(props.children);

  return {
    ...props,
    children: content || undefined, // 覆盖children
  };
}
