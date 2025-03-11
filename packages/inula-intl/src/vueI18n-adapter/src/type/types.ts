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

import { AllMessages, Locale } from '../../../types/types';
import {
  AFTER_PATH,
  APPEND,
  BEFORE_IDENT,
  BEFORE_PATH,
  ERROR,
  IN_DOUBLE_QUOTE,
  IN_IDENT,
  IN_PATH,
  IN_SINGLE_QUOTE,
  IN_SUB_PATH,
  INC_SUB_PATH_DEPTH,
  PUSH,
  PUSH_SUB_PATH,
} from '../constants';
import { FunctionComponent, InulaElement } from 'openinula';

export type I18nOptions = {
  locale?: Locale;
  messages?: AllMessages;
  dateTimeFormats?: NonNullable<unknown>;
  datetimeFormats?: NonNullable<unknown>;
  numberFormats?: NonNullable<unknown>;
  silentTranslationWarn?: boolean;
  globalInjection?: boolean;
  legacy?: false;
  install?: Function;
};

export type UseI18nOptions = {
  options?: Options;
  Locales?: string | NonNullable<unknown>;
} & I18nOptions;

type Options = {
  message?: unknown;
  datetime?: unknown;
  number?: unknown;
};

// 创建一个新的类型来明确这种对应关系
type Action = typeof APPEND | typeof PUSH | typeof INC_SUB_PATH_DEPTH | typeof PUSH_SUB_PATH;
type State =
  | typeof BEFORE_PATH
  | typeof IN_PATH
  | typeof BEFORE_IDENT
  | typeof IN_IDENT
  | typeof IN_SUB_PATH
  | typeof IN_SINGLE_QUOTE
  | typeof IN_DOUBLE_QUOTE
  | typeof AFTER_PATH
  | typeof ERROR;

// StateAction type
type StateAction = [State, Action?];
type PathState = StateAction;
export type PathStateMachine = Record<string, PathState>;

export type PathValue = PathValueObject | PathValueArray | Function | string | number | boolean | null;
export type PathValueObject = { [key: string]: PathValue };
export type PathValueArray = Array<PathValue>;

export interface App {
  rootComponent: InulaElement;

  component(name: string, component: FunctionComponent<any>): void;
}
