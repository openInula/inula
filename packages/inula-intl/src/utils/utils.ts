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
import { CompiledMessage } from "../types/types";
import parse from "../parser/parser";
import getTokenAST from "./getTokenAST";
import I18n from "../core/I18n";



export function isVariantI18n(i18n?: I18n) {
  if (!i18n) {
    throw new Error('I18n object is not found!');
  }
}

function generateKey<T>(locales?: string | string[], options: T = {} as T) {
  const localeKey = Array.isArray(locales) ? locales.sort().join('-') : locales;
  return `${localeKey}:${JSON.stringify(options)}`;
}

function compile(message: string): CompiledMessage {
  try {
    return getTokenAST(parse(message));
  } catch (e) {
    console.error(`Message cannot be parse due to syntax errors: ${message}`);
    return message;
  }
}

const utils = {
  isVariantI18n,
  generateKey,
  compile,
}

export default utils;
