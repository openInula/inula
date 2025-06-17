/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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

import { createContext, Dispatch } from 'openinula';
import { PanelAction, PanelState } from '../panel/Panel';

const PickElementContext = createContext(null);
PickElementContext.displayName = 'PickElementContext';

const ViewSourceContext = createContext(null);
ViewSourceContext.displayName = 'ViewSourceContext';

const GlobalCtx = createContext<{ state: PanelState; dispatch: Dispatch<PanelAction> }>(null);
GlobalCtx.displayName = 'GlobalCtx';

export { PickElementContext, ViewSourceContext, GlobalCtx };
