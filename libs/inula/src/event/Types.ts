/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import type { VNode } from '../renderer/Types';
import { WrappedEvent } from './EventWrapper';

export type AnyNativeEvent = KeyboardEvent | MouseEvent | TouchEvent | UIEvent | Event;

export interface InulaEventListener {
  (event: WrappedEvent): void;
}

export type ListenerUnit = {
  vNode: null | VNode;
  listener: InulaEventListener;
  currentTarget: EventTarget;
  event: WrappedEvent;
};

export type ListenerUnitList = Array<ListenerUnit>;
