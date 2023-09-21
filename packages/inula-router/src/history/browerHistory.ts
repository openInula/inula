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

import { getDefaultConfirmation, isSupportHistory, isSupportsPopState } from './dom';
import { Action, BaseOption, DefaultStateType, EventType, History, HistoryState, Location, Path, To } from './types';
import { normalizeSlash, createMemoryRecord, createPath, createLocation, stripBasename } from './utils';
import TransitionManager from './transitionManager';

import warning from './waring';
import { getBaseHistory } from './baseHistory';

export type BrowserHistoryOption = {
  /**
   * forceRefresh为True时跳转时会强制刷新页面
   */
  forceRefresh?: boolean;
} & BaseOption;

export function createBrowserHistory<S = DefaultStateType>(options: BrowserHistoryOption = {}): History<S> {
  const supportHistory = isSupportHistory();
  const isSupportPopState = isSupportsPopState();
  const browserHistory = window.history;
  const { forceRefresh = false, getUserConfirmation = getDefaultConfirmation } = options;

  const basename = options.basename ? normalizeSlash(options.basename) : '';

  const initLocation = getLocation(getHistoryState());

  const recordOperator = createMemoryRecord<string, Location<S>>(initLocation, l => l.key);

  const transitionManager = new TransitionManager<S>();

  const { go, goBack, goForward, listen, block, getUpdateStateFunc } = getBaseHistory<S>(
    transitionManager,
    setListener,
    browserHistory,
  );

  const history: History<S> = {
    action: Action.pop,
    length: browserHistory.length,
    location: initLocation,
    go,
    goBack,
    goForward,
    listen,
    block,
    push,
    replace,
    createHref,
  };

  const updateState = getUpdateStateFunc(history);

  function getHistoryState() {
    return supportHistory ? window.history.state : {};
  }

  function getLocation(historyState: Partial<HistoryState<S>>) {
    const { search, hash } = window.location;
    const { key, state } = historyState || {};
    let pathname = window.location.pathname;
    pathname = basename ? stripBasename(pathname, basename) : pathname;

    return createLocation<S>('', { pathname, search, hash }, state, key);
  }

  // 拦截页面POP事件后，防止返回到的页面被重复拦截
  let forceJump = false;

  function handlePopState(location: Location<S>) {
    if (forceJump) {
      forceJump = false;
      updateState(undefined);
    } else {
      const action = Action.pop;

      const callback = (isJump: boolean) => {
        if (isJump) {
          // 执行跳转行为
          updateState({ action: action, location: location });
        } else {
          revertPopState(location, history.location);
        }
      };

      transitionManager.confirmJumpTo(location, action, getUserConfirmation, callback);
    }
  }

  function popStateListener(event: PopStateEvent) {
    handlePopState(getLocation(event.state));
  }

  function hashChangeListener() {
    const location = getLocation(getHistoryState());
    handlePopState(location);
  }

  let listenerCount = 0;

  function setListener(count: number) {
    listenerCount += count;
    if (listenerCount === 1 && count === 1) {
      window.addEventListener(EventType.PopState, popStateListener);
      if (!isSupportPopState) {
        window.addEventListener(EventType.HashChange, hashChangeListener);
      }
    } else if (listenerCount === 0) {
      window.removeEventListener(EventType.PopState, popStateListener);
      if (!isSupportPopState) {
        window.removeEventListener(EventType.HashChange, hashChangeListener);
      }
    }
  }

  // 取消页面跳转并恢复到跳转前的页面
  function revertPopState(form: Location<S>, to: Location<S>) {
    const delta = recordOperator.getDelta(to, form);
    if (delta !== 0) {
      go(delta);
      forceJump = true;
    }
  }

  function createHref(path: Partial<Path>) {
    return basename + createPath(path);
  }

  function push(to: To, state?: S) {
    const action = Action.push;
    const location = createLocation<S>(history.location, to, state, undefined);

    transitionManager.confirmJumpTo(location, action, getUserConfirmation, isJump => {
      if (!isJump) {
        return;
      }
      const href = createHref(location);
      const { key, state } = location;

      if (supportHistory) {
        if (forceRefresh) {
          window.location.href = href;
        } else {
          browserHistory.pushState({ key: key, state: state }, '', href);
          recordOperator.addRecord(history.location, location, action);
          updateState({ action, location });
        }
      } else {
        warning(state !== undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.href = href;
      }
    });
  }

  function replace(to: To, state?: S) {
    const action = Action.replace;
    const location = createLocation<S>(history.location, to, state, undefined);

    transitionManager.confirmJumpTo(location, action, getUserConfirmation, isJump => {
      if (!isJump) {
        return;
      }
      const href = createHref(location);
      const { key, state } = location;
      if (supportHistory) {
        if (forceRefresh) {
          window.location.replace(href);
        } else {
          browserHistory.replaceState({ key: key, state: state }, '', href);
          recordOperator.addRecord(history.location, location, action);
          updateState({ action, location });
        }
      } else {
        warning(state !== undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.replace(href);
      }
    });
  }

  return history;
}
