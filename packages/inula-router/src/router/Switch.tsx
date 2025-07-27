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

import Inula from 'openinula';
import { useContext, Children, isValidElement, cloneElement, InulaNode, InulaElement } from 'openinula';

import { Location } from './index';
import RouterContext from './context';
import { Matched, matchPath } from './matcher/parser';
import type { RouteProps } from './Route';
import type { RedirectProps } from './Redirect';

export type SwitchProps = {
  location?: Location;
  children?: InulaNode;
};

type MergeType<T1, T2> = { [K in keyof (T1 & T2)]: K extends keyof T1 ? T1[K] : K extends keyof T2 ? T2[K] : never };

function Switch<P extends SwitchProps>(props: P): InulaElement | null {
  const context = useContext(RouterContext);
  const location = props.location || context.location;

  let element: InulaElement | null = null;
  let match: Matched | null = null;

  // 使用forEach不会给React.ReactNode增加key属性,防止重新渲染
  Children.forEach(props.children, node => {
    if (match === null && isValidElement(node)) {
      element = node;

      const elementProps: MergeType<RouteProps, RedirectProps> = node.props;
      const target = elementProps.path || elementProps.from;

      // 更新匹配状态，一旦匹配到停止遍历
      if (target) {
        match = matchPath(location.pathname, target, {
          strictMode: elementProps.strict,
          caseSensitive: elementProps.sensitive,
          exact: elementProps.exact,
        });
      } else {
        match = context.match;
      }
    }
  });

  if (match && element) {
    // 使用cloneElement复制已有组件并更新其Props
    return cloneElement(element, { location: location, computed: match });
  }
  return null;
}

export default Switch;
