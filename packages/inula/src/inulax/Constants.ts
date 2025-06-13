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

export const OBSERVER_KEY = typeof Symbol === 'function' ? Symbol('_inulaObserver') : '_inulaObserver';

// 特殊处理的keys
export enum KeyTypes {
  RAW_VALUE = '_rawValue',
  COLLECTION_CHANGE = '_collectionChange',
  GET = 'get',
  SIZE = 'size',
  VALUE = 'value',
  WATCH = 'watch',
  LENGTH = 'length',
  PROTOTYPE = 'prototype',
  HAS_OWN_PROPERTY = 'hasOwnProperty',
  ADD_LISTENER = 'addListener',
  REMOVE_LISTENER = 'removeListener',
}

export enum ReactiveFlags {
  IS_SKIP = '_isSkip',
  IS_SHALLOW = '_isShallow',
  IS_READONLY = '_isReadonly',
  IS_REF = '_isRef',
}
