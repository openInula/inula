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

// 计算一段时间内平均传输速度
export function calculateTransRate(samplesNum: number, interval: number) {
  // 采样数默认值为 10，最小时间间隔默认值为 1000
  const num = samplesNum ?? 10;
  const minInterval = interval ?? 1000;

  // 创建存储每个样本的数据量和时间戳的数组
  const bytesArr = new Array(num);
  const timestampsArr = new Array(num);

  // 记录当前样本索引和第一个样本索引
  let currentIndex = 0;
  let firstIndex = 0;
  let firstTimestamp: number;

  return function calculate(dataSize: number) {
    const now = Date.now();
    const start = timestampsArr[firstIndex];

    // 检查是否是第一个样本。如果是第一个样本，则将当前时间设置为 firstTimestamp
    firstTimestamp = firstTimestamp ?? now;

    // 存储当前数据量和时间戳
    bytesArr[currentIndex] = dataSize;
    timestampsArr[currentIndex] = now;

    let index = firstIndex;
    let totalSize = 0;

    // 计算从第一个样本到当前的所有样本的数据量总和
    while (index !== currentIndex) {
      totalSize += bytesArr[index++];
      index = index % num;
    }

    currentIndex = (currentIndex + 1) % num;

    // 如果当前索引和第一个索引相等，表示样本数组已满，更新第一个 index 的值。
    if (currentIndex === firstIndex) {
      firstIndex = (firstIndex + 1) % num;
    }

    if (now - firstTimestamp < minInterval) {
      return;
    }

    const totalTime = start && now - start;

    return totalTime ? Math.round(totalSize * 1000 / totalTime) : undefined;
  };
}
