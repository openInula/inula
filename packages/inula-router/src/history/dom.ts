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

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && window.document && typeof window.document.createElement === 'function';
}

export function getDefaultConfirmation(message: string, callBack: (result: boolean) => void) {
  callBack(window.confirm(message));
}

// 判断浏览器是否支持pushState方法，pushState是browserHistory实现的基础
export function isSupportHistory(): boolean {
  return isBrowser() && window.history && 'pushState' in window.history;
}

// 判断浏览器是否支持PopState事件
export function isSupportsPopState(): boolean {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}
