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

/*
  区分是否开发者模式
 */
import { Handler } from './src/injector';

declare global {
  const isDev: boolean;
  const isTest: boolean;
  const __VERSION__: string;

  interface Window {
    __INULA_DEV_HOOK__: {
      isInit: boolean;
      $0: any;
      attach(event: string, fn: Handler): void;
      detach(event: string, fn: Handler): void;
      subscribe(event: string, fn: Handler): () => void;
      trigger(event: string, data: unknown): void;
    };
  }
}

export {};
