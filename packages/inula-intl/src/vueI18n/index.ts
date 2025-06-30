/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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
// type for $api
import VueI18n from './VueI18n';
import { createI18n } from './hooks/createI18n';
import { useI18n } from './hooks/useI18n';
import { useLocalMessage } from './hooks/useLocalMessage';

declare global {
  interface Window {
    $i18n: VueI18n;
  }
}

export default {
  VueI18n,
};

export { createI18n, useI18n, useLocalMessage };
