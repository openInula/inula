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

/**
 * chrome 通过 iframe 的方式将 panel 页面嵌入到开发者工具中，如果报错无法感知
 * 同时也无法在运行时打断点，需要适当的日志辅助开发和定位问题
 */
interface LoggerType {
  error: typeof console.error;
  info: typeof console.info;
  log: typeof console.log;
  warn: typeof console.warn;
}

export function createLogger(id: string): LoggerType {
  return ['error', 'info', 'log', 'warn'].reduce((pre, current) => {
    const prefix = `[inula_dev_tools][${id}] `;
    pre[current] = (...data) => {
      console[current](prefix, ...data);
    };
    return pre;
  }, {} as LoggerType);
}
