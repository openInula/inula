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
import { isReactiveObj } from 'inula-reactive';

export function Show<T>({
  if: rIf,
  else: rElse,
  children,
}: {
  if: any | (() => T);
  else?: any;
  children: any;
}): any {
  return () => {
    const ifValue: any = calculateReactive(rIf);

    let child: any = null;
    if (ifValue) {
      child = typeof children === 'function' ? children() : children;
    } else {
      child = typeof rElse === 'function' ? rElse() : rElse;
    }

    return child;
  };
}

/**
 * 如果是函数就执行，如果是reactive就调用get()
 * @param val 值/reactive对象/函数
 * @return 返回真实值
 */
export function calculateReactive(val: any | (() => any)): any {
  let ret = val;
  if (typeof val === 'function') {
    ret = val();
  }

  if (isReactiveObj(ret)) {
    ret = ret.get();
  }

  return ret;
}
