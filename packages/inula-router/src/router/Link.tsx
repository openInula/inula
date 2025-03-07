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
import { useContext, MouseEvent, ComponentType, Ref } from 'openinula';
import RouterContext from './context';
import { Location } from './index';
import { createPath, parsePath } from '../history/utils';
import { Path } from '../history/types';

export type LinkProps = {
  component?: ComponentType<any>;
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  replace?: boolean;
  tag?: string;
  innerRef?: Ref<HTMLAnchorElement>;
} & { [key: string]: any };

const isModifiedEvent = (event: MouseEvent) => {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
};

const checkTarget = (target?: any) => {
  return !target || target === '_self';
};

function Link<P extends LinkProps>(props: P) {
  const { to, replace, component, onClick, target, ...other } = props;

  const tag = props.tag || 'a';

  const context = useContext(RouterContext);
  const history = context.history;

  const location = typeof to === 'function' ? to(context.location) : to;

  let state: any;
  let path: Partial<Path>;
  if (typeof location === 'string') {
    path = parsePath(location);
  } else {
    const { pathname, hash, search } = location;
    path = { pathname, hash, search };
    state = location.state;
  }
  const href = location ? history.createHref(path) : '';

  const linkClickEvent = (event: MouseEvent<HTMLAnchorElement>) => {
    try {
      if (onClick) {
        onClick(event);
      }
    } catch (e) {
      event.preventDefault();
      throw e;
    }

    if (!event.defaultPrevented && event.button === 0 && checkTarget(target) && !isModifiedEvent(event)) {
      // 不是相同的路径执行push操作，是相同的路径执行replace
      const isSamePath = createPath(context.location) === createPath(path);
      const navigate = replace || isSamePath ? history.replace : history.push;
      event.preventDefault();
      navigate(path, state);
    }
  };

  const linkProps = { href: href, onClick: linkClickEvent, ...other };
  return Inula.createElement(tag, linkProps);
}

export default Link;
