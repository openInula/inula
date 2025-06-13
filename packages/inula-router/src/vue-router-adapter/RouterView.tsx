/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

import { createElement, useContext, useMemo } from '@cloudsop/horizon';
import { CurrentRouteRecord, RouteContext, ViewDepth } from './RouterContext';
import { NormalizedRouteRecord } from './types';

function calcNextDepth(currentDepth: number, matched: NormalizedRouteRecord[]) {
  let matchedRecord: NormalizedRouteRecord | undefined;
  let nextDepth = currentDepth;
  while ((matchedRecord = matched[nextDepth]) && !matchedRecord.component) {
    nextDepth++;
  }
  return nextDepth;
}

function RouterView() {
  const { matched } = useContext(RouteContext);
  const { depth } = useContext(ViewDepth);
  const nextDepth = useMemo(() => calcNextDepth(depth, matched), [depth]);
  const routeRecord = matched[nextDepth];
  if (routeRecord) {
    const { component, props } = routeRecord;
    const nextComponent = createElement(component, props);

    return (
      <ViewDepth.Provider value={{ depth: nextDepth + 1 }}>
        <CurrentRouteRecord.Provider value={routeRecord}>{nextComponent}</CurrentRouteRecord.Provider>
      </ViewDepth.Provider>
    );
  }
  return null;
}

export default RouterView;
