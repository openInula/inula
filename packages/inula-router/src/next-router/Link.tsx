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

import { useContext, watch, Component } from '@openinula/next';
import RouterContext from './context';
import { Location } from './index';
import { createPath, parsePath } from '../history/utils';
import { Path } from '../history/types';

export type LinkProps = {
  component?: Component<any>;
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  replace?: boolean;
  tag?: string;
  innerRef?: HTMLAnchorElement;
} & { [key: string]: any };

const isModifiedEvent = (event: MouseEvent) => {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
};

const checkTarget = (target?: any) => {
  return !target || target === '_self';
};

function Link<P extends LinkProps>(props: P) {
  const { to, replace, component, onClick, target, children, ...other } = props;

  const tag = props.tag || 'a';

  const { history, location: locationCtx } = useContext(RouterContext);

  let location = typeof to === 'function' ? to(locationCtx) : to;

  let state: any;
  let path: Partial<Path>;
  watch(() => {
    if (typeof location === 'string') {
      path = parsePath(location);
    } else {
      const { pathname, hash, search } = location;
      path = { pathname, hash, search };
      state = location.state;
    }
  });

  const href = history.createHref(path!);

  const linkClickEvent = (event: MouseEvent) => {
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
      const isSamePath = createPath(locationCtx) === createPath(path);
      const navigate = replace || isSamePath ? history.replace : history.push;
      event.preventDefault();
      navigate(path, state);
    }
  };

  // TODO: 未实现tag，需要动态组件
  return (
    <a href={href} onClick={linkClickEvent} {...other}>
      {children}
    </a>
  );
}

export default Link;
