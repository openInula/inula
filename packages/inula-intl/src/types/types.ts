/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import {
  Content,
  MissingMessageEvent,
  Octothorpe,
  PlainArg,
  Select,
  FunctionArg,
  I18nContextProps,
  configProps
} from './interfaces';
import I18n from "../core/I18n";

export type Error = string | ((message, id, context) => string);

export type Locale = string;

export type Locales = Locale | Locale[];

export type LocaleConfig = { plurals?: Function };

export type AllLocaleConfig = Record<Locale, LocaleConfig>;

type CompiledMessagePart = string | Array<string | Array<string | (string | undefined)> | Record<string, unknown>>;

export type CompiledMessage = string | CompiledMessagePart[];

export type Messages = Record<string, string> | Record<string, CompiledMessage>;

export type AllMessages = Record<string, string> | Record<Locale, Messages>;

export type EventCallback = (...args: any[]) => any;

// 资源事件
export type Events = {
  change: () => void;
  missing: (event: MissingMessageEvent) => void;
};

// 默认复数规则
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export type Token = Content | PlainArg | FunctionArg | Select | Octothorpe;

export type DatePool = Date | string;

export type SelectPool = string | object;

export type RawToken = {
  type: string;
  value: string;
  text: string;
  toString: () => string;
  offset: number;
  lineBreaks: number;
  line: number;
  col: number;
};

export type I18nProviderProps = I18nContextProps & configProps

export type IntlType = {
  i18n: I18n;
  formatMessage: Function,
  formatNumber: Function,
  formatDate: Function,
}
