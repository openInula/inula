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
import { defineMessage, defineMessages } from '../index';

describe('index', () => {
  describe('defineMessages Test', () => {
    it('return the input message object', () => {
      const messages = {
        greeting: {
          id: 'greeting',
          defaultMessage: 'Hello',
        },
        farewell: {
          id: 'farewell',
          defaultMessage: 'Goodbye',
        },
      };

      const result = defineMessages(messages);

      expect(result).toEqual(messages);
    });
  });

  describe('defineMessage Test', () => {
    it('return the input message object', () => {
      const message = {
        id: 'greeting',
        defaultMessage: 'Hello',
      };

      const result = defineMessage(message);

      expect(result).toEqual(message);
    });
  });
});
