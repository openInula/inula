/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
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
