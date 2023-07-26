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

// 当条件不成立报错
// 接收模板
export function throwIfTrue(condition: boolean, errTemplate: string, ...errExpressions: string[]) {
  if (condition) {
    // 将%s 替换成对应的变量
    const msg = errTemplate.split('%s').reduce((prevSentence: string, part: string, idx: number) => {
      // %s对应的变量
      const expression = idx < errExpressions.length ? errExpressions[idx] : '';
      return prevSentence + part + expression;
    }, '');
    throw Error(msg);
  }
}
