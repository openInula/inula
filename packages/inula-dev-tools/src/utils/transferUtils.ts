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

const devTools = 'INULA_DEV_TOOLS';

interface PayloadType {
  type: string;
  data?: any;
  inulaX?: boolean;
}

interface Message {
  type: typeof devTools;
  payload: PayloadType;
  from: string;
}

export function packagePayload(payload: PayloadType, from: string, inulaX?: boolean): Message {
  if (inulaX) {
    payload.inulaX = true;
  }
  return {
    type: devTools,
    payload,
    from
  };
}

export function checkMessage(data: any, from: string) {
  return data?.type === devTools && data?.from === from;
}

export function changeSource(message: Message, from: string) {
  message.from = from;
}
