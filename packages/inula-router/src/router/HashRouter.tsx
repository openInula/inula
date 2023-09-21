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
import { useRef } from 'openinula';
import { History } from '../history/types';
import { BaseRouterProps } from './BrowserRouter';
import { createHashHistory, urlHashType } from '../history/hashHistory';
import Router from './Router';

export type HashRouterProps = BaseRouterProps & {
  hashType: urlHashType;
};

function HashRouter<P extends Partial<HashRouterProps>>(props: P) {
  let historyRef = useRef<History>();
  if (historyRef.current === null || historyRef.current === undefined) {
    historyRef.current = createHashHistory({
      basename: props.basename,
      getUserConfirmation: props.getUserConfirmation,
      hashType: props.hashType,
    });
  }

  return <Router history={historyRef.current}>{props.children}</Router>;
}

export default HashRouter;