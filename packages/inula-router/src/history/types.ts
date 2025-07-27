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

export type BaseOption = {
  basename?: string;
  getUserConfirmation?: ConfirmationFunc;
};

export interface HistoryProps<T = unknown> {
  readonly action: Action;

  readonly location: Location<T>;

  length: number;
}

export interface History<T = unknown> extends HistoryProps<T> {
  createHref(path: Partial<Path>): string;

  push(to: To, state?: T): void;

  replace(to: To, state?: T): void;

  listen(listener: Listener<T>): () => void;

  block(prompt: Prompt<T>): () => void;

  go(index: number): void;

  goBack(): void;

  goForward(): void;
}

export enum Action {
  pop = 'POP',
  push = 'PUSH',
  replace = 'REPLACE',
}

export enum EventType {
  PopState = 'popstate',
  HashChange = 'hashchange',
}

export type Path = {
  pathname: string;

  search: string;

  hash: string;
};

export type HistoryState<T> = {
  state?: T;

  key: string;
};

export type DefaultStateType = unknown;

export type Location<T = unknown> = Path & HistoryState<T>;

export type To = string | Partial<Path>;

export interface Listener<T = unknown> {
  (navigation: Navigation<T>): void;
}

export interface Navigation<T = unknown> {
  action: Action;

  location: Location<T>;
}

export type Prompt<S> = string | boolean | null | ((location: Location<S>, action: Action) => void);

export type CallBackFunc = (isJump: boolean) => void;

export type ConfirmationFunc = (message: string, callBack: CallBackFunc) => void;

export interface TManager<S> {
  setPrompt(next: Prompt<S>): () => void;

  addListener(func: (navigation: Navigation<S>) => void): () => void;

  notifyListeners(args: Navigation<S>): void;

  confirmJumpTo(
    location: Location<S>,
    action: Action,
    userConfirmationFunc: ConfirmationFunc,
    callBack: CallBackFunc
  ): void;
}
