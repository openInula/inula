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

import Inula, { didMount, didUnmount } from '@openinula/next';
import { InulaNode } from '@openinula/next';

import { History, Location } from '../history/types';

import RouterContext, { RouterContextValue } from './context';

export type RouterProps = {
  history: History;
  children?: InulaNode;
};

function Router<P extends RouterProps>({ history, children = null }: P) {
  let location = history.location;
  let pendingLocation: Location | null = null;
  let unListen: null | (() => void) = null;
  let isMount: boolean = false;

  // 在Router加载时就监听history地址变化，以保证在始渲染时重定向能正确触发
  if (unListen === null) {
    unListen = history.listen(arg => {
      pendingLocation = arg.location;
    });
  }
  // 模拟componentDidMount和componentWillUnmount
  didMount(() => {
    isMount = true;
    if (unListen) {
      unListen();
    }
    // 监听history中的位置变化
    unListen = history.listen(arg => {
      if (isMount) {
        location = arg.location;
      }
    });

    if (pendingLocation) {
      location = pendingLocation;
    }
  });

  didUnmount(() => {
    if (unListen) {
      isMount = false;
      unListen();
      unListen = null;
      pendingLocation = null;
    }
  });

  return (
    <RouterContext
      history={history}
      location={location}
      match={{
        isExact: location.pathname === '/',
        params: {},
        path: '/',
        score: [],
        url: '/',
      }}
    >
      {children}
    </RouterContext>
  );
}

export default Router;
