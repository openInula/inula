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

import { HeaderMap } from '../../types/types';

function convertRawHeaders(rawHeaders: string): HeaderMap {
  const convertedHeaders: HeaderMap = {};

  if (rawHeaders) {
    rawHeaders.split('\n').forEach((item: string) => {
      let i = item.indexOf(':');
      let key = item.substring(0, i).trim().toLowerCase();
      let val = item.substring(i + 1).trim();

      if (!key || (convertedHeaders[key] && key !== 'set-cookie')) {
        return;
      }

      // Set-Cookie 在 HTTP 响应中可能会出现多次，为了保留每个独立的 Set-Cookie 报头，需要将它们的值存储在一个数组中
      if (key === 'set-cookie') {
        if (convertedHeaders[key]) {
          (convertedHeaders[key] as any).push(val);
        } else {
          convertedHeaders[key] = [val];
        }
      } else {
        convertedHeaders[key] = convertedHeaders[key] ? `${convertedHeaders[key]}, ${val}` : val;
      }
    });
  }

  return convertedHeaders;
}

export default convertRawHeaders;
