import * as React from 'react';
import { createContext, useContext, Children, createElement, useState, useRef, useLayoutEffect, useMemo, isValidElement, cloneElement } from 'react';
import { connect, ReactReduxContext } from 'react-redux';
import { reduxAdapter } from '@cloudsop/horizon';

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

// 定义位置变化和history方法调用的Action type
var ActionName = /*#__PURE__*/function (ActionName) {
  ActionName["LOCATION_CHANGE"] = "$horizon-router/LOCATION_CHANGE";
  ActionName["CALL_HISTORY_METHOD"] = "$horizon-router/CALL_HISTORY_METHOD";
  return ActionName;
}({});

// 定义Action的两种数据类型

var onLocationChanged = function (location, action) {
  var isFirstRendering = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return {
    type: ActionName.LOCATION_CHANGE,
    payload: {
      location: location,
      action: action,
      isFirstRendering: isFirstRendering
    }
  };
};

// 解析location对象，将其中的query参数解析并注入
function injectQueryParams(location) {
  if (location && location.query) {
    return location;
  }
  var queryString = location && location.search;
  if (!queryString) {
    return _extends({}, location, {
      query: {}
    });
  }
  var queryObject = {};
  var params = new URLSearchParams(queryString);
  params.forEach(function (value, key) {
    return queryObject[key] = value;
  });
  return _extends({}, location, {
    query: queryObject
  });
}
function createConnectRouter() {
  // 初始化redux State
  return function (history) {
    var initRouterState = {
      location: injectQueryParams(history.location),
      action: history.action
    };

    // 定义connect-router对应的redux reducer函数
    return function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initRouterState;
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        type = _ref.type,
        payload = _ref.payload;
      if (type === ActionName.LOCATION_CHANGE) {
        var location = payload.location,
          action = payload.action,
          isFirstRendering = payload.isFirstRendering;
        if (isFirstRendering) {
          return state;
        }
        return _extends({}, state, {
          location: injectQueryParams(location),
          action: action
        });
      }
      return state;
    };
  };
}

function isBrowser() {
  return typeof window !== 'undefined' && window.document && typeof window.document.createElement === 'function';
}
function getDefaultConfirmation(message, callBack) {
  callBack(window.confirm(message));
}

// 判断浏览器是否支持pushState方法，pushState是browserHistory实现的基础
function isSupportHistory() {
  return isBrowser() && window.history && 'pushState' in window.history;
}

// 判断浏览器是否支持PopState事件
function isSupportsPopState() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}

var Action = /*#__PURE__*/function (Action) {
  Action["pop"] = "POP";
  Action["push"] = "PUSH";
  Action["replace"] = "REPLACE";
  return Action;
}({});
var EventType = /*#__PURE__*/function (EventType) {
  EventType["PopState"] = "popstate";
  EventType["HashChange"] = "hashchange";
  return EventType;
}({});

function createPath(path) {
  var search = path.search,
    hash = path.hash;
  var pathname = path.pathname || '/';
  if (search && search !== '?') {
    pathname += search.startsWith('?') ? search : '?' + search;
  }
  if (hash && hash !== '#') {
    pathname += hash.startsWith('#') ? hash : '#' + hash;
  }
  return pathname;
}
function parsePath(url) {
  if (!url) {
    return {};
  }
  var parsedPath = {};
  var hashIdx = url.indexOf('#');
  if (hashIdx > -1) {
    parsedPath.hash = url.substring(hashIdx);
    url = url.substring(0, hashIdx);
  }
  var searchIdx = url.indexOf('?');
  if (searchIdx > -1) {
    parsedPath.search = url.substring(searchIdx);
    url = url.substring(0, searchIdx);
  }
  if (url) {
    parsedPath.pathname = url;
  }
  return parsedPath;
}
function createLocation(current, to, state, key) {
  var pathname = typeof current === 'string' ? current : current.pathname;
  var urlObj = typeof to === 'string' ? parsePath(to) : to;
  // 随机key长度取6
  var getRandKey = genRandomKey(6);
  var location = _extends({
    pathname: pathname,
    search: '',
    hash: '',
    state: state,
    key: typeof key === 'string' ? key : getRandKey()
  }, urlObj);
  if (!location.pathname) {
    location.pathname = '/';
  }
  return location;
}
function isLocationEqual(p1, p2) {
  return p1.pathname === p2.pathname && p1.search === p2.search && p1.hash === p2.hash;
}
function addHeadSlash(path) {
  if (path[0] === '/') {
    return path;
  }
  return '/' + path;
}
function stripHeadSlash(path) {
  if (path[0] === '/') {
    return path.substring(1);
  }
  return path;
}
function normalizeSlash(path) {
  var tempPath = addHeadSlash(path);
  if (tempPath[tempPath.length - 1] === '/') {
    return tempPath.substring(0, tempPath.length - 1);
  }
  return tempPath;
}
function hasBasename(path, prefix) {
  return path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && ['/', '?', '#', ''].includes(path.charAt(prefix.length));
}
function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substring(prefix.length) : path;
}

// 使用随机生成的Key记录被访问过的URL，当Block被被触发时利用delta值跳转到之前的页面
function createMemoryRecord(initVal, fn) {
  var visitedRecord = [fn(initVal)];
  function getDelta(to, form) {
    var toIdx = visitedRecord.lastIndexOf(fn(to));
    if (toIdx === -1) {
      toIdx = 0;
    }
    var fromIdx = visitedRecord.lastIndexOf(fn(form));
    if (fromIdx === -1) {
      fromIdx = 0;
    }
    return toIdx - fromIdx;
  }
  function addRecord(current, newRecord, action) {
    var curVal = fn(current);
    var NewVal = fn(newRecord);
    if (action === Action.push) {
      var prevIdx = visitedRecord.lastIndexOf(curVal);
      var newVisitedRecord = visitedRecord.slice(0, prevIdx + 1);
      newVisitedRecord.push(NewVal);
      visitedRecord = newVisitedRecord;
    }
    if (action === Action.replace) {
      var _prevIdx = visitedRecord.lastIndexOf(curVal);
      if (_prevIdx !== -1) {
        visitedRecord[_prevIdx] = NewVal;
      }
    }
  }
  return {
    getDelta: getDelta,
    addRecord: addRecord
  };
}
function genRandomKey(length) {
  var end = length + 2;
  return function () {
    return Math.random().toString(18).substring(2, end);
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }
function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var TransitionManager = /*#__PURE__*/function () {
  function TransitionManager() {
    _classCallCheck(this, TransitionManager);
    this.prompt = void 0;
    this.listeners = void 0;
    this.prompt = null;
    this.listeners = [];
  }
  _createClass(TransitionManager, [{
    key: "setPrompt",
    value: function setPrompt(prompt) {
      var _this = this;
      this.prompt = prompt;

      // 清除Prompt
      return function () {
        if (_this.prompt === prompt) {
          _this.prompt = null;
        }
      };
    }

    // 使用发布订阅模式管理history的监听者
  }, {
    key: "addListener",
    value: function addListener(func) {
      var _this2 = this;
      var isActive = true;
      var listener = function (args) {
        if (isActive) {
          func(args);
        }
      };
      this.listeners.push(listener);
      return function () {
        isActive = false;
        // 移除对应的监听者
        _this2.listeners = _this2.listeners.filter(function (item) {
          return item !== listener;
        });
      };
    }
  }, {
    key: "notifyListeners",
    value: function notifyListeners(args) {
      var _iterator = _createForOfIteratorHelper$1(this.listeners),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var listener = _step.value;
          listener(args);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "confirmJumpTo",
    value: function confirmJumpTo(location, action, userConfirmationFunc, callBack) {
      if (this.prompt !== null) {
        var result = typeof this.prompt === 'function' ? this.prompt(location, action) : this.prompt;
        if (typeof result === 'string') {
          typeof userConfirmationFunc === 'function' ? userConfirmationFunc(result, callBack) : callBack(true);
        } else {
          callBack(result !== false);
        }
      } else {
        callBack(true);
      }
    }
  }]);
  return TransitionManager;
}();

function warning(condition, message) {
  if (condition) {
    if (console && typeof console.warn === 'function') {
      console.warn(message);
    }
  }
}

// 抽取BrowserHistory和HashHistory中相同的方法
function getBaseHistory(transitionManager, setListener, browserHistory) {
  function go(step) {
    browserHistory.go(step);
  }
  function goBack() {
    browserHistory.go(-1);
  }
  function goForward() {
    browserHistory.go(1);
  }
  function listen(listener) {
    var cancel = transitionManager.addListener(listener);
    setListener(1);
    return function () {
      setListener(-1);
      cancel();
    };
  }
  var isBlocked = false;
  function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var unblock = transitionManager.setPrompt(prompt);
    if (!isBlocked) {
      setListener(1);
      isBlocked = true;
    }
    return function () {
      if (isBlocked) {
        isBlocked = false;
        setListener(-1);
      }
      unblock();
    };
  }
  function getUpdateStateFunc(historyProps) {
    return function (nextState) {
      if (nextState) {
        _extends(historyProps, nextState);
      }
      historyProps.length = browserHistory.length;
      var args = {
        location: historyProps.location,
        action: historyProps.action
      };
      transitionManager.notifyListeners(args);
    };
  }
  return {
    go: go,
    goBack: goBack,
    goForward: goForward,
    listen: listen,
    block: block,
    getUpdateStateFunc: getUpdateStateFunc
  };
}

function createBrowserHistory() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var supportHistory = isSupportHistory();
  var isSupportPopState = isSupportsPopState();
  var browserHistory = window.history;
  var _options$forceRefresh = options.forceRefresh,
    forceRefresh = _options$forceRefresh === void 0 ? false : _options$forceRefresh,
    _options$getUserConfi = options.getUserConfirmation,
    getUserConfirmation = _options$getUserConfi === void 0 ? getDefaultConfirmation : _options$getUserConfi;
  var basename = options.basename ? normalizeSlash(options.basename) : '';
  var initLocation = getLocation(getHistoryState());
  var recordOperator = createMemoryRecord(initLocation, function (l) {
    return l.key;
  });
  var transitionManager = new TransitionManager();
  var _getBaseHistory = getBaseHistory(transitionManager, setListener, browserHistory),
    go = _getBaseHistory.go,
    goBack = _getBaseHistory.goBack,
    goForward = _getBaseHistory.goForward,
    listen = _getBaseHistory.listen,
    block = _getBaseHistory.block,
    getUpdateStateFunc = _getBaseHistory.getUpdateStateFunc;
  var history = {
    action: Action.pop,
    length: browserHistory.length,
    location: initLocation,
    go: go,
    goBack: goBack,
    goForward: goForward,
    listen: listen,
    block: block,
    push: push,
    replace: replace,
    createHref: createHref
  };
  var updateState = getUpdateStateFunc(history);
  function getHistoryState() {
    return supportHistory ? window.history.state : {};
  }
  function getLocation(historyState) {
    var _window$location = window.location,
      search = _window$location.search,
      hash = _window$location.hash;
    var _ref = historyState || {},
      key = _ref.key,
      state = _ref.state;
    var pathname = window.location.pathname;
    pathname = basename ? stripBasename(pathname, basename) : pathname;
    return createLocation('', {
      pathname: pathname,
      search: search,
      hash: hash
    }, state, key);
  }

  // 拦截页面POP事件后，防止返回到的页面被重复拦截
  var forceJump = false;
  function handlePopState(location) {
    if (forceJump) {
      forceJump = false;
      updateState(undefined);
    } else {
      var action = Action.pop;
      var callback = function (isJump) {
        if (isJump) {
          // 执行跳转行为
          updateState({
            action: action,
            location: location
          });
        } else {
          revertPopState(location, history.location);
        }
      };
      transitionManager.confirmJumpTo(location, action, getUserConfirmation, callback);
    }
  }
  function popStateListener(event) {
    handlePopState(getLocation(event.state));
  }
  function hashChangeListener() {
    var location = getLocation(getHistoryState());
    handlePopState(location);
  }
  var listenerCount = 0;
  function setListener(count) {
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
  function revertPopState(form, to) {
    var delta = recordOperator.getDelta(to, form);
    if (delta !== 0) {
      go(delta);
      forceJump = true;
    }
  }
  function createHref(path) {
    return basename + createPath(path);
  }
  function push(to, state) {
    var action = Action.push;
    var location = createLocation(history.location, to, state, undefined);
    transitionManager.confirmJumpTo(location, action, getUserConfirmation, function (isJump) {
      if (!isJump) {
        return;
      }
      var href = createHref(location);
      var key = location.key,
        state = location.state;
      if (supportHistory) {
        if (forceRefresh) {
          window.location.href = href;
        } else {
          browserHistory.pushState({
            key: key,
            state: state
          }, '', href);
          recordOperator.addRecord(history.location, location, action);
          updateState({
            action: action,
            location: location
          });
        }
      } else {
        warning(state !== undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.href = href;
      }
    });
  }
  function replace(to, state) {
    var action = Action.replace;
    var location = createLocation(history.location, to, state, undefined);
    transitionManager.confirmJumpTo(location, action, getUserConfirmation, function (isJump) {
      if (!isJump) {
        return;
      }
      var href = createHref(location);
      var key = location.key,
        state = location.state;
      if (supportHistory) {
        if (forceRefresh) {
          window.location.replace(href);
        } else {
          browserHistory.replaceState({
            key: key,
            state: state
          }, '', href);
          recordOperator.addRecord(history.location, location, action);
          updateState({
            action: action,
            location: location
          });
        }
      } else {
        warning(state !== undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.replace(href);
      }
    });
  }
  return history;
}

// 获取#前的内容
function stripHash(path) {
  var idx = path.indexOf('#');
  return idx === -1 ? path : path.substring(0, idx);
}

// 获取#后的内容
function getHashContent(path) {
  var idx = path.indexOf('#');
  return idx === -1 ? '' : path.substring(idx + 1);
}
function createHashHistory() {
  var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var browserHistory = window.history;
  var _option$hashType = option.hashType,
    hashType = _option$hashType === void 0 ? 'slash' : _option$hashType,
    _option$getUserConfir = option.getUserConfirmation,
    getUserConfirmation = _option$getUserConfir === void 0 ? getDefaultConfirmation : _option$getUserConfir;
  var basename = option.basename ? normalizeSlash(option.basename) : '';
  var pathDecoder = addHeadSlash;
  var pathEncoder = hashType === 'slash' ? addHeadSlash : stripHeadSlash;
  function getLocation() {
    var hashPath = pathDecoder(getHashContent(window.location.hash));
    if (basename) {
      hashPath = stripBasename(hashPath, basename);
    }
    return createLocation('', hashPath, undefined, 'default');
  }
  var initLocation = getLocation();
  var memRecords = createMemoryRecord(initLocation, createPath);
  var transitionManager = new TransitionManager();
  function createHref(location) {
    var tag = document.querySelector('base');
    var base = tag && tag.getAttribute('href') ? stripHash(window.location.href) : '';
    return base + '#' + pathEncoder(basename + createPath(location));
  }
  var forceNextPop = false;
  var ignorePath = null;
  var _getBaseHistory = getBaseHistory(transitionManager, setListener, browserHistory),
    go = _getBaseHistory.go,
    goBack = _getBaseHistory.goBack,
    goForward = _getBaseHistory.goForward,
    listen = _getBaseHistory.listen,
    block = _getBaseHistory.block,
    getUpdateStateFunc = _getBaseHistory.getUpdateStateFunc;
  var history = {
    action: Action.pop,
    length: browserHistory.length,
    location: initLocation,
    go: go,
    goBack: goBack,
    goForward: goForward,
    push: push,
    replace: replace,
    listen: listen,
    block: block,
    createHref: createHref
  };
  var updateState = getUpdateStateFunc(history);
  function push(to, state) {
    warning(state !== undefined, 'Hash history does not support state, it will be ignored');
    var action = Action.push;
    var location = createLocation(history.location, to, undefined, '');
    transitionManager.confirmJumpTo(location, action, getUserConfirmation, function (isJump) {
      if (!isJump) {
        return;
      }
      var path = createPath(location);
      var encodedPath = pathEncoder(basename + path);
      // 前后hash不一样才进行跳转
      if (getHashContent(window.location.href) !== encodedPath) {
        ignorePath = encodedPath;
        window.location.hash = encodedPath;
        memRecords.addRecord(history.location, location, action);
        updateState({
          action: action,
          location: location
        });
      } else {
        updateState(undefined);
      }
    });
  }
  function replace(to, state) {
    warning(state !== undefined, 'Hash history does not support state, it will be ignored');
    var action = Action.replace;
    var location = createLocation(history.location, to, undefined, '');
    transitionManager.confirmJumpTo(location, action, getUserConfirmation, function (isJump) {
      if (!isJump) {
        return;
      }
      var path = createPath(location);
      var encodedPath = pathEncoder(basename + path);
      if (getHashContent(window.location.href) !== encodedPath) {
        ignorePath = path;
        window.location.replace(stripHash(window.location.href) + '#' + encodedPath);
      }
      memRecords.addRecord(history.location, location, action);
      updateState({
        action: action,
        location: location
      });
    });
  }
  function handleHashChange() {
    var hashPath = getHashContent(window.location.href);
    var encodedPath = pathEncoder(hashPath);
    if (hashPath !== encodedPath) {
      window.location.replace(stripHash(window.location.href) + '#' + encodedPath);
    } else {
      var location = getLocation();
      var prevLocation = history.location;
      if (!forceNextPop && isLocationEqual(location, prevLocation)) {
        return;
      }
      if (ignorePath === createPath(location)) {
        return;
      }
      ignorePath = null;
      handlePopState(location);
    }
  }
  function handlePopState(location) {
    if (forceNextPop) {
      forceNextPop = false;
      updateState(undefined);
    } else {
      var action = Action.pop;
      var callback = function (isJump) {
        if (isJump) {
          updateState({
            action: action,
            location: location
          });
        } else {
          revertPopState(location);
        }
      };
      transitionManager.confirmJumpTo(location, action, getUserConfirmation, callback);
    }
  }

  // 在跳转行为被Block后，用History.go()跳转回之前的页面
  function revertPopState(form) {
    var to = history.location;
    var delta = memRecords.getDelta(to, form);
    if (delta !== 0) {
      go(delta);
      forceNextPop = true;
    }
  }
  var listenerCount = 0;
  function setListener(delta) {
    listenerCount += delta;
    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(EventType.HashChange, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(EventType.HashChange, handleHashChange);
    }
  }
  return history;
}

function createNamedContext(name, defaultValue) {
  var context = createContext(defaultValue);
  context.displayName = name;
  return context;
}
var RouterContext = createNamedContext('Router', {});

var TokenType = /*#__PURE__*/function (TokenType) {
  TokenType["Delimiter"] = "delimiter";
  TokenType["Static"] = "static";
  TokenType["Param"] = "param";
  TokenType["WildCard"] = "wildcard";
  TokenType["LBracket"] = "(";
  TokenType["RBracket"] = ")";
  TokenType["Pattern"] = "pattern";
  return TokenType;
}({});

// 解析URL中的动态参数，以实现TypeScript提示功能

/**
 * @description 将url中的//转换为/
 */
function cleanPath(path) {
  return path.replace(/\/+/g, '/');
}
function scoreCompare(score1, score2) {
  var score1Length = score1.length;
  var score2Length = score2.length;
  var end = Math.min(score1Length, score2Length);
  for (var i = 0; i < end; i++) {
    var delta = score2[i] - score1[i];
    if (delta !== 0) {
      return delta;
    }
  }
  if (score1Length === score2Length) {
    return 0;
  }
  return score1Length > score2Length ? -1 : 1;
}

// 把正则表达式的特殊符号加两个反斜杠进行转义
function escapeStr(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}

var validChar = /[^/:*()]/;

// 对Url模板进行词法解析，解析结果为Tokens
function lexer(path) {
  var tokens = [];
  if (!path) {
    return tokens;
  }
  var urlPath = cleanPath(path);
  if (urlPath !== '*' && !urlPath.startsWith('/')) {
    throw new Error("Url must start with \"/\".");
  }
  var getLiteral = function () {
    var name = '';
    while (i < urlPath.length && validChar.test(urlPath[i])) {
      name += urlPath[i];
      skipChar(1);
    }
    return name;
  };
  var skipChar = function (step) {
    i += step;
  };
  var i = 0;
  while (i < urlPath.length) {
    var curChar = urlPath[i];
    var prevChar = urlPath[i - 1];
    if (curChar === '/') {
      tokens.push({
        type: TokenType.Delimiter,
        value: urlPath[i]
      });
      skipChar(1);
      continue;
    }
    // dynamic params (/:a)
    if (prevChar === '/' && curChar === ':') {
      skipChar(1);
      tokens.push({
        type: TokenType.Param,
        value: getLiteral()
      });
      continue;
    }
    // wildCard params (/:*)
    if ((prevChar === '/' || prevChar === undefined) && curChar === '*') {
      tokens.push({
        type: TokenType.WildCard,
        value: urlPath[i]
      });
      skipChar(1);
      continue;
    }
    // static params
    if (prevChar === '/' && validChar.test(curChar)) {
      tokens.push({
        type: TokenType.Static,
        value: getLiteral()
      });
      continue;
    }
    if (curChar === '(') {
      tokens.push({
        type: TokenType.LBracket,
        value: '('
      });
      skipChar(1);
      continue;
    }
    if (curChar === ')') {
      tokens.push({
        type: TokenType.RBracket,
        value: ')'
      });
      skipChar(1);
      continue;
    }
    if (validChar.test(curChar)) {
      tokens.push({
        type: TokenType.Pattern,
        value: getLiteral()
      });
      continue;
    }
    // 跳过非法字符
    skipChar(1);
  }
  return tokens;
}

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// 不同类型参数的匹配得分
var MatchScore = /*#__PURE__*/function (MatchScore) {
  MatchScore[MatchScore["static"] = 10] = "static";
  MatchScore[MatchScore["param"] = 6] = "param";
  MatchScore[MatchScore["wildcard"] = 3] = "wildcard";
  MatchScore[MatchScore["placeholder"] = -1] = "placeholder";
  return MatchScore;
}(MatchScore || {}); // 兼容 react v5 matched类型
var defaultOption = {
  // url匹配时是否大小写敏感
  caseSensitive: true,
  // 是否严格匹配url结尾的/
  strictMode: false,
  // 是否完全精确匹配
  exact: false
};
// 正则表达式中需要转义的字符
var REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
// 用于匹配两个//中的的值
var BASE_PARAM_PATTERN = '[^/]+';
var DefaultDelimiter = '/#?';
function createPathParser(pathname) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOption;
  var _option$caseSensitive = option.caseSensitive,
    caseSensitive = _option$caseSensitive === void 0 ? defaultOption.caseSensitive : _option$caseSensitive,
    _option$strictMode = option.strictMode,
    strictMode = _option$strictMode === void 0 ? defaultOption.strictMode : _option$strictMode,
    _option$exact = option.exact,
    exact = _option$exact === void 0 ? defaultOption.exact : _option$exact;
  /**
   * URL匹配整体流程
   * 1.词法解析，将URL模板解析为Token
   * 2.使用Token生成正则表达式
   * 3.利用正则表达式解析URL中参数或填充URL模板
   */
  var pattern = '^';
  var keys = [];
  var scores = [];
  var tokens = lexer(pathname);
  var onlyHasWildCard = tokens.length === 1 && tokens[0].type === TokenType.WildCard;
  var tokenCount = tokens.length;
  var lastToken = tokens[tokenCount - 1];
  for (var tokenIdx = 0; tokenIdx < tokenCount; tokenIdx++) {
    var token = tokens[tokenIdx];
    var nextToken = tokens[tokenIdx + 1];
    switch (token.type) {
      case TokenType.Delimiter:
        pattern += '/';
        break;
      case TokenType.Static:
        pattern += token.value.replace(REGEX_CHARS_RE, '\\$&');
        scores.push(MatchScore.static);
        break;
      case TokenType.Param:
        var paramRegexp = '';
        if (nextToken && nextToken.type === TokenType.LBracket) {
          // 跳过当前Token和左括号
          tokenIdx += 2;
          while (tokens[tokenIdx].type !== TokenType.RBracket) {
            paramRegexp += tokens[tokenIdx].value;
            tokenIdx++;
          }
        }
        pattern += paramRegexp ? "((?:" + paramRegexp + "))" : "(" + BASE_PARAM_PATTERN + ")";
        keys.push(token.value);
        scores.push(MatchScore.param);
        break;
      case TokenType.WildCard:
        keys.push(token.value);
        pattern += "((?:" + BASE_PARAM_PATTERN + ")" + (onlyHasWildCard ? '?' : '') + "(?:/(?:" + BASE_PARAM_PATTERN + "))*)";
        scores.push(onlyHasWildCard ? MatchScore.wildcard : MatchScore.placeholder);
        break;
    }
  }
  var isWildCard = lastToken.type === TokenType.WildCard;
  if (!isWildCard && !exact) {
    if (!strictMode) {
      pattern += "(?:[" + escapeStr(DefaultDelimiter) + "](?=$))?";
    }
    if (lastToken.type !== TokenType.Delimiter) {
      pattern += "(?=[" + escapeStr(DefaultDelimiter) + "]|$)";
    }
  } else {
    pattern += strictMode ? '$' : "[" + escapeStr(DefaultDelimiter) + "]?$";
  }
  var flag = caseSensitive ? '' : 'i';
  var regexp = new RegExp(pattern, flag);

  /**
   * @description 根据给定Pattern解析path
   */
  function parse(path) {
    var reMatch = path.match(regexp);
    if (!reMatch) {
      return null;
    }
    var matchedPath = reMatch[0];
    var params = {};
    var parseScore = Array.from(scores);
    for (var i = 1; i < reMatch.length; i++) {
      var param = reMatch[i];
      var key = keys[i - 1];
      if (key === '*' && param) {
        var value = param.split('/');
        if (!Array.isArray(params['*'])) {
          params['*'] = value;
        } else {
          var _params$;
          (_params$ = params['*']).push.apply(_params$, value);
        }
        // 完成通配符参数解析后将placeholder替换为wildcard参数的分值
        parseScore.splice.apply(parseScore, [scores.indexOf(MatchScore.placeholder), 1].concat(new Array(value.length).fill(MatchScore.wildcard)));
      } else {
        params[key] = param ? param : [];
      }
    }
    var isExact = path === matchedPath;
    var url = path === '/' && matchedPath === '' ? '/' : matchedPath;
    return {
      isExact: isExact,
      path: pathname,
      url: url,
      score: parseScore,
      params: params
    };
  }

  /**
   * @description 使用给定参数填充pattern，得到目标URL
   */
  function compile(params) {
    var path = '';
    var _iterator = _createForOfIteratorHelper(tokens),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _token = _step.value;
        switch (_token.type) {
          case TokenType.Static:
            path += _token.value;
            break;
          case TokenType.Param:
            if (!params[_token.value]) {
              throw new Error('Param is invalid.');
            }
            path += params[_token.value];
            break;
          case TokenType.WildCard:
            var wildCard = params['*'];
            if (wildCard instanceof Array) {
              path += wildCard.join('/');
            } else {
              path += wildCard;
            }
            break;
          case TokenType.Delimiter:
            path += _token.value;
            break;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return path;
  }
  return {
    get regexp() {
      return regexp;
    },
    get keys() {
      return keys;
    },
    compile: compile,
    parse: parse
  };
}

/**
 * @description 依次使用pathname与pattern进行匹配，根据匹配分数取得分数最高结果
 */
function matchPath(pathname, pattern, option) {
  var patterns = Array.isArray(pattern) ? [].concat(pattern) : [pattern];
  var matchedResults = [];
  var _iterator2 = _createForOfIteratorHelper(patterns),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var item = _step2.value;
      var parser = createPathParser(item, option);
      var matched = parser.parse(pathname);
      if (matched) {
        matchedResults.push(matched);
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return !matchedResults.length ? null : matchedResults.sort(function (a, b) {
    return scoreCompare(a.score, b.score);
  })[0];
}
function generatePath(path, params) {
  var parser = createPathParser(path);
  return parser.compile(params);
}

function useHistory() {
  return useContext(RouterContext).history;
}
function useLocation() {
  return useContext(RouterContext).location;
}
function useParams() {
  var match = useContext(RouterContext).match;
  return match ? match.params : {};
}
function useRouteMatch(path) {
  var pathname = useLocation().pathname;
  var match = useContext(RouterContext).match;
  if (path) {
    return matchPath(pathname, path);
  }
  return match;
}

function Route(props) {
  var context = useContext(RouterContext);
  var computed = props.computed,
    location = props.location,
    path = props.path;
  var children = props.children,
    component = props.component,
    render = props.render;
  var match;
  var routeLocation = location || context.location;
  if (computed) {
    match = computed;
  } else if (path) {
    match = matchPath(routeLocation.pathname, path);
  } else {
    match = context.match;
  }
  var newProps = _extends({}, context, {
    location: routeLocation,
    match: match
  });
  if (Array.isArray(children) && Children.count(children) === 0) {
    children = null;
  }

  /**
   * 按顺序获取需要渲染的组件
   * 1.children
   * 2.component
   * 3.render
   * 都没有匹配到返回Null
   */
  var getChildren = function () {
    // 如果 match 存在
    if (newProps.match) {
      if (children) {
        if (typeof children === 'function') {
          return children(newProps);
        }
        return children;
      }
      if (component) {
        return createElement(component, newProps);
      } else if (render) {
        return render(newProps);
      } else {
        return null;
      }
    } else {
      // match为null
      if (typeof children === 'function') {
        return children(newProps);
      }
      return null;
    }
  };
  return /*#__PURE__*/React.createElement(RouterContext.Provider, {
    value: newProps
  }, getChildren());
}

function Router(props) {
  var history = props.history,
    _props$children = props.children,
    children = _props$children === void 0 ? null : _props$children;
  var _useState = useState(props.history.location),
    location = _useState[0],
    setLocation = _useState[1];
  var pendingLocation = useRef(null);

  // 在Router加载时就监听history地址变化，以保证在始渲染时重定向能正确触发
  var unListen = history.listen(function (arg) {
    pendingLocation.current = arg.location;
  });

  // 模拟componentDidMount和componentWillUnmount
  useLayoutEffect(function () {
    if (unListen) {
      unListen();
    }
    // 监听history中的位置变化
    unListen = history.listen(function (arg) {
      setLocation(arg.location);
    });
    if (pendingLocation.current) {
      setLocation(pendingLocation.current);
    }
    return function () {
      if (unListen) {
        unListen();
        unListen = null;
        pendingLocation.current = null;
      }
    };
  }, []);
  var initContextValue = useMemo(function () {
    return {
      history: history,
      location: location,
      match: {
        isExact: location.pathname === '/',
        params: {},
        path: '/',
        score: [],
        url: '/'
      }
    };
  }, [location]);
  return /*#__PURE__*/React.createElement(RouterContext.Provider, {
    value: initContextValue,
    children: children
  });
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

function LifeCycle(props) {
  // 使用ref保存上一次的props，防止重新渲染
  var prevProps = useRef(null);
  var isMount = useRef(false);
  var onMount = props.onMount,
    onUpdate = props.onUpdate,
    onUnmount = props.onUnmount;
  useLayoutEffect(function () {
    // 首次挂载 模拟componentDidMount
    if (!isMount.current) {
      isMount.current = true;
      if (onMount) {
        onMount();
      }
    } else {
      // 不是首次渲染 模拟componentDidUpdate
      if (onUpdate) {
        prevProps.current ? onUpdate(prevProps.current) : onUpdate();
      }
    }
    prevProps.current = props;
  });

  // 模拟componentWillUnmount
  useLayoutEffect(function () {
    return function () {
      if (onUnmount) {
        onUnmount();
      }
    };
  }, []);
  return null;
}

var _excluded$2 = ["state"];
function Redirect(props) {
  var to = props.to,
    _props$push = props.push,
    push = _props$push === void 0 ? false : _props$push,
    computed = props.computed;
  var context = useContext(RouterContext);
  var history = context.history;
  var calcLocation = function () {
    if (computed) {
      if (typeof to === 'string') {
        var parser = createPathParser(to);
        var target = parser.compile(computed.params);
        return parsePath(target);
      } else {
        var pathname = to.pathname ? addHeadSlash(to.pathname) : '/';
        var _parser = createPathParser(pathname);
        var _target = _parser.compile(computed.params);
        return _extends({}, to, {
          pathname: _target
        });
      }
    }
    return typeof to === 'string' ? parsePath(to) : to;
  };
  var navigate = push ? history.push : history.replace;
  var _calcLocation = calcLocation(),
    state = _calcLocation.state,
    path = _objectWithoutPropertiesLoose(_calcLocation, _excluded$2);
  var onMountFunc = function () {
    navigate(path, state);
  };
  var onUpdateFunc = function (prevProps) {
    // 如果当前页面与重定向前页面不一致，执行跳转
    var prevPath = prevProps === null || prevProps === void 0 ? void 0 : prevProps.data;
    if (!isLocationEqual(prevPath, path)) {
      navigate(path, state);
    }
  };
  return /*#__PURE__*/React.createElement(LifeCycle, {
    onMount: onMountFunc,
    onUpdate: onUpdateFunc,
    data: path
  });
}

function Switch(props) {
  var context = useContext(RouterContext);
  var location = props.location || context.location;
  var element = null;
  var match = null;

  // 使用forEach不会给React.ReactNode增加key属性,防止重新渲染
  Children.forEach(props.children, function (node) {
    if (match === null && isValidElement(node)) {
      element = node;
      var strict;
      var sensitive;
      var path;
      var from;

      // node可能是Route和Redirect
      if (node.type === Route) {
        var _props = node.props;
        strict = _props.strict;
        sensitive = _props.sensitive;
        path = _props.path;
      } else if (node.type === Redirect) {
        var _props2 = node.props;
        path = _props2.path;
        strict = _props2.strict;
        from = _props2.from;
      }
      var exact = node.props.exact;
      var target = path || from;

      // 更新匹配状态，一旦匹配到停止遍历
      if (target) {
        match = matchPath(location.pathname, target, {
          strictMode: strict,
          caseSensitive: sensitive,
          exact: exact
        });
      } else {
        match = context.match;
      }
    }
  });
  if (match && element) {
    // 使用cloneElement复制已有组件并更新其Props
    return cloneElement(element, {
      location: location,
      computed: match
    });
  }
  return null;
}

function Prompt(props) {
  var context = useContext(RouterContext);
  var message = props.message,
    _props$when = props.when,
    when = _props$when === void 0 ? true : _props$when;
  if (typeof when === 'function' && when(context.location) === false || !when) {
    return null;
  }
  var navigate = context.history.block;
  var release = null;
  var onMountFunc = function () {
    release = message ? navigate(message) : null;
  };
  var onUpdateFunc = function (prevProps) {
    if (prevProps && prevProps.data !== message) {
      if (release) {
        release();
      }
      release = message ? navigate(message) : null;
    }
  };
  var onUnmountFunc = function () {
    if (release) {
      release();
    }
    release = null;
  };
  return /*#__PURE__*/React.createElement(LifeCycle, {
    onMount: onMountFunc,
    onUpdate: onUpdateFunc,
    onUnmount: onUnmountFunc,
    data: message
  });
}

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    var _useContext = useContext(RouterContext),
      history = _useContext.history,
      location = _useContext.location,
      match = _useContext.match;
    var routeProps = {
      history: history,
      location: location,
      match: match
    };
    return /*#__PURE__*/React.createElement(Component, _extends({}, props, routeProps));
  }
  return ComponentWithRouterProp;
}

function HashRouter(props) {
  var historyRef = useRef();
  if (historyRef.current === null || historyRef.current === undefined) {
    historyRef.current = createHashHistory({
      basename: props.basename,
      getUserConfirmation: props.getUserConfirmation,
      hashType: props.hashType
    });
  }
  return /*#__PURE__*/React.createElement(Router, {
    history: historyRef.current
  }, props.children);
}

function BrowserRouter(props) {
  // 使用Ref持有History对象，防止重复渲染
  var historyRef = useRef();
  if (historyRef.current === null || historyRef.current === undefined) {
    historyRef.current = createBrowserHistory({
      basename: props.basename,
      forceRefresh: props.forceRefresh,
      getUserConfirmation: props.getUserConfirmation
    });
  }
  return /*#__PURE__*/React.createElement(Router, {
    history: historyRef.current
  }, props.children);
}

var _excluded$1 = ["to", "replace", "component", "onClick", "target"];
var isModifiedEvent = function (event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
};
var checkTarget = function (target) {
  return !target || target === '_self';
};
function Link(props) {
  var to = props.to,
    replace = props.replace;
    props.component;
    var onClick = props.onClick,
    target = props.target,
    other = _objectWithoutPropertiesLoose(props, _excluded$1);
  var tag = props.tag || 'a';
  var context = useContext(RouterContext);
  var history = context.history;
  var location = typeof to === 'function' ? to(context.location) : to;
  var state;
  var path;
  if (typeof location === 'string') {
    path = parsePath(location);
  } else {
    var pathname = location.pathname,
      hash = location.hash,
      search = location.search;
    path = {
      pathname: pathname,
      hash: hash,
      search: search
    };
    state = location.state;
  }
  var href = history.createHref(path);
  var linkClickEvent = function (event) {
    try {
      if (onClick) {
        onClick(event);
      }
    } catch (e) {
      event.preventDefault();
      throw e;
    }
    if (!event.defaultPrevented && event.button === 0 && checkTarget(target) && !isModifiedEvent(event)) {
      // 不是相同的路径执行push操作，是相同的路径执行replace
      var isSamePath = createPath(context.location) === createPath(path);
      var navigate = replace || isSamePath ? history.replace : history.push;
      event.preventDefault();
      navigate(path, state);
    }
  };
  var linkProps = _extends({
    href: href,
    onClick: linkClickEvent
  }, other);
  return React.createElement(tag, linkProps);
}

var _excluded = ["to", "isActive"];
function NavLink(props) {
  var to = props.to,
    isActive = props.isActive,
    rest = _objectWithoutPropertiesLoose(props, _excluded);
  var context = useContext(RouterContext);
  var toLocation = typeof to === 'function' ? to(context.location) : to;
  var _ref = typeof toLocation === 'string' ? parsePath(toLocation) : toLocation,
    path = _ref.pathname;
  // 把正则表达式的特殊符号加两个反斜杠进行转义
  var escapedPath = path ? escapeStr(path) : '';
  var match = escapedPath ? matchPath(context.location.pathname, escapedPath) : null;
  var isLinkActive = match && isActive ? isActive(match, context.location) : false;
  var page = 'page';
  var otherProps = _extends({
    'aria-current': isLinkActive ? page : false
  }, rest);
  return /*#__PURE__*/React.createElement(Link, _extends({
    to: to
  }, otherProps));
}

// 获取redux state中的值
function getIn(state, path) {
  if (!state) {
    return state;
  }
  var length = path.length;
  if (!length) {
    return undefined;
  }
  var res = state;
  for (var i = 0; i < length && !!res; ++i) {
    res = res[path[i]];
  }
  return res;
}

// 从store的state中获取Router、Location、Action、Hash等信息
var stateReader = function (storeType) {
  var isRouter = function (value) {
    return value !== null && typeof value === 'object' && !!getIn(value, ['location']) && !!getIn(value, ['action']);
  };
  var getRouter = function (state) {
    var router = getIn(state, ['router']);
    if (!isRouter(router)) {
      throw new Error("Could not find router reducer in " + storeType + " store, it must be mounted under \"router\"");
    }
    return router;
  };
  var getLocation = function (state) {
    return getIn(getRouter(state), ['location']);
  };
  var getAction = function (state) {
    return getIn(getRouter(state), ['action']);
  };
  var getSearch = function (state) {
    return getIn(getRouter(state), ['location', 'search']);
  };
  var getHash = function (state) {
    return getIn(getRouter(state), ['location', 'hash']);
  };
  return {
    getHash: getHash,
    getAction: getAction,
    getSearch: getSearch,
    getRouter: getRouter,
    getLocation: getLocation
  };
};

var hConnect = reduxAdapter.connect;
function ConnectedRouterWithoutMemo(props) {
  var store = props.store,
    history = props.history,
    onLocationChanged = props.onLocationChanged,
    omitRouter = props.omitRouter,
    children = props.children,
    storeType = props.storeType;
  var _stateReader = stateReader(storeType),
    getLocation = _stateReader.getLocation;

  // 监听store变化
  var unsubscribe = store.subscribe(function () {
    // 获取redux State中的location信息
    var _getLocation = getLocation(store.getState()),
      pathnameInStore = _getLocation.pathname,
      searchInStore = _getLocation.search,
      hashInStore = _getLocation.hash,
      stateInStore = _getLocation.state;

    // 获取当前history对象中的location信息
    var _history$location = history.location,
      pathnameInHistory = _history$location.pathname,
      searchInHistory = _history$location.search,
      hashInHistory = _history$location.hash,
      stateInHistory = _history$location.state;

    // 两个location不一致 执行跳转
    if (history.action === 'PUSH' && (pathnameInHistory !== pathnameInStore || searchInHistory !== searchInStore || hashInHistory !== hashInStore || stateInHistory !== stateInStore)) {
      history.push({
        pathname: pathnameInStore,
        search: searchInStore,
        hash: hashInStore
      }, stateInStore);
    }
  });
  var handleLocationChange = function (args) {
    var isFirstRendering = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var location = args.location,
      action = args.action;
    onLocationChanged(location, action, isFirstRendering);
  };

  // 监听history更新
  var unListen = function () {
    return history.listen(handleLocationChange);
  };
  useLayoutEffect(function () {
    return function () {
      unListen();
      unsubscribe();
    };
  }, []);
  if (!props.noInitialPop) {
    // 传递初始时位置信息，isFirstRendering设为true防止重复渲染
    handleLocationChange({
      location: history.location,
      action: history.action
    }, true);
  }
  if (omitRouter) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, children);
  }
  var childrenNode;
  if (typeof children === 'function') {
    childrenNode = children();
  } else {
    childrenNode = children;
  }
  return /*#__PURE__*/React.createElement(Router, {
    history: history
  }, childrenNode);
}
function getConnectedRouter(type) {
  var mapDispatchToProps = function (dispatch) {
    return {
      onLocationChanged: function (location, action, isFirstRendering) {
        return dispatch(onLocationChanged(location, action, isFirstRendering));
      }
    };
  };
  var ConnectedRouter = React.memo(ConnectedRouterWithoutMemo);
  var ConnectedRouterWithContext = function (props) {
    var Context = props.context || ReactReduxContext;
    return /*#__PURE__*/React.createElement(Context.Consumer, null, function (_ref) {
      var store = _ref.store;
      return /*#__PURE__*/React.createElement(ConnectedRouter, _extends({
        store: store,
        storeType: type
      }, props));
    });
  };

  // 针对不同的Store类型，使用对应的connect函数
  if (type === 'HorizonXCompat') {
    return hConnect(null, mapDispatchToProps)(ConnectedRouterWithContext);
  }
  if (type === 'Redux') {
    return connect(null, mapDispatchToProps)(ConnectedRouterWithContext);
  } else {
    throw new Error('Invalid store type');
  }
}

// 定义connect-router对应的redux dispatch函数
function routerMiddleware(history) {
  return function (_) {
    return function (next) {
      return function (action) {
        if (action.type !== ActionName.CALL_HISTORY_METHOD) {
          return next(action);
        }
        var _action$payload = action.payload,
          method = _action$payload.method,
          args = _action$payload.args;
        if (method in history) {
          var _ref;
          (_ref = history)[method].apply(_ref, args);
        }
      };
    };
  };
}

var connectRouter = createConnectRouter();

var ConnectedRouter = getConnectedRouter('Redux');
var ConnectedHRouter = getConnectedRouter('HorizonXCompat');

export { BrowserRouter, ConnectedHRouter, ConnectedRouter, HashRouter, Link, NavLink, Prompt, Redirect, Route, Router, Switch, RouterContext as __RouterContext, connectRouter, createBrowserHistory, createHashHistory, generatePath, matchPath, routerMiddleware, useHistory, useLocation, useParams, useRouteMatch, withRouter };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdFJvdXRlci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2V4dGVuZHMuanMiLCIuLi8uLi9zcmMvY29ubmVjdC1yb3V0ZXIvYWN0aW9ucy50cyIsIi4uLy4uL3NyYy9jb25uZWN0LXJvdXRlci9yZWR1Y2VyLnRzIiwiLi4vLi4vc3JjL2hpc3RvcnkvZG9tLnRzIiwiLi4vLi4vc3JjL2hpc3RvcnkvdHlwZXMudHMiLCIuLi8uLi9zcmMvaGlzdG9yeS91dGlscy50cyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9jbGFzc0NhbGxDaGVjay5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS90eXBlb2YuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vdG9QcmltaXRpdmUuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vdG9Qcm9wZXJ0eUtleS5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9jcmVhdGVDbGFzcy5qcyIsIi4uLy4uL3NyYy9oaXN0b3J5L3RyYW5zaXRpb25NYW5hZ2VyLnRzIiwiLi4vLi4vc3JjL2hpc3Rvcnkvd2FyaW5nLnRzIiwiLi4vLi4vc3JjL2hpc3RvcnkvYmFzZUhpc3RvcnkudHMiLCIuLi8uLi9zcmMvaGlzdG9yeS9icm93ZXJIaXN0b3J5LnRzIiwiLi4vLi4vc3JjL2hpc3RvcnkvaGFzaEhpc3RvcnkudHMiLCIuLi8uLi9zcmMvcm91dGVyL2NvbnRleHQudHN4IiwiLi4vLi4vc3JjL3JvdXRlci9tYXRjaGVyL3R5cGVzLnRzIiwiLi4vLi4vc3JjL3JvdXRlci9tYXRjaGVyL3V0aWxzLnRzIiwiLi4vLi4vc3JjL3JvdXRlci9tYXRjaGVyL2xleGVyLnRzIiwiLi4vLi4vc3JjL3JvdXRlci9tYXRjaGVyL3BhcnNlci50cyIsIi4uLy4uL3NyYy9yb3V0ZXIvaG9va3MudHMiLCIuLi8uLi9zcmMvcm91dGVyL1JvdXRlLnRzeCIsIi4uLy4uL3NyYy9yb3V0ZXIvUm91dGVyLnRzeCIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlLmpzIiwiLi4vLi4vc3JjL3JvdXRlci9saWZlQ3ljbGVIb29rLnRzIiwiLi4vLi4vc3JjL3JvdXRlci9SZWRpcmVjdC50c3giLCIuLi8uLi9zcmMvcm91dGVyL1N3aXRjaC50c3giLCIuLi8uLi9zcmMvcm91dGVyL1Byb21wdC50c3giLCIuLi8uLi9zcmMvcm91dGVyL3dpdGhSb3V0ZXIudHN4IiwiLi4vLi4vc3JjL3JvdXRlci9IYXNoUm91dGVyLnRzeCIsIi4uLy4uL3NyYy9yb3V0ZXIvQnJvd3NlclJvdXRlci50c3giLCIuLi8uLi9zcmMvcm91dGVyL0xpbmsudHN4IiwiLi4vLi4vc3JjL3JvdXRlci9OYXZMaW5rLnRzeCIsIi4uLy4uL3NyYy9jb25uZWN0LXJvdXRlci9yZWR1eFV0aWxzLnRzIiwiLi4vLi4vc3JjL2Nvbm5lY3Qtcm91dGVyL2Nvbm5lY3RlZFJvdXRlci50c3giLCIuLi8uLi9zcmMvY29ubmVjdC1yb3V0ZXIvZGlzcGF0Y2gudHMiLCIuLi8uLi9zcmMvY29ubmVjdC1yb3V0ZXIvaW5kZXgudHMiLCIuLi8uLi9zcmMvcm91dGVyL2luZGV4Mi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfZXh0ZW5kcygpIHtcbiAgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuICByZXR1cm4gX2V4dGVuZHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn0iLCJpbXBvcnQgeyBBY3Rpb24sIFBhdGggfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuXHJcbnR5cGUgTG9jYXRpb24gPSBQYXJ0aWFsPFBhdGg+XHJcblxyXG4vLyDlrprkuYnkvY3nva7lj5jljJblkoxoaXN0b3J55pa55rOV6LCD55So55qEQWN0aW9uIHR5cGVcclxuZXhwb3J0IGVudW0gQWN0aW9uTmFtZSB7XHJcbiAgTE9DQVRJT05fQ0hBTkdFID0gJyRob3Jpem9uLXJvdXRlci9MT0NBVElPTl9DSEFOR0UnLFxyXG4gIENBTExfSElTVE9SWV9NRVRIT0QgPSAnJGhvcml6b24tcm91dGVyL0NBTExfSElTVE9SWV9NRVRIT0QnXHJcbn1cclxuXHJcbi8vIOWumuS5iUFjdGlvbueahOS4pOenjeaVsOaNruexu+Wei1xyXG5leHBvcnQgdHlwZSBBY3Rpb25NZXNzYWdlID0ge1xyXG4gIHR5cGU6IEFjdGlvbk5hbWUuTE9DQVRJT05fQ0hBTkdFXHJcbiAgcGF5bG9hZDoge1xyXG4gICAgbG9jYXRpb246IExvY2F0aW9uLFxyXG4gICAgYWN0aW9uOiBBY3Rpb25cclxuICAgIGlzRmlyc3RSZW5kZXJpbmc6IGJvb2xlYW5cclxuICB9XHJcbn0gfCB7XHJcbiAgdHlwZTogQWN0aW9uTmFtZS5DQUxMX0hJU1RPUllfTUVUSE9EXHJcbiAgcGF5bG9hZDoge1xyXG4gICAgbWV0aG9kOiBzdHJpbmcsXHJcbiAgICBhcmdzOiBhbnlcclxuICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3Qgb25Mb2NhdGlvbkNoYW5nZWQgPSAobG9jYXRpb246IExvY2F0aW9uLCBhY3Rpb246IEFjdGlvbiwgaXNGaXJzdFJlbmRlcmluZyA9IGZhbHNlKTogQWN0aW9uTWVzc2FnZSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHR5cGU6IEFjdGlvbk5hbWUuTE9DQVRJT05fQ0hBTkdFLFxyXG4gICAgcGF5bG9hZDoge1xyXG4gICAgICBsb2NhdGlvbixcclxuICAgICAgYWN0aW9uLFxyXG4gICAgICBpc0ZpcnN0UmVuZGVyaW5nLFxyXG4gICAgfSxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3QgdXBkYXRlTG9jYXRpb24gPSAobWV0aG9kOiBzdHJpbmcpOiAoLi4uYXJnczogYW55KSA9PiBBY3Rpb25NZXNzYWdlID0+IHtcclxuICByZXR1cm4gKC4uLmFyZ3M6IGFueSkgPT4gKHtcclxuICAgIHR5cGU6IEFjdGlvbk5hbWUuQ0FMTF9ISVNUT1JZX01FVEhPRCxcclxuICAgIHBheWxvYWQ6IHtcclxuICAgICAgbWV0aG9kLFxyXG4gICAgICBhcmdzLFxyXG4gICAgfSxcclxuICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBwdXNoID0gdXBkYXRlTG9jYXRpb24oJ3B1c2gnKTtcclxuZXhwb3J0IGNvbnN0IHJlcGxhY2UgPSB1cGRhdGVMb2NhdGlvbigncmVwbGFjZScpO1xyXG5leHBvcnQgY29uc3QgZ28gPSB1cGRhdGVMb2NhdGlvbignZ28nKTsiLCJpbXBvcnQgeyBBY3Rpb25OYW1lIH0gZnJvbSAnLi9hY3Rpb25zJztcclxuaW1wb3J0IHsgQWN0aW9uLCBIaXN0b3J5IH0gZnJvbSAnLi4vaGlzdG9yeS90eXBlcyc7XHJcbmltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSAnLi4vcm91dGVyJztcclxuXHJcbnR5cGUgTG9jYXRpb25XaXRoUXVlcnkgPSBQYXJ0aWFsPExvY2F0aW9uPiAmIHsgcXVlcnk/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IH07XHJcblxyXG4vLyDop6PmnpBsb2NhdGlvbuWvueixoe+8jOWwhuWFtuS4reeahHF1ZXJ55Y+C5pWw6Kej5p6Q5bm25rOo5YWlXHJcbmZ1bmN0aW9uIGluamVjdFF1ZXJ5UGFyYW1zKGxvY2F0aW9uPzogTG9jYXRpb25XaXRoUXVlcnkpOiBMb2NhdGlvbldpdGhRdWVyeSB7XHJcbiAgaWYgKGxvY2F0aW9uICYmIGxvY2F0aW9uLnF1ZXJ5KSB7XHJcbiAgICByZXR1cm4gbG9jYXRpb247XHJcbiAgfVxyXG5cclxuICBjb25zdCBxdWVyeVN0cmluZyA9IGxvY2F0aW9uICYmIGxvY2F0aW9uLnNlYXJjaDtcclxuXHJcbiAgaWYgKCFxdWVyeVN0cmluZykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgLi4ubG9jYXRpb24sXHJcbiAgICAgIHF1ZXJ5OiB7fSxcclxuICAgIH07XHJcbiAgfVxyXG4gIGNvbnN0IHF1ZXJ5T2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XHJcblxyXG4gIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHJpbmcpO1xyXG4gIHBhcmFtcy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiAocXVlcnlPYmplY3Rba2V5XSA9IHZhbHVlKSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICAuLi5sb2NhdGlvbixcclxuICAgIHF1ZXJ5OiBxdWVyeU9iamVjdCxcclxuICB9O1xyXG59XHJcblxyXG50eXBlIEluaXRSb3V0ZXJTdGF0ZSA9IHtcclxuICBsb2NhdGlvbjogTG9jYXRpb25XaXRoUXVlcnk7XHJcbiAgYWN0aW9uOiBBY3Rpb247XHJcbn07XHJcblxyXG50eXBlIFBheWxvYWQgPSB7XHJcbiAgdHlwZT86IEFjdGlvbk5hbWU7XHJcbiAgcGF5bG9hZD86IGFueTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb25uZWN0Um91dGVyKCkge1xyXG4gIC8vIOWIneWni+WMlnJlZHV4IFN0YXRlXHJcbiAgcmV0dXJuIChoaXN0b3J5OiBIaXN0b3J5KSA9PiB7XHJcbiAgICBjb25zdCBpbml0Um91dGVyU3RhdGUgPSB7XHJcbiAgICAgIGxvY2F0aW9uOiBpbmplY3RRdWVyeVBhcmFtcyhoaXN0b3J5LmxvY2F0aW9uKSxcclxuICAgICAgYWN0aW9uOiBoaXN0b3J5LmFjdGlvbixcclxuICAgIH07XHJcblxyXG4gICAgLy8g5a6a5LmJY29ubmVjdC1yb3V0ZXLlr7nlupTnmoRyZWR1eCByZWR1Y2Vy5Ye95pWwXHJcbiAgICByZXR1cm4gKHN0YXRlOiBJbml0Um91dGVyU3RhdGUgPSBpbml0Um91dGVyU3RhdGUsIHsgdHlwZSwgcGF5bG9hZCB9OiBQYXlsb2FkID0ge30pOiBhbnkgPT4ge1xyXG4gICAgICBpZiAodHlwZSA9PT0gQWN0aW9uTmFtZS5MT0NBVElPTl9DSEFOR0UpIHtcclxuICAgICAgICBjb25zdCB7IGxvY2F0aW9uLCBhY3Rpb24sIGlzRmlyc3RSZW5kZXJpbmcgfSA9IHBheWxvYWQ7XHJcbiAgICAgICAgaWYgKGlzRmlyc3RSZW5kZXJpbmcpIHtcclxuICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIGxvY2F0aW9uOiBpbmplY3RRdWVyeVBhcmFtcyhsb2NhdGlvbiksIGFjdGlvbjogYWN0aW9uIH07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfTtcclxuICB9O1xyXG59XHJcbiIsImV4cG9ydCBmdW5jdGlvbiBpc0Jyb3dzZXIoKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCAmJiB0eXBlb2Ygd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgPT09ICdmdW5jdGlvbic7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0Q29uZmlybWF0aW9uKG1lc3NhZ2U6IHN0cmluZywgY2FsbEJhY2s6IChyZXN1bHQ6IGJvb2xlYW4pID0+IHZvaWQpIHtcclxuICBjYWxsQmFjayh3aW5kb3cuY29uZmlybShtZXNzYWdlKSk7XHJcbn1cclxuXHJcbi8vIOWIpOaWrea1j+iniOWZqOaYr+WQpuaUr+aMgXB1c2hTdGF0ZeaWueazle+8jHB1c2hTdGF0ZeaYr2Jyb3dzZXJIaXN0b3J55a6e546w55qE5Z+656GAXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1N1cHBvcnRIaXN0b3J5KCk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBpc0Jyb3dzZXIoKSAmJiB3aW5kb3cuaGlzdG9yeSAmJiAncHVzaFN0YXRlJyBpbiB3aW5kb3cuaGlzdG9yeTtcclxufVxyXG5cclxuLy8g5Yik5pat5rWP6KeI5Zmo5piv5ZCm5pSv5oyBUG9wU3RhdGXkuovku7ZcclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3VwcG9ydHNQb3BTdGF0ZSgpOiBib29sZWFuIHtcclxuICByZXR1cm4gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignVHJpZGVudCcpID09PSAtMTtcclxufVxyXG4iLCJleHBvcnQgdHlwZSBCYXNlT3B0aW9uID0ge1xyXG4gIGJhc2VuYW1lPzogc3RyaW5nO1xyXG4gIGdldFVzZXJDb25maXJtYXRpb24/OiBDb25maXJtYXRpb25GdW5jO1xyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBIaXN0b3J5UHJvcHM8VCA9IHVua25vd24+IHtcclxuICByZWFkb25seSBhY3Rpb246IEFjdGlvbjtcclxuXHJcbiAgcmVhZG9ubHkgbG9jYXRpb246IExvY2F0aW9uPFQ+O1xyXG5cclxuICBsZW5ndGg6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBIaXN0b3J5PFQgPSB1bmtub3duPiBleHRlbmRzIEhpc3RvcnlQcm9wczxUPiB7XHJcbiAgY3JlYXRlSHJlZihwYXRoOiBQYXJ0aWFsPFBhdGg+KTogc3RyaW5nO1xyXG5cclxuICBwdXNoKHRvOiBUbywgc3RhdGU/OiBUKTogdm9pZDtcclxuXHJcbiAgcmVwbGFjZSh0bzogVG8sIHN0YXRlPzogVCk6IHZvaWQ7XHJcblxyXG4gIGxpc3RlbihsaXN0ZW5lcjogTGlzdGVuZXI8VD4pOiAoKSA9PiB2b2lkO1xyXG5cclxuICBibG9jayhwcm9tcHQ6IFByb21wdDxUPik6ICgpID0+IHZvaWQ7XHJcblxyXG4gIGdvKGluZGV4OiBudW1iZXIpOiB2b2lkO1xyXG5cclxuICBnb0JhY2soKTogdm9pZDtcclxuXHJcbiAgZ29Gb3J3YXJkKCk6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEFjdGlvbiB7XHJcbiAgcG9wID0gJ1BPUCcsXHJcbiAgcHVzaCA9ICdQVVNIJyxcclxuICByZXBsYWNlID0gJ1JFUExBQ0UnLFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBFdmVudFR5cGUge1xyXG4gIFBvcFN0YXRlID0gJ3BvcHN0YXRlJyxcclxuICBIYXNoQ2hhbmdlID0gJ2hhc2hjaGFuZ2UnLFxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBQYXRoID0ge1xyXG4gIHBhdGhuYW1lOiBzdHJpbmc7XHJcblxyXG4gIHNlYXJjaDogc3RyaW5nO1xyXG5cclxuICBoYXNoOiBzdHJpbmc7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBIaXN0b3J5U3RhdGU8VD4gPSB7XHJcbiAgc3RhdGU/OiBUO1xyXG5cclxuICBrZXk6IHN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIERlZmF1bHRTdGF0ZVR5cGUgPSB1bmtub3duO1xyXG5cclxuZXhwb3J0IHR5cGUgTG9jYXRpb248VCA9IHVua25vd24+ID0gUGF0aCAmIEhpc3RvcnlTdGF0ZTxUPjtcclxuXHJcbmV4cG9ydCB0eXBlIFRvID0gc3RyaW5nIHwgUGFydGlhbDxQYXRoPjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlzdGVuZXI8VCA9IHVua25vd24+IHtcclxuICAobmF2aWdhdGlvbjogTmF2aWdhdGlvbjxUPik6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTmF2aWdhdGlvbjxUID0gdW5rbm93bj4ge1xyXG4gIGFjdGlvbjogQWN0aW9uO1xyXG5cclxuICBsb2NhdGlvbjogTG9jYXRpb248VD47XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFByb21wdDxTPiA9IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgKChsb2NhdGlvbjogTG9jYXRpb248Uz4sIGFjdGlvbjogQWN0aW9uKSA9PiB2b2lkKTtcclxuXHJcbmV4cG9ydCB0eXBlIENhbGxCYWNrRnVuYyA9IChpc0p1bXA6IGJvb2xlYW4pID0+IHZvaWQ7XHJcblxyXG5leHBvcnQgdHlwZSBDb25maXJtYXRpb25GdW5jID0gKG1lc3NhZ2U6IHN0cmluZywgY2FsbEJhY2s6IENhbGxCYWNrRnVuYykgPT4gdm9pZDtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVE1hbmFnZXI8Uz4ge1xyXG4gIHNldFByb21wdChuZXh0OiBQcm9tcHQ8Uz4pOiAoKSA9PiB2b2lkO1xyXG5cclxuICBhZGRMaXN0ZW5lcihmdW5jOiAobmF2aWdhdGlvbjogTmF2aWdhdGlvbjxTPikgPT4gdm9pZCk6ICgpID0+IHZvaWQ7XHJcblxyXG4gIG5vdGlmeUxpc3RlbmVycyhhcmdzOiBOYXZpZ2F0aW9uPFM+KTogdm9pZDtcclxuXHJcbiAgY29uZmlybUp1bXBUbyhcclxuICAgIGxvY2F0aW9uOiBMb2NhdGlvbjxTPixcclxuICAgIGFjdGlvbjogQWN0aW9uLFxyXG4gICAgdXNlckNvbmZpcm1hdGlvbkZ1bmM6IENvbmZpcm1hdGlvbkZ1bmMsXHJcbiAgICBjYWxsQmFjazogQ2FsbEJhY2tGdW5jLFxyXG4gICk6IHZvaWQ7XHJcbn1cclxuIiwiaW1wb3J0IHsgQWN0aW9uLCBMb2NhdGlvbiwgUGF0aCwgVG8gfSBmcm9tICcuL3R5cGVzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYXRoKHBhdGg6IFBhcnRpYWw8UGF0aD4pOiBzdHJpbmcge1xyXG4gIGNvbnN0IHsgc2VhcmNoLCBoYXNoIH0gPSBwYXRoO1xyXG4gIGxldCBwYXRobmFtZSA9IHBhdGgucGF0aG5hbWUgfHwgJy8nO1xyXG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoICE9PSAnPycpIHtcclxuICAgIHBhdGhuYW1lICs9IHNlYXJjaC5zdGFydHNXaXRoKCc/JykgPyBzZWFyY2ggOiAnPycgKyBzZWFyY2g7XHJcbiAgfVxyXG4gIGlmIChoYXNoICYmIGhhc2ggIT09ICcjJykge1xyXG4gICAgcGF0aG5hbWUgKz0gaGFzaC5zdGFydHNXaXRoKCcjJykgPyBoYXNoIDogJyMnICsgaGFzaDtcclxuICB9XHJcbiAgcmV0dXJuIHBhdGhuYW1lO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQYXRoKHVybDogc3RyaW5nKTogUGFydGlhbDxQYXRoPiB7XHJcbiAgaWYgKCF1cmwpIHtcclxuICAgIHJldHVybiB7fTtcclxuICB9XHJcbiAgbGV0IHBhcnNlZFBhdGg6IFBhcnRpYWw8UGF0aD4gPSB7fTtcclxuXHJcbiAgbGV0IGhhc2hJZHggPSB1cmwuaW5kZXhPZignIycpO1xyXG4gIGlmIChoYXNoSWR4ID4gLTEpIHtcclxuICAgIHBhcnNlZFBhdGguaGFzaCA9IHVybC5zdWJzdHJpbmcoaGFzaElkeCk7XHJcbiAgICB1cmwgPSB1cmwuc3Vic3RyaW5nKDAsIGhhc2hJZHgpO1xyXG4gIH1cclxuXHJcbiAgbGV0IHNlYXJjaElkeCA9IHVybC5pbmRleE9mKCc/Jyk7XHJcbiAgaWYgKHNlYXJjaElkeCA+IC0xKSB7XHJcbiAgICBwYXJzZWRQYXRoLnNlYXJjaCA9IHVybC5zdWJzdHJpbmcoc2VhcmNoSWR4KTtcclxuICAgIHVybCA9IHVybC5zdWJzdHJpbmcoMCwgc2VhcmNoSWR4KTtcclxuICB9XHJcbiAgaWYgKHVybCkge1xyXG4gICAgcGFyc2VkUGF0aC5wYXRobmFtZSA9IHVybDtcclxuICB9XHJcbiAgcmV0dXJuIHBhcnNlZFBhdGg7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbjxTPihjdXJyZW50OiBzdHJpbmcgfCBMb2NhdGlvbiwgdG86IFRvLCBzdGF0ZT86IFMsIGtleT86IHN0cmluZyk6IFJlYWRvbmx5PExvY2F0aW9uPFM+PiB7XHJcbiAgbGV0IHBhdGhuYW1lID0gdHlwZW9mIGN1cnJlbnQgPT09ICdzdHJpbmcnID8gY3VycmVudCA6IGN1cnJlbnQucGF0aG5hbWU7XHJcbiAgbGV0IHVybE9iaiA9IHR5cGVvZiB0byA9PT0gJ3N0cmluZycgPyBwYXJzZVBhdGgodG8pIDogdG87XHJcbiAgLy8g6ZqP5py6a2V56ZW/5bqm5Y+WNlxyXG4gIGNvbnN0IGdldFJhbmRLZXkgPSBnZW5SYW5kb21LZXkoNik7XHJcbiAgY29uc3QgbG9jYXRpb24gPSB7XHJcbiAgICBwYXRobmFtZTogcGF0aG5hbWUsXHJcbiAgICBzZWFyY2g6ICcnLFxyXG4gICAgaGFzaDogJycsXHJcbiAgICBzdGF0ZTogc3RhdGUsXHJcbiAgICBrZXk6IHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnID8ga2V5IDogZ2V0UmFuZEtleSgpLFxyXG4gICAgLi4udXJsT2JqLFxyXG4gIH07XHJcbiAgaWYgKCFsb2NhdGlvbi5wYXRobmFtZSkge1xyXG4gICAgbG9jYXRpb24ucGF0aG5hbWUgPSAnLyc7XHJcbiAgfVxyXG4gIHJldHVybiBsb2NhdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzTG9jYXRpb25FcXVhbChwMTogUGFydGlhbDxQYXRoPiwgcDI6IFBhcnRpYWw8UGF0aD4pIHtcclxuICByZXR1cm4gcDEucGF0aG5hbWUgPT09IHAyLnBhdGhuYW1lICYmIHAxLnNlYXJjaCA9PT0gcDIuc2VhcmNoICYmIHAxLmhhc2ggPT09IHAyLmhhc2g7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRIZWFkU2xhc2gocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBpZiAocGF0aFswXSA9PT0gJy8nKSB7XHJcbiAgICByZXR1cm4gcGF0aDtcclxuICB9XHJcbiAgcmV0dXJuICcvJyArIHBhdGg7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEhlYWRTbGFzaChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGlmIChwYXRoWzBdID09PSAnLycpIHtcclxuICAgIHJldHVybiBwYXRoLnN1YnN0cmluZygxKTtcclxuICB9XHJcbiAgcmV0dXJuIHBhdGg7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTbGFzaChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IHRlbXBQYXRoID0gYWRkSGVhZFNsYXNoKHBhdGgpO1xyXG4gIGlmICh0ZW1wUGF0aFt0ZW1wUGF0aC5sZW5ndGggLSAxXSA9PT0gJy8nKSB7XHJcbiAgICByZXR1cm4gdGVtcFBhdGguc3Vic3RyaW5nKDAsIHRlbXBQYXRoLmxlbmd0aCAtIDEpO1xyXG4gIH1cclxuICByZXR1cm4gdGVtcFBhdGg7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNCYXNlbmFtZShwYXRoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nKTogQm9vbGVhbiB7XHJcbiAgcmV0dXJuIChcclxuICAgIHBhdGgudG9Mb3dlckNhc2UoKS5pbmRleE9mKHByZWZpeC50b0xvd2VyQ2FzZSgpKSA9PT0gMCAmJiBbJy8nLCAnPycsICcjJywgJyddLmluY2x1ZGVzKHBhdGguY2hhckF0KHByZWZpeC5sZW5ndGgpKVxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEJhc2VuYW1lKHBhdGg6IHN0cmluZywgcHJlZml4OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBoYXNCYXNlbmFtZShwYXRoLCBwcmVmaXgpID8gcGF0aC5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCkgOiBwYXRoO1xyXG59XHJcblxyXG4vLyDkvb/nlKjpmo/mnLrnlJ/miJDnmoRLZXnorrDlvZXooqvorr/pl67ov4fnmoRVUkzvvIzlvZNCbG9ja+iiq+iiq+inpuWPkeaXtuWIqeeUqGRlbHRh5YC86Lez6L2s5Yiw5LmL5YmN55qE6aG16Z2iXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNZW1vcnlSZWNvcmQ8VCwgUz4oaW5pdFZhbDogUywgZm46IChhcmc6IFMpID0+IFQpIHtcclxuICBsZXQgdmlzaXRlZFJlY29yZDogVFtdID0gW2ZuKGluaXRWYWwpXTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0RGVsdGEodG86IFMsIGZvcm06IFMpOiBudW1iZXIge1xyXG4gICAgbGV0IHRvSWR4ID0gdmlzaXRlZFJlY29yZC5sYXN0SW5kZXhPZihmbih0bykpO1xyXG4gICAgaWYgKHRvSWR4ID09PSAtMSkge1xyXG4gICAgICB0b0lkeCA9IDA7XHJcbiAgICB9XHJcbiAgICBsZXQgZnJvbUlkeCA9IHZpc2l0ZWRSZWNvcmQubGFzdEluZGV4T2YoZm4oZm9ybSkpO1xyXG4gICAgaWYgKGZyb21JZHggPT09IC0xKSB7XHJcbiAgICAgIGZyb21JZHggPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvSWR4IC0gZnJvbUlkeDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFJlY29yZChjdXJyZW50OiBTLCBuZXdSZWNvcmQ6IFMsIGFjdGlvbjogQWN0aW9uKSB7XHJcbiAgICBjb25zdCBjdXJWYWwgPSBmbihjdXJyZW50KTtcclxuICAgIGNvbnN0IE5ld1ZhbCA9IGZuKG5ld1JlY29yZCk7XHJcbiAgICBpZiAoYWN0aW9uID09PSBBY3Rpb24ucHVzaCkge1xyXG4gICAgICBjb25zdCBwcmV2SWR4ID0gdmlzaXRlZFJlY29yZC5sYXN0SW5kZXhPZihjdXJWYWwpO1xyXG4gICAgICBjb25zdCBuZXdWaXNpdGVkUmVjb3JkID0gdmlzaXRlZFJlY29yZC5zbGljZSgwLCBwcmV2SWR4ICsgMSk7XHJcbiAgICAgIG5ld1Zpc2l0ZWRSZWNvcmQucHVzaChOZXdWYWwpO1xyXG4gICAgICB2aXNpdGVkUmVjb3JkID0gbmV3VmlzaXRlZFJlY29yZDtcclxuICAgIH1cclxuICAgIGlmIChhY3Rpb24gPT09IEFjdGlvbi5yZXBsYWNlKSB7XHJcbiAgICAgIGNvbnN0IHByZXZJZHggPSB2aXNpdGVkUmVjb3JkLmxhc3RJbmRleE9mKGN1clZhbCk7XHJcbiAgICAgIGlmIChwcmV2SWR4ICE9PSAtMSkge1xyXG4gICAgICAgIHZpc2l0ZWRSZWNvcmRbcHJldklkeF0gPSBOZXdWYWw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IGdldERlbHRhLCBhZGRSZWNvcmQgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2VuUmFuZG9tS2V5KGxlbmd0aDogbnVtYmVyKTogKCkgPT4gc3RyaW5nIHtcclxuICBjb25zdCBlbmQgPSBsZW5ndGggKyAyO1xyXG4gIHJldHVybiAoKSA9PiB7XHJcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygxOCkuc3Vic3RyaW5nKDIsIGVuZCk7XHJcbiAgfTtcclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICByZXR1cm4gX3R5cGVvZiA9IFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIFwic3ltYm9sXCIgPT0gdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA/IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgfSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICB9LCBfdHlwZW9mKG9iaik7XG59IiwiaW1wb3J0IF90eXBlb2YgZnJvbSBcIi4vdHlwZW9mLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfdG9QcmltaXRpdmUoaW5wdXQsIGhpbnQpIHtcbiAgaWYgKF90eXBlb2YoaW5wdXQpICE9PSBcIm9iamVjdFwiIHx8IGlucHV0ID09PSBudWxsKSByZXR1cm4gaW5wdXQ7XG4gIHZhciBwcmltID0gaW5wdXRbU3ltYm9sLnRvUHJpbWl0aXZlXTtcbiAgaWYgKHByaW0gIT09IHVuZGVmaW5lZCkge1xuICAgIHZhciByZXMgPSBwcmltLmNhbGwoaW5wdXQsIGhpbnQgfHwgXCJkZWZhdWx0XCIpO1xuICAgIGlmIChfdHlwZW9mKHJlcykgIT09IFwib2JqZWN0XCIpIHJldHVybiByZXM7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpO1xuICB9XG4gIHJldHVybiAoaGludCA9PT0gXCJzdHJpbmdcIiA/IFN0cmluZyA6IE51bWJlcikoaW5wdXQpO1xufSIsImltcG9ydCBfdHlwZW9mIGZyb20gXCIuL3R5cGVvZi5qc1wiO1xuaW1wb3J0IHRvUHJpbWl0aXZlIGZyb20gXCIuL3RvUHJpbWl0aXZlLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleShhcmcpIHtcbiAgdmFyIGtleSA9IHRvUHJpbWl0aXZlKGFyZywgXCJzdHJpbmdcIik7XG4gIHJldHVybiBfdHlwZW9mKGtleSkgPT09IFwic3ltYm9sXCIgPyBrZXkgOiBTdHJpbmcoa2V5KTtcbn0iLCJpbXBvcnQgdG9Qcm9wZXJ0eUtleSBmcm9tIFwiLi90b1Byb3BlcnR5S2V5LmpzXCI7XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCB0b1Byb3BlcnR5S2V5KGRlc2NyaXB0b3Iua2V5KSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbnN0cnVjdG9yLCBcInByb3RvdHlwZVwiLCB7XG4gICAgd3JpdGFibGU6IGZhbHNlXG4gIH0pO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59IiwiaW1wb3J0IHsgQWN0aW9uLCBDYWxsQmFja0Z1bmMsIENvbmZpcm1hdGlvbkZ1bmMsIExpc3RlbmVyLCBMb2NhdGlvbiwgTmF2aWdhdGlvbiwgUHJvbXB0LCBUTWFuYWdlciB9IGZyb20gJy4vdHlwZXMnO1xyXG5cclxuY2xhc3MgVHJhbnNpdGlvbk1hbmFnZXI8Uz4gaW1wbGVtZW50cyBUTWFuYWdlcjxTPiB7XHJcbiAgcHJpdmF0ZSBwcm9tcHQ6IFByb21wdDxTPjtcclxuICBwcml2YXRlIGxpc3RlbmVyczogTGlzdGVuZXI8Uz5bXTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnByb21wdCA9IG51bGw7XHJcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFByb21wdChwcm9tcHQ6IFByb21wdDxTPik6ICgpID0+IHZvaWQge1xyXG4gICAgdGhpcy5wcm9tcHQgPSBwcm9tcHQ7XHJcblxyXG4gICAgLy8g5riF6ZmkUHJvbXB0XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5wcm9tcHQgPT09IHByb21wdCkge1xyXG4gICAgICAgIHRoaXMucHJvbXB0ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIOS9v+eUqOWPkeW4g+iuoumYheaooeW8j+euoeeQhmhpc3RvcnnnmoTnm5HlkKzogIVcclxuICBwdWJsaWMgYWRkTGlzdGVuZXIoZnVuYzogTGlzdGVuZXI8Uz4pOiAoKSA9PiB2b2lkIHtcclxuICAgIGxldCBpc0FjdGl2ZSA9IHRydWU7XHJcbiAgICBjb25zdCBsaXN0ZW5lciA9IChhcmdzOiBOYXZpZ2F0aW9uPFM+KSA9PiB7XHJcbiAgICAgIGlmIChpc0FjdGl2ZSkge1xyXG4gICAgICAgIGZ1bmMoYXJncyk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGlzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgIC8vIOenu+mZpOWvueW6lOeahOebkeWQrOiAhVxyXG4gICAgICB0aGlzLmxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IGxpc3RlbmVyKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbm90aWZ5TGlzdGVuZXJzKGFyZ3M6IE5hdmlnYXRpb248Uz4pIHtcclxuICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgdGhpcy5saXN0ZW5lcnMpIHtcclxuICAgICAgbGlzdGVuZXIoYXJncyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY29uZmlybUp1bXBUbyhcclxuICAgIGxvY2F0aW9uOiBMb2NhdGlvbjxTPixcclxuICAgIGFjdGlvbjogQWN0aW9uLFxyXG4gICAgdXNlckNvbmZpcm1hdGlvbkZ1bmM6IENvbmZpcm1hdGlvbkZ1bmMsXHJcbiAgICBjYWxsQmFjazogQ2FsbEJhY2tGdW5jXHJcbiAgKSB7XHJcbiAgICBpZiAodGhpcy5wcm9tcHQgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gdHlwZW9mIHRoaXMucHJvbXB0ID09PSAnZnVuY3Rpb24nID8gdGhpcy5wcm9tcHQobG9jYXRpb24sIGFjdGlvbikgOiB0aGlzLnByb21wdDtcclxuICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgdHlwZW9mIHVzZXJDb25maXJtYXRpb25GdW5jID09PSAnZnVuY3Rpb24nID8gdXNlckNvbmZpcm1hdGlvbkZ1bmMocmVzdWx0LCBjYWxsQmFjaykgOiBjYWxsQmFjayh0cnVlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYWxsQmFjayhyZXN1bHQgIT09IGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2FsbEJhY2sodHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmFuc2l0aW9uTWFuYWdlcjtcclxuIiwiZnVuY3Rpb24gd2FybmluZyhjb25kaXRpb246IGFueSwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgaWYgKGNvbmRpdGlvbikge1xyXG4gICAgaWYgKGNvbnNvbGUgJiYgdHlwZW9mIGNvbnNvbGUud2FybiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB3YXJuaW5nOyIsImltcG9ydCB7IEhpc3RvcnlQcm9wcywgTGlzdGVuZXIsIE5hdmlnYXRpb24sIFByb21wdCB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgdHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi90cmFuc2l0aW9uTWFuYWdlcic7XHJcblxyXG4vLyDmir3lj5ZCcm93c2VySGlzdG9yeeWSjEhhc2hIaXN0b3J55Lit55u45ZCM55qE5pa55rOVXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlSGlzdG9yeTxTPihcclxuICB0cmFuc2l0aW9uTWFuYWdlcjogdHJhbnNpdGlvbk1hbmFnZXI8Uz4sXHJcbiAgc2V0TGlzdGVuZXI6IChkZWx0YTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gIGJyb3dzZXJIaXN0b3J5OiBIaXN0b3J5LFxyXG4pIHtcclxuICBmdW5jdGlvbiBnbyhzdGVwOiBudW1iZXIpIHtcclxuICAgIGJyb3dzZXJIaXN0b3J5LmdvKHN0ZXApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ29CYWNrKCkge1xyXG4gICAgYnJvd3Nlckhpc3RvcnkuZ28oLTEpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ29Gb3J3YXJkKCkge1xyXG4gICAgYnJvd3Nlckhpc3RvcnkuZ28oMSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsaXN0ZW4obGlzdGVuZXI6IExpc3RlbmVyPFM+KTogKCkgPT4gdm9pZCB7XHJcbiAgICBjb25zdCBjYW5jZWwgPSB0cmFuc2l0aW9uTWFuYWdlci5hZGRMaXN0ZW5lcihsaXN0ZW5lcik7XHJcbiAgICBzZXRMaXN0ZW5lcigxKTtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIHNldExpc3RlbmVyKC0xKTtcclxuICAgICAgY2FuY2VsKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgbGV0IGlzQmxvY2tlZCA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBibG9jayhwcm9tcHQ6IFByb21wdDxTPiA9IGZhbHNlKTogKCkgPT4gdm9pZCB7XHJcbiAgICBjb25zdCB1bmJsb2NrID0gdHJhbnNpdGlvbk1hbmFnZXIuc2V0UHJvbXB0KHByb21wdCk7XHJcbiAgICBpZiAoIWlzQmxvY2tlZCkge1xyXG4gICAgICBzZXRMaXN0ZW5lcigxKTtcclxuICAgICAgaXNCbG9ja2VkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGlmIChpc0Jsb2NrZWQpIHtcclxuICAgICAgICBpc0Jsb2NrZWQgPSBmYWxzZTtcclxuICAgICAgICBzZXRMaXN0ZW5lcigtMSk7XHJcbiAgICAgIH1cclxuICAgICAgdW5ibG9jaygpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFVwZGF0ZVN0YXRlRnVuYyhoaXN0b3J5UHJvcHM6IEhpc3RvcnlQcm9wczxTPikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0U3RhdGU6IE5hdmlnYXRpb248Uz4gfCB1bmRlZmluZWQpIHtcclxuICAgICAgaWYgKG5leHRTdGF0ZSkge1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24oaGlzdG9yeVByb3BzLCBuZXh0U3RhdGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGhpc3RvcnlQcm9wcy5sZW5ndGggPSBicm93c2VySGlzdG9yeS5sZW5ndGg7XHJcbiAgICAgIGNvbnN0IGFyZ3MgPSB7IGxvY2F0aW9uOiBoaXN0b3J5UHJvcHMubG9jYXRpb24sIGFjdGlvbjogaGlzdG9yeVByb3BzLmFjdGlvbiB9O1xyXG4gICAgICB0cmFuc2l0aW9uTWFuYWdlci5ub3RpZnlMaXN0ZW5lcnMoYXJncyk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgZ28sIGdvQmFjaywgZ29Gb3J3YXJkLCBsaXN0ZW4sIGJsb2NrLCBnZXRVcGRhdGVTdGF0ZUZ1bmMgfTtcclxufVxyXG4iLCJpbXBvcnQgeyBnZXREZWZhdWx0Q29uZmlybWF0aW9uLCBpc1N1cHBvcnRIaXN0b3J5LCBpc1N1cHBvcnRzUG9wU3RhdGUgfSBmcm9tICcuL2RvbSc7XHJcbmltcG9ydCB7IEFjdGlvbiwgQmFzZU9wdGlvbiwgRGVmYXVsdFN0YXRlVHlwZSwgRXZlbnRUeXBlLCBIaXN0b3J5LCBIaXN0b3J5U3RhdGUsIExvY2F0aW9uLCBQYXRoLCBUbyB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgeyBub3JtYWxpemVTbGFzaCwgY3JlYXRlTWVtb3J5UmVjb3JkLCBjcmVhdGVQYXRoLCBjcmVhdGVMb2NhdGlvbiwgc3RyaXBCYXNlbmFtZSB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgVHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi90cmFuc2l0aW9uTWFuYWdlcic7XHJcblxyXG5pbXBvcnQgd2FybmluZyBmcm9tICcuL3dhcmluZyc7XHJcbmltcG9ydCB7IGdldEJhc2VIaXN0b3J5IH0gZnJvbSAnLi9iYXNlSGlzdG9yeSc7XHJcblxyXG5leHBvcnQgdHlwZSBCcm93c2VySGlzdG9yeU9wdGlvbiA9IHtcclxuICAvKipcclxuICAgKiBmb3JjZVJlZnJlc2jkuLpUcnVl5pe26Lez6L2s5pe25Lya5by65Yi25Yi35paw6aG16Z2iXHJcbiAgICovXHJcbiAgZm9yY2VSZWZyZXNoPzogYm9vbGVhbjtcclxufSAmIEJhc2VPcHRpb247XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQnJvd3Nlckhpc3Rvcnk8UyA9IERlZmF1bHRTdGF0ZVR5cGU+KG9wdGlvbnM6IEJyb3dzZXJIaXN0b3J5T3B0aW9uID0ge30pOiBIaXN0b3J5PFM+IHtcclxuICBjb25zdCBzdXBwb3J0SGlzdG9yeSA9IGlzU3VwcG9ydEhpc3RvcnkoKTtcclxuICBjb25zdCBpc1N1cHBvcnRQb3BTdGF0ZSA9IGlzU3VwcG9ydHNQb3BTdGF0ZSgpO1xyXG4gIGNvbnN0IGJyb3dzZXJIaXN0b3J5ID0gd2luZG93Lmhpc3Rvcnk7XHJcbiAgY29uc3QgeyBmb3JjZVJlZnJlc2ggPSBmYWxzZSwgZ2V0VXNlckNvbmZpcm1hdGlvbiA9IGdldERlZmF1bHRDb25maXJtYXRpb24gfSA9IG9wdGlvbnM7XHJcblxyXG4gIGNvbnN0IGJhc2VuYW1lID0gb3B0aW9ucy5iYXNlbmFtZSA/IG5vcm1hbGl6ZVNsYXNoKG9wdGlvbnMuYmFzZW5hbWUpIDogJyc7XHJcblxyXG4gIGNvbnN0IGluaXRMb2NhdGlvbiA9IGdldExvY2F0aW9uKGdldEhpc3RvcnlTdGF0ZSgpKTtcclxuXHJcbiAgY29uc3QgcmVjb3JkT3BlcmF0b3IgPSBjcmVhdGVNZW1vcnlSZWNvcmQ8c3RyaW5nLCBMb2NhdGlvbjxTPj4oaW5pdExvY2F0aW9uLCBsID0+IGwua2V5KTtcclxuXHJcbiAgY29uc3QgdHJhbnNpdGlvbk1hbmFnZXIgPSBuZXcgVHJhbnNpdGlvbk1hbmFnZXI8Uz4oKTtcclxuXHJcbiAgY29uc3QgeyBnbywgZ29CYWNrLCBnb0ZvcndhcmQsIGxpc3RlbiwgYmxvY2ssIGdldFVwZGF0ZVN0YXRlRnVuYyB9ID0gZ2V0QmFzZUhpc3Rvcnk8Uz4oXHJcbiAgICB0cmFuc2l0aW9uTWFuYWdlcixcclxuICAgIHNldExpc3RlbmVyLFxyXG4gICAgYnJvd3Nlckhpc3RvcnksXHJcbiAgKTtcclxuXHJcbiAgY29uc3QgaGlzdG9yeTogSGlzdG9yeTxTPiA9IHtcclxuICAgIGFjdGlvbjogQWN0aW9uLnBvcCxcclxuICAgIGxlbmd0aDogYnJvd3Nlckhpc3RvcnkubGVuZ3RoLFxyXG4gICAgbG9jYXRpb246IGluaXRMb2NhdGlvbixcclxuICAgIGdvLFxyXG4gICAgZ29CYWNrLFxyXG4gICAgZ29Gb3J3YXJkLFxyXG4gICAgbGlzdGVuLFxyXG4gICAgYmxvY2ssXHJcbiAgICBwdXNoLFxyXG4gICAgcmVwbGFjZSxcclxuICAgIGNyZWF0ZUhyZWYsXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdXBkYXRlU3RhdGUgPSBnZXRVcGRhdGVTdGF0ZUZ1bmMoaGlzdG9yeSk7XHJcblxyXG4gIGZ1bmN0aW9uIGdldEhpc3RvcnlTdGF0ZSgpIHtcclxuICAgIHJldHVybiBzdXBwb3J0SGlzdG9yeSA/IHdpbmRvdy5oaXN0b3J5LnN0YXRlIDoge307XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRMb2NhdGlvbihoaXN0b3J5U3RhdGU6IFBhcnRpYWw8SGlzdG9yeVN0YXRlPFM+Pikge1xyXG4gICAgY29uc3QgeyBzZWFyY2gsIGhhc2ggfSA9IHdpbmRvdy5sb2NhdGlvbjtcclxuICAgIGNvbnN0IHsga2V5LCBzdGF0ZSB9ID0gaGlzdG9yeVN0YXRlIHx8IHt9O1xyXG4gICAgbGV0IHBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgcGF0aG5hbWUgPSBiYXNlbmFtZSA/IHN0cmlwQmFzZW5hbWUocGF0aG5hbWUsIGJhc2VuYW1lKSA6IHBhdGhuYW1lO1xyXG5cclxuICAgIHJldHVybiBjcmVhdGVMb2NhdGlvbjxTPignJywgeyBwYXRobmFtZSwgc2VhcmNoLCBoYXNoIH0sIHN0YXRlLCBrZXkpO1xyXG4gIH1cclxuXHJcbiAgLy8g5oum5oiq6aG16Z2iUE9Q5LqL5Lu25ZCO77yM6Ziy5q2i6L+U5Zue5Yiw55qE6aG16Z2i6KKr6YeN5aSN5oum5oiqXHJcbiAgbGV0IGZvcmNlSnVtcCA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVQb3BTdGF0ZShsb2NhdGlvbjogTG9jYXRpb248Uz4pIHtcclxuICAgIGlmIChmb3JjZUp1bXApIHtcclxuICAgICAgZm9yY2VKdW1wID0gZmFsc2U7XHJcbiAgICAgIHVwZGF0ZVN0YXRlKHVuZGVmaW5lZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBhY3Rpb24gPSBBY3Rpb24ucG9wO1xyXG5cclxuICAgICAgY29uc3QgY2FsbGJhY2sgPSAoaXNKdW1wOiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgaWYgKGlzSnVtcCkge1xyXG4gICAgICAgICAgLy8g5omn6KGM6Lez6L2s6KGM5Li6XHJcbiAgICAgICAgICB1cGRhdGVTdGF0ZSh7IGFjdGlvbjogYWN0aW9uLCBsb2NhdGlvbjogbG9jYXRpb24gfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldmVydFBvcFN0YXRlKGxvY2F0aW9uLCBoaXN0b3J5LmxvY2F0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0cmFuc2l0aW9uTWFuYWdlci5jb25maXJtSnVtcFRvKGxvY2F0aW9uLCBhY3Rpb24sIGdldFVzZXJDb25maXJtYXRpb24sIGNhbGxiYWNrKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBvcFN0YXRlTGlzdGVuZXIoZXZlbnQ6IFBvcFN0YXRlRXZlbnQpIHtcclxuICAgIGhhbmRsZVBvcFN0YXRlKGdldExvY2F0aW9uKGV2ZW50LnN0YXRlKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYXNoQ2hhbmdlTGlzdGVuZXIoKSB7XHJcbiAgICBjb25zdCBsb2NhdGlvbiA9IGdldExvY2F0aW9uKGdldEhpc3RvcnlTdGF0ZSgpKTtcclxuICAgIGhhbmRsZVBvcFN0YXRlKGxvY2F0aW9uKTtcclxuICB9XHJcblxyXG4gIGxldCBsaXN0ZW5lckNvdW50ID0gMDtcclxuXHJcbiAgZnVuY3Rpb24gc2V0TGlzdGVuZXIoY291bnQ6IG51bWJlcikge1xyXG4gICAgbGlzdGVuZXJDb3VudCArPSBjb3VudDtcclxuICAgIGlmIChsaXN0ZW5lckNvdW50ID09PSAxICYmIGNvdW50ID09PSAxKSB7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKEV2ZW50VHlwZS5Qb3BTdGF0ZSwgcG9wU3RhdGVMaXN0ZW5lcik7XHJcbiAgICAgIGlmICghaXNTdXBwb3J0UG9wU3RhdGUpIHtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihFdmVudFR5cGUuSGFzaENoYW5nZSwgaGFzaENoYW5nZUxpc3RlbmVyKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChsaXN0ZW5lckNvdW50ID09PSAwKSB7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50VHlwZS5Qb3BTdGF0ZSwgcG9wU3RhdGVMaXN0ZW5lcik7XHJcbiAgICAgIGlmICghaXNTdXBwb3J0UG9wU3RhdGUpIHtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudFR5cGUuSGFzaENoYW5nZSwgaGFzaENoYW5nZUxpc3RlbmVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5Y+W5raI6aG16Z2i6Lez6L2s5bm25oGi5aSN5Yiw6Lez6L2s5YmN55qE6aG16Z2iXHJcbiAgZnVuY3Rpb24gcmV2ZXJ0UG9wU3RhdGUoZm9ybTogTG9jYXRpb248Uz4sIHRvOiBMb2NhdGlvbjxTPikge1xyXG4gICAgY29uc3QgZGVsdGEgPSByZWNvcmRPcGVyYXRvci5nZXREZWx0YSh0bywgZm9ybSk7XHJcbiAgICBpZiAoZGVsdGEgIT09IDApIHtcclxuICAgICAgZ28oZGVsdGEpO1xyXG4gICAgICBmb3JjZUp1bXAgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlSHJlZihwYXRoOiBQYXJ0aWFsPFBhdGg+KSB7XHJcbiAgICByZXR1cm4gYmFzZW5hbWUgKyBjcmVhdGVQYXRoKHBhdGgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcHVzaCh0bzogVG8sIHN0YXRlPzogUykge1xyXG4gICAgY29uc3QgYWN0aW9uID0gQWN0aW9uLnB1c2g7XHJcbiAgICBjb25zdCBsb2NhdGlvbiA9IGNyZWF0ZUxvY2F0aW9uPFM+KGhpc3RvcnkubG9jYXRpb24sIHRvLCBzdGF0ZSwgdW5kZWZpbmVkKTtcclxuXHJcbiAgICB0cmFuc2l0aW9uTWFuYWdlci5jb25maXJtSnVtcFRvKGxvY2F0aW9uLCBhY3Rpb24sIGdldFVzZXJDb25maXJtYXRpb24sIGlzSnVtcCA9PiB7XHJcbiAgICAgIGlmICghaXNKdW1wKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGhyZWYgPSBjcmVhdGVIcmVmKGxvY2F0aW9uKTtcclxuICAgICAgY29uc3QgeyBrZXksIHN0YXRlIH0gPSBsb2NhdGlvbjtcclxuXHJcbiAgICAgIGlmIChzdXBwb3J0SGlzdG9yeSkge1xyXG4gICAgICAgIGlmIChmb3JjZVJlZnJlc2gpIHtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gaHJlZjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYnJvd3Nlckhpc3RvcnkucHVzaFN0YXRlKHsga2V5OiBrZXksIHN0YXRlOiBzdGF0ZSB9LCAnJywgaHJlZik7XHJcbiAgICAgICAgICByZWNvcmRPcGVyYXRvci5hZGRSZWNvcmQoaGlzdG9yeS5sb2NhdGlvbiwgbG9jYXRpb24sIGFjdGlvbik7XHJcbiAgICAgICAgICB1cGRhdGVTdGF0ZSh7IGFjdGlvbiwgbG9jYXRpb24gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHdhcm5pbmcoc3RhdGUgIT09IHVuZGVmaW5lZCwgJ0Jyb3dzZXIgaGlzdG9yeSBjYW5ub3QgcHVzaCBzdGF0ZSBpbiBicm93c2VycyB0aGF0IGRvIG5vdCBzdXBwb3J0IEhUTUw1IGhpc3RvcnknKTtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGhyZWY7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVwbGFjZSh0bzogVG8sIHN0YXRlPzogUykge1xyXG4gICAgY29uc3QgYWN0aW9uID0gQWN0aW9uLnJlcGxhY2U7XHJcbiAgICBjb25zdCBsb2NhdGlvbiA9IGNyZWF0ZUxvY2F0aW9uPFM+KGhpc3RvcnkubG9jYXRpb24sIHRvLCBzdGF0ZSwgdW5kZWZpbmVkKTtcclxuXHJcbiAgICB0cmFuc2l0aW9uTWFuYWdlci5jb25maXJtSnVtcFRvKGxvY2F0aW9uLCBhY3Rpb24sIGdldFVzZXJDb25maXJtYXRpb24sIGlzSnVtcCA9PiB7XHJcbiAgICAgIGlmICghaXNKdW1wKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGhyZWYgPSBjcmVhdGVIcmVmKGxvY2F0aW9uKTtcclxuICAgICAgY29uc3QgeyBrZXksIHN0YXRlIH0gPSBsb2NhdGlvbjtcclxuICAgICAgaWYgKHN1cHBvcnRIaXN0b3J5KSB7XHJcbiAgICAgICAgaWYgKGZvcmNlUmVmcmVzaCkge1xyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoaHJlZik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJyb3dzZXJIaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IGtleToga2V5LCBzdGF0ZTogc3RhdGUgfSwgJycsIGhyZWYpO1xyXG4gICAgICAgICAgcmVjb3JkT3BlcmF0b3IuYWRkUmVjb3JkKGhpc3RvcnkubG9jYXRpb24sIGxvY2F0aW9uLCBhY3Rpb24pO1xyXG4gICAgICAgICAgdXBkYXRlU3RhdGUoeyBhY3Rpb24sIGxvY2F0aW9uIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB3YXJuaW5nKHN0YXRlICE9PSB1bmRlZmluZWQsICdCcm93c2VyIGhpc3RvcnkgY2Fubm90IHB1c2ggc3RhdGUgaW4gYnJvd3NlcnMgdGhhdCBkbyBub3Qgc3VwcG9ydCBIVE1MNSBoaXN0b3J5Jyk7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoaHJlZik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3Rvcnk7XHJcbn1cclxuIiwiaW1wb3J0IHsgQWN0aW9uLCBCYXNlT3B0aW9uLCBEZWZhdWx0U3RhdGVUeXBlLCBFdmVudFR5cGUsIEhpc3RvcnksIExvY2F0aW9uLCBUbyB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQge1xyXG4gIGFkZEhlYWRTbGFzaCxcclxuICBub3JtYWxpemVTbGFzaCxcclxuICBjcmVhdGVNZW1vcnlSZWNvcmQsXHJcbiAgY3JlYXRlUGF0aCxcclxuICBjcmVhdGVMb2NhdGlvbixcclxuICBpc0xvY2F0aW9uRXF1YWwsXHJcbiAgc3RyaXBCYXNlbmFtZSxcclxuICBzdHJpcEhlYWRTbGFzaCxcclxufSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgZ2V0RGVmYXVsdENvbmZpcm1hdGlvbiB9IGZyb20gJy4vZG9tJztcclxuaW1wb3J0IFRyYW5zaXRpb25NYW5hZ2VyIGZyb20gJy4vdHJhbnNpdGlvbk1hbmFnZXInO1xyXG5cclxuaW1wb3J0IHdhcm5pbmcgZnJvbSAnLi93YXJpbmcnO1xyXG5pbXBvcnQgeyBnZXRCYXNlSGlzdG9yeSB9IGZyb20gJy4vYmFzZUhpc3RvcnknO1xyXG5cclxuZXhwb3J0IHR5cGUgdXJsSGFzaFR5cGUgPSAnc2xhc2gnIHwgJ25vc2xhc2gnO1xyXG5cclxudHlwZSBIYXNoSGlzdG9yeU9wdGlvbiA9IHtcclxuICBoYXNoVHlwZT86IHVybEhhc2hUeXBlO1xyXG59ICYgQmFzZU9wdGlvbjtcclxuXHJcbi8vIOiOt+WPliPliY3nmoTlhoXlrrlcclxuZnVuY3Rpb24gc3RyaXBIYXNoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgaWR4ID0gcGF0aC5pbmRleE9mKCcjJyk7XHJcbiAgcmV0dXJuIGlkeCA9PT0gLTEgPyBwYXRoIDogcGF0aC5zdWJzdHJpbmcoMCwgaWR4KTtcclxufVxyXG5cclxuLy8g6I635Y+WI+WQjueahOWGheWuuVxyXG5mdW5jdGlvbiBnZXRIYXNoQ29udGVudChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IGlkeCA9IHBhdGguaW5kZXhPZignIycpO1xyXG4gIHJldHVybiBpZHggPT09IC0xID8gJycgOiBwYXRoLnN1YnN0cmluZyhpZHggKyAxKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhhc2hIaXN0b3J5PFMgPSBEZWZhdWx0U3RhdGVUeXBlPihvcHRpb246IEhhc2hIaXN0b3J5T3B0aW9uID0ge30pOiBIaXN0b3J5PFM+IHtcclxuICBjb25zdCBicm93c2VySGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5O1xyXG4gIGNvbnN0IHsgaGFzaFR5cGUgPSAnc2xhc2gnLCBnZXRVc2VyQ29uZmlybWF0aW9uID0gZ2V0RGVmYXVsdENvbmZpcm1hdGlvbiB9ID0gb3B0aW9uO1xyXG5cclxuICBjb25zdCBiYXNlbmFtZSA9IG9wdGlvbi5iYXNlbmFtZSA/IG5vcm1hbGl6ZVNsYXNoKG9wdGlvbi5iYXNlbmFtZSkgOiAnJztcclxuXHJcbiAgY29uc3QgcGF0aERlY29kZXIgPSBhZGRIZWFkU2xhc2g7XHJcbiAgY29uc3QgcGF0aEVuY29kZXIgPSBoYXNoVHlwZSA9PT0gJ3NsYXNoJyA/IGFkZEhlYWRTbGFzaCA6IHN0cmlwSGVhZFNsYXNoO1xyXG5cclxuICBmdW5jdGlvbiBnZXRMb2NhdGlvbigpIHtcclxuICAgIGxldCBoYXNoUGF0aCA9IHBhdGhEZWNvZGVyKGdldEhhc2hDb250ZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoKSk7XHJcbiAgICBpZiAoYmFzZW5hbWUpIHtcclxuICAgICAgaGFzaFBhdGggPSBzdHJpcEJhc2VuYW1lKGhhc2hQYXRoLCBiYXNlbmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNyZWF0ZUxvY2F0aW9uPFM+KCcnLCBoYXNoUGF0aCwgdW5kZWZpbmVkLCAnZGVmYXVsdCcpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgaW5pdExvY2F0aW9uID0gZ2V0TG9jYXRpb24oKTtcclxuXHJcbiAgY29uc3QgbWVtUmVjb3JkcyA9IGNyZWF0ZU1lbW9yeVJlY29yZDxzdHJpbmcsIExvY2F0aW9uPFM+Pihpbml0TG9jYXRpb24sIGNyZWF0ZVBhdGgpO1xyXG5cclxuICBjb25zdCB0cmFuc2l0aW9uTWFuYWdlciA9IG5ldyBUcmFuc2l0aW9uTWFuYWdlcjxTPigpO1xyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVIcmVmKGxvY2F0aW9uOiBMb2NhdGlvbjxTPikge1xyXG4gICAgY29uc3QgdGFnID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYmFzZScpO1xyXG4gICAgY29uc3QgYmFzZSA9IHRhZyAmJiB0YWcuZ2V0QXR0cmlidXRlKCdocmVmJykgPyBzdHJpcEhhc2god2luZG93LmxvY2F0aW9uLmhyZWYpIDogJyc7XHJcbiAgICByZXR1cm4gYmFzZSArICcjJyArIHBhdGhFbmNvZGVyKGJhc2VuYW1lICsgY3JlYXRlUGF0aChsb2NhdGlvbikpO1xyXG4gIH1cclxuXHJcbiAgbGV0IGZvcmNlTmV4dFBvcCA9IGZhbHNlO1xyXG4gIGxldCBpZ25vcmVQYXRoOiBudWxsIHwgc3RyaW5nID0gbnVsbDtcclxuXHJcbiAgY29uc3QgeyBnbywgZ29CYWNrLCBnb0ZvcndhcmQsIGxpc3RlbiwgYmxvY2ssIGdldFVwZGF0ZVN0YXRlRnVuYyB9ID0gZ2V0QmFzZUhpc3RvcnkoXHJcbiAgICB0cmFuc2l0aW9uTWFuYWdlcixcclxuICAgIHNldExpc3RlbmVyLFxyXG4gICAgYnJvd3Nlckhpc3RvcnksXHJcbiAgKTtcclxuXHJcbiAgY29uc3QgaGlzdG9yeTogSGlzdG9yeTxTPiA9IHtcclxuICAgIGFjdGlvbjogQWN0aW9uLnBvcCxcclxuICAgIGxlbmd0aDogYnJvd3Nlckhpc3RvcnkubGVuZ3RoLFxyXG4gICAgbG9jYXRpb246IGluaXRMb2NhdGlvbixcclxuICAgIGdvLFxyXG4gICAgZ29CYWNrLFxyXG4gICAgZ29Gb3J3YXJkLFxyXG4gICAgcHVzaCxcclxuICAgIHJlcGxhY2UsXHJcbiAgICBsaXN0ZW4sXHJcbiAgICBibG9jayxcclxuICAgIGNyZWF0ZUhyZWYsXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdXBkYXRlU3RhdGUgPSBnZXRVcGRhdGVTdGF0ZUZ1bmMoaGlzdG9yeSk7XHJcblxyXG4gIGZ1bmN0aW9uIHB1c2godG86IFRvLCBzdGF0ZT86IFMpIHtcclxuICAgIHdhcm5pbmcoc3RhdGUgIT09IHVuZGVmaW5lZCwgJ0hhc2ggaGlzdG9yeSBkb2VzIG5vdCBzdXBwb3J0IHN0YXRlLCBpdCB3aWxsIGJlIGlnbm9yZWQnKTtcclxuXHJcbiAgICBjb25zdCBhY3Rpb24gPSBBY3Rpb24ucHVzaDtcclxuICAgIGNvbnN0IGxvY2F0aW9uID0gY3JlYXRlTG9jYXRpb248Uz4oaGlzdG9yeS5sb2NhdGlvbiwgdG8sIHVuZGVmaW5lZCwgJycpO1xyXG5cclxuICAgIHRyYW5zaXRpb25NYW5hZ2VyLmNvbmZpcm1KdW1wVG8obG9jYXRpb24sIGFjdGlvbiwgZ2V0VXNlckNvbmZpcm1hdGlvbiwgaXNKdW1wID0+IHtcclxuICAgICAgaWYgKCFpc0p1bXApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgcGF0aCA9IGNyZWF0ZVBhdGgobG9jYXRpb24pO1xyXG4gICAgICBjb25zdCBlbmNvZGVkUGF0aCA9IHBhdGhFbmNvZGVyKGJhc2VuYW1lICsgcGF0aCk7XHJcbiAgICAgIC8vIOWJjeWQjmhhc2jkuI3kuIDmoLfmiY3ov5vooYzot7PovaxcclxuICAgICAgaWYgKGdldEhhc2hDb250ZW50KHdpbmRvdy5sb2NhdGlvbi5ocmVmKSAhPT0gZW5jb2RlZFBhdGgpIHtcclxuICAgICAgICBpZ25vcmVQYXRoID0gZW5jb2RlZFBhdGg7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbmNvZGVkUGF0aDtcclxuXHJcbiAgICAgICAgbWVtUmVjb3Jkcy5hZGRSZWNvcmQoaGlzdG9yeS5sb2NhdGlvbiwgbG9jYXRpb24sIGFjdGlvbik7XHJcblxyXG4gICAgICAgIHVwZGF0ZVN0YXRlKHsgYWN0aW9uLCBsb2NhdGlvbiB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB1cGRhdGVTdGF0ZSh1bmRlZmluZWQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlcGxhY2UodG86IFRvLCBzdGF0ZT86IFMpIHtcclxuICAgIHdhcm5pbmcoc3RhdGUgIT09IHVuZGVmaW5lZCwgJ0hhc2ggaGlzdG9yeSBkb2VzIG5vdCBzdXBwb3J0IHN0YXRlLCBpdCB3aWxsIGJlIGlnbm9yZWQnKTtcclxuICAgIGNvbnN0IGFjdGlvbiA9IEFjdGlvbi5yZXBsYWNlO1xyXG4gICAgY29uc3QgbG9jYXRpb24gPSBjcmVhdGVMb2NhdGlvbjxTPihoaXN0b3J5LmxvY2F0aW9uLCB0bywgdW5kZWZpbmVkLCAnJyk7XHJcblxyXG4gICAgdHJhbnNpdGlvbk1hbmFnZXIuY29uZmlybUp1bXBUbyhsb2NhdGlvbiwgYWN0aW9uLCBnZXRVc2VyQ29uZmlybWF0aW9uLCBpc0p1bXAgPT4ge1xyXG4gICAgICBpZiAoIWlzSnVtcCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBwYXRoID0gY3JlYXRlUGF0aChsb2NhdGlvbik7XHJcbiAgICAgIGNvbnN0IGVuY29kZWRQYXRoID0gcGF0aEVuY29kZXIoYmFzZW5hbWUgKyBwYXRoKTtcclxuICAgICAgaWYgKGdldEhhc2hDb250ZW50KHdpbmRvdy5sb2NhdGlvbi5ocmVmKSAhPT0gZW5jb2RlZFBhdGgpIHtcclxuICAgICAgICBpZ25vcmVQYXRoID0gcGF0aDtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShzdHJpcEhhc2god2luZG93LmxvY2F0aW9uLmhyZWYpICsgJyMnICsgZW5jb2RlZFBhdGgpO1xyXG4gICAgICB9XHJcbiAgICAgIG1lbVJlY29yZHMuYWRkUmVjb3JkKGhpc3RvcnkubG9jYXRpb24sIGxvY2F0aW9uLCBhY3Rpb24pO1xyXG4gICAgICB1cGRhdGVTdGF0ZSh7IGFjdGlvbiwgbG9jYXRpb24gfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZUhhc2hDaGFuZ2UoKSB7XHJcbiAgICBjb25zdCBoYXNoUGF0aCA9IGdldEhhc2hDb250ZW50KHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcclxuICAgIGNvbnN0IGVuY29kZWRQYXRoID0gcGF0aEVuY29kZXIoaGFzaFBhdGgpO1xyXG4gICAgaWYgKGhhc2hQYXRoICE9PSBlbmNvZGVkUGF0aCkge1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShzdHJpcEhhc2god2luZG93LmxvY2F0aW9uLmhyZWYpICsgJyMnICsgZW5jb2RlZFBhdGgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgbG9jYXRpb24gPSBnZXRMb2NhdGlvbigpO1xyXG4gICAgICBjb25zdCBwcmV2TG9jYXRpb24gPSBoaXN0b3J5LmxvY2F0aW9uO1xyXG4gICAgICBpZiAoIWZvcmNlTmV4dFBvcCAmJiBpc0xvY2F0aW9uRXF1YWwobG9jYXRpb24sIHByZXZMb2NhdGlvbikpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlnbm9yZVBhdGggPT09IGNyZWF0ZVBhdGgobG9jYXRpb24pKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlnbm9yZVBhdGggPSBudWxsO1xyXG4gICAgICBoYW5kbGVQb3BTdGF0ZShsb2NhdGlvbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVQb3BTdGF0ZShsb2NhdGlvbjogTG9jYXRpb248Uz4pIHtcclxuICAgIGlmIChmb3JjZU5leHRQb3ApIHtcclxuICAgICAgZm9yY2VOZXh0UG9wID0gZmFsc2U7XHJcbiAgICAgIHVwZGF0ZVN0YXRlKHVuZGVmaW5lZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBhY3Rpb24gPSBBY3Rpb24ucG9wO1xyXG5cclxuICAgICAgY29uc3QgY2FsbGJhY2sgPSAoaXNKdW1wOiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgaWYgKGlzSnVtcCkge1xyXG4gICAgICAgICAgdXBkYXRlU3RhdGUoeyBhY3Rpb246IGFjdGlvbiwgbG9jYXRpb246IGxvY2F0aW9uIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXZlcnRQb3BTdGF0ZShsb2NhdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdHJhbnNpdGlvbk1hbmFnZXIuY29uZmlybUp1bXBUbyhsb2NhdGlvbiwgYWN0aW9uLCBnZXRVc2VyQ29uZmlybWF0aW9uLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDlnKjot7PovazooYzkuLrooqtCbG9ja+WQju+8jOeUqEhpc3RvcnkuZ28oKei3s+i9rOWbnuS5i+WJjeeahOmhtemdolxyXG4gIGZ1bmN0aW9uIHJldmVydFBvcFN0YXRlKGZvcm06IExvY2F0aW9uPFM+KSB7XHJcbiAgICBjb25zdCB0byA9IGhpc3RvcnkubG9jYXRpb247XHJcbiAgICBjb25zdCBkZWx0YSA9IG1lbVJlY29yZHMuZ2V0RGVsdGEodG8sIGZvcm0pO1xyXG4gICAgaWYgKGRlbHRhICE9PSAwKSB7XHJcbiAgICAgIGdvKGRlbHRhKTtcclxuICAgICAgZm9yY2VOZXh0UG9wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxldCBsaXN0ZW5lckNvdW50ID0gMDtcclxuXHJcbiAgZnVuY3Rpb24gc2V0TGlzdGVuZXIoZGVsdGE6IG51bWJlcikge1xyXG4gICAgbGlzdGVuZXJDb3VudCArPSBkZWx0YTtcclxuICAgIGlmIChsaXN0ZW5lckNvdW50ID09PSAxICYmIGRlbHRhID09PSAxKSB7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKEV2ZW50VHlwZS5IYXNoQ2hhbmdlLCBoYW5kbGVIYXNoQ2hhbmdlKTtcclxuICAgIH0gZWxzZSBpZiAobGlzdGVuZXJDb3VudCA9PT0gMCkge1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudFR5cGUuSGFzaENoYW5nZSwgaGFuZGxlSGFzaENoYW5nZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gaGlzdG9yeTtcclxufVxyXG4iLCJpbXBvcnQgeyBjcmVhdGVDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBIaXN0b3J5LCBMb2NhdGlvbiB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyBNYXRjaGVkIH0gZnJvbSAnLi9tYXRjaGVyL3BhcnNlcic7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVOYW1lZENvbnRleHQ8VD4obmFtZTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IFQpIHtcclxuICBjb25zdCBjb250ZXh0ID0gY3JlYXRlQ29udGV4dDxUPihkZWZhdWx0VmFsdWUpO1xyXG4gIGNvbnRleHQuZGlzcGxheU5hbWUgPSBuYW1lO1xyXG4gIHJldHVybiBjb250ZXh0O1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBSb3V0ZXJDb250ZXh0VmFsdWUgPSB7XHJcbiAgaGlzdG9yeTogSGlzdG9yeTtcclxuICBsb2NhdGlvbjogTG9jYXRpb247XHJcbiAgbWF0Y2g6IE1hdGNoZWQgfCBudWxsO1xyXG59O1xyXG5cclxuY29uc3QgUm91dGVyQ29udGV4dCA9IGNyZWF0ZU5hbWVkQ29udGV4dDxSb3V0ZXJDb250ZXh0VmFsdWU+KCdSb3V0ZXInLCB7fSBhcyBhbnkpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm91dGVyQ29udGV4dDsiLCJpbXBvcnQgeyBNYXRjaGVkLCBQYXJhbXMgfSBmcm9tICcuL3BhcnNlcic7XHJcblxyXG5leHBvcnQgdHlwZSBUb2tlbiA9IHtcclxuICB0eXBlOiBUb2tlblR5cGU7XHJcbiAgdmFsdWU6IHN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydCBlbnVtIFRva2VuVHlwZSB7XHJcbiAgRGVsaW1pdGVyID0gJ2RlbGltaXRlcicsXHJcbiAgU3RhdGljID0gJ3N0YXRpYycsXHJcbiAgUGFyYW0gPSAncGFyYW0nLFxyXG4gIFdpbGRDYXJkID0gJ3dpbGRjYXJkJyxcclxuICBMQnJhY2tldCA9ICcoJyxcclxuICBSQnJhY2tldCA9ICcpJyxcclxuICBQYXR0ZXJuID0gJ3BhdHRlcm4nLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlcjxQPiB7XHJcbiAgcmVnZXhwOiBSZWdFeHA7XHJcblxyXG4gIGtleXM6IHN0cmluZ1tdO1xyXG5cclxuICBwYXJzZSh1cmw6IHN0cmluZyk6IE1hdGNoZWQ8UD4gfCBudWxsO1xyXG5cclxuICBjb21waWxlKHBhcmFtczogUGFyYW1zPFA+KTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBQYXJzZXJPcHRpb24gPSB7XHJcbiAgLy8g5piv5ZCm5aSn5bCP5YaZ5pWP5oSfXHJcbiAgY2FzZVNlbnNpdGl2ZT86IGJvb2xlYW47XHJcbiAgLy8g5piv5ZCm5ZCv55So5Lil5qC85qih5byPXHJcbiAgc3RyaWN0TW9kZT86IGJvb2xlYW47XHJcbiAgLy8g57K+5YeG5Yy56YWNIOWFvOWuuSBSZWFjdC1Sb3V0ZXJWNVxyXG4gIGV4YWN0PzogYm9vbGVhbjtcclxufTtcclxuXHJcbnR5cGUgQ2xlYXJMZWFkaW5nPFUgZXh0ZW5kcyBzdHJpbmc+ID0gVSBleHRlbmRzIGAvJHtpbmZlciBSfWAgPyBDbGVhckxlYWRpbmc8Uj4gOiBVO1xyXG50eXBlIENsZWFyVGFpbGluZzxVIGV4dGVuZHMgc3RyaW5nPiA9IFUgZXh0ZW5kcyBgJHtpbmZlciBMfS9gID8gQ2xlYXJUYWlsaW5nPEw+IDogVTtcclxuXHJcbnR5cGUgUGFyc2VQYXJhbTxQYXJhbSBleHRlbmRzIHN0cmluZz4gPSBQYXJhbSBleHRlbmRzIGA6JHtpbmZlciBSfWBcclxuICA/IHtcclxuICAgIFtLIGluIFJdOiBzdHJpbmc7XHJcbiAgfVxyXG4gIDoge307XHJcblxyXG50eXBlIE1lcmdlUGFyYW1zPE9uZVBhcmFtIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiwgT3RoZXJQYXJhbSBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4+ID0ge1xyXG4gIHJlYWRvbmx5IFtLZXkgaW4ga2V5b2YgT25lUGFyYW0gfCBrZXlvZiBPdGhlclBhcmFtXT86IHN0cmluZztcclxufTtcclxuXHJcbnR5cGUgUGFyc2VVUkxTdHJpbmc8U3RyIGV4dGVuZHMgc3RyaW5nPiA9IFN0ciBleHRlbmRzIGAke2luZmVyIFBhcmFtfS8ke2luZmVyIFJlc3R9YFxyXG4gID8gTWVyZ2VQYXJhbXM8UGFyc2VQYXJhbTxQYXJhbT4sIFBhcnNlVVJMU3RyaW5nPENsZWFyTGVhZGluZzxSZXN0Pj4+XHJcbiAgOiBQYXJzZVBhcmFtPFN0cj47XHJcblxyXG4vLyDop6PmnpBVUkzkuK3nmoTliqjmgIHlj4LmlbDvvIzku6Xlrp7njrBUeXBlU2NyaXB05o+Q56S65Yqf6IO9XHJcbmV4cG9ydCB0eXBlIEdldFVSTFBhcmFtczxVIGV4dGVuZHMgc3RyaW5nPiA9IFBhcnNlVVJMU3RyaW5nPENsZWFyTGVhZGluZzxDbGVhclRhaWxpbmc8VT4+PjtcclxuIiwiLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiDlsIZ1cmzkuK3nmoQvL+i9rOaNouS4ui9cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGVhblBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXC8rL2csICcvJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzY29yZUNvbXBhcmUoc2NvcmUxOiBudW1iZXJbXSwgc2NvcmUyOiBudW1iZXJbXSk6IG51bWJlciB7XHJcbiAgY29uc3Qgc2NvcmUxTGVuZ3RoID0gc2NvcmUxLmxlbmd0aDtcclxuICBjb25zdCBzY29yZTJMZW5ndGggPSBzY29yZTIubGVuZ3RoO1xyXG4gIGNvbnN0IGVuZCA9IE1hdGgubWluKHNjb3JlMUxlbmd0aCwgc2NvcmUyTGVuZ3RoKTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGVuZDsgaSsrKSB7XHJcbiAgICBjb25zdCBkZWx0YSA9IHNjb3JlMltpXSAtIHNjb3JlMVtpXTtcclxuICAgIGlmIChkZWx0YSAhPT0gMCkge1xyXG4gICAgICByZXR1cm4gZGVsdGE7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChzY29yZTFMZW5ndGggPT09IHNjb3JlMkxlbmd0aCkge1xyXG4gICAgcmV0dXJuIDA7XHJcbiAgfVxyXG4gIHJldHVybiBzY29yZTFMZW5ndGggPiBzY29yZTJMZW5ndGggPyAtMSA6IDE7XHJcbn1cclxuXHJcbi8vIOaKiuato+WImeihqOi+vuW8j+eahOeJueauiuespuWPt+WKoOS4pOS4quWPjeaWnOadoOi/m+ihjOi9rOS5iVxyXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlU3RyKHN0cjogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oWy4rKj89XiE6JHt9KClbXFxdfC9cXFxcXSkvZywgJ1xcXFwkMScpO1xyXG59XHJcbiIsImltcG9ydCB7IFRva2VuLCBUb2tlblR5cGUgfSBmcm9tICcuL3R5cGVzJztcclxuaW1wb3J0IHsgY2xlYW5QYXRoIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5jb25zdCB2YWxpZENoYXIgPSAvW14vOiooKV0vO1xyXG5cclxuLy8g5a+5VXJs5qih5p2/6L+b6KGM6K+N5rOV6Kej5p6Q77yM6Kej5p6Q57uT5p6c5Li6VG9rZW5zXHJcbmV4cG9ydCBmdW5jdGlvbiBsZXhlcihwYXRoOiBzdHJpbmcpOiBUb2tlbltdIHtcclxuICBjb25zdCB0b2tlbnM6IFRva2VuW10gPSBbXTtcclxuXHJcbiAgaWYgKCFwYXRoKSB7XHJcbiAgICByZXR1cm4gdG9rZW5zO1xyXG4gIH1cclxuXHJcbiAgbGV0IHVybFBhdGggPSBjbGVhblBhdGgocGF0aCk7XHJcbiAgaWYgKHVybFBhdGggIT09ICcqJyAmJiAhdXJsUGF0aC5zdGFydHNXaXRoKCcvJykpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgVXJsIG11c3Qgc3RhcnQgd2l0aCBcIi9cIi5gKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGdldExpdGVyYWwgPSAoKSA9PiB7XHJcbiAgICBsZXQgbmFtZSA9ICcnO1xyXG4gICAgd2hpbGUgKGkgPCB1cmxQYXRoLmxlbmd0aCAmJiB2YWxpZENoYXIudGVzdCh1cmxQYXRoW2ldKSkge1xyXG4gICAgICBuYW1lICs9IHVybFBhdGhbaV07XHJcbiAgICAgIHNraXBDaGFyKDEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5hbWU7XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc2tpcENoYXIgPSAoc3RlcDogbnVtYmVyKSA9PiB7XHJcbiAgICBpICs9IHN0ZXA7XHJcbiAgfTtcclxuXHJcbiAgbGV0IGkgPSAwO1xyXG4gIHdoaWxlIChpIDwgdXJsUGF0aC5sZW5ndGgpIHtcclxuICAgIGNvbnN0IGN1ckNoYXIgPSB1cmxQYXRoW2ldO1xyXG4gICAgY29uc3QgcHJldkNoYXIgPSB1cmxQYXRoW2kgLSAxXTtcclxuXHJcbiAgICBpZiAoY3VyQ2hhciA9PT0gJy8nKSB7XHJcbiAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogVG9rZW5UeXBlLkRlbGltaXRlciwgdmFsdWU6IHVybFBhdGhbaV0gfSk7XHJcbiAgICAgIHNraXBDaGFyKDEpO1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIC8vIGR5bmFtaWMgcGFyYW1zICgvOmEpXHJcbiAgICBpZiAocHJldkNoYXIgPT09ICcvJyAmJiBjdXJDaGFyID09PSAnOicpIHtcclxuICAgICAgc2tpcENoYXIoMSk7XHJcbiAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogVG9rZW5UeXBlLlBhcmFtLCB2YWx1ZTogZ2V0TGl0ZXJhbCgpIH0pO1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIC8vIHdpbGRDYXJkIHBhcmFtcyAoLzoqKVxyXG4gICAgaWYgKChwcmV2Q2hhciA9PT0gJy8nIHx8IHByZXZDaGFyID09PSB1bmRlZmluZWQpICYmIGN1ckNoYXIgPT09ICcqJykge1xyXG4gICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFRva2VuVHlwZS5XaWxkQ2FyZCwgdmFsdWU6IHVybFBhdGhbaV0gfSk7XHJcbiAgICAgIHNraXBDaGFyKDEpO1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIC8vIHN0YXRpYyBwYXJhbXNcclxuICAgIGlmIChwcmV2Q2hhciA9PT0gJy8nICYmIHZhbGlkQ2hhci50ZXN0KGN1ckNoYXIpKSB7XHJcbiAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogVG9rZW5UeXBlLlN0YXRpYywgdmFsdWU6IGdldExpdGVyYWwoKSB9KTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBpZiAoY3VyQ2hhciA9PT0gJygnKSB7XHJcbiAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogVG9rZW5UeXBlLkxCcmFja2V0LCB2YWx1ZTogJygnIH0pO1xyXG4gICAgICBza2lwQ2hhcigxKTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBpZiAoY3VyQ2hhciA9PT0gJyknKSB7XHJcbiAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogVG9rZW5UeXBlLlJCcmFja2V0LCB2YWx1ZTogJyknIH0pO1xyXG4gICAgICBza2lwQ2hhcigxKTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsaWRDaGFyLnRlc3QoY3VyQ2hhcikpIHtcclxuICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBUb2tlblR5cGUuUGF0dGVybiwgdmFsdWU6IGdldExpdGVyYWwoKSB9KTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICAvLyDot7Pov4fpnZ7ms5XlrZfnrKZcclxuICAgIHNraXBDaGFyKDEpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRva2VucztcclxufVxyXG4iLCJpbXBvcnQgeyBHZXRVUkxQYXJhbXMsIFBhcnNlciwgUGFyc2VyT3B0aW9uLCBUb2tlblR5cGUgfSBmcm9tICcuL3R5cGVzJztcclxuaW1wb3J0IHsgbGV4ZXIgfSBmcm9tICcuL2xleGVyJztcclxuaW1wb3J0IHsgZXNjYXBlU3RyLCBzY29yZUNvbXBhcmUgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbi8vIOS4jeWQjOexu+Wei+WPguaVsOeahOWMuemFjeW+l+WIhlxyXG5lbnVtIE1hdGNoU2NvcmUge1xyXG4gIC8vIOWbuuWumuWPguaVsFxyXG4gIHN0YXRpYyA9IDEwLFxyXG4gIC8vIOWKqOaAgeWPguaVsFxyXG4gIHBhcmFtID0gNixcclxuICAvLyDpgJrphY3nrKblj4LmlbBcclxuICB3aWxkY2FyZCA9IDMsXHJcbiAgcGxhY2Vob2xkZXIgPSAtMSxcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgUGFyYW1zPFA+ID0geyBbSyBpbiBrZXlvZiBQXT86IFBbS10gfTtcclxuXHJcbi8vIOWFvOWuuSByZWFjdCB2NSBtYXRjaGVk57G75Z6LXHJcbmV4cG9ydCB0eXBlIE1hdGNoZWQ8UCA9IGFueT4gPSB7XHJcbiAgc2NvcmU6IG51bWJlcltdO1xyXG4gIHBhcmFtczogUGFyYW1zPFA+O1xyXG4gIHBhdGg6IHN0cmluZztcclxuICB1cmw6IHN0cmluZztcclxuICBpc0V4YWN0OiBib29sZWFuO1xyXG59O1xyXG5cclxuY29uc3QgZGVmYXVsdE9wdGlvbjogUmVxdWlyZWQ8UGFyc2VyT3B0aW9uPiA9IHtcclxuICAvLyB1cmzljLnphY3ml7bmmK/lkKblpKflsI/lhpnmlY/mhJ9cclxuICBjYXNlU2Vuc2l0aXZlOiB0cnVlLFxyXG4gIC8vIOaYr+WQpuS4peagvOWMuemFjXVybOe7k+WwvueahC9cclxuICBzdHJpY3RNb2RlOiBmYWxzZSxcclxuICAvLyDmmK/lkKblrozlhajnsr7noa7ljLnphY1cclxuICBleGFjdDogZmFsc2UsXHJcbn07XHJcbi8vIOato+WImeihqOi+vuW8j+S4remcgOimgei9rOS5ieeahOWtl+esplxyXG5jb25zdCBSRUdFWF9DSEFSU19SRSA9IC9bLisqP14ke30oKVtcXF0vXFxcXF0vZztcclxuLy8g55So5LqO5Yy56YWN5Lik5LiqLy/kuK3nmoTnmoTlgLxcclxuY29uc3QgQkFTRV9QQVJBTV9QQVRURVJOID0gJ1teL10rJztcclxuXHJcbmNvbnN0IERlZmF1bHREZWxpbWl0ZXIgPSAnLyM/JztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYXRoUGFyc2VyPFN0ciBleHRlbmRzIHN0cmluZz4ocGF0aG5hbWU6IFN0ciwgb3B0aW9uPzogUGFyc2VyT3B0aW9uKTogUGFyc2VyPEdldFVSTFBhcmFtczxTdHI+PjtcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGhQYXJzZXI8UCA9IHVua25vd24+KHBhdGhuYW1lOiBzdHJpbmcsIG9wdGlvbj86IFBhcnNlck9wdGlvbik6IFBhcnNlcjxQPjtcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGhQYXJzZXI8UCA9IHVua25vd24+KHBhdGhuYW1lOiBzdHJpbmcsIG9wdGlvbjogUGFyc2VyT3B0aW9uID0gZGVmYXVsdE9wdGlvbik6IFBhcnNlcjxQPiB7XHJcbiAgY29uc3Qge1xyXG4gICAgY2FzZVNlbnNpdGl2ZSA9IGRlZmF1bHRPcHRpb24uY2FzZVNlbnNpdGl2ZSxcclxuICAgIHN0cmljdE1vZGUgPSBkZWZhdWx0T3B0aW9uLnN0cmljdE1vZGUsXHJcbiAgICBleGFjdCA9IGRlZmF1bHRPcHRpb24uZXhhY3QsXHJcbiAgfSA9IG9wdGlvbjtcclxuICAvKipcclxuICAgKiBVUkzljLnphY3mlbTkvZPmtYHnqItcclxuICAgKiAxLuivjeazleino+aekO+8jOWwhlVSTOaooeadv+ino+aekOS4ulRva2VuXHJcbiAgICogMi7kvb/nlKhUb2tlbueUn+aIkOato+WImeihqOi+vuW8j1xyXG4gICAqIDMu5Yip55So5q2j5YiZ6KGo6L6+5byP6Kej5p6QVVJM5Lit5Y+C5pWw5oiW5aGr5YWFVVJM5qih5p2/XHJcbiAgICovXHJcbiAgbGV0IHBhdHRlcm4gPSAnXic7XHJcbiAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcclxuICBjb25zdCBzY29yZXM6IG51bWJlcltdID0gW107XHJcblxyXG4gIGNvbnN0IHRva2VucyA9IGxleGVyKHBhdGhuYW1lKTtcclxuICBjb25zdCBvbmx5SGFzV2lsZENhcmQgPSB0b2tlbnMubGVuZ3RoID09PSAxICYmIHRva2Vuc1swXS50eXBlID09PSBUb2tlblR5cGUuV2lsZENhcmQ7XHJcbiAgY29uc3QgdG9rZW5Db3VudCA9IHRva2Vucy5sZW5ndGg7XHJcbiAgY29uc3QgbGFzdFRva2VuID0gdG9rZW5zW3Rva2VuQ291bnQgLSAxXTtcclxuXHJcbiAgZm9yIChsZXQgdG9rZW5JZHggPSAwOyB0b2tlbklkeCA8IHRva2VuQ291bnQ7IHRva2VuSWR4KyspIHtcclxuICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW3Rva2VuSWR4XTtcclxuICAgIGNvbnN0IG5leHRUb2tlbiA9IHRva2Vuc1t0b2tlbklkeCArIDFdO1xyXG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XHJcbiAgICAgIGNhc2UgVG9rZW5UeXBlLkRlbGltaXRlcjpcclxuICAgICAgICBwYXR0ZXJuICs9ICcvJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBUb2tlblR5cGUuU3RhdGljOlxyXG4gICAgICAgIHBhdHRlcm4gKz0gdG9rZW4udmFsdWUucmVwbGFjZShSRUdFWF9DSEFSU19SRSwgJ1xcXFwkJicpO1xyXG4gICAgICAgIHNjb3Jlcy5wdXNoKE1hdGNoU2NvcmUuc3RhdGljKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBUb2tlblR5cGUuUGFyYW06XHJcbiAgICAgICAgbGV0IHBhcmFtUmVnZXhwID0gJyc7XHJcbiAgICAgICAgaWYgKG5leHRUb2tlbiAmJiBuZXh0VG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkxCcmFja2V0KSB7XHJcbiAgICAgICAgICAvLyDot7Pov4flvZPliY1Ub2tlbuWSjOW3puaLrOWPt1xyXG4gICAgICAgICAgdG9rZW5JZHggKz0gMjtcclxuICAgICAgICAgIHdoaWxlICh0b2tlbnNbdG9rZW5JZHhdLnR5cGUgIT09IFRva2VuVHlwZS5SQnJhY2tldCkge1xyXG4gICAgICAgICAgICBwYXJhbVJlZ2V4cCArPSB0b2tlbnNbdG9rZW5JZHhdLnZhbHVlO1xyXG4gICAgICAgICAgICB0b2tlbklkeCsrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwYXR0ZXJuICs9IHBhcmFtUmVnZXhwID8gYCgoPzoke3BhcmFtUmVnZXhwfSkpYCA6IGAoJHtCQVNFX1BBUkFNX1BBVFRFUk59KWA7XHJcbiAgICAgICAga2V5cy5wdXNoKHRva2VuLnZhbHVlKTtcclxuICAgICAgICBzY29yZXMucHVzaChNYXRjaFNjb3JlLnBhcmFtKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBUb2tlblR5cGUuV2lsZENhcmQ6XHJcbiAgICAgICAga2V5cy5wdXNoKHRva2VuLnZhbHVlKTtcclxuICAgICAgICBwYXR0ZXJuICs9IGAoKD86JHtCQVNFX1BBUkFNX1BBVFRFUk59KSR7b25seUhhc1dpbGRDYXJkID8gJz8nIDogJyd9KD86Lyg/OiR7QkFTRV9QQVJBTV9QQVRURVJOfSkpKilgO1xyXG4gICAgICAgIHNjb3Jlcy5wdXNoKG9ubHlIYXNXaWxkQ2FyZCA/IE1hdGNoU2NvcmUud2lsZGNhcmQgOiBNYXRjaFNjb3JlLnBsYWNlaG9sZGVyKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgaXNXaWxkQ2FyZCA9IGxhc3RUb2tlbi50eXBlID09PSBUb2tlblR5cGUuV2lsZENhcmQ7XHJcblxyXG4gIGlmICghaXNXaWxkQ2FyZCAmJiAhZXhhY3QpIHtcclxuICAgIGlmICghc3RyaWN0TW9kZSkge1xyXG4gICAgICBwYXR0ZXJuICs9IGAoPzpbJHtlc2NhcGVTdHIoRGVmYXVsdERlbGltaXRlcil9XSg/PSQpKT9gO1xyXG4gICAgfVxyXG4gICAgaWYgKGxhc3RUb2tlbi50eXBlICE9PSBUb2tlblR5cGUuRGVsaW1pdGVyKSB7XHJcbiAgICAgIHBhdHRlcm4gKz0gYCg/PVske2VzY2FwZVN0cihEZWZhdWx0RGVsaW1pdGVyKX1dfCQpYDtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgcGF0dGVybiArPSBzdHJpY3RNb2RlID8gJyQnIDogYFske2VzY2FwZVN0cihEZWZhdWx0RGVsaW1pdGVyKX1dPyRgO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZmxhZyA9IGNhc2VTZW5zaXRpdmUgPyAnJyA6ICdpJztcclxuICBjb25zdCByZWdleHAgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIGZsYWcpO1xyXG5cclxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24g5qC55o2u57uZ5a6aUGF0dGVybuino+aekHBhdGhcclxuICAgKi9cclxuICBmdW5jdGlvbiBwYXJzZShwYXRoOiBzdHJpbmcpOiBNYXRjaGVkPFA+IHwgbnVsbCB7XHJcbiAgICBjb25zdCByZU1hdGNoID0gcGF0aC5tYXRjaChyZWdleHApO1xyXG5cclxuICAgIGlmICghcmVNYXRjaCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnN0IG1hdGNoZWRQYXRoID0gcmVNYXRjaFswXTtcclxuICAgIGxldCBwYXJhbXM6IFBhcmFtczxQPiA9IHt9O1xyXG4gICAgbGV0IHBhcnNlU2NvcmU6IG51bWJlcltdID0gQXJyYXkuZnJvbShzY29yZXMpO1xyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCByZU1hdGNoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxldCBwYXJhbSA9IHJlTWF0Y2hbaV07XHJcbiAgICAgIGxldCBrZXkgPSBrZXlzW2kgLSAxXTtcclxuICAgICAgaWYgKGtleSA9PT0gJyonICYmIHBhcmFtKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gcGFyYW0uc3BsaXQoJy8nKTtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocGFyYW1zWycqJ10pKSB7XHJcbiAgICAgICAgICBwYXJhbXNbJyonXSA9IHZhbHVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwYXJhbXNbJyonXS5wdXNoKC4uLnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5a6M5oiQ6YCa6YWN56ym5Y+C5pWw6Kej5p6Q5ZCO5bCGcGxhY2Vob2xkZXLmm7/mjaLkuLp3aWxkY2FyZOWPguaVsOeahOWIhuWAvFxyXG4gICAgICAgIHBhcnNlU2NvcmUuc3BsaWNlKFxyXG4gICAgICAgICAgc2NvcmVzLmluZGV4T2YoTWF0Y2hTY29yZS5wbGFjZWhvbGRlciksXHJcbiAgICAgICAgICAxLFxyXG4gICAgICAgICAgLi4ubmV3IEFycmF5KHZhbHVlLmxlbmd0aCkuZmlsbChNYXRjaFNjb3JlLndpbGRjYXJkKSxcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBhcmFtc1trZXldID0gcGFyYW0gPyBwYXJhbSA6IFtdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNFeGFjdCA9IHBhdGggPT09IG1hdGNoZWRQYXRoO1xyXG4gICAgY29uc3QgdXJsID0gcGF0aCA9PT0gJy8nICYmIG1hdGNoZWRQYXRoID09PSAnJyA/ICcvJyA6IG1hdGNoZWRQYXRoO1xyXG4gICAgcmV0dXJuIHsgaXNFeGFjdDogaXNFeGFjdCwgcGF0aDogcGF0aG5hbWUsIHVybDogdXJsLCBzY29yZTogcGFyc2VTY29yZSwgcGFyYW1zOiBwYXJhbXMgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiDkvb/nlKjnu5nlrprlj4LmlbDloavlhYVwYXR0ZXJu77yM5b6X5Yiw55uu5qCHVVJMXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY29tcGlsZShwYXJhbXM6IFBhcmFtczxQPik6IHN0cmluZyB7XHJcbiAgICBsZXQgcGF0aCA9ICcnO1xyXG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcclxuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBUb2tlblR5cGUuU3RhdGljOlxyXG4gICAgICAgICAgcGF0aCArPSB0b2tlbi52YWx1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgVG9rZW5UeXBlLlBhcmFtOlxyXG4gICAgICAgICAgaWYgKCFwYXJhbXNbdG9rZW4udmFsdWVdKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGFyYW0gaXMgaW52YWxpZC4nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHBhdGggKz0gcGFyYW1zW3Rva2VuLnZhbHVlXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgVG9rZW5UeXBlLldpbGRDYXJkOlxyXG4gICAgICAgICAgbGV0IHdpbGRDYXJkID0gcGFyYW1zWycqJ107XHJcbiAgICAgICAgICBpZiAod2lsZENhcmQgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICBwYXRoICs9IHdpbGRDYXJkLmpvaW4oJy8nKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhdGggKz0gd2lsZENhcmQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRva2VuVHlwZS5EZWxpbWl0ZXI6XHJcbiAgICAgICAgICBwYXRoICs9IHRva2VuLnZhbHVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwYXRoO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGdldCByZWdleHAoKSB7XHJcbiAgICAgIHJldHVybiByZWdleHA7XHJcbiAgICB9LFxyXG4gICAgZ2V0IGtleXMoKSB7XHJcbiAgICAgIHJldHVybiBrZXlzO1xyXG4gICAgfSxcclxuICAgIGNvbXBpbGUsXHJcbiAgICBwYXJzZSxcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIOS+neasoeS9v+eUqHBhdGhuYW1l5LiOcGF0dGVybui/m+ihjOWMuemFje+8jOagueaNruWMuemFjeWIhuaVsOWPluW+l+WIhuaVsOacgOmrmOe7k+aenFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoUGF0aDxQID0gYW55PihcclxuICBwYXRobmFtZTogc3RyaW5nLFxyXG4gIHBhdHRlcm46IHN0cmluZyB8IHN0cmluZ1tdLFxyXG4gIG9wdGlvbj86IFBhcnNlck9wdGlvbixcclxuKTogTWF0Y2hlZDxQPiB8IG51bGwge1xyXG4gIGNvbnN0IHBhdHRlcm5zID0gQXJyYXkuaXNBcnJheShwYXR0ZXJuKSA/IFsuLi5wYXR0ZXJuXSA6IFtwYXR0ZXJuXTtcclxuICBjb25zdCBtYXRjaGVkUmVzdWx0czogTWF0Y2hlZDxQPltdID0gW107XHJcbiAgZm9yIChjb25zdCBpdGVtIG9mIHBhdHRlcm5zKSB7XHJcbiAgICBjb25zdCBwYXJzZXIgPSBjcmVhdGVQYXRoUGFyc2VyKGl0ZW0sIG9wdGlvbik7XHJcbiAgICBjb25zdCBtYXRjaGVkID0gcGFyc2VyLnBhcnNlKHBhdGhuYW1lKTtcclxuICAgIGlmIChtYXRjaGVkKSB7XHJcbiAgICAgIG1hdGNoZWRSZXN1bHRzLnB1c2gobWF0Y2hlZCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAhbWF0Y2hlZFJlc3VsdHMubGVuZ3RoID8gbnVsbCA6IG1hdGNoZWRSZXN1bHRzLnNvcnQoKGEsIGIpID0+IHNjb3JlQ29tcGFyZShhLnNjb3JlLCBiLnNjb3JlKSlbMF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVBhdGg8UCA9IGFueT4ocGF0aDogc3RyaW5nLCBwYXJhbXM6IFBhcmFtczxQPikge1xyXG4gIGNvbnN0IHBhcnNlciA9IGNyZWF0ZVBhdGhQYXJzZXIocGF0aCk7XHJcbiAgcmV0dXJuIHBhcnNlci5jb21waWxlKHBhcmFtcyk7XHJcbn0iLCJpbXBvcnQgeyB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUm91dGVyQ29udGV4dCBmcm9tICcuL2NvbnRleHQnO1xyXG5pbXBvcnQgeyBNYXRjaGVkLCBtYXRjaFBhdGgsIFBhcmFtcyB9IGZyb20gJy4vbWF0Y2hlci9wYXJzZXInO1xyXG5pbXBvcnQgeyBIaXN0b3J5IH0gZnJvbSAnLi4vaGlzdG9yeS90eXBlcyc7XHJcbmltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSAnLi9pbmRleCc7XHJcblxyXG5mdW5jdGlvbiB1c2VIaXN0b3J5PFM+KCk6IEhpc3Rvcnk8Uz47XHJcbmZ1bmN0aW9uIHVzZUhpc3RvcnkoKSB7XHJcbiAgcmV0dXJuIHVzZUNvbnRleHQoUm91dGVyQ29udGV4dCkuaGlzdG9yeTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXNlTG9jYXRpb248Uz4oKTogTG9jYXRpb248Uz47XHJcbmZ1bmN0aW9uIHVzZUxvY2F0aW9uKCkge1xyXG4gIHJldHVybiB1c2VDb250ZXh0KFJvdXRlckNvbnRleHQpLmxvY2F0aW9uO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1c2VQYXJhbXM8UD4oKTogUGFyYW1zPFA+IHwge307XHJcbmZ1bmN0aW9uIHVzZVBhcmFtcygpIHtcclxuICBjb25zdCBtYXRjaCA9IHVzZUNvbnRleHQoUm91dGVyQ29udGV4dCkubWF0Y2g7XHJcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2gucGFyYW1zIDoge307XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVzZVJvdXRlTWF0Y2g8UD4ocGF0aD86IHN0cmluZyk6IE1hdGNoZWQ8UD4gfCBudWxsO1xyXG5mdW5jdGlvbiB1c2VSb3V0ZU1hdGNoKHBhdGg/OiBzdHJpbmcpIHtcclxuICBjb25zdCBwYXRobmFtZSA9IHVzZUxvY2F0aW9uKCkucGF0aG5hbWU7XHJcbiAgY29uc3QgbWF0Y2ggPSB1c2VDb250ZXh0KFJvdXRlckNvbnRleHQpLm1hdGNoO1xyXG4gIGlmIChwYXRoKSB7XHJcbiAgICByZXR1cm4gbWF0Y2hQYXRoKHBhdGhuYW1lLCBwYXRoKTtcclxuICB9XHJcbiAgcmV0dXJuIG1hdGNoO1xyXG59XHJcblxyXG5leHBvcnQgeyB1c2VIaXN0b3J5LCB1c2VMb2NhdGlvbiwgdXNlUGFyYW1zLCB1c2VSb3V0ZU1hdGNoIH07XHJcbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgSGlzdG9yeSwgTG9jYXRpb24gfSBmcm9tICcuL2luZGV4JztcclxuaW1wb3J0IHsgTWF0Y2hlZCwgbWF0Y2hQYXRoIH0gZnJvbSAnLi9tYXRjaGVyL3BhcnNlcic7XHJcbmltcG9ydCB7IHVzZUNvbnRleHQsIENoaWxkcmVuLCBjcmVhdGVFbGVtZW50IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUm91dGVyQ29udGV4dCBmcm9tICcuL2NvbnRleHQnO1xyXG5pbXBvcnQgeyBHZXRVUkxQYXJhbXMgfSBmcm9tICcuL21hdGNoZXIvdHlwZXMnO1xyXG5cclxuZXhwb3J0IHR5cGUgUm91dGVDb21wb25lbnRQcm9wczxQIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA9IHt9LCBTID0gdW5rbm93bj4gPSBSb3V0ZUNoaWxkcmVuUHJvcHM8UCwgUz47XHJcblxyXG5leHBvcnQgdHlwZSBSb3V0ZUNoaWxkcmVuUHJvcHM8UCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fSwgUyA9IHVua25vd24+ID0ge1xyXG4gIGhpc3Rvcnk6IEhpc3Rvcnk8Uz47XHJcbiAgbG9jYXRpb246IExvY2F0aW9uPFM+O1xyXG4gIG1hdGNoOiBNYXRjaGVkPFA+IHwgbnVsbFxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBSb3V0ZVByb3BzPFAgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge30sIFBhdGggZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0ge1xyXG4gIGxvY2F0aW9uPzogTG9jYXRpb247XHJcbiAgY29tcG9uZW50PzogUmVhY3QuQ29tcG9uZW50VHlwZTxSb3V0ZUNvbXBvbmVudFByb3BzPFA+PiB8IFJlYWN0LkNvbXBvbmVudFR5cGU8YW55PiB8IHVuZGVmaW5lZDtcclxuICBjaGlsZHJlbj86ICgocHJvcHM6IFJvdXRlQ2hpbGRyZW5Qcm9wczxQPikgPT4gUmVhY3QuUmVhY3ROb2RlKSB8IFJlYWN0LlJlYWN0Tm9kZTtcclxuICByZW5kZXI/OiAocHJvcHM6IFJvdXRlQ29tcG9uZW50UHJvcHM8UD4pID0+IFJlYWN0LlJlYWN0Tm9kZTtcclxuICBwYXRoPzogUGF0aCB8IFBhdGhbXTtcclxuICBleGFjdD86IGJvb2xlYW47XHJcbiAgc2Vuc2l0aXZlPzogYm9vbGVhbjtcclxuICBzdHJpY3Q/OiBib29sZWFuO1xyXG4gIGNvbXB1dGVkPzogTWF0Y2hlZDxQPjtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFJvdXRlPFBhdGggZXh0ZW5kcyBzdHJpbmcsIFAgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0gR2V0VVJMUGFyYW1zPFBhdGg+Pihwcm9wczogUm91dGVQcm9wczxQLCBQYXRoPikge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFJvdXRlckNvbnRleHQpO1xyXG5cclxuICBjb25zdCB7IGNvbXB1dGVkLCBsb2NhdGlvbiwgcGF0aCB9ID0gcHJvcHM7XHJcbiAgbGV0IHsgY2hpbGRyZW4sIGNvbXBvbmVudCwgcmVuZGVyIH0gPSBwcm9wcztcclxuICBsZXQgbWF0Y2g6IE1hdGNoZWQ8UD4gfCBudWxsO1xyXG5cclxuICBjb25zdCByb3V0ZUxvY2F0aW9uID0gbG9jYXRpb24gfHwgY29udGV4dC5sb2NhdGlvbjtcclxuICBpZiAoY29tcHV0ZWQpIHtcclxuICAgIG1hdGNoID0gY29tcHV0ZWQ7XHJcbiAgfSBlbHNlIGlmIChwYXRoKSB7XHJcbiAgICBtYXRjaCA9IG1hdGNoUGF0aDxQPihyb3V0ZUxvY2F0aW9uLnBhdGhuYW1lLCBwYXRoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgbWF0Y2ggPSBjb250ZXh0Lm1hdGNoO1xyXG4gIH1cclxuICBjb25zdCBuZXdQcm9wcyA9IHsgLi4uY29udGV4dCwgbG9jYXRpb246IHJvdXRlTG9jYXRpb24sIG1hdGNoOiBtYXRjaCB9O1xyXG5cclxuICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikgJiYgQ2hpbGRyZW4uY291bnQoY2hpbGRyZW4pID09PSAwKSB7XHJcbiAgICBjaGlsZHJlbiA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiDmjInpobrluo/ojrflj5bpnIDopoHmuLLmn5PnmoTnu4Tku7ZcclxuICAgKiAxLmNoaWxkcmVuXHJcbiAgICogMi5jb21wb25lbnRcclxuICAgKiAzLnJlbmRlclxyXG4gICAqIOmDveayoeacieWMuemFjeWIsOi/lOWbnk51bGxcclxuICAgKi9cclxuICBjb25zdCBnZXRDaGlsZHJlbiA9ICgpOiBSZWFjdC5SZWFjdE5vZGUgfCBudWxsID0+IHtcclxuICAgIC8vIOWmguaenCBtYXRjaCDlrZjlnKhcclxuICAgIGlmIChuZXdQcm9wcy5tYXRjaCkge1xyXG4gICAgICBpZiAoY2hpbGRyZW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNoaWxkcmVuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2hpbGRyZW4obmV3UHJvcHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjb21wb25lbnQpIHtcclxuICAgICAgICByZXR1cm4gY3JlYXRlRWxlbWVudChjb21wb25lbnQsIG5ld1Byb3BzKTtcclxuICAgICAgfSBlbHNlIGlmIChyZW5kZXIpIHtcclxuICAgICAgICByZXR1cm4gcmVuZGVyKG5ld1Byb3BzKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gbWF0Y2jkuLpudWxsXHJcbiAgICAgIGlmICh0eXBlb2YgY2hpbGRyZW4gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICByZXR1cm4gY2hpbGRyZW4obmV3UHJvcHMpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiA8Um91dGVyQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17bmV3UHJvcHN9PntnZXRDaGlsZHJlbigpfTwvUm91dGVyQ29udGV4dC5Qcm92aWRlcj47XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJvdXRlO1xyXG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZUxheW91dEVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcclxuXHJcbmltcG9ydCB7IEhpc3RvcnksIExvY2F0aW9uIH0gZnJvbSAnLi4vaGlzdG9yeS90eXBlcyc7XHJcblxyXG5pbXBvcnQgUm91dGVyQ29udGV4dCwgeyBSb3V0ZXJDb250ZXh0VmFsdWUgfSBmcm9tICcuL2NvbnRleHQnO1xyXG5cclxuZXhwb3J0IHR5cGUgUm91dGVyUHJvcHMgPSB7XHJcbiAgaGlzdG9yeTogSGlzdG9yeTtcclxuICBjaGlsZHJlbj86IFJlYWN0LlJlYWN0Tm9kZTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFJvdXRlcjxQIGV4dGVuZHMgUm91dGVyUHJvcHM+KHByb3BzOiBQKSB7XHJcbiAgY29uc3QgeyBoaXN0b3J5LCBjaGlsZHJlbiA9IG51bGwgfSA9IHByb3BzO1xyXG4gIGNvbnN0IFtsb2NhdGlvbiwgc2V0TG9jYXRpb25dID0gdXNlU3RhdGUocHJvcHMuaGlzdG9yeS5sb2NhdGlvbik7XHJcbiAgY29uc3QgcGVuZGluZ0xvY2F0aW9uID0gdXNlUmVmPExvY2F0aW9uIHwgbnVsbD4obnVsbCk7XHJcblxyXG4gIC8vIOWcqFJvdXRlcuWKoOi9veaXtuWwseebkeWQrGhpc3RvcnnlnLDlnYDlj5jljJbvvIzku6Xkv53or4HlnKjlp4vmuLLmn5Pml7bph43lrprlkJHog73mraPnoa7op6blj5FcclxuICBsZXQgdW5MaXN0ZW46IG51bGwgfCAoKCkgPT4gdm9pZCkgPSBoaXN0b3J5Lmxpc3RlbihhcmcgPT4ge1xyXG4gICAgcGVuZGluZ0xvY2F0aW9uLmN1cnJlbnQgPSBhcmcubG9jYXRpb247XHJcbiAgfSk7XHJcblxyXG4gIC8vIOaooeaLn2NvbXBvbmVudERpZE1vdW505ZKMY29tcG9uZW50V2lsbFVubW91bnRcclxuICB1c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKHVuTGlzdGVuKSB7XHJcbiAgICAgIHVuTGlzdGVuKCk7XHJcbiAgICB9XHJcbiAgICAvLyDnm5HlkKxoaXN0b3J55Lit55qE5L2N572u5Y+Y5YyWXHJcbiAgICB1bkxpc3RlbiA9IGhpc3RvcnkubGlzdGVuKGFyZyA9PiB7XHJcbiAgICAgIHNldExvY2F0aW9uKGFyZy5sb2NhdGlvbik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocGVuZGluZ0xvY2F0aW9uLmN1cnJlbnQpIHtcclxuICAgICAgc2V0TG9jYXRpb24ocGVuZGluZ0xvY2F0aW9uLmN1cnJlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGlmICh1bkxpc3Rlbikge1xyXG4gICAgICAgIHVuTGlzdGVuKCk7XHJcbiAgICAgICAgdW5MaXN0ZW4gPSBudWxsO1xyXG4gICAgICAgIHBlbmRpbmdMb2NhdGlvbi5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIGNvbnN0IGluaXRDb250ZXh0VmFsdWU6IFJvdXRlckNvbnRleHRWYWx1ZSA9IHVzZU1lbW8oXHJcbiAgICAoKSA9PiAoe1xyXG4gICAgICBoaXN0b3J5OiBoaXN0b3J5LFxyXG4gICAgICBsb2NhdGlvbjogbG9jYXRpb24sXHJcbiAgICAgIG1hdGNoOiB7IGlzRXhhY3Q6IGxvY2F0aW9uLnBhdGhuYW1lID09PSAnLycsIHBhcmFtczoge30sIHBhdGg6ICcvJywgc2NvcmU6IFtdLCB1cmw6ICcvJyB9LFxyXG4gICAgfSksXHJcbiAgICBbbG9jYXRpb25dLFxyXG4gICk7XHJcblxyXG4gIHJldHVybiA8Um91dGVyQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17aW5pdENvbnRleHRWYWx1ZX0gY2hpbGRyZW49e2NoaWxkcmVufSAvPjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm91dGVyO1xyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShzb3VyY2UsIGV4Y2x1ZGVkKSB7XG4gIGlmIChzb3VyY2UgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICB2YXIgdGFyZ2V0ID0ge307XG4gIHZhciBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTtcbiAgdmFyIGtleSwgaTtcbiAgZm9yIChpID0gMDsgaSA8IHNvdXJjZUtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBrZXkgPSBzb3VyY2VLZXlzW2ldO1xuICAgIGlmIChleGNsdWRlZC5pbmRleE9mKGtleSkgPj0gMCkgY29udGludWU7XG4gICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufSIsImltcG9ydCB7IHVzZUxheW91dEVmZmVjdCwgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xyXG5cclxuZXhwb3J0IHR5cGUgTGlmZUN5Y2xlUHJvcHMgPSB7XHJcbiAgb25Nb3VudD86ICgpID0+IHZvaWQ7XHJcbiAgb25VcGRhdGU/OiAocHJldlByb3BzPzogTGlmZUN5Y2xlUHJvcHMpID0+IHZvaWQ7XHJcbiAgb25Vbm1vdW50PzogKCkgPT4gdm9pZDtcclxuICBkYXRhPzogYW55O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIExpZmVDeWNsZShwcm9wczogTGlmZUN5Y2xlUHJvcHMpIHtcclxuICAvLyDkvb/nlKhyZWbkv53lrZjkuIrkuIDmrKHnmoRwcm9wc++8jOmYsuatoumHjeaWsOa4suafk1xyXG4gIGNvbnN0IHByZXZQcm9wcyA9IHVzZVJlZjxMaWZlQ3ljbGVQcm9wcyB8IG51bGw+KG51bGwpO1xyXG4gIGNvbnN0IGlzTW91bnQgPSB1c2VSZWYoZmFsc2UpO1xyXG5cclxuICBjb25zdCB7IG9uTW91bnQsIG9uVXBkYXRlLCBvblVubW91bnQgfSA9IHByb3BzO1xyXG5cclxuICB1c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xyXG4gICAgLy8g6aaW5qyh5oyC6L29IOaooeaLn2NvbXBvbmVudERpZE1vdW50XHJcbiAgICBpZiAoIWlzTW91bnQuY3VycmVudCkge1xyXG4gICAgICBpc01vdW50LmN1cnJlbnQgPSB0cnVlO1xyXG4gICAgICBpZiAob25Nb3VudCkge1xyXG4gICAgICAgIG9uTW91bnQoKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g5LiN5piv6aaW5qyh5riy5p+TIOaooeaLn2NvbXBvbmVudERpZFVwZGF0ZVxyXG4gICAgICBpZiAob25VcGRhdGUpIHtcclxuICAgICAgICBwcmV2UHJvcHMuY3VycmVudCA/IG9uVXBkYXRlKHByZXZQcm9wcy5jdXJyZW50KSA6IG9uVXBkYXRlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXZQcm9wcy5jdXJyZW50ID0gcHJvcHM7XHJcbiAgfSk7XHJcblxyXG4gIC8vIOaooeaLn2NvbXBvbmVudFdpbGxVbm1vdW50XHJcbiAgdXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGlmIChvblVubW91bnQpIHtcclxuICAgICAgICBvblVubW91bnQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IFJvdXRlckNvbnRleHQgZnJvbSAnLi9jb250ZXh0JztcclxuaW1wb3J0IHsgTGlmZUN5Y2xlLCBMaWZlQ3ljbGVQcm9wcyB9IGZyb20gJy4vbGlmZUN5Y2xlSG9vayc7XHJcbmltcG9ydCB7IE1hdGNoZWQsIGNyZWF0ZVBhdGhQYXJzZXIgfSBmcm9tICcuL21hdGNoZXIvcGFyc2VyJztcclxuaW1wb3J0IHsgYWRkSGVhZFNsYXNoLCBpc0xvY2F0aW9uRXF1YWwsIHBhcnNlUGF0aCB9IGZyb20gJy4uL2hpc3RvcnkvdXRpbHMnO1xyXG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gJy4vaW5kZXgnO1xyXG5cclxuZXhwb3J0IHR5cGUgUmVkaXJlY3RQcm9wcyA9IHtcclxuICB0bzogc3RyaW5nIHwgUGFydGlhbDxMb2NhdGlvbj47XHJcbiAgcHVzaD86IGJvb2xlYW47XHJcbiAgcGF0aD86IHN0cmluZztcclxuICBmcm9tPzogc3RyaW5nO1xyXG4gIGV4YWN0PzogYm9vbGVhbjtcclxuICBzdHJpY3Q/OiBib29sZWFuO1xyXG5cclxuICAvLyDnlLFTd2l0Y2jorqHnrpflvpfliLBcclxuICByZWFkb25seSBjb21wdXRlZD86IE1hdGNoZWQgfCBudWxsO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gUmVkaXJlY3Q8UCBleHRlbmRzIFJlZGlyZWN0UHJvcHM+KHByb3BzOiBQKSB7XHJcbiAgY29uc3QgeyB0bywgcHVzaCA9IGZhbHNlLCBjb21wdXRlZCB9ID0gcHJvcHM7XHJcblxyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFJvdXRlckNvbnRleHQpO1xyXG4gIGNvbnN0IHsgaGlzdG9yeSB9ID0gY29udGV4dDtcclxuXHJcbiAgY29uc3QgY2FsY0xvY2F0aW9uID0gKCk6IFBhcnRpYWw8TG9jYXRpb24+ID0+IHtcclxuICAgIGlmIChjb21wdXRlZCkge1xyXG4gICAgICBpZiAodHlwZW9mIHRvID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlciA9IGNyZWF0ZVBhdGhQYXJzZXIodG8pO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHBhcnNlci5jb21waWxlKGNvbXB1dGVkLnBhcmFtcyk7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlUGF0aCh0YXJnZXQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHBhdGhuYW1lID0gdG8ucGF0aG5hbWUgPyBhZGRIZWFkU2xhc2godG8ucGF0aG5hbWUpIDogJy8nO1xyXG4gICAgICAgIGNvbnN0IHBhcnNlciA9IGNyZWF0ZVBhdGhQYXJzZXIocGF0aG5hbWUpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHBhcnNlci5jb21waWxlKGNvbXB1dGVkLnBhcmFtcyk7XHJcbiAgICAgICAgcmV0dXJuIHsgLi4udG8sIHBhdGhuYW1lOiB0YXJnZXQgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHR5cGVvZiB0byA9PT0gJ3N0cmluZycgPyBwYXJzZVBhdGgodG8pIDogdG87XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbmF2aWdhdGUgPSBwdXNoID8gaGlzdG9yeS5wdXNoIDogaGlzdG9yeS5yZXBsYWNlO1xyXG4gIGNvbnN0IHsgc3RhdGUsIC4uLnBhdGggfSA9IGNhbGNMb2NhdGlvbigpO1xyXG5cclxuICBjb25zdCBvbk1vdW50RnVuYyA9ICgpID0+IHtcclxuICAgIG5hdmlnYXRlKHBhdGgsIHN0YXRlKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBvblVwZGF0ZUZ1bmMgPSAocHJldlByb3BzPzogTGlmZUN5Y2xlUHJvcHMpID0+IHtcclxuICAgIC8vIOWmguaenOW9k+WJjemhtemdouS4jumHjeWumuWQkeWJjemhtemdouS4jeS4gOiHtO+8jOaJp+ihjOi3s+i9rFxyXG4gICAgY29uc3QgcHJldlBhdGggPSBwcmV2UHJvcHM/LmRhdGEgYXMgTG9jYXRpb247XHJcbiAgICBpZiAoIWlzTG9jYXRpb25FcXVhbChwcmV2UGF0aCwgcGF0aCkpIHtcclxuICAgICAgbmF2aWdhdGUocGF0aCwgc3RhdGUpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiA8TGlmZUN5Y2xlIG9uTW91bnQ9e29uTW91bnRGdW5jfSBvblVwZGF0ZT17b25VcGRhdGVGdW5jfSBkYXRhPXtwYXRofSAvPjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVkaXJlY3Q7XHJcbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlQ29udGV4dCwgQ2hpbGRyZW4sIGlzVmFsaWRFbGVtZW50LCBjbG9uZUVsZW1lbnQgfSBmcm9tICdyZWFjdCc7XHJcblxyXG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgUm91dGVyQ29udGV4dCBmcm9tICcuL2NvbnRleHQnO1xyXG5pbXBvcnQgeyBNYXRjaGVkLCBtYXRjaFBhdGggfSBmcm9tICcuL21hdGNoZXIvcGFyc2VyJztcclxuaW1wb3J0IFJvdXRlLCB7IFJvdXRlUHJvcHMgfSBmcm9tICcuL1JvdXRlJztcclxuaW1wb3J0IFJlZGlyZWN0LCB7IFJlZGlyZWN0UHJvcHMgfSBmcm9tICcuL1JlZGlyZWN0JztcclxuXHJcbmV4cG9ydCB0eXBlIFN3aXRjaFByb3BzID0ge1xyXG4gIGxvY2F0aW9uPzogTG9jYXRpb247XHJcbiAgY2hpbGRyZW4/OiBSZWFjdC5SZWFjdE5vZGU7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBTd2l0Y2g8UCBleHRlbmRzIFN3aXRjaFByb3BzPihwcm9wczogUCk6IFJlYWN0LlJlYWN0RWxlbWVudCB8IG51bGwge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFJvdXRlckNvbnRleHQpO1xyXG4gIGNvbnN0IGxvY2F0aW9uID0gcHJvcHMubG9jYXRpb24gfHwgY29udGV4dC5sb2NhdGlvbjtcclxuXHJcbiAgbGV0IGVsZW1lbnQ6IFJlYWN0LlJlYWN0RWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIGxldCBtYXRjaDogTWF0Y2hlZCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyDkvb/nlKhmb3JFYWNo5LiN5Lya57uZUmVhY3QuUmVhY3ROb2Rl5aKe5Yqga2V55bGe5oCnLOmYsuatoumHjeaWsOa4suafk1xyXG4gIENoaWxkcmVuLmZvckVhY2gocHJvcHMuY2hpbGRyZW4sIG5vZGUgPT4ge1xyXG4gICAgaWYgKG1hdGNoID09PSBudWxsICYmIGlzVmFsaWRFbGVtZW50KG5vZGUpKSB7XHJcbiAgICAgIGVsZW1lbnQgPSBub2RlO1xyXG5cclxuICAgICAgbGV0IHN0cmljdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcclxuICAgICAgbGV0IHNlbnNpdGl2ZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcclxuICAgICAgbGV0IHBhdGg6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xyXG4gICAgICBsZXQgZnJvbTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgLy8gbm9kZeWPr+iDveaYr1JvdXRl5ZKMUmVkaXJlY3RcclxuICAgICAgaWYgKG5vZGUudHlwZSA9PT0gUm91dGUpIHtcclxuICAgICAgICBjb25zdCBwcm9wcyA9IG5vZGUucHJvcHMgYXMgUm91dGVQcm9wcztcclxuICAgICAgICBzdHJpY3QgPSBwcm9wcy5zdHJpY3Q7XHJcbiAgICAgICAgc2Vuc2l0aXZlID0gcHJvcHMuc2Vuc2l0aXZlO1xyXG4gICAgICAgIHBhdGggPSBwcm9wcy5wYXRoO1xyXG4gICAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gUmVkaXJlY3QpIHtcclxuICAgICAgICBjb25zdCBwcm9wcyA9IG5vZGUucHJvcHMgYXMgUmVkaXJlY3RQcm9wcztcclxuICAgICAgICBwYXRoID0gcHJvcHMucGF0aDtcclxuICAgICAgICBzdHJpY3QgPSBwcm9wcy5zdHJpY3Q7XHJcbiAgICAgICAgZnJvbSA9IHByb3BzLmZyb207XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGV4YWN0ID0gbm9kZS5wcm9wcy5leGFjdDtcclxuICAgICAgY29uc3QgdGFyZ2V0ID0gcGF0aCB8fCBmcm9tO1xyXG5cclxuICAgICAgLy8g5pu05paw5Yy56YWN54q25oCB77yM5LiA5pem5Yy56YWN5Yiw5YGc5q2i6YGN5Y6GXHJcbiAgICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBtYXRjaCA9IG1hdGNoUGF0aChsb2NhdGlvbi5wYXRobmFtZSwgdGFyZ2V0LCB7XHJcbiAgICAgICAgICBzdHJpY3RNb2RlOiBzdHJpY3QsXHJcbiAgICAgICAgICBjYXNlU2Vuc2l0aXZlOiBzZW5zaXRpdmUsXHJcbiAgICAgICAgICBleGFjdDogZXhhY3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbWF0Y2ggPSBjb250ZXh0Lm1hdGNoO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGlmIChtYXRjaCAmJiBlbGVtZW50KSB7XHJcbiAgICAvLyDkvb/nlKhjbG9uZUVsZW1lbnTlpI3liLblt7LmnInnu4Tku7blubbmm7TmlrDlhbZQcm9wc1xyXG4gICAgcmV0dXJuIGNsb25lRWxlbWVudChlbGVtZW50LCB7IGxvY2F0aW9uOiBsb2NhdGlvbiwgY29tcHV0ZWQ6IG1hdGNoIH0pO1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU3dpdGNoO1xyXG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IExpZmVDeWNsZSwgTGlmZUN5Y2xlUHJvcHMgfSBmcm9tICcuL2xpZmVDeWNsZUhvb2snO1xyXG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuaW1wb3J0IFJvdXRlckNvbnRleHQgZnJvbSAnLi9jb250ZXh0JztcclxuXHJcbnR5cGUgUHJvbXB0UHJvcHMgPSB7XHJcbiAgbWVzc2FnZT86IHN0cmluZyB8ICgobG9jYXRpb246IFBhcnRpYWw8TG9jYXRpb24+LCBhY3Rpb246IEFjdGlvbikgPT4gdm9pZCk7XHJcbiAgd2hlbj86IGJvb2xlYW4gfCAoKGxvY2F0aW9uOiBQYXJ0aWFsPExvY2F0aW9uPikgPT4gYm9vbGVhbik7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBQcm9tcHQ8UCBleHRlbmRzIFByb21wdFByb3BzPihwcm9wczogUCkge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFJvdXRlckNvbnRleHQpO1xyXG5cclxuICBjb25zdCB7IG1lc3NhZ2UsIHdoZW4gPSB0cnVlIH0gPSBwcm9wcztcclxuXHJcbiAgaWYgKCh0eXBlb2Ygd2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiB3aGVuKGNvbnRleHQubG9jYXRpb24pID09PSBmYWxzZSkgfHwgIXdoZW4pIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbmF2aWdhdGUgPSBjb250ZXh0Lmhpc3RvcnkuYmxvY2s7XHJcblxyXG4gIGxldCByZWxlYXNlOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3Qgb25Nb3VudEZ1bmMgPSAoKSA9PiB7XHJcbiAgICByZWxlYXNlID0gbWVzc2FnZSA/IG5hdmlnYXRlKG1lc3NhZ2UpIDogbnVsbDtcclxuICB9O1xyXG5cclxuICBjb25zdCBvblVwZGF0ZUZ1bmMgPSAocHJldlByb3BzPzogTGlmZUN5Y2xlUHJvcHMpID0+IHtcclxuICAgIGlmIChwcmV2UHJvcHMgJiYgcHJldlByb3BzLmRhdGEgIT09IG1lc3NhZ2UpIHtcclxuICAgICAgaWYgKHJlbGVhc2UpIHtcclxuICAgICAgICByZWxlYXNlKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmVsZWFzZSA9IG1lc3NhZ2UgPyBuYXZpZ2F0ZShtZXNzYWdlKSA6IG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgb25Vbm1vdW50RnVuYyA9ICgpID0+IHtcclxuICAgIGlmIChyZWxlYXNlKSB7XHJcbiAgICAgIHJlbGVhc2UoKTtcclxuICAgIH1cclxuICAgIHJlbGVhc2UgPSBudWxsO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiA8TGlmZUN5Y2xlIG9uTW91bnQ9e29uTW91bnRGdW5jfSBvblVwZGF0ZT17b25VcGRhdGVGdW5jfSBvblVubW91bnQ9e29uVW5tb3VudEZ1bmN9IGRhdGE9e21lc3NhZ2V9IC8+O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQcm9tcHQ7XHJcbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IFJvdXRlckNvbnRleHQgZnJvbSAnLi9jb250ZXh0JztcclxuXHJcbmZ1bmN0aW9uIHdpdGhSb3V0ZXI8QyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudFR5cGU+KENvbXBvbmVudDogQykge1xyXG5cclxuICBmdW5jdGlvbiBDb21wb25lbnRXaXRoUm91dGVyUHJvcChwcm9wczogYW55KSB7XHJcbiAgICBjb25zdCB7IGhpc3RvcnksIGxvY2F0aW9uLCBtYXRjaCB9ID0gdXNlQ29udGV4dChSb3V0ZXJDb250ZXh0KTtcclxuICAgIGNvbnN0IHJvdXRlUHJvcHMgPSB7IGhpc3Rvcnk6IGhpc3RvcnksIGxvY2F0aW9uOiBsb2NhdGlvbiwgbWF0Y2g6IG1hdGNoIH07XHJcblxyXG4gICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnByb3BzfSB7Li4ucm91dGVQcm9wc30gLz47XHJcbiAgfVxyXG5cclxuICByZXR1cm4gQ29tcG9uZW50V2l0aFJvdXRlclByb3A7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHdpdGhSb3V0ZXI7IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IEhpc3RvcnkgfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuaW1wb3J0IHsgQmFzZVJvdXRlclByb3BzIH0gZnJvbSAnLi9Ccm93c2VyUm91dGVyJztcclxuaW1wb3J0IHsgY3JlYXRlSGFzaEhpc3RvcnksIHVybEhhc2hUeXBlIH0gZnJvbSAnLi4vaGlzdG9yeS9oYXNoSGlzdG9yeSc7XHJcbmltcG9ydCBSb3V0ZXIgZnJvbSAnLi9Sb3V0ZXInO1xyXG5cclxuZXhwb3J0IHR5cGUgSGFzaFJvdXRlclByb3BzID0gQmFzZVJvdXRlclByb3BzICYge1xyXG4gIGhhc2hUeXBlOiB1cmxIYXNoVHlwZTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIEhhc2hSb3V0ZXI8UCBleHRlbmRzIFBhcnRpYWw8SGFzaFJvdXRlclByb3BzPj4ocHJvcHM6IFApIHtcclxuICBsZXQgaGlzdG9yeVJlZiA9IHVzZVJlZjxIaXN0b3J5PigpO1xyXG4gIGlmIChoaXN0b3J5UmVmLmN1cnJlbnQgPT09IG51bGwgfHwgaGlzdG9yeVJlZi5jdXJyZW50ID09PSB1bmRlZmluZWQpIHtcclxuICAgIGhpc3RvcnlSZWYuY3VycmVudCA9IGNyZWF0ZUhhc2hIaXN0b3J5KHtcclxuICAgICAgYmFzZW5hbWU6IHByb3BzLmJhc2VuYW1lLFxyXG4gICAgICBnZXRVc2VyQ29uZmlybWF0aW9uOiBwcm9wcy5nZXRVc2VyQ29uZmlybWF0aW9uLFxyXG4gICAgICBoYXNoVHlwZTogcHJvcHMuaGFzaFR5cGUsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHJldHVybiA8Um91dGVyIGhpc3Rvcnk9e2hpc3RvcnlSZWYuY3VycmVudH0+e3Byb3BzLmNoaWxkcmVufTwvUm91dGVyPjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgSGFzaFJvdXRlcjsiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZVJlZiwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUm91dGVyIGZyb20gJy4vUm91dGVyJztcclxuaW1wb3J0IHsgY3JlYXRlQnJvd3Nlckhpc3RvcnkgfSBmcm9tICcuLi9oaXN0b3J5L2Jyb3dlckhpc3RvcnknO1xyXG5pbXBvcnQgeyBDb25maXJtYXRpb25GdW5jLCBIaXN0b3J5IH0gZnJvbSAnLi4vaGlzdG9yeS90eXBlcyc7XHJcblxyXG5leHBvcnQgdHlwZSBCYXNlUm91dGVyUHJvcHMgPSB7XHJcbiAgYmFzZW5hbWU6IHN0cmluZztcclxuICBnZXRVc2VyQ29uZmlybWF0aW9uOiBDb25maXJtYXRpb25GdW5jO1xyXG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgQnJvd3NlclJvdXRlclByb3BzID0gQmFzZVJvdXRlclByb3BzICYge1xyXG4gIGZvcmNlUmVmcmVzaDogYm9vbGVhbjtcclxufTtcclxuXHJcbmZ1bmN0aW9uIEJyb3dzZXJSb3V0ZXI8UCBleHRlbmRzIFBhcnRpYWw8QnJvd3NlclJvdXRlclByb3BzPj4ocHJvcHM6IFApIHtcclxuICAvLyDkvb/nlKhSZWbmjIHmnIlIaXN0b3J55a+56LGh77yM6Ziy5q2i6YeN5aSN5riy5p+TXHJcbiAgbGV0IGhpc3RvcnlSZWYgPSB1c2VSZWY8SGlzdG9yeT4oKTtcclxuXHJcbiAgaWYgKGhpc3RvcnlSZWYuY3VycmVudCA9PT0gbnVsbCB8fCBoaXN0b3J5UmVmLmN1cnJlbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgaGlzdG9yeVJlZi5jdXJyZW50ID0gY3JlYXRlQnJvd3Nlckhpc3Rvcnkoe1xyXG4gICAgICBiYXNlbmFtZTogcHJvcHMuYmFzZW5hbWUsXHJcbiAgICAgIGZvcmNlUmVmcmVzaDogcHJvcHMuZm9yY2VSZWZyZXNoLFxyXG4gICAgICBnZXRVc2VyQ29uZmlybWF0aW9uOiBwcm9wcy5nZXRVc2VyQ29uZmlybWF0aW9uLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gPFJvdXRlciBoaXN0b3J5PXtoaXN0b3J5UmVmLmN1cnJlbnR9Pntwcm9wcy5jaGlsZHJlbn08L1JvdXRlcj47XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJyb3dzZXJSb3V0ZXI7IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUm91dGVyQ29udGV4dCBmcm9tICcuL2NvbnRleHQnO1xyXG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyBjcmVhdGVQYXRoLCBwYXJzZVBhdGggfSBmcm9tICcuLi9oaXN0b3J5L3V0aWxzJztcclxuaW1wb3J0IHsgUGF0aCB9IGZyb20gJy4uL2hpc3RvcnkvdHlwZXMnO1xyXG5cclxuZXhwb3J0IHR5cGUgTGlua1Byb3BzID0ge1xyXG4gIGNvbXBvbmVudD86IFJlYWN0LkNvbXBvbmVudFR5cGU8YW55PjtcclxuICB0bzogUGFydGlhbDxMb2NhdGlvbj4gfCBzdHJpbmcgfCAoKGxvY2F0aW9uOiBMb2NhdGlvbikgPT4gc3RyaW5nIHwgUGFydGlhbDxMb2NhdGlvbj4pO1xyXG4gIHJlcGxhY2U/OiBib29sZWFuO1xyXG4gIHRhZz86IHN0cmluZztcclxuICAvKipcclxuICAgKiBAZGVwcmVjYXRlZFxyXG4gICAqIFJlYWN0MTbku6XlkI7kuI3lho3pnIDopoHor6XlsZ7mgKdcclxuICAgKiovXHJcbiAgaW5uZXJSZWY/OiBSZWFjdC5SZWY8SFRNTEFuY2hvckVsZW1lbnQ+O1xyXG59ICYgUmVhY3QuQW5jaG9ySFRNTEF0dHJpYnV0ZXM8SFRNTEFuY2hvckVsZW1lbnQ+O1xyXG5cclxuY29uc3QgaXNNb2RpZmllZEV2ZW50ID0gKGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XHJcbiAgcmV0dXJuIGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuYWx0S2V5IHx8IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQuc2hpZnRLZXk7XHJcbn07XHJcblxyXG5jb25zdCBjaGVja1RhcmdldCA9ICh0YXJnZXQ/OiBSZWFjdC5IVE1MQXR0cmlidXRlQW5jaG9yVGFyZ2V0KSA9PiB7XHJcbiAgcmV0dXJuICF0YXJnZXQgfHwgdGFyZ2V0ID09PSAnX3NlbGYnO1xyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIExpbms8UCBleHRlbmRzIExpbmtQcm9wcz4ocHJvcHM6IFApIHtcclxuICBjb25zdCB7IHRvLCByZXBsYWNlLCBjb21wb25lbnQsIG9uQ2xpY2ssIHRhcmdldCwgLi4ub3RoZXIgfSA9IHByb3BzO1xyXG5cclxuICBjb25zdCB0YWcgPSBwcm9wcy50YWcgfHwgJ2EnO1xyXG5cclxuICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChSb3V0ZXJDb250ZXh0KTtcclxuICBjb25zdCBoaXN0b3J5ID0gY29udGV4dC5oaXN0b3J5O1xyXG5cclxuICBsZXQgbG9jYXRpb24gPSB0eXBlb2YgdG8gPT09ICdmdW5jdGlvbicgPyB0byhjb250ZXh0LmxvY2F0aW9uKSA6IHRvO1xyXG5cclxuICBsZXQgc3RhdGU6IGFueTtcclxuICBsZXQgcGF0aDogUGFydGlhbDxQYXRoPjtcclxuICBpZiAodHlwZW9mIGxvY2F0aW9uID09PSAnc3RyaW5nJykge1xyXG4gICAgcGF0aCA9IHBhcnNlUGF0aChsb2NhdGlvbik7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnN0IHsgcGF0aG5hbWUsIGhhc2gsIHNlYXJjaCB9ID0gbG9jYXRpb247XHJcbiAgICBwYXRoID0geyBwYXRobmFtZSwgaGFzaCwgc2VhcmNoIH07XHJcbiAgICBzdGF0ZSA9IGxvY2F0aW9uLnN0YXRlO1xyXG4gIH1cclxuICBjb25zdCBocmVmID0gaGlzdG9yeS5jcmVhdGVIcmVmKHBhdGgpO1xyXG5cclxuICBjb25zdCBsaW5rQ2xpY2tFdmVudCA9IChldmVudDogUmVhY3QuTW91c2VFdmVudDxIVE1MQW5jaG9yRWxlbWVudD4pID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmIChvbkNsaWNrKSB7XHJcbiAgICAgICAgb25DbGljayhldmVudCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZXZlbnQuYnV0dG9uID09PSAwICYmIGNoZWNrVGFyZ2V0KHRhcmdldCkgJiYgIWlzTW9kaWZpZWRFdmVudChldmVudCkpIHtcclxuICAgICAgLy8g5LiN5piv55u45ZCM55qE6Lev5b6E5omn6KGMcHVzaOaTjeS9nO+8jOaYr+ebuOWQjOeahOi3r+W+hOaJp+ihjHJlcGxhY2VcclxuICAgICAgY29uc3QgaXNTYW1lUGF0aCA9IGNyZWF0ZVBhdGgoY29udGV4dC5sb2NhdGlvbikgPT09IGNyZWF0ZVBhdGgocGF0aCk7XHJcbiAgICAgIGNvbnN0IG5hdmlnYXRlID0gcmVwbGFjZSB8fCBpc1NhbWVQYXRoID8gaGlzdG9yeS5yZXBsYWNlIDogaGlzdG9yeS5wdXNoO1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBuYXZpZ2F0ZShwYXRoLCBzdGF0ZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbGlua1Byb3BzID0geyBocmVmOiBocmVmLCBvbkNsaWNrOiBsaW5rQ2xpY2tFdmVudCwgLi4ub3RoZXIgfTtcclxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCh0YWcsIGxpbmtQcm9wcyk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExpbms7IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgdHlwZSB7IExpbmtQcm9wcyB9IGZyb20gJy4vTGluayc7XHJcbmltcG9ydCBMaW5rIGZyb20gJy4vTGluayc7XHJcbmltcG9ydCB7IExvY2F0aW9uLCBtYXRjaFBhdGggfSBmcm9tICcuL2luZGV4JztcclxuaW1wb3J0IHsgTWF0Y2hlZCB9IGZyb20gJy4vbWF0Y2hlci9wYXJzZXInO1xyXG5pbXBvcnQgQ29udGV4dCBmcm9tICcuL2NvbnRleHQnO1xyXG5pbXBvcnQgeyBwYXJzZVBhdGggfSBmcm9tICcuLi9oaXN0b3J5L3V0aWxzJztcclxuaW1wb3J0IHsgZXNjYXBlU3RyIH0gZnJvbSAnLi9tYXRjaGVyL3V0aWxzJztcclxuXHJcbnR5cGUgTmF2TGlua1Byb3BzID0ge1xyXG4gIHRvOiBQYXJ0aWFsPExvY2F0aW9uPiB8IHN0cmluZyB8ICgobG9jYXRpb246IExvY2F0aW9uKSA9PiBzdHJpbmcgfCBQYXJ0aWFsPExvY2F0aW9uPik7XHJcbiAgaXNBY3RpdmU/OiAobWF0Y2g6IE1hdGNoZWQgfCBudWxsLCBsb2NhdGlvbjogTG9jYXRpb24pID0+IGJvb2xlYW47XHJcbiAgLy8gY29tcGF0IHJlYWN0LXJvdXRlciBOYXZMaW5rIHByb3BzIHR5cGVcclxuICBba2V5OiBzdHJpbmddOiBhbnk7XHJcbn0gJiBMaW5rUHJvcHM7XHJcblxyXG50eXBlIFBhZ2UgPSAncGFnZSc7XHJcblxyXG5mdW5jdGlvbiBOYXZMaW5rPFAgZXh0ZW5kcyBOYXZMaW5rUHJvcHM+KHByb3BzOiBQKSB7XHJcbiAgY29uc3QgeyB0bywgaXNBY3RpdmUsIC4uLnJlc3QgfSA9IHByb3BzO1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KENvbnRleHQpO1xyXG5cclxuICBjb25zdCB0b0xvY2F0aW9uID0gdHlwZW9mIHRvID09PSAnZnVuY3Rpb24nID8gdG8oY29udGV4dC5sb2NhdGlvbikgOiB0bztcclxuXHJcbiAgY29uc3QgeyBwYXRobmFtZTogcGF0aCB9ID0gdHlwZW9mIHRvTG9jYXRpb24gPT09ICdzdHJpbmcnID8gcGFyc2VQYXRoKHRvTG9jYXRpb24pIDogdG9Mb2NhdGlvbjtcclxuICAvLyDmiormraPliJnooajovr7lvI/nmoTnibnmrornrKblj7fliqDkuKTkuKrlj43mlpzmnaDov5vooYzovazkuYlcclxuICBjb25zdCBlc2NhcGVkUGF0aCA9IHBhdGggPyBlc2NhcGVTdHIocGF0aCkgOiAnJztcclxuICBjb25zdCBtYXRjaCA9IGVzY2FwZWRQYXRoID8gbWF0Y2hQYXRoKGNvbnRleHQubG9jYXRpb24ucGF0aG5hbWUsIGVzY2FwZWRQYXRoKSA6IG51bGw7XHJcblxyXG4gIGNvbnN0IGlzTGlua0FjdGl2ZSA9IG1hdGNoICYmIGlzQWN0aXZlID8gaXNBY3RpdmUobWF0Y2gsIGNvbnRleHQubG9jYXRpb24pIDogZmFsc2U7XHJcblxyXG4gIGNvbnN0IHBhZ2U6IFBhZ2UgPSAncGFnZSc7XHJcbiAgY29uc3Qgb3RoZXJQcm9wcyA9IHtcclxuICAgICdhcmlhLWN1cnJlbnQnOiBpc0xpbmtBY3RpdmUgPyBwYWdlIDogZmFsc2UsXHJcbiAgICAuLi5yZXN0LFxyXG4gIH07XHJcblxyXG4gIHJldHVybiA8TGluayB0bz17dG99IHsuLi5vdGhlclByb3BzfSAvPjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTmF2TGluaztcclxuIiwiaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tICcuLi9yb3V0ZXInO1xyXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuXHJcbi8vIOiOt+WPlnJlZHV4IHN0YXRl5Lit55qE5YC8XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJbihzdGF0ZTogUmVjb3JkPHN0cmluZywgYW55PiwgcGF0aDogc3RyaW5nW10pOiBhbnkge1xyXG4gIGlmICghc3RhdGUpIHtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcbiAgY29uc3QgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XHJcbiAgaWYgKCFsZW5ndGgpIHtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIGxldCByZXMgPSBzdGF0ZTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aCAmJiAhIXJlczsgKytpKSB7XHJcbiAgICByZXMgPSByZXNbcGF0aFtpXV07XHJcbiAgfVxyXG4gIHJldHVybiByZXM7XHJcbn1cclxuXHJcbi8vIOS7jnN0b3Jl55qEc3RhdGXkuK3ojrflj5ZSb3V0ZXLjgIFMb2NhdGlvbuOAgUFjdGlvbuOAgUhhc2jnrYnkv6Hmga9cclxuY29uc3Qgc3RhdGVSZWFkZXIgPSAoc3RvcmVUeXBlOiBzdHJpbmcpID0+IHtcclxuICBjb25zdCBpc1JvdXRlciA9ICh2YWx1ZTogdW5rbm93bikgPT4ge1xyXG4gICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgISFnZXRJbih2YWx1ZSwgWydsb2NhdGlvbiddKSAmJiAhIWdldEluKHZhbHVlLCBbJ2FjdGlvbiddKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBnZXRSb3V0ZXIgPSAoc3RhdGU6IGFueSkgPT4ge1xyXG4gICAgY29uc3Qgcm91dGVyID0gZ2V0SW4oc3RhdGUsIFsncm91dGVyJ10pO1xyXG4gICAgaWYgKCFpc1JvdXRlcihyb3V0ZXIpKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgcm91dGVyIHJlZHVjZXIgaW4gJHtzdG9yZVR5cGV9IHN0b3JlLCBpdCBtdXN0IGJlIG1vdW50ZWQgdW5kZXIgXCJyb3V0ZXJcImApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJvdXRlciE7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZ2V0TG9jYXRpb24gPSA8Uz4oc3RhdGU6IGFueSk6IFBhcnRpYWw8TG9jYXRpb248Uz4+ID0+IGdldEluKGdldFJvdXRlcihzdGF0ZSksIFsnbG9jYXRpb24nXSk7XHJcbiAgY29uc3QgZ2V0QWN0aW9uID0gKHN0YXRlOiBhbnkpOiBBY3Rpb24gPT4gZ2V0SW4oZ2V0Um91dGVyKHN0YXRlKSwgWydhY3Rpb24nXSk7XHJcbiAgY29uc3QgZ2V0U2VhcmNoID0gKHN0YXRlOiBhbnkpOiBzdHJpbmcgPT4gZ2V0SW4oZ2V0Um91dGVyKHN0YXRlKSwgWydsb2NhdGlvbicsICdzZWFyY2gnXSk7XHJcbiAgY29uc3QgZ2V0SGFzaCA9IChzdGF0ZTogYW55KTogc3RyaW5nID0+IGdldEluKGdldFJvdXRlcihzdGF0ZSksIFsnbG9jYXRpb24nLCAnaGFzaCddKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGdldEhhc2gsXHJcbiAgICBnZXRBY3Rpb24sXHJcbiAgICBnZXRTZWFyY2gsXHJcbiAgICBnZXRSb3V0ZXIsXHJcbiAgICBnZXRMb2NhdGlvbixcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgc3RhdGVSZWFkZXIiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZUxheW91dEVmZmVjdCB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgY29ubmVjdCwgUmVhY3RSZWR1eENvbnRleHQgfSBmcm9tICdyZWFjdC1yZWR1eCc7XHJcbmltcG9ydCB7IFN0b3JlIH0gZnJvbSAncmVkdXgnO1xyXG5pbXBvcnQgeyByZWR1eEFkYXB0ZXIgfSBmcm9tICdAY2xvdWRzb3AvaG9yaXpvbic7XHJcbmltcG9ydCB7IEhpc3RvcnksIExvY2F0aW9uLCBSb3V0ZXIgfSBmcm9tICcuLi9yb3V0ZXInO1xyXG5pbXBvcnQgeyBBY3Rpb24sIERlZmF1bHRTdGF0ZVR5cGUsIE5hdmlnYXRpb24gfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuaW1wb3J0IHsgQWN0aW9uTWVzc2FnZSwgb25Mb2NhdGlvbkNoYW5nZWQgfSBmcm9tICcuL2FjdGlvbnMnO1xyXG5pbXBvcnQgc3RhdGVSZWFkZXIgZnJvbSAnLi9yZWR1eFV0aWxzJztcclxuXHJcbnR5cGUgU3RvcmVUeXBlID0gJ0hvcml6b25YQ29tcGF0JyB8ICdSZWR1eCc7XHJcblxyXG50eXBlIENvbm5lY3RlZFJvdXRlcjxTPiA9IHtcclxuICBzdG9yZTogU3RvcmU7XHJcbiAgaGlzdG9yeTogSGlzdG9yeTxTPjtcclxuICBiYXNlbmFtZTogc3RyaW5nO1xyXG4gIGNoaWxkcmVuPzogKCgpID0+IFJlYWN0LlJlYWN0Tm9kZSkgfCBSZWFjdC5SZWFjdE5vZGU7XHJcbiAgb25Mb2NhdGlvbkNoYW5nZWQ6IChsb2NhdGlvbjogTG9jYXRpb248Uz4sIGFjdGlvbjogQWN0aW9uLCBpc0ZpcnN0UmVuZGVyaW5nOiBib29sZWFuKSA9PiBBY3Rpb25NZXNzYWdlO1xyXG4gIG5vSW5pdGlhbFBvcDogYm9vbGVhbjtcclxuICBvbWl0Um91dGVyOiBib29sZWFuO1xyXG4gIHN0b3JlVHlwZTogU3RvcmVUeXBlO1xyXG59O1xyXG5cclxuY29uc3QgeyBjb25uZWN0OiBoQ29ubmVjdCB9ID0gcmVkdXhBZGFwdGVyO1xyXG5cclxuZnVuY3Rpb24gQ29ubmVjdGVkUm91dGVyV2l0aG91dE1lbW88Uz4ocHJvcHM6IENvbm5lY3RlZFJvdXRlcjxTPikge1xyXG4gIGNvbnN0IHsgc3RvcmUsIGhpc3RvcnksIG9uTG9jYXRpb25DaGFuZ2VkLCBvbWl0Um91dGVyLCBjaGlsZHJlbiwgc3RvcmVUeXBlIH0gPSBwcm9wcztcclxuICBjb25zdCB7IGdldExvY2F0aW9uIH0gPSBzdGF0ZVJlYWRlcihzdG9yZVR5cGUpO1xyXG5cclxuICAvLyDnm5HlkKxzdG9yZeWPmOWMllxyXG4gIGNvbnN0IHVuc3Vic2NyaWJlID0gc3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgIC8vIOiOt+WPlnJlZHV4IFN0YXRl5Lit55qEbG9jYXRpb27kv6Hmga9cclxuICAgIGNvbnN0IHtcclxuICAgICAgcGF0aG5hbWU6IHBhdGhuYW1lSW5TdG9yZSxcclxuICAgICAgc2VhcmNoOiBzZWFyY2hJblN0b3JlLFxyXG4gICAgICBoYXNoOiBoYXNoSW5TdG9yZSxcclxuICAgICAgc3RhdGU6IHN0YXRlSW5TdG9yZSxcclxuICAgIH0gPSBnZXRMb2NhdGlvbjxTPihzdG9yZS5nZXRTdGF0ZSgpKTtcclxuXHJcbiAgICAvLyDojrflj5blvZPliY1oaXN0b3J55a+56LGh5Lit55qEbG9jYXRpb27kv6Hmga9cclxuICAgIGNvbnN0IHtcclxuICAgICAgcGF0aG5hbWU6IHBhdGhuYW1lSW5IaXN0b3J5LFxyXG4gICAgICBzZWFyY2g6IHNlYXJjaEluSGlzdG9yeSxcclxuICAgICAgaGFzaDogaGFzaEluSGlzdG9yeSxcclxuICAgICAgc3RhdGU6IHN0YXRlSW5IaXN0b3J5LFxyXG4gICAgfSA9IGhpc3RvcnkubG9jYXRpb247XHJcblxyXG4gICAgLy8g5Lik5LiqbG9jYXRpb27kuI3kuIDoh7Qg5omn6KGM6Lez6L2sXHJcbiAgICBpZiAoXHJcbiAgICAgIGhpc3RvcnkuYWN0aW9uID09PSAnUFVTSCcgJiZcclxuICAgICAgKHBhdGhuYW1lSW5IaXN0b3J5ICE9PSBwYXRobmFtZUluU3RvcmUgfHxcclxuICAgICAgICBzZWFyY2hJbkhpc3RvcnkgIT09IHNlYXJjaEluU3RvcmUgfHxcclxuICAgICAgICBoYXNoSW5IaXN0b3J5ICE9PSBoYXNoSW5TdG9yZSB8fFxyXG4gICAgICAgIHN0YXRlSW5IaXN0b3J5ICE9PSBzdGF0ZUluU3RvcmUpXHJcbiAgICApIHtcclxuICAgICAgaGlzdG9yeS5wdXNoKFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBhdGhuYW1lOiBwYXRobmFtZUluU3RvcmUsXHJcbiAgICAgICAgICBzZWFyY2g6IHNlYXJjaEluU3RvcmUsXHJcbiAgICAgICAgICBoYXNoOiBoYXNoSW5TdG9yZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXRlSW5TdG9yZSxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgY29uc3QgaGFuZGxlTG9jYXRpb25DaGFuZ2UgPSAoYXJnczogTmF2aWdhdGlvbjxTPiwgaXNGaXJzdFJlbmRlcmluZzogYm9vbGVhbiA9IGZhbHNlKSA9PiB7XHJcbiAgICBjb25zdCB7IGxvY2F0aW9uLCBhY3Rpb24gfSA9IGFyZ3M7XHJcbiAgICBvbkxvY2F0aW9uQ2hhbmdlZChsb2NhdGlvbiwgYWN0aW9uLCBpc0ZpcnN0UmVuZGVyaW5nKTtcclxuICB9O1xyXG5cclxuICAvLyDnm5HlkKxoaXN0b3J55pu05pawXHJcbiAgY29uc3QgdW5MaXN0ZW4gPSAoKSA9PiBoaXN0b3J5Lmxpc3RlbihoYW5kbGVMb2NhdGlvbkNoYW5nZSk7XHJcblxyXG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICB1bkxpc3RlbigpO1xyXG4gICAgICB1bnN1YnNjcmliZSgpO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIGlmICghcHJvcHMubm9Jbml0aWFsUG9wKSB7XHJcbiAgICAvLyDkvKDpgJLliJ3lp4vml7bkvY3nva7kv6Hmga/vvIxpc0ZpcnN0UmVuZGVyaW5n6K6+5Li6dHJ1ZemYsuatoumHjeWkjea4suafk1xyXG4gICAgaGFuZGxlTG9jYXRpb25DaGFuZ2UoeyBsb2NhdGlvbjogaGlzdG9yeS5sb2NhdGlvbiwgYWN0aW9uOiBoaXN0b3J5LmFjdGlvbiB9LCB0cnVlKTtcclxuICB9XHJcblxyXG4gIGlmIChvbWl0Um91dGVyKSB7XHJcbiAgICByZXR1cm4gPD57Y2hpbGRyZW59PC8+O1xyXG4gIH1cclxuICBsZXQgY2hpbGRyZW5Ob2RlOiBSZWFjdC5SZWFjdE5vZGU7XHJcbiAgaWYgKHR5cGVvZiBjaGlsZHJlbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgY2hpbGRyZW5Ob2RlID0gY2hpbGRyZW4oKTtcclxuICB9IGVsc2Uge1xyXG4gICAgY2hpbGRyZW5Ob2RlID0gY2hpbGRyZW47XHJcbiAgfVxyXG5cclxuICByZXR1cm4gPFJvdXRlciBoaXN0b3J5PXtoaXN0b3J5fT57Y2hpbGRyZW5Ob2RlfTwvUm91dGVyPjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29ubmVjdGVkUm91dGVyPFMgPSBEZWZhdWx0U3RhdGVUeXBlPih0eXBlOiBTdG9yZVR5cGUpIHtcclxuICBjb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoZGlzcGF0Y2g6IGFueSkgPT4gKHtcclxuICAgIG9uTG9jYXRpb25DaGFuZ2VkOiAobG9jYXRpb246IExvY2F0aW9uLCBhY3Rpb246IEFjdGlvbiwgaXNGaXJzdFJlbmRlcmluZzogYm9vbGVhbikgPT5cclxuICAgICAgZGlzcGF0Y2gob25Mb2NhdGlvbkNoYW5nZWQobG9jYXRpb24sIGFjdGlvbiwgaXNGaXJzdFJlbmRlcmluZykpLFxyXG4gIH0pO1xyXG4gIGNvbnN0IENvbm5lY3RlZFJvdXRlciA9IFJlYWN0Lm1lbW8oQ29ubmVjdGVkUm91dGVyV2l0aG91dE1lbW88Uz4pO1xyXG5cclxuICBjb25zdCBDb25uZWN0ZWRSb3V0ZXJXaXRoQ29udGV4dCA9IChwcm9wczogYW55KSA9PiB7XHJcbiAgICBjb25zdCBDb250ZXh0ID0gcHJvcHMuY29udGV4dCB8fCBSZWFjdFJlZHV4Q29udGV4dDtcclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8Q29udGV4dC5Db25zdW1lcj5cclxuICAgICAgICB7KHsgc3RvcmUgfTogYW55KSA9PiA8Q29ubmVjdGVkUm91dGVyIHN0b3JlPXtzdG9yZX0gc3RvcmVUeXBlPXt0eXBlfSB7Li4ucHJvcHN9IC8+fVxyXG4gICAgICA8L0NvbnRleHQuQ29uc3VtZXI+XHJcbiAgICApO1xyXG4gIH07XHJcblxyXG4gIC8vIOmSiOWvueS4jeWQjOeahFN0b3Jl57G75Z6L77yM5L2/55So5a+55bqU55qEY29ubmVjdOWHveaVsFxyXG4gIGlmICh0eXBlID09PSAnSG9yaXpvblhDb21wYXQnKSB7XHJcbiAgICByZXR1cm4gaENvbm5lY3QobnVsbCwgbWFwRGlzcGF0Y2hUb1Byb3BzKShDb25uZWN0ZWRSb3V0ZXJXaXRoQ29udGV4dCk7XHJcbiAgfVxyXG4gIGlmICh0eXBlID09PSAnUmVkdXgnKSB7XHJcbiAgICByZXR1cm4gY29ubmVjdChudWxsLCBtYXBEaXNwYXRjaFRvUHJvcHMpKENvbm5lY3RlZFJvdXRlcldpdGhDb250ZXh0KTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0b3JlIHR5cGUnKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7IGdldENvbm5lY3RlZFJvdXRlciB9O1xyXG4iLCJpbXBvcnQgeyBBY3Rpb25NZXNzYWdlLCBBY3Rpb25OYW1lIH0gZnJvbSAnLi9hY3Rpb25zJztcclxuaW1wb3J0IHsgSGlzdG9yeSB9IGZyb20gJy4uL2hpc3RvcnkvdHlwZXMnO1xyXG5cclxuLy8g5a6a5LmJY29ubmVjdC1yb3V0ZXLlr7nlupTnmoRyZWR1eCBkaXNwYXRjaOWHveaVsFxyXG5leHBvcnQgZnVuY3Rpb24gcm91dGVyTWlkZGxld2FyZShoaXN0b3J5OiBIaXN0b3J5KSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKF86IGFueSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG5leHQ6IGFueSkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24oYWN0aW9uOiBBY3Rpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKGFjdGlvbi50eXBlICE9PSBBY3Rpb25OYW1lLkNBTExfSElTVE9SWV9NRVRIT0QpIHtcclxuICAgICAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHsgcGF5bG9hZDogeyBtZXRob2QsIGFyZ3MgfSB9ID0gYWN0aW9uO1xyXG4gICAgICAgIGlmIChtZXRob2QgaW4gaGlzdG9yeSkge1xyXG4gICAgICAgICAgKGhpc3RvcnkgYXMgYW55KVttZXRob2RdKC4uLmFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH07XHJcbiAgfTtcclxufVxyXG4iLCJpbXBvcnQgeyBjcmVhdGVDb25uZWN0Um91dGVyIH0gZnJvbSAnLi9yZWR1Y2VyJztcclxuXHJcbmV4cG9ydCB7IGdldENvbm5lY3RlZFJvdXRlciB9IGZyb20gJy4vY29ubmVjdGVkUm91dGVyJztcclxuZXhwb3J0IGNvbnN0IGNvbm5lY3RSb3V0ZXIgPSBjcmVhdGVDb25uZWN0Um91dGVyKCk7XHJcbmV4cG9ydCB7IHJvdXRlck1pZGRsZXdhcmUgfSBmcm9tICcuL2Rpc3BhdGNoJztcclxuIiwiaW1wb3J0IHsgTG9jYXRpb24gYXMgSExvY2F0aW9uIH0gZnJvbSAnLi4vaGlzdG9yeS90eXBlcyc7XHJcbmltcG9ydCB7IGdldENvbm5lY3RlZFJvdXRlciB9IGZyb20gJy4uL2Nvbm5lY3Qtcm91dGVyJztcclxuXHJcbnR5cGUgTG9jYXRpb248UyA9IHVua25vd24+ID0gT21pdDxITG9jYXRpb248Uz4sICdrZXknPjtcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT0gaGlzdG9yeSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgeyBMb2NhdGlvbiB9O1xyXG5leHBvcnQgdHlwZSB7IEhpc3RvcnkgfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuXHJcbmV4cG9ydCB7IGNyZWF0ZUJyb3dzZXJIaXN0b3J5IH0gZnJvbSAnLi4vaGlzdG9yeS9icm93ZXJIaXN0b3J5JztcclxuZXhwb3J0IHsgY3JlYXRlSGFzaEhpc3RvcnkgfSBmcm9tICcuLi9oaXN0b3J5L2hhc2hIaXN0b3J5JztcclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgX19Sb3V0ZXJDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0JztcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT0gVVJMIHBhcnNlciA9PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgeyBtYXRjaFBhdGgsIGdlbmVyYXRlUGF0aCB9IGZyb20gJy4vbWF0Y2hlci9wYXJzZXInO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PSBSb3V0ZXIgSG9va3MgPT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IHsgdXNlSGlzdG9yeSwgdXNlTG9jYXRpb24sIHVzZVBhcmFtcywgdXNlUm91dGVNYXRjaCB9IGZyb20gJy4vaG9va3MnO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PSBSb3V0ZXIgZnVuY3Rpb24gY29tcG9uZW50ID09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUm91dGUgfSBmcm9tICcuL1JvdXRlJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBSb3V0ZXIgfSBmcm9tICcuL1JvdXRlcic7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3dpdGNoIH0gZnJvbSAnLi9Td2l0Y2gnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFJlZGlyZWN0IH0gZnJvbSAnLi9SZWRpcmVjdCc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUHJvbXB0IH0gZnJvbSAnLi9Qcm9tcHQnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIHdpdGhSb3V0ZXIgfSBmcm9tICcuL3dpdGhSb3V0ZXInO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEhhc2hSb3V0ZXIgfSBmcm9tICcuL0hhc2hSb3V0ZXInO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEJyb3dzZXJSb3V0ZXIgfSBmcm9tICcuL0Jyb3dzZXJSb3V0ZXInO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIExpbmsgfSBmcm9tICcuL0xpbmsnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIE5hdkxpbmsgfSBmcm9tICcuL05hdkxpbmsnO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PSBSb3V0ZXIgVHlwZXMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IHR5cGUgeyBSb3V0ZUNvbXBvbmVudFByb3BzLCBSb3V0ZUNoaWxkcmVuUHJvcHMsIFJvdXRlUHJvcHMgfSBmcm9tICcuL1JvdXRlJztcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ29ubmVjdC1yb3V0ZXIgPT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IHsgY29ubmVjdFJvdXRlciwgcm91dGVyTWlkZGxld2FyZSB9IGZyb20gJy4uL2Nvbm5lY3Qtcm91dGVyJztcclxuZXhwb3J0IGNvbnN0IENvbm5lY3RlZFJvdXRlciA9IGdldENvbm5lY3RlZFJvdXRlcignUmVkdXgnKTtcclxuZXhwb3J0IGNvbnN0IENvbm5lY3RlZEhSb3V0ZXIgPSBnZXRDb25uZWN0ZWRSb3V0ZXIoJ0hvcml6b25YQ29tcGF0Jyk7Il0sIm5hbWVzIjpbIl9leHRlbmRzIiwiT2JqZWN0IiwiYXNzaWduIiwiYmluZCIsInRhcmdldCIsImkiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJzb3VyY2UiLCJrZXkiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJhcHBseSIsIkFjdGlvbk5hbWUiLCJvbkxvY2F0aW9uQ2hhbmdlZCIsImxvY2F0aW9uIiwiYWN0aW9uIiwiaXNGaXJzdFJlbmRlcmluZyIsInVuZGVmaW5lZCIsInR5cGUiLCJMT0NBVElPTl9DSEFOR0UiLCJwYXlsb2FkIiwiaW5qZWN0UXVlcnlQYXJhbXMiLCJxdWVyeSIsInF1ZXJ5U3RyaW5nIiwic2VhcmNoIiwicXVlcnlPYmplY3QiLCJwYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJmb3JFYWNoIiwidmFsdWUiLCJjcmVhdGVDb25uZWN0Um91dGVyIiwiaGlzdG9yeSIsImluaXRSb3V0ZXJTdGF0ZSIsInN0YXRlIiwiX3JlZiIsImlzQnJvd3NlciIsIndpbmRvdyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldERlZmF1bHRDb25maXJtYXRpb24iLCJtZXNzYWdlIiwiY2FsbEJhY2siLCJjb25maXJtIiwiaXNTdXBwb3J0SGlzdG9yeSIsImlzU3VwcG9ydHNQb3BTdGF0ZSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImluZGV4T2YiLCJBY3Rpb24iLCJFdmVudFR5cGUiLCJjcmVhdGVQYXRoIiwicGF0aCIsImhhc2giLCJwYXRobmFtZSIsInN0YXJ0c1dpdGgiLCJwYXJzZVBhdGgiLCJ1cmwiLCJwYXJzZWRQYXRoIiwiaGFzaElkeCIsInN1YnN0cmluZyIsInNlYXJjaElkeCIsImNyZWF0ZUxvY2F0aW9uIiwiY3VycmVudCIsInRvIiwidXJsT2JqIiwiZ2V0UmFuZEtleSIsImdlblJhbmRvbUtleSIsImlzTG9jYXRpb25FcXVhbCIsInAxIiwicDIiLCJhZGRIZWFkU2xhc2giLCJzdHJpcEhlYWRTbGFzaCIsIm5vcm1hbGl6ZVNsYXNoIiwidGVtcFBhdGgiLCJoYXNCYXNlbmFtZSIsInByZWZpeCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJjaGFyQXQiLCJzdHJpcEJhc2VuYW1lIiwiY3JlYXRlTWVtb3J5UmVjb3JkIiwiaW5pdFZhbCIsImZuIiwidmlzaXRlZFJlY29yZCIsImdldERlbHRhIiwiZm9ybSIsInRvSWR4IiwibGFzdEluZGV4T2YiLCJmcm9tSWR4IiwiYWRkUmVjb3JkIiwibmV3UmVjb3JkIiwiY3VyVmFsIiwiTmV3VmFsIiwicHVzaCIsInByZXZJZHgiLCJuZXdWaXNpdGVkUmVjb3JkIiwic2xpY2UiLCJyZXBsYWNlIiwiZW5kIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwiX2NsYXNzQ2FsbENoZWNrIiwiaW5zdGFuY2UiLCJDb25zdHJ1Y3RvciIsIlR5cGVFcnJvciIsIl90eXBlb2YiLCJvYmoiLCJTeW1ib2wiLCJpdGVyYXRvciIsImNvbnN0cnVjdG9yIiwiX3RvUHJpbWl0aXZlIiwiaW5wdXQiLCJoaW50IiwicHJpbSIsInRvUHJpbWl0aXZlIiwicmVzIiwiU3RyaW5nIiwiTnVtYmVyIiwiX3RvUHJvcGVydHlLZXkiLCJhcmciLCJfZGVmaW5lUHJvcGVydGllcyIsInByb3BzIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsImRlZmluZVByb3BlcnR5IiwidG9Qcm9wZXJ0eUtleSIsIl9jcmVhdGVDbGFzcyIsInByb3RvUHJvcHMiLCJzdGF0aWNQcm9wcyIsIlRyYW5zaXRpb25NYW5hZ2VyIiwicHJvbXB0IiwibGlzdGVuZXJzIiwic2V0UHJvbXB0IiwiX3RoaXMiLCJhZGRMaXN0ZW5lciIsImZ1bmMiLCJfdGhpczIiLCJpc0FjdGl2ZSIsImxpc3RlbmVyIiwiYXJncyIsImZpbHRlciIsIml0ZW0iLCJub3RpZnlMaXN0ZW5lcnMiLCJfaXRlcmF0b3IiLCJfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlciIsIl9zdGVwIiwicyIsIm4iLCJkb25lIiwiZXJyIiwiZSIsImYiLCJjb25maXJtSnVtcFRvIiwidXNlckNvbmZpcm1hdGlvbkZ1bmMiLCJyZXN1bHQiLCJ3YXJuaW5nIiwiY29uZGl0aW9uIiwiY29uc29sZSIsIndhcm4iLCJnZXRCYXNlSGlzdG9yeSIsInRyYW5zaXRpb25NYW5hZ2VyIiwic2V0TGlzdGVuZXIiLCJicm93c2VySGlzdG9yeSIsImdvIiwic3RlcCIsImdvQmFjayIsImdvRm9yd2FyZCIsImxpc3RlbiIsImNhbmNlbCIsImlzQmxvY2tlZCIsImJsb2NrIiwidW5ibG9jayIsImdldFVwZGF0ZVN0YXRlRnVuYyIsImhpc3RvcnlQcm9wcyIsIm5leHRTdGF0ZSIsImNyZWF0ZUJyb3dzZXJIaXN0b3J5Iiwib3B0aW9ucyIsInN1cHBvcnRIaXN0b3J5IiwiaXNTdXBwb3J0UG9wU3RhdGUiLCJfb3B0aW9ucyRmb3JjZVJlZnJlc2giLCJmb3JjZVJlZnJlc2giLCJfb3B0aW9ucyRnZXRVc2VyQ29uZmkiLCJnZXRVc2VyQ29uZmlybWF0aW9uIiwiYmFzZW5hbWUiLCJpbml0TG9jYXRpb24iLCJnZXRMb2NhdGlvbiIsImdldEhpc3RvcnlTdGF0ZSIsInJlY29yZE9wZXJhdG9yIiwibCIsIl9nZXRCYXNlSGlzdG9yeSIsInBvcCIsImNyZWF0ZUhyZWYiLCJ1cGRhdGVTdGF0ZSIsImhpc3RvcnlTdGF0ZSIsIl93aW5kb3ckbG9jYXRpb24iLCJmb3JjZUp1bXAiLCJoYW5kbGVQb3BTdGF0ZSIsImNhbGxiYWNrIiwiaXNKdW1wIiwicmV2ZXJ0UG9wU3RhdGUiLCJwb3BTdGF0ZUxpc3RlbmVyIiwiZXZlbnQiLCJoYXNoQ2hhbmdlTGlzdGVuZXIiLCJsaXN0ZW5lckNvdW50IiwiY291bnQiLCJhZGRFdmVudExpc3RlbmVyIiwiUG9wU3RhdGUiLCJIYXNoQ2hhbmdlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRlbHRhIiwiaHJlZiIsInB1c2hTdGF0ZSIsInJlcGxhY2VTdGF0ZSIsInN0cmlwSGFzaCIsImlkeCIsImdldEhhc2hDb250ZW50IiwiY3JlYXRlSGFzaEhpc3RvcnkiLCJvcHRpb24iLCJfb3B0aW9uJGhhc2hUeXBlIiwiaGFzaFR5cGUiLCJfb3B0aW9uJGdldFVzZXJDb25maXIiLCJwYXRoRGVjb2RlciIsInBhdGhFbmNvZGVyIiwiaGFzaFBhdGgiLCJtZW1SZWNvcmRzIiwidGFnIiwicXVlcnlTZWxlY3RvciIsImJhc2UiLCJnZXRBdHRyaWJ1dGUiLCJmb3JjZU5leHRQb3AiLCJpZ25vcmVQYXRoIiwiZW5jb2RlZFBhdGgiLCJoYW5kbGVIYXNoQ2hhbmdlIiwicHJldkxvY2F0aW9uIiwiY3JlYXRlTmFtZWRDb250ZXh0IiwibmFtZSIsImRlZmF1bHRWYWx1ZSIsImNvbnRleHQiLCJjcmVhdGVDb250ZXh0IiwiZGlzcGxheU5hbWUiLCJSb3V0ZXJDb250ZXh0IiwiVG9rZW5UeXBlIiwiY2xlYW5QYXRoIiwic2NvcmVDb21wYXJlIiwic2NvcmUxIiwic2NvcmUyIiwic2NvcmUxTGVuZ3RoIiwic2NvcmUyTGVuZ3RoIiwibWluIiwiZXNjYXBlU3RyIiwic3RyIiwidmFsaWRDaGFyIiwibGV4ZXIiLCJ0b2tlbnMiLCJ1cmxQYXRoIiwiRXJyb3IiLCJnZXRMaXRlcmFsIiwidGVzdCIsInNraXBDaGFyIiwiY3VyQ2hhciIsInByZXZDaGFyIiwiRGVsaW1pdGVyIiwiUGFyYW0iLCJXaWxkQ2FyZCIsIlN0YXRpYyIsIkxCcmFja2V0IiwiUkJyYWNrZXQiLCJQYXR0ZXJuIiwiTWF0Y2hTY29yZSIsImRlZmF1bHRPcHRpb24iLCJjYXNlU2Vuc2l0aXZlIiwic3RyaWN0TW9kZSIsImV4YWN0IiwiUkVHRVhfQ0hBUlNfUkUiLCJCQVNFX1BBUkFNX1BBVFRFUk4iLCJEZWZhdWx0RGVsaW1pdGVyIiwiY3JlYXRlUGF0aFBhcnNlciIsIl9vcHRpb24kY2FzZVNlbnNpdGl2ZSIsIl9vcHRpb24kc3RyaWN0TW9kZSIsIl9vcHRpb24kZXhhY3QiLCJwYXR0ZXJuIiwia2V5cyIsInNjb3JlcyIsIm9ubHlIYXNXaWxkQ2FyZCIsInRva2VuQ291bnQiLCJsYXN0VG9rZW4iLCJ0b2tlbklkeCIsInRva2VuIiwibmV4dFRva2VuIiwic3RhdGljIiwicGFyYW1SZWdleHAiLCJwYXJhbSIsIndpbGRjYXJkIiwicGxhY2Vob2xkZXIiLCJpc1dpbGRDYXJkIiwiZmxhZyIsInJlZ2V4cCIsIlJlZ0V4cCIsInBhcnNlIiwicmVNYXRjaCIsIm1hdGNoIiwibWF0Y2hlZFBhdGgiLCJwYXJzZVNjb3JlIiwiQXJyYXkiLCJmcm9tIiwic3BsaXQiLCJpc0FycmF5IiwiX3BhcmFtcyQiLCJzcGxpY2UiLCJjb25jYXQiLCJmaWxsIiwiaXNFeGFjdCIsInNjb3JlIiwiY29tcGlsZSIsIndpbGRDYXJkIiwiam9pbiIsIm1hdGNoUGF0aCIsInBhdHRlcm5zIiwibWF0Y2hlZFJlc3VsdHMiLCJfaXRlcmF0b3IyIiwiX3N0ZXAyIiwicGFyc2VyIiwibWF0Y2hlZCIsInNvcnQiLCJhIiwiYiIsImdlbmVyYXRlUGF0aCIsInVzZUhpc3RvcnkiLCJ1c2VDb250ZXh0IiwidXNlTG9jYXRpb24iLCJ1c2VQYXJhbXMiLCJ1c2VSb3V0ZU1hdGNoIiwiUm91dGUiLCJjb21wdXRlZCIsImNoaWxkcmVuIiwiY29tcG9uZW50IiwicmVuZGVyIiwicm91dGVMb2NhdGlvbiIsIm5ld1Byb3BzIiwiQ2hpbGRyZW4iLCJnZXRDaGlsZHJlbiIsIlJlYWN0IiwiUHJvdmlkZXIiLCJSb3V0ZXIiLCJfcHJvcHMkY2hpbGRyZW4iLCJfdXNlU3RhdGUiLCJ1c2VTdGF0ZSIsInNldExvY2F0aW9uIiwicGVuZGluZ0xvY2F0aW9uIiwidXNlUmVmIiwidW5MaXN0ZW4iLCJ1c2VMYXlvdXRFZmZlY3QiLCJpbml0Q29udGV4dFZhbHVlIiwidXNlTWVtbyIsIl9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlIiwiZXhjbHVkZWQiLCJzb3VyY2VLZXlzIiwiTGlmZUN5Y2xlIiwicHJldlByb3BzIiwiaXNNb3VudCIsIm9uTW91bnQiLCJvblVwZGF0ZSIsIm9uVW5tb3VudCIsIlJlZGlyZWN0IiwiX3Byb3BzJHB1c2giLCJjYWxjTG9jYXRpb24iLCJuYXZpZ2F0ZSIsIl9jYWxjTG9jYXRpb24iLCJfZXhjbHVkZWQiLCJvbk1vdW50RnVuYyIsIm9uVXBkYXRlRnVuYyIsInByZXZQYXRoIiwiZGF0YSIsIlN3aXRjaCIsImVsZW1lbnQiLCJub2RlIiwiaXNWYWxpZEVsZW1lbnQiLCJzdHJpY3QiLCJzZW5zaXRpdmUiLCJjbG9uZUVsZW1lbnQiLCJQcm9tcHQiLCJfcHJvcHMkd2hlbiIsIndoZW4iLCJyZWxlYXNlIiwib25Vbm1vdW50RnVuYyIsIndpdGhSb3V0ZXIiLCJDb21wb25lbnQiLCJDb21wb25lbnRXaXRoUm91dGVyUHJvcCIsIl91c2VDb250ZXh0Iiwicm91dGVQcm9wcyIsIkhhc2hSb3V0ZXIiLCJoaXN0b3J5UmVmIiwiQnJvd3NlclJvdXRlciIsImlzTW9kaWZpZWRFdmVudCIsIm1ldGFLZXkiLCJhbHRLZXkiLCJjdHJsS2V5Iiwic2hpZnRLZXkiLCJjaGVja1RhcmdldCIsIkxpbmsiLCJvbkNsaWNrIiwib3RoZXIiLCJsaW5rQ2xpY2tFdmVudCIsInByZXZlbnREZWZhdWx0IiwiZGVmYXVsdFByZXZlbnRlZCIsImJ1dHRvbiIsImlzU2FtZVBhdGgiLCJsaW5rUHJvcHMiLCJOYXZMaW5rIiwicmVzdCIsIkNvbnRleHQiLCJ0b0xvY2F0aW9uIiwiZXNjYXBlZFBhdGgiLCJpc0xpbmtBY3RpdmUiLCJwYWdlIiwib3RoZXJQcm9wcyIsImdldEluIiwic3RhdGVSZWFkZXIiLCJzdG9yZVR5cGUiLCJpc1JvdXRlciIsImdldFJvdXRlciIsInJvdXRlciIsImdldEFjdGlvbiIsImdldFNlYXJjaCIsImdldEhhc2giLCJoQ29ubmVjdCIsInJlZHV4QWRhcHRlciIsImNvbm5lY3QiLCJDb25uZWN0ZWRSb3V0ZXJXaXRob3V0TWVtbyIsInN0b3JlIiwib21pdFJvdXRlciIsIl9zdGF0ZVJlYWRlciIsInVuc3Vic2NyaWJlIiwic3Vic2NyaWJlIiwiX2dldExvY2F0aW9uIiwiZ2V0U3RhdGUiLCJwYXRobmFtZUluU3RvcmUiLCJzZWFyY2hJblN0b3JlIiwiaGFzaEluU3RvcmUiLCJzdGF0ZUluU3RvcmUiLCJfaGlzdG9yeSRsb2NhdGlvbiIsInBhdGhuYW1lSW5IaXN0b3J5Iiwic2VhcmNoSW5IaXN0b3J5IiwiaGFzaEluSGlzdG9yeSIsInN0YXRlSW5IaXN0b3J5IiwiaGFuZGxlTG9jYXRpb25DaGFuZ2UiLCJub0luaXRpYWxQb3AiLCJGcmFnbWVudCIsImNoaWxkcmVuTm9kZSIsImdldENvbm5lY3RlZFJvdXRlciIsIm1hcERpc3BhdGNoVG9Qcm9wcyIsImRpc3BhdGNoIiwiQ29ubmVjdGVkUm91dGVyIiwibWVtbyIsIkNvbm5lY3RlZFJvdXRlcldpdGhDb250ZXh0IiwiUmVhY3RSZWR1eENvbnRleHQiLCJDb25zdW1lciIsInJvdXRlck1pZGRsZXdhcmUiLCJfIiwibmV4dCIsIkNBTExfSElTVE9SWV9NRVRIT0QiLCJfYWN0aW9uJHBheWxvYWQiLCJtZXRob2QiLCJjb25uZWN0Um91dGVyIiwiQ29ubmVj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
