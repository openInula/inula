/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import { insert } from './dom';

export function createComponent<T>(Comp, props) {
  return Comp(props || ({} as T));
}

export function render(code, element, init, options = {}) {
  let disposer;

  createRoot(dispose => {
    disposer = dispose;
    if (element === document) {
      code();
    } else {
      insert(element, code(), element.firstChild ? null : undefined, init);
    }
  });

  return () => {
    disposer();
    element.textContent = '';
  };
}

let Owner;
let Listener;

function createRoot(fn) {
  const listener = Listener;
  const owner = Owner;
  const unowned = fn.length === 0;
  const current = owner;
  const root = {
    owned: null,
    cleanups: null,
    context: current ? current.context : null,
    owner: current,
  };
  const updateFn = () => {
    // fn(() => cleanNode(root));
    fn(() => {});
  };

  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}

let Updates, Effects;
let ExecCount = 0;

function runUpdates(fn, init) {
  if (Updates) return fn();
  let wait = false;
  if (!init) Updates = [];
  if (Effects) {
    wait = true;
  } else {
    Effects = [];
  }
  ExecCount++;
  // try {
    const res = fn();
    // completeUpdates(wait);
    return res;
  // } catch (err) {
  //   if (!wait) Effects = null;
  //   Updates = null;
  //   // handleError(err);
  // }
}
