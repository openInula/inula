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

import { JSXElement } from '../../renderer/Types';
import { computed } from '../../reactive/Computed';
import { untrack } from '../../reactive/RNode';

// TODO 需要优化为精细更新
export function For<T>(props: { each: any; children?: (value: any, index: number) => JSXElement }) {
  let list = props.each,
    mapFn = props.children,
    items = [],
    mapped = [],
    disposers = [],
    len = 0;

  return () => {
      let newItems = list.get() || [];

      untrack(() => {
        let i, j;

        let newLen = newItems.length,
          newIndices,
          newIndicesNext,
          temp,
          start,
          end,
          newEnd,
          item;

        if (newLen === 0) {
          // 没新数据
          if (len !== 0) {
            disposers = [];
            items = [];
            mapped = [];
            len = 0;
          }
        } else if (len === 0) {
          // 上一次没有数据
          mapped = new Array(newLen);
          for (j = 0; j < newLen; j++) {
            items[j] = newItems[j];
            mapped[j] = mapFn(list[j]);
          }
          len = newLen;
        } else { // 都有数据
          // temp = new Array(newLen);
          //
          // // 从前往后，判断相等。但是这种前度比较经常是不生效的，比如数组的值相同，指针不一样
          // for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);
          //
          // // 从后往前
          // for (
          //   end = len - 1, newEnd = newLen - 1;
          //   end >= start && newEnd >= start && items[end] === newItems[newEnd]; // 值相等
          //   end--, newEnd--
          // ) {
          //   temp[newEnd] = mapped[end]; // 把dom取出来
          // }
          // // 从start -> newEnd就是不相等的
          //
          // newIndices = new Map();
          // newIndicesNext = new Array(newEnd + 1);
          // for (j = newEnd; j >= start; j--) {
          //   item = newItems[j];
          //   i = newIndices.get(item);
          //   newIndicesNext[j] = i === undefined ? -1 : i; // item数据可能指针相同，重复。因为是倒序遍历，所以i就是相同数据下一个位置。
          //   newIndices.set(item, j); // 新数据，放到map中
          // }
          //
          // // 遍历旧数据
          // for (i = start; i <= end; i++) {
          //   item = items[i];
          //   j = newIndices.get(item); // j 是相同数据的第一个
          //   // 旧行数据，在新数据中存在，在j位置
          //   if (j !== undefined && j !== -1) {
          //     temp[j] = mapped[i]; // 把就dom放到新的j位置
          //     j = newIndicesNext[j];
          //     newIndices.set(item, j); // 修改map里面的位置，改为下一个
          //   }
          // }
          //
          // // 往mapped中放入start - newLen的dom数据
          // for (j = start; j < newLen; j++) { // 按新数据来遍历
          //   if (j in temp) {
          //     mapped[j] = temp[j]; // 直接取旧的
          //   } else {
          //     mapped[j] = mapFn(list[j]); // 创建新的dom
          //   }
          // }
          //
          // // 0 - start 数据没有变动
          // mapped = mapped.slice(0, (len = newLen)); // 如果newLen小于len，就截断
          // items = newItems.slice(0);

          // 假设新旧相同行数据已经更新
          if (newLen > len) {
            for (let i = len; i < newLen; i++) {
              mapped[i] = mapFn(list[i]); // 创建新的dom
            }
          }

          // 0 - start 数据没有变动
          mapped = mapped.slice(0, (len = newLen)); // 如果newLen小于len，就截断
          items = newItems.slice(0);
        }
      });

      return mapped;
  };
}
