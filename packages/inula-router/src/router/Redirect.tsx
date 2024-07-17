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
import { useContext } from 'openinula';
import RouterContext from './context';
import { LifeCycle, LifeCycleProps } from './lifeCycleHook';
import { Matched, createPathParser } from './matcher/parser';
import { addHeadSlash, isLocationEqual, parsePath } from '../history/utils';
import { Location } from './index';

export type RedirectProps = {
  to: string | Partial<Location>;
  push?: boolean;
  path?: string;
  from?: string;
  exact?: boolean;
  strict?: boolean;

  // 由Switch计算得到
  readonly computed?: Matched | null;
};

function Redirect<P extends RedirectProps>(props: P) {
  const { to, push = false, computed } = props;

  const context = useContext(RouterContext);
  const { history } = context;

  const calcLocation = (): Partial<Location> => {
    if (computed) {
      if (typeof to === 'string') {
        const parser = createPathParser(to);
        const target = parser.compile(computed.params);
        return parsePath(target);
      } else {
        const pathname = to.pathname ? addHeadSlash(to.pathname) : '/';
        const parser = createPathParser(pathname);
        const target = parser.compile(computed.params);
        return { ...to, pathname: target };
      }
    }
    return typeof to === 'string' ? parsePath(to) : to;
  };

  const navigate = push ? history.push : history.replace;
  const { state, ...path } = calcLocation();

  const onMountFunc = () => {
    navigate(path, state);
  };

  const onUpdateFunc = (prevProps?: LifeCycleProps) => {
    // 如果当前页面与重定向前页面不一致，执行跳转
    const prevPath = prevProps?.data as Location;
    if (!isLocationEqual(prevPath, path)) {
      navigate(path, state);
    }
  };

  return <LifeCycle onMount={onMountFunc} onUpdate={onUpdateFunc} data={path} />;
}

export default Redirect;
