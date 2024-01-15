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

import { watch } from '../reactive/Watch';
import { isReactiveObj } from '../reactive/Utils';

export function template(html) {
  let node;
  const create = () => {
    const t = document.createElement('template');
    t.innerHTML = html;
    return t.content.firstChild;
  };

  const fn = () => (node || (node = create())).cloneNode(true);
  fn.cloneNode = fn;
  return fn;
}

export function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial) {
    initial = [];
  }

  if (isReactiveObj(accessor)) {
    watchRender(current => {
      return insertExpression(parent, accessor.get(), current, marker);
    }, initial);
  } else {
    return insertExpression(parent, accessor, initial, marker);
  }
}

function watchRender(fn, prevValue) {
  let nextValue = prevValue;
  watch(() => {
    nextValue = fn(nextValue);
  });
}

function insertExpression(parent, value, current, marker, unwrapArray) {
  while (typeof current === 'function') current = current();
  if (value === current) return value;

  const t = typeof value,
    multi = marker !== undefined;

  if (t === 'string' || t === 'number') {
    if (t === 'number') value = value.toString();
    if (multi) {
      let node = current[0];
      if (node && node.nodeType === 3) {
        node.data = value;
      } else {
        node = document.createTextNode(value);
      }
      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== '' && typeof current === 'string') {
        current = parent.firstChild.data = value;
      } else current = parent.textContent = value;
    }
  } else if (value == null || t === 'boolean') {
    current = cleanChildren(parent, current, marker);
  } else if (t === 'function') {
    // 在watch里面执行
    watch(() => {
      let v = value();
      while (isReactiveObj(v)) {
        v = v.get();
      }

      current = insertExpression(parent, v, current, marker);
    });
    return () => current;
  } else if (Array.isArray(value)) {
    // return [() => {}, () => {}, ...]
    const array = [];
    const currentArray = current && Array.isArray(current);
    if (normalizeIncomingArray(array, value, current, unwrapArray)) {
      watchRender(() => (current = insertExpression(parent, array, current, marker, true)));
      return () => current;
    }

    if (array.length === 0) {
      // 当前没有节点
      current = cleanChildren(parent, current, marker);
      if (multi) return current;
    } else if (currentArray) {
      if (current.length === 0) {
        appendNodes(parent, array, marker); // 原来没有节点
      } else {
        reconcileArrays(parent, current, array); // 原本有节点，现在也有节点
      }
    } else {
      current && cleanChildren(parent);
      appendNodes(parent, array);
    }
    current = array;
  } else if (value.nodeType) {
    if (Array.isArray(current)) {
      if (multi) return (current = cleanChildren(parent, current, marker, value));
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === '' || !parent.firstChild) {
      parent.appendChild(value);
    } else {
      parent.replaceChild(value, parent.firstChild);
    }
    current = value;
  }

  return current;
}

function cleanChildren(parent, current, marker, replacement) {
  if (marker === undefined) {
    return (parent.textContent = '');
  }

  const node = replacement || document.createTextNode('');
  if (current.length) {
    let inserted = false;
    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i];
      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i) {
          isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
        } else {
          isParent && el.remove();
        }
      } else {
        inserted = true;
      }
    }
  } else {
    parent.insertBefore(node, marker);
  }

  return [node];
}

function appendNodes(parent, array, marker = null) {
  for (let i = 0, len = array.length; i < len; i++) {
    parent.insertBefore(array[i], marker);
  }
}

// 拆解数组，如：[[a, b], [c, d], ...] to [a, b, c, d]
function normalizeIncomingArray(normalized, array, unwrap) {
  let dynamic = false;
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i],
      t;
    if (item == null || item === true || item === false) {
      // matches null, undefined, true or false
      // skip
    } else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item) || dynamic;
    } else if ((t = typeof item) === 'string' || t === 'number') {
      normalized.push(document.createTextNode(item));
    } else if (t === 'function') {
      if (unwrap) {
        while (typeof item === 'function') item = item();
        dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item]) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else {
      normalized.push(item);
    }
  }
  return dynamic;
}

// 原本有节点，现在也有节点
export default function reconcileArrays(parentNode, oldChildren, newChildren) {
  let nLength = newChildren.length,
    oEnd = oldChildren.length,
    nEnd = nLength,
    oStart = 0,
    nStart = 0,
    after = oldChildren[oEnd - 1].nextSibling,
    map = null;

  while (oStart < oEnd || nStart < nEnd) {
    // 从前到后对比相同内容
    if (oldChildren[oStart] === newChildren[nStart]) {
      oStart++;
      nStart++;
      continue;
    }
    // 从后往前对比相同内容
    while (oldChildren[oEnd - 1] === newChildren[nEnd - 1]) {
      oEnd--;
      nEnd--;
    }
    // append
    if (oEnd === oStart) {
      // 旧节点全部和新节点相同（不是完全相同， 如：旧 abcd 新 abefcd）
      const node = nEnd < nLength ? (nStart ? newChildren[nStart - 1].nextSibling : newChildren[nEnd - nStart]) : after;

      while (nStart < nEnd) {
        parentNode.insertBefore(newChildren[nStart++], node);
      }
      // remove
    } else if (nEnd === nStart) {
      // 新节点全部和新节点相同（不是完全相同， 如：旧 abefcd 新 abcd）
      while (oStart < oEnd) {
        if (!map || !map.has(oldChildren[oStart])) {
          oldChildren[oStart].remove();
        }
        oStart++;
      }
      // swap backward
    } else if (oldChildren[oStart] === newChildren[nEnd - 1] && newChildren[nStart] === oldChildren[oEnd - 1]) {
      // 如：旧 ab ef cd 新 ab fe cd
      const node = oldChildren[--oEnd].nextSibling;
      parentNode.insertBefore(newChildren[nStart++], oldChildren[oStart++].nextSibling); // 如：旧 abe f fcd
      parentNode.insertBefore(newChildren[--nEnd], node); // 如：旧 abeff e cd

      oldChildren[oEnd] = newChildren[nEnd];
      // fallback to map
    } else {
      // 如：旧 ab feww cd 新 ab hgeht cd
      if (!map) {
        map = new Map();
        let i = nStart;

        while (i < nEnd) {
          map.set(newChildren[i], i++); // 收集 hgeht
        }
      }

      const index = map.get(oldChildren[oStart]);
      if (index != null) {
        // 如：e就在newChildren中
        if (nStart < index && index < nEnd) {
          // 且位置在新节点 之间
          let i = oStart,
            sequence = 1,
            t;

          while (++i < oEnd && i < nEnd) {
            // 如：旧 ab feww cd 新 ab hgeht cd, e 的 sequence 是 2 ？
            if ((t = map.get(oldChildren[i])) == null || t !== index + sequence) break;
            sequence++;
          }

          if (sequence > index - nStart) {
            const node = oldChildren[oStart];
            while (nStart < index) {
              parentNode.insertBefore(newChildren[nStart++], node);
            }
          } else {
            parentNode.replaceChild(newChildren[nStart++], oldChildren[oStart++]);
          }
        } else {
          oStart++;
        }
      } else {
        oldChildren[oStart++].remove();
      }
    }
  }
}

export function setAttribute(node, name, value) {
  if (value == null) {
    node.removeAttribute(name);
  } else {
    node.setAttribute(name, value);
  }
}

export function className(node, value) {
  if (value == null) {
    node.removeAttribute('class');
  } else {
    node.className = value;
  }
}
