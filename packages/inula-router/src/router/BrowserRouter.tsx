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

import Inula from '@cloudsop/horizon';
import { useRef, InulaNode } from '@cloudsop/horizon';
import Router from './Router';
import { createBrowserHistory } from '../history/browerHistory';
import { ConfirmationFunc, History } from '../history/types';

export type BaseRouterProps = {
  basename: string;
  getUserConfirmation: ConfirmationFunc;
  children?: InulaNode;
};

export type BrowserRouterProps = BaseRouterProps & {
  forceRefresh: boolean;
};

function BrowserRouter<P extends Partial<BrowserRouterProps>>(props: P) {
  // 使用Ref持有History对象，防止重复渲染
  const historyRef = useRef<History>();

  if (historyRef.current === null || historyRef.current === undefined) {
    historyRef.current = createBrowserHistory({
      basename: props.basename,
      forceRefresh: props.forceRefresh,
      getUserConfirmation: props.getUserConfirmation,
    });
  }

  return <Router history={historyRef.current}>{props.children}</Router>;
}

export default BrowserRouter;
