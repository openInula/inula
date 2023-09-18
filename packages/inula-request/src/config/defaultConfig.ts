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

const defaultConfig = {
  method: 'GET',

  transitional: {
    // 解析 JSON 时静默处理错误。在启用时，如果发生 JSON 解析错误，将不会抛出异常，而是返回解析前的原始数据
    silentJSONParsing: true,
    // 控制是否强制解析 JSON 数据。在启用时，无论数据的 MIME 类型（如text/plain）是什么，都会尝试将其解析为 JSON
    forcedJSONParsing: true,
    // 控制是否在超时错误中提供更明确的错误信息。在启用时，将提供更具体的错误消息，指示发生的超时错误类型
    clarifyTimeoutError: false,
  },

  timeout: 0,

  maxBodyLength: -1,

  validateStatus: (status: number) => {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      Accept: 'application/json, text/plain, */*',
    },
  },
};

export default defaultConfig;
