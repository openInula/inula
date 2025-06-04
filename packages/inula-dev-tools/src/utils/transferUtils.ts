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

import { DevToolPanel, DevToolBackground, DevToolContentScript, DevToolHook } from './constants';

type MessageSource = typeof DevToolPanel | typeof DevToolBackground | typeof DevToolContentScript | typeof DevToolHook;

const DevToolMsgLabel = 'DevTool_Msg_Label';

interface PayloadType {
  type: string;
  data?: unknown;
  inulaX?: boolean;
}

interface Message {
  type: typeof DevToolMsgLabel;
  payload: PayloadType;
  from: MessageSource;
}

export function createMessage(payload: PayloadType, from: MessageSource, inulaX?: boolean): Message {
  if (inulaX) {
    payload.inulaX = true;
  }
  return {
    type: DevToolMsgLabel,
    payload,
    from,
  };
}

export function checkMessageSource(data: any, from: MessageSource) {
  return data?.type === DevToolMsgLabel && data?.from === from;
}

export function modifyMessageSource(message: Message, from: MessageSource) {
  return { ...message, from };
}
