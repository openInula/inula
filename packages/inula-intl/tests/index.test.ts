/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
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
