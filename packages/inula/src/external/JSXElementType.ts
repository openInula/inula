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

import { Fragment, InulaProfiler, StrictMode, Suspense } from '../types';

export const TYPE_COMMON_ELEMENT = 1;
export const TYPE_PORTAL = 2;
export const TYPE_FRAGMENT = 3 as unknown as Fragment;
export const TYPE_STRICT_MODE = 4 as unknown as StrictMode;
export const TYPE_PROVIDER = 5;
export const TYPE_CONTEXT = 6;
export const TYPE_FORWARD_REF = 7;
export const TYPE_SUSPENSE = 8 as unknown as Suspense;
export const TYPE_PROFILER = 9 as unknown as InulaProfiler;
export const TYPE_MEMO = 10;
export const TYPE_LAZY = 11;
