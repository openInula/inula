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

/**
 * 兼容IE浏览器没有Object.is
 */
export function isSame(x: any, y: any) {
  if (!(typeof Object.is === 'function')) {
    if (x === y) {
      // +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // NaN == NaN
      return x !== x && y !== y;
    }
  } else {
    return Object.is(x, y);
  }
}

export function isArrayEqual(nextParam: Array<any>, lastParam: Array<any> | null) {
  if (lastParam === null || lastParam.length !== nextParam.length) {
    return false;
  }
  for (let i = 0; i < lastParam.length; i++) {
    if (!isSame(nextParam[i], lastParam[i])) {
      return false;
    }
  }
  return true;
}

export function shallowCompare(paramX: any, paramY: any): boolean {
  if (isSame(paramX, paramY)) {
    return true;
  }

  // 对比对象
  if (typeof paramX === 'object' && typeof paramY === 'object' && paramX !== null && paramY !== null) {
    const keysX = Object.keys(paramX);
    const keysY = Object.keys(paramY);

    // key长度不相等时直接返回不相等
    if (keysX.length !== keysY.length) {
      return false;
    }

    return keysX.every(
      (key, i) => Object.prototype.hasOwnProperty.call(paramY, key) && isSame(paramX[key], paramY[keysX[i]])
    );
  }

  return false;
}
