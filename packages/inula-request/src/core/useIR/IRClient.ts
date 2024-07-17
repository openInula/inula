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

import inulaRequest from '../../inulaRequest';
import { CacheItem, IrRequestConfig, Limitation, QueryOptions } from '../../types/interfaces';
import utils from '../../utils/commonUtils/utils';

// 兼容 IE 上没有 CustomEvent 对象
function createCustomEvent(eventName: string, options?: Record<string, any>) {
  options = options || { bubbles: false, cancelable: false, detail: null };
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, options.bubbles, options.cancelable, options.detail);
  return event;
}

class IRClient {
  private cache: Map<string, CacheItem> = new Map();
  private historyData: string[] = [];
  public requestEvent = utils.isIE() ? createCustomEvent('request') : new CustomEvent('request');

  public async query(url: string, config?: IrRequestConfig, options: QueryOptions = {}): Promise<any> {
    const { pollingInterval, enablePollingOptimization, limitation, capacity = 100, windowSize = 5 } = options;
    let cacheItem = this.cache.get(url);

    if (cacheItem && pollingInterval && Date.now() - cacheItem.lastUpdated < pollingInterval) {
      return cacheItem.data; // 返回缓存中的数据
    }

    const response = await inulaRequest.get(url, config);
    const data = response.data;

    // 如果轮询已配置，设置一个定时器
    if (pollingInterval) {
      if (cacheItem && cacheItem.timeoutId) {
        clearTimeout(cacheItem.timeoutId); // 清除已存在的定时器
      }

      let optimizedInterval;

      // 如果启用动态缓存策略
      if (enablePollingOptimization) {
        optimizedInterval = this.getDynamicInterval(pollingInterval, windowSize, limitation);
      }

      const timeoutId = setInterval(async () => {
        const result = await this.query(url, config, options); // 执行轮询查询
        document.dispatchEvent(new CustomEvent('request', { detail: result }));
      }, optimizedInterval ?? pollingInterval);

      cacheItem = {
        data,
        lastUpdated: Date.now(),
        pollingInterval: optimizedInterval ?? pollingInterval,
        timeoutId,
      };

      // 保存历史数据，以便动态缓存策略分析
      this.historyData.push(data as string);
      // 历史数据超过配置容量便老化最早的数据
      if (this.historyData.length > capacity) {
        this.historyData.unshift();
      }
    } else {
      cacheItem = {
        data,
        lastUpdated: Date.now(),
      };
    }

    // 更新缓存
    this.cache.set(url, cacheItem);

    return data;
  }

  // 计算滑动窗口内相邻字符串的相同个数
  private countAdjacentMatches(data: string[]): number {
    let count = 0;

    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === data[i + 1]) {
        count++;
      }
    }

    return count;
  }

  // 启用动态缓存策略，pollingInterval 作为初始轮询时间并分析历史请求数据计算最优轮询时间减缓服务器压力
  private getDynamicInterval(pollingInterval: number, windowSize: number, limitation?: Limitation): number {
    // 历史数据量过少时，使用用户配置的初始轮询时间
    if (this.historyData.length <= windowSize + 5) {
      return pollingInterval;
    }

    const minInterval = limitation?.minInterval ?? 100; // 最小时间间隔
    const maxInterval = limitation?.maxInterval ?? 60000; // 最大时间间隔

    // PID 控制器初始化参数
    const Kp = 0.2; // 比例常数
    const Ki = 0.2; // 积分常数
    const Kd = 0.1; // 微分常数
    const targetCount = windowSize - 1; // 目标结果数量
    let lastError = 0; // 上一个错误变量，初始值设为0

    // 计算总窗口数量
    const numWindows = this.historyData.length - windowSize + 1;

    // 根据每个滑动窗口内相邻字符串的相同个数来反馈控制调整请求间隔
    for (let i = 0; i < numWindows; i++) {
      // 获取当前窗口的数据
      const windowData = this.historyData.slice(i, i + windowSize);
      const windowCount = this.countAdjacentMatches(windowData);

      // 根据PID控制器计算调整量
      const error = windowCount - targetCount;
      const output = Kp * error + Ki * windowCount + Kd * (error - lastError);

      // 根据调整量更新请求间隔
      pollingInterval += output * 100;

      // 更新上一个错误变量
      lastError = error;
    }

    // 限制时间间隔的范围在最小和最大值之间
    pollingInterval = Math.max(pollingInterval, minInterval);
    pollingInterval = Math.min(pollingInterval, maxInterval);

    return pollingInterval;
  }

  public invalidateCache(url: string): void {
    const cacheItem = this.cache.get(url);
    if (cacheItem && cacheItem.timeoutId) {
      clearTimeout(cacheItem.timeoutId); // 清除定时器
    }

    this.cache.delete(url); // 从缓存中删除条目
  }
}

export default IRClient;
