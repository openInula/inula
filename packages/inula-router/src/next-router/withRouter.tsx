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
import { useContext, ComponentType } from '@openinula/next';
import RouterContext from './context';

function withRouter<C extends ComponentType>(Component: C) {
  function ComponentWithRouterProp(props: any) {
    const { wrappedComponentRef, ...rest } = props;
    const { history, location, match } = useContext(RouterContext);
    const routeProps = { history: history, location: location, match: match };

    return <Component {...routeProps} {...rest} ref={wrappedComponentRef} />;
  }

  return ComponentWithRouterProp;
}

export default withRouter;
