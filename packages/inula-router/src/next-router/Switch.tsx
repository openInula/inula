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

import Inula from '@openinula/next';
import { useContext, InulaNode, InulaElement } from '@openinula/next';

import { Location } from './index';
import RouterContext from './context';
import { Matched, matchPath } from './matcher/parser';
import Route, { RouteProps } from './Route';
import Redirect, { RedirectProps } from './Redirect';
import { watch } from '@openinula/next';

export type SwitchProps = {
  locProp?: Location;
  children?: InulaNode;
};

function Switch<P extends SwitchProps>({ locProp, children }: P): InulaElement | null {
  const context = useContext(RouterContext);
  const location = locProp || context.location;

  let element: InulaElement | null = null;
  let match: Matched | null = null;

  watch(() => {
    // 使用forEach不会给InulaNode增加key属性,防止重新渲染
    children().find(node => {
      if (match === null) {
        element = node;

        let strict: boolean | undefined;
        let sensitive: boolean | undefined;
        let path: string | string[] | undefined;
        let from: string | undefined;

        // node可能是Route和Redirect
        if (node.type === Route) {
          ({ strict, sensitive, path } = node.props as RouteProps);
        } else if (node.type === Redirect) {
          ({ path, strict, from } = node.props as RedirectProps);
        }

        const exact = node.props.exact;
        const target = path || from;

        // 更新匹配状态，一旦匹配到停止遍历
        if (target) {
          match = matchPath(location.pathname, target, {
            strictMode: strict,
            caseSensitive: sensitive,
            exact: exact,
          });
        } else {
          match = context.match;
        }
      }
    });
  });

  if (match && element) {
    // TODO: 使用cloneElement复制已有组件并更新其Props
    return <div>{element}</div>;
  }
  return null;
}

export default Switch;
