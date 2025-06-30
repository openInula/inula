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

import { Directive } from './directive';

const vShowOriginalDisplay = Symbol('_v_show_original_display');

export const vShow: Directive = {
  beforeMount(el, { value }) {
    el[vShowOriginalDisplay] = el.style.display === 'none' ? '' : el.style.display;

    setDisplay(el, value);
  },
  updated(el, { value, oldValue }) {
    if (!value === !oldValue) return;

    setDisplay(el, value);
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value);
  },
};

function setDisplay(el: HTMLElement, value: unknown): void {
  el.style.display = value ? el[vShowOriginalDisplay] : 'none';
}
