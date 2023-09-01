'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

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
  var context = React.createContext(defaultValue);
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
  return React.useContext(RouterContext).history;
}
function useLocation() {
  return React.useContext(RouterContext).location;
}
function useParams() {
  var match = React.useContext(RouterContext).match;
  return match ? match.params : {};
}
function useRouteMatch(path) {
  var pathname = useLocation().pathname;
  var match = React.useContext(RouterContext).match;
  if (path) {
    return matchPath(pathname, path);
  }
  return match;
}

function Route(props) {
  var context = React.useContext(RouterContext);
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
  if (Array.isArray(children) && React.Children.count(children) === 0) {
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
        return React.createElement(component, newProps);
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
  return /*#__PURE__*/React__namespace.createElement(RouterContext.Provider, {
    value: newProps
  }, getChildren());
}

function Router(props) {
  var history = props.history,
    _props$children = props.children,
    children = _props$children === void 0 ? null : _props$children;
  var _useState = React.useState(props.history.location),
    location = _useState[0],
    setLocation = _useState[1];
  var pendingLocation = React.useRef(null);

  // 在Router加载时就监听history地址变化，以保证在始渲染时重定向能正确触发
  var unListen = history.listen(function (arg) {
    pendingLocation.current = arg.location;
  });

  // 模拟componentDidMount和componentWillUnmount
  React.useLayoutEffect(function () {
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
  var initContextValue = React.useMemo(function () {
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
  return /*#__PURE__*/React__namespace.createElement(RouterContext.Provider, {
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
  var prevProps = React.useRef(null);
  var isMount = React.useRef(false);
  var onMount = props.onMount,
    onUpdate = props.onUpdate,
    onUnmount = props.onUnmount;
  React.useLayoutEffect(function () {
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
  React.useLayoutEffect(function () {
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
  var context = React.useContext(RouterContext);
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
  return /*#__PURE__*/React__namespace.createElement(LifeCycle, {
    onMount: onMountFunc,
    onUpdate: onUpdateFunc,
    data: path
  });
}

function Switch(props) {
  var context = React.useContext(RouterContext);
  var location = props.location || context.location;
  var element = null;
  var match = null;

  // 使用forEach不会给React.ReactNode增加key属性,防止重新渲染
  React.Children.forEach(props.children, function (node) {
    if (match === null && React.isValidElement(node)) {
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
    return React.cloneElement(element, {
      location: location,
      computed: match
    });
  }
  return null;
}

function Prompt(props) {
  var context = React.useContext(RouterContext);
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
  return /*#__PURE__*/React__namespace.createElement(LifeCycle, {
    onMount: onMountFunc,
    onUpdate: onUpdateFunc,
    onUnmount: onUnmountFunc,
    data: message
  });
}

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    var _useContext = React.useContext(RouterContext),
      history = _useContext.history,
      location = _useContext.location,
      match = _useContext.match;
    var routeProps = {
      history: history,
      location: location,
      match: match
    };
    return /*#__PURE__*/React__namespace.createElement(Component, _extends({}, props, routeProps));
  }
  return ComponentWithRouterProp;
}

function HashRouter(props) {
  var historyRef = React.useRef();
  if (historyRef.current === null || historyRef.current === undefined) {
    historyRef.current = createHashHistory({
      basename: props.basename,
      getUserConfirmation: props.getUserConfirmation,
      hashType: props.hashType
    });
  }
  return /*#__PURE__*/React__namespace.createElement(Router, {
    history: historyRef.current
  }, props.children);
}

function BrowserRouter(props) {
  // 使用Ref持有History对象，防止重复渲染
  var historyRef = React.useRef();
  if (historyRef.current === null || historyRef.current === undefined) {
    historyRef.current = createBrowserHistory({
      basename: props.basename,
      forceRefresh: props.forceRefresh,
      getUserConfirmation: props.getUserConfirmation
    });
  }
  return /*#__PURE__*/React__namespace.createElement(Router, {
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
  var context = React.useContext(RouterContext);
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
  return React__namespace.createElement(tag, linkProps);
}

var _excluded = ["to", "isActive"];
function NavLink(props) {
  var to = props.to,
    isActive = props.isActive,
    rest = _objectWithoutPropertiesLoose(props, _excluded);
  var context = React.useContext(RouterContext);
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
  return /*#__PURE__*/React__namespace.createElement(Link, _extends({
    to: to
  }, otherProps));
}

exports.BrowserRouter = BrowserRouter;
exports.HashRouter = HashRouter;
exports.Link = Link;
exports.NavLink = NavLink;
exports.Prompt = Prompt;
exports.Redirect = Redirect;
exports.Route = Route;
exports.Router = Router;
exports.Switch = Switch;
exports.__RouterContext = RouterContext;
exports.createBrowserHistory = createBrowserHistory;
exports.createHashHistory = createHashHistory;
exports.generatePath = generatePath;
exports.matchPath = matchPath;
exports.useHistory = useHistory;
exports.useLocation = useLocation;
exports.useParams = useParams;
exports.useRouteMatch = useRouteMatch;
exports.withRouter = withRouter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGlzdG9yeS9kb20udHMiLCIuLi8uLi9zcmMvaGlzdG9yeS90eXBlcy50cyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9leHRlbmRzLmpzIiwiLi4vLi4vc3JjL2hpc3RvcnkvdXRpbHMudHMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vY2xhc3NDYWxsQ2hlY2suanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vdHlwZW9mLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3RvUHJpbWl0aXZlLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3RvUHJvcGVydHlLZXkuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vY3JlYXRlQ2xhc3MuanMiLCIuLi8uLi9zcmMvaGlzdG9yeS90cmFuc2l0aW9uTWFuYWdlci50cyIsIi4uLy4uL3NyYy9oaXN0b3J5L3dhcmluZy50cyIsIi4uLy4uL3NyYy9oaXN0b3J5L2Jhc2VIaXN0b3J5LnRzIiwiLi4vLi4vc3JjL2hpc3RvcnkvYnJvd2VySGlzdG9yeS50cyIsIi4uLy4uL3NyYy9oaXN0b3J5L2hhc2hIaXN0b3J5LnRzIiwiLi4vLi4vc3JjL3JvdXRlci9jb250ZXh0LnRzeCIsIi4uLy4uL3NyYy9yb3V0ZXIvbWF0Y2hlci90eXBlcy50cyIsIi4uLy4uL3NyYy9yb3V0ZXIvbWF0Y2hlci91dGlscy50cyIsIi4uLy4uL3NyYy9yb3V0ZXIvbWF0Y2hlci9sZXhlci50cyIsIi4uLy4uL3NyYy9yb3V0ZXIvbWF0Y2hlci9wYXJzZXIudHMiLCIuLi8uLi9zcmMvcm91dGVyL2hvb2tzLnRzIiwiLi4vLi4vc3JjL3JvdXRlci9Sb3V0ZS50c3giLCIuLi8uLi9zcmMvcm91dGVyL1JvdXRlci50c3giLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZS5qcyIsIi4uLy4uL3NyYy9yb3V0ZXIvbGlmZUN5Y2xlSG9vay50cyIsIi4uLy4uL3NyYy9yb3V0ZXIvUmVkaXJlY3QudHN4IiwiLi4vLi4vc3JjL3JvdXRlci9Td2l0Y2gudHN4IiwiLi4vLi4vc3JjL3JvdXRlci9Qcm9tcHQudHN4IiwiLi4vLi4vc3JjL3JvdXRlci93aXRoUm91dGVyLnRzeCIsIi4uLy4uL3NyYy9yb3V0ZXIvSGFzaFJvdXRlci50c3giLCIuLi8uLi9zcmMvcm91dGVyL0Jyb3dzZXJSb3V0ZXIudHN4IiwiLi4vLi4vc3JjL3JvdXRlci9MaW5rLnRzeCIsIi4uLy4uL3NyYy9yb3V0ZXIvTmF2TGluay50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGlzQnJvd3NlcigpOiBib29sZWFuIHtcclxuICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50ICYmIHR5cGVvZiB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCA9PT0gJ2Z1bmN0aW9uJztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRDb25maXJtYXRpb24obWVzc2FnZTogc3RyaW5nLCBjYWxsQmFjazogKHJlc3VsdDogYm9vbGVhbikgPT4gdm9pZCkge1xyXG4gIGNhbGxCYWNrKHdpbmRvdy5jb25maXJtKG1lc3NhZ2UpKTtcclxufVxyXG5cclxuLy8g5Yik5pat5rWP6KeI5Zmo5piv5ZCm5pSv5oyBcHVzaFN0YXRl5pa55rOV77yMcHVzaFN0YXRl5pivYnJvd3Nlckhpc3Rvcnnlrp7njrDnmoTln7rnoYBcclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3VwcG9ydEhpc3RvcnkoKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIGlzQnJvd3NlcigpICYmIHdpbmRvdy5oaXN0b3J5ICYmICdwdXNoU3RhdGUnIGluIHdpbmRvdy5oaXN0b3J5O1xyXG59XHJcblxyXG4vLyDliKTmlq3mtY/op4jlmajmmK/lkKbmlK/mjIFQb3BTdGF0ZeS6i+S7tlxyXG5leHBvcnQgZnVuY3Rpb24gaXNTdXBwb3J0c1BvcFN0YXRlKCk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdUcmlkZW50JykgPT09IC0xO1xyXG59XHJcbiIsImV4cG9ydCB0eXBlIEJhc2VPcHRpb24gPSB7XHJcbiAgYmFzZW5hbWU/OiBzdHJpbmc7XHJcbiAgZ2V0VXNlckNvbmZpcm1hdGlvbj86IENvbmZpcm1hdGlvbkZ1bmM7XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEhpc3RvcnlQcm9wczxUID0gdW5rbm93bj4ge1xyXG4gIHJlYWRvbmx5IGFjdGlvbjogQWN0aW9uO1xyXG5cclxuICByZWFkb25seSBsb2NhdGlvbjogTG9jYXRpb248VD47XHJcblxyXG4gIGxlbmd0aDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEhpc3Rvcnk8VCA9IHVua25vd24+IGV4dGVuZHMgSGlzdG9yeVByb3BzPFQ+IHtcclxuICBjcmVhdGVIcmVmKHBhdGg6IFBhcnRpYWw8UGF0aD4pOiBzdHJpbmc7XHJcblxyXG4gIHB1c2godG86IFRvLCBzdGF0ZT86IFQpOiB2b2lkO1xyXG5cclxuICByZXBsYWNlKHRvOiBUbywgc3RhdGU/OiBUKTogdm9pZDtcclxuXHJcbiAgbGlzdGVuKGxpc3RlbmVyOiBMaXN0ZW5lcjxUPik6ICgpID0+IHZvaWQ7XHJcblxyXG4gIGJsb2NrKHByb21wdDogUHJvbXB0PFQ+KTogKCkgPT4gdm9pZDtcclxuXHJcbiAgZ28oaW5kZXg6IG51bWJlcik6IHZvaWQ7XHJcblxyXG4gIGdvQmFjaygpOiB2b2lkO1xyXG5cclxuICBnb0ZvcndhcmQoKTogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGVudW0gQWN0aW9uIHtcclxuICBwb3AgPSAnUE9QJyxcclxuICBwdXNoID0gJ1BVU0gnLFxyXG4gIHJlcGxhY2UgPSAnUkVQTEFDRScsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XHJcbiAgUG9wU3RhdGUgPSAncG9wc3RhdGUnLFxyXG4gIEhhc2hDaGFuZ2UgPSAnaGFzaGNoYW5nZScsXHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFBhdGggPSB7XHJcbiAgcGF0aG5hbWU6IHN0cmluZztcclxuXHJcbiAgc2VhcmNoOiBzdHJpbmc7XHJcblxyXG4gIGhhc2g6IHN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEhpc3RvcnlTdGF0ZTxUPiA9IHtcclxuICBzdGF0ZT86IFQ7XHJcblxyXG4gIGtleTogc3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRGVmYXVsdFN0YXRlVHlwZSA9IHVua25vd247XHJcblxyXG5leHBvcnQgdHlwZSBMb2NhdGlvbjxUID0gdW5rbm93bj4gPSBQYXRoICYgSGlzdG9yeVN0YXRlPFQ+O1xyXG5cclxuZXhwb3J0IHR5cGUgVG8gPSBzdHJpbmcgfCBQYXJ0aWFsPFBhdGg+O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaXN0ZW5lcjxUID0gdW5rbm93bj4ge1xyXG4gIChuYXZpZ2F0aW9uOiBOYXZpZ2F0aW9uPFQ+KTogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBOYXZpZ2F0aW9uPFQgPSB1bmtub3duPiB7XHJcbiAgYWN0aW9uOiBBY3Rpb247XHJcblxyXG4gIGxvY2F0aW9uOiBMb2NhdGlvbjxUPjtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgUHJvbXB0PFM+ID0gc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwgfCAoKGxvY2F0aW9uOiBMb2NhdGlvbjxTPiwgYWN0aW9uOiBBY3Rpb24pID0+IHZvaWQpO1xyXG5cclxuZXhwb3J0IHR5cGUgQ2FsbEJhY2tGdW5jID0gKGlzSnVtcDogYm9vbGVhbikgPT4gdm9pZDtcclxuXHJcbmV4cG9ydCB0eXBlIENvbmZpcm1hdGlvbkZ1bmMgPSAobWVzc2FnZTogc3RyaW5nLCBjYWxsQmFjazogQ2FsbEJhY2tGdW5jKSA9PiB2b2lkO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUTWFuYWdlcjxTPiB7XHJcbiAgc2V0UHJvbXB0KG5leHQ6IFByb21wdDxTPik6ICgpID0+IHZvaWQ7XHJcblxyXG4gIGFkZExpc3RlbmVyKGZ1bmM6IChuYXZpZ2F0aW9uOiBOYXZpZ2F0aW9uPFM+KSA9PiB2b2lkKTogKCkgPT4gdm9pZDtcclxuXHJcbiAgbm90aWZ5TGlzdGVuZXJzKGFyZ3M6IE5hdmlnYXRpb248Uz4pOiB2b2lkO1xyXG5cclxuICBjb25maXJtSnVtcFRvKFxyXG4gICAgbG9jYXRpb246IExvY2F0aW9uPFM+LFxyXG4gICAgYWN0aW9uOiBBY3Rpb24sXHJcbiAgICB1c2VyQ29uZmlybWF0aW9uRnVuYzogQ29uZmlybWF0aW9uRnVuYyxcclxuICAgIGNhbGxCYWNrOiBDYWxsQmFja0Z1bmMsXHJcbiAgKTogdm9pZDtcclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfZXh0ZW5kcygpIHtcbiAgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuICByZXR1cm4gX2V4dGVuZHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn0iLCJpbXBvcnQgeyBBY3Rpb24sIExvY2F0aW9uLCBQYXRoLCBUbyB9IGZyb20gJy4vdHlwZXMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGgocGF0aDogUGFydGlhbDxQYXRoPik6IHN0cmluZyB7XHJcbiAgY29uc3QgeyBzZWFyY2gsIGhhc2ggfSA9IHBhdGg7XHJcbiAgbGV0IHBhdGhuYW1lID0gcGF0aC5wYXRobmFtZSB8fCAnLyc7XHJcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2ggIT09ICc/Jykge1xyXG4gICAgcGF0aG5hbWUgKz0gc2VhcmNoLnN0YXJ0c1dpdGgoJz8nKSA/IHNlYXJjaCA6ICc/JyArIHNlYXJjaDtcclxuICB9XHJcbiAgaWYgKGhhc2ggJiYgaGFzaCAhPT0gJyMnKSB7XHJcbiAgICBwYXRobmFtZSArPSBoYXNoLnN0YXJ0c1dpdGgoJyMnKSA/IGhhc2ggOiAnIycgKyBoYXNoO1xyXG4gIH1cclxuICByZXR1cm4gcGF0aG5hbWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBhdGgodXJsOiBzdHJpbmcpOiBQYXJ0aWFsPFBhdGg+IHtcclxuICBpZiAoIXVybCkge1xyXG4gICAgcmV0dXJuIHt9O1xyXG4gIH1cclxuICBsZXQgcGFyc2VkUGF0aDogUGFydGlhbDxQYXRoPiA9IHt9O1xyXG5cclxuICBsZXQgaGFzaElkeCA9IHVybC5pbmRleE9mKCcjJyk7XHJcbiAgaWYgKGhhc2hJZHggPiAtMSkge1xyXG4gICAgcGFyc2VkUGF0aC5oYXNoID0gdXJsLnN1YnN0cmluZyhoYXNoSWR4KTtcclxuICAgIHVybCA9IHVybC5zdWJzdHJpbmcoMCwgaGFzaElkeCk7XHJcbiAgfVxyXG5cclxuICBsZXQgc2VhcmNoSWR4ID0gdXJsLmluZGV4T2YoJz8nKTtcclxuICBpZiAoc2VhcmNoSWR4ID4gLTEpIHtcclxuICAgIHBhcnNlZFBhdGguc2VhcmNoID0gdXJsLnN1YnN0cmluZyhzZWFyY2hJZHgpO1xyXG4gICAgdXJsID0gdXJsLnN1YnN0cmluZygwLCBzZWFyY2hJZHgpO1xyXG4gIH1cclxuICBpZiAodXJsKSB7XHJcbiAgICBwYXJzZWRQYXRoLnBhdGhuYW1lID0gdXJsO1xyXG4gIH1cclxuICByZXR1cm4gcGFyc2VkUGF0aDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2F0aW9uPFM+KGN1cnJlbnQ6IHN0cmluZyB8IExvY2F0aW9uLCB0bzogVG8sIHN0YXRlPzogUywga2V5Pzogc3RyaW5nKTogUmVhZG9ubHk8TG9jYXRpb248Uz4+IHtcclxuICBsZXQgcGF0aG5hbWUgPSB0eXBlb2YgY3VycmVudCA9PT0gJ3N0cmluZycgPyBjdXJyZW50IDogY3VycmVudC5wYXRobmFtZTtcclxuICBsZXQgdXJsT2JqID0gdHlwZW9mIHRvID09PSAnc3RyaW5nJyA/IHBhcnNlUGF0aCh0bykgOiB0bztcclxuICAvLyDpmo/mnLprZXnplb/luqblj5Y2XHJcbiAgY29uc3QgZ2V0UmFuZEtleSA9IGdlblJhbmRvbUtleSg2KTtcclxuICBjb25zdCBsb2NhdGlvbiA9IHtcclxuICAgIHBhdGhuYW1lOiBwYXRobmFtZSxcclxuICAgIHNlYXJjaDogJycsXHJcbiAgICBoYXNoOiAnJyxcclxuICAgIHN0YXRlOiBzdGF0ZSxcclxuICAgIGtleTogdHlwZW9mIGtleSA9PT0gJ3N0cmluZycgPyBrZXkgOiBnZXRSYW5kS2V5KCksXHJcbiAgICAuLi51cmxPYmosXHJcbiAgfTtcclxuICBpZiAoIWxvY2F0aW9uLnBhdGhuYW1lKSB7XHJcbiAgICBsb2NhdGlvbi5wYXRobmFtZSA9ICcvJztcclxuICB9XHJcbiAgcmV0dXJuIGxvY2F0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNMb2NhdGlvbkVxdWFsKHAxOiBQYXJ0aWFsPFBhdGg+LCBwMjogUGFydGlhbDxQYXRoPikge1xyXG4gIHJldHVybiBwMS5wYXRobmFtZSA9PT0gcDIucGF0aG5hbWUgJiYgcDEuc2VhcmNoID09PSBwMi5zZWFyY2ggJiYgcDEuaGFzaCA9PT0gcDIuaGFzaDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZEhlYWRTbGFzaChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGlmIChwYXRoWzBdID09PSAnLycpIHtcclxuICAgIHJldHVybiBwYXRoO1xyXG4gIH1cclxuICByZXR1cm4gJy8nICsgcGF0aDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwSGVhZFNsYXNoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgaWYgKHBhdGhbMF0gPT09ICcvJykge1xyXG4gICAgcmV0dXJuIHBhdGguc3Vic3RyaW5nKDEpO1xyXG4gIH1cclxuICByZXR1cm4gcGF0aDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVNsYXNoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgdGVtcFBhdGggPSBhZGRIZWFkU2xhc2gocGF0aCk7XHJcbiAgaWYgKHRlbXBQYXRoW3RlbXBQYXRoLmxlbmd0aCAtIDFdID09PSAnLycpIHtcclxuICAgIHJldHVybiB0ZW1wUGF0aC5zdWJzdHJpbmcoMCwgdGVtcFBhdGgubGVuZ3RoIC0gMSk7XHJcbiAgfVxyXG4gIHJldHVybiB0ZW1wUGF0aDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhhc0Jhc2VuYW1lKHBhdGg6IHN0cmluZywgcHJlZml4OiBzdHJpbmcpOiBCb29sZWFuIHtcclxuICByZXR1cm4gKFxyXG4gICAgcGF0aC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocHJlZml4LnRvTG93ZXJDYXNlKCkpID09PSAwICYmIFsnLycsICc/JywgJyMnLCAnJ10uaW5jbHVkZXMocGF0aC5jaGFyQXQocHJlZml4Lmxlbmd0aCkpXHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwQmFzZW5hbWUocGF0aDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGhhc0Jhc2VuYW1lKHBhdGgsIHByZWZpeCkgPyBwYXRoLnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoKSA6IHBhdGg7XHJcbn1cclxuXHJcbi8vIOS9v+eUqOmaj+acuueUn+aIkOeahEtleeiusOW9leiiq+iuv+mXrui/h+eahFVSTO+8jOW9k0Jsb2Nr6KKr6KKr6Kem5Y+R5pe25Yip55SoZGVsdGHlgLzot7PovazliLDkuYvliY3nmoTpobXpnaJcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1lbW9yeVJlY29yZDxULCBTPihpbml0VmFsOiBTLCBmbjogKGFyZzogUykgPT4gVCkge1xyXG4gIGxldCB2aXNpdGVkUmVjb3JkOiBUW10gPSBbZm4oaW5pdFZhbCldO1xyXG5cclxuICBmdW5jdGlvbiBnZXREZWx0YSh0bzogUywgZm9ybTogUyk6IG51bWJlciB7XHJcbiAgICBsZXQgdG9JZHggPSB2aXNpdGVkUmVjb3JkLmxhc3RJbmRleE9mKGZuKHRvKSk7XHJcbiAgICBpZiAodG9JZHggPT09IC0xKSB7XHJcbiAgICAgIHRvSWR4ID0gMDtcclxuICAgIH1cclxuICAgIGxldCBmcm9tSWR4ID0gdmlzaXRlZFJlY29yZC5sYXN0SW5kZXhPZihmbihmb3JtKSk7XHJcbiAgICBpZiAoZnJvbUlkeCA9PT0gLTEpIHtcclxuICAgICAgZnJvbUlkeCA9IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG9JZHggLSBmcm9tSWR4O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkUmVjb3JkKGN1cnJlbnQ6IFMsIG5ld1JlY29yZDogUywgYWN0aW9uOiBBY3Rpb24pIHtcclxuICAgIGNvbnN0IGN1clZhbCA9IGZuKGN1cnJlbnQpO1xyXG4gICAgY29uc3QgTmV3VmFsID0gZm4obmV3UmVjb3JkKTtcclxuICAgIGlmIChhY3Rpb24gPT09IEFjdGlvbi5wdXNoKSB7XHJcbiAgICAgIGNvbnN0IHByZXZJZHggPSB2aXNpdGVkUmVjb3JkLmxhc3RJbmRleE9mKGN1clZhbCk7XHJcbiAgICAgIGNvbnN0IG5ld1Zpc2l0ZWRSZWNvcmQgPSB2aXNpdGVkUmVjb3JkLnNsaWNlKDAsIHByZXZJZHggKyAxKTtcclxuICAgICAgbmV3VmlzaXRlZFJlY29yZC5wdXNoKE5ld1ZhbCk7XHJcbiAgICAgIHZpc2l0ZWRSZWNvcmQgPSBuZXdWaXNpdGVkUmVjb3JkO1xyXG4gICAgfVxyXG4gICAgaWYgKGFjdGlvbiA9PT0gQWN0aW9uLnJlcGxhY2UpIHtcclxuICAgICAgY29uc3QgcHJldklkeCA9IHZpc2l0ZWRSZWNvcmQubGFzdEluZGV4T2YoY3VyVmFsKTtcclxuICAgICAgaWYgKHByZXZJZHggIT09IC0xKSB7XHJcbiAgICAgICAgdmlzaXRlZFJlY29yZFtwcmV2SWR4XSA9IE5ld1ZhbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgZ2V0RGVsdGEsIGFkZFJlY29yZCB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZW5SYW5kb21LZXkobGVuZ3RoOiBudW1iZXIpOiAoKSA9PiBzdHJpbmcge1xyXG4gIGNvbnN0IGVuZCA9IGxlbmd0aCArIDI7XHJcbiAgcmV0dXJuICgpID0+IHtcclxuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDE4KS5zdWJzdHJpbmcoMiwgZW5kKTtcclxuICB9O1xyXG59XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiO1xuXG4gIHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICB9IDogZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBvYmogJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gIH0sIF90eXBlb2Yob2JqKTtcbn0iLCJpbXBvcnQgX3R5cGVvZiBmcm9tIFwiLi90eXBlb2YuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF90b1ByaW1pdGl2ZShpbnB1dCwgaGludCkge1xuICBpZiAoX3R5cGVvZihpbnB1dCkgIT09IFwib2JqZWN0XCIgfHwgaW5wdXQgPT09IG51bGwpIHJldHVybiBpbnB1dDtcbiAgdmFyIHByaW0gPSBpbnB1dFtTeW1ib2wudG9QcmltaXRpdmVdO1xuICBpZiAocHJpbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHJlcyA9IHByaW0uY2FsbChpbnB1dCwgaGludCB8fCBcImRlZmF1bHRcIik7XG4gICAgaWYgKF90eXBlb2YocmVzKSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHJlcztcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7XG4gIH1cbiAgcmV0dXJuIChoaW50ID09PSBcInN0cmluZ1wiID8gU3RyaW5nIDogTnVtYmVyKShpbnB1dCk7XG59IiwiaW1wb3J0IF90eXBlb2YgZnJvbSBcIi4vdHlwZW9mLmpzXCI7XG5pbXBvcnQgdG9QcmltaXRpdmUgZnJvbSBcIi4vdG9QcmltaXRpdmUuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KGFyZykge1xuICB2YXIga2V5ID0gdG9QcmltaXRpdmUoYXJnLCBcInN0cmluZ1wiKTtcbiAgcmV0dXJuIF90eXBlb2Yoa2V5KSA9PT0gXCJzeW1ib2xcIiA/IGtleSA6IFN0cmluZyhrZXkpO1xufSIsImltcG9ydCB0b1Byb3BlcnR5S2V5IGZyb20gXCIuL3RvUHJvcGVydHlLZXkuanNcIjtcbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHRvUHJvcGVydHlLZXkoZGVzY3JpcHRvci5rZXkpLCBkZXNjcmlwdG9yKTtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uc3RydWN0b3IsIFwicHJvdG90eXBlXCIsIHtcbiAgICB3cml0YWJsZTogZmFsc2VcbiAgfSk7XG4gIHJldHVybiBDb25zdHJ1Y3Rvcjtcbn0iLCJpbXBvcnQgeyBBY3Rpb24sIENhbGxCYWNrRnVuYywgQ29uZmlybWF0aW9uRnVuYywgTGlzdGVuZXIsIExvY2F0aW9uLCBOYXZpZ2F0aW9uLCBQcm9tcHQsIFRNYW5hZ2VyIH0gZnJvbSAnLi90eXBlcyc7XHJcblxyXG5jbGFzcyBUcmFuc2l0aW9uTWFuYWdlcjxTPiBpbXBsZW1lbnRzIFRNYW5hZ2VyPFM+IHtcclxuICBwcml2YXRlIHByb21wdDogUHJvbXB0PFM+O1xyXG4gIHByaXZhdGUgbGlzdGVuZXJzOiBMaXN0ZW5lcjxTPltdO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMucHJvbXB0ID0gbnVsbDtcclxuICAgIHRoaXMubGlzdGVuZXJzID0gW107XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0UHJvbXB0KHByb21wdDogUHJvbXB0PFM+KTogKCkgPT4gdm9pZCB7XHJcbiAgICB0aGlzLnByb21wdCA9IHByb21wdDtcclxuXHJcbiAgICAvLyDmuIXpmaRQcm9tcHRcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnByb21wdCA9PT0gcHJvbXB0KSB7XHJcbiAgICAgICAgdGhpcy5wcm9tcHQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8g5L2/55So5Y+R5biD6K6i6ZiF5qih5byP566h55CGaGlzdG9yeeeahOebkeWQrOiAhVxyXG4gIHB1YmxpYyBhZGRMaXN0ZW5lcihmdW5jOiBMaXN0ZW5lcjxTPik6ICgpID0+IHZvaWQge1xyXG4gICAgbGV0IGlzQWN0aXZlID0gdHJ1ZTtcclxuICAgIGNvbnN0IGxpc3RlbmVyID0gKGFyZ3M6IE5hdmlnYXRpb248Uz4pID0+IHtcclxuICAgICAgaWYgKGlzQWN0aXZlKSB7XHJcbiAgICAgICAgZnVuYyhhcmdzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgaXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgLy8g56e76Zmk5a+55bqU55qE55uR5ZCs6ICFXHJcbiAgICAgIHRoaXMubGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gbGlzdGVuZXIpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBub3RpZnlMaXN0ZW5lcnMoYXJnczogTmF2aWdhdGlvbjxTPikge1xyXG4gICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiB0aGlzLmxpc3RlbmVycykge1xyXG4gICAgICBsaXN0ZW5lcihhcmdzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb25maXJtSnVtcFRvKFxyXG4gICAgbG9jYXRpb246IExvY2F0aW9uPFM+LFxyXG4gICAgYWN0aW9uOiBBY3Rpb24sXHJcbiAgICB1c2VyQ29uZmlybWF0aW9uRnVuYzogQ29uZmlybWF0aW9uRnVuYyxcclxuICAgIGNhbGxCYWNrOiBDYWxsQmFja0Z1bmNcclxuICApIHtcclxuICAgIGlmICh0aGlzLnByb21wdCAhPT0gbnVsbCkge1xyXG4gICAgICBjb25zdCByZXN1bHQgPSB0eXBlb2YgdGhpcy5wcm9tcHQgPT09ICdmdW5jdGlvbicgPyB0aGlzLnByb21wdChsb2NhdGlvbiwgYWN0aW9uKSA6IHRoaXMucHJvbXB0O1xyXG4gICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0eXBlb2YgdXNlckNvbmZpcm1hdGlvbkZ1bmMgPT09ICdmdW5jdGlvbicgPyB1c2VyQ29uZmlybWF0aW9uRnVuYyhyZXN1bHQsIGNhbGxCYWNrKSA6IGNhbGxCYWNrKHRydWUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNhbGxCYWNrKHJlc3VsdCAhPT0gZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjYWxsQmFjayh0cnVlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyYW5zaXRpb25NYW5hZ2VyO1xyXG4iLCJmdW5jdGlvbiB3YXJuaW5nKGNvbmRpdGlvbjogYW55LCBtZXNzYWdlOiBzdHJpbmcpIHtcclxuICBpZiAoY29uZGl0aW9uKSB7XHJcbiAgICBpZiAoY29uc29sZSAmJiB0eXBlb2YgY29uc29sZS53YXJuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHdhcm5pbmc7IiwiaW1wb3J0IHsgSGlzdG9yeVByb3BzLCBMaXN0ZW5lciwgTmF2aWdhdGlvbiwgUHJvbXB0IH0gZnJvbSAnLi90eXBlcyc7XHJcbmltcG9ydCB0cmFuc2l0aW9uTWFuYWdlciBmcm9tICcuL3RyYW5zaXRpb25NYW5hZ2VyJztcclxuXHJcbi8vIOaKveWPlkJyb3dzZXJIaXN0b3J55ZKMSGFzaEhpc3RvcnnkuK3nm7jlkIznmoTmlrnms5VcclxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VIaXN0b3J5PFM+KFxyXG4gIHRyYW5zaXRpb25NYW5hZ2VyOiB0cmFuc2l0aW9uTWFuYWdlcjxTPixcclxuICBzZXRMaXN0ZW5lcjogKGRlbHRhOiBudW1iZXIpID0+IHZvaWQsXHJcbiAgYnJvd3Nlckhpc3Rvcnk6IEhpc3RvcnksXHJcbikge1xyXG4gIGZ1bmN0aW9uIGdvKHN0ZXA6IG51bWJlcikge1xyXG4gICAgYnJvd3Nlckhpc3RvcnkuZ28oc3RlcCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnb0JhY2soKSB7XHJcbiAgICBicm93c2VySGlzdG9yeS5nbygtMSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnb0ZvcndhcmQoKSB7XHJcbiAgICBicm93c2VySGlzdG9yeS5nbygxKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGxpc3RlbihsaXN0ZW5lcjogTGlzdGVuZXI8Uz4pOiAoKSA9PiB2b2lkIHtcclxuICAgIGNvbnN0IGNhbmNlbCA9IHRyYW5zaXRpb25NYW5hZ2VyLmFkZExpc3RlbmVyKGxpc3RlbmVyKTtcclxuICAgIHNldExpc3RlbmVyKDEpO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgc2V0TGlzdGVuZXIoLTEpO1xyXG4gICAgICBjYW5jZWwoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBsZXQgaXNCbG9ja2VkID0gZmFsc2U7XHJcblxyXG4gIGZ1bmN0aW9uIGJsb2NrKHByb21wdDogUHJvbXB0PFM+ID0gZmFsc2UpOiAoKSA9PiB2b2lkIHtcclxuICAgIGNvbnN0IHVuYmxvY2sgPSB0cmFuc2l0aW9uTWFuYWdlci5zZXRQcm9tcHQocHJvbXB0KTtcclxuICAgIGlmICghaXNCbG9ja2VkKSB7XHJcbiAgICAgIHNldExpc3RlbmVyKDEpO1xyXG4gICAgICBpc0Jsb2NrZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgaWYgKGlzQmxvY2tlZCkge1xyXG4gICAgICAgIGlzQmxvY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIHNldExpc3RlbmVyKC0xKTtcclxuICAgICAgfVxyXG4gICAgICB1bmJsb2NrKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0VXBkYXRlU3RhdGVGdW5jKGhpc3RvcnlQcm9wczogSGlzdG9yeVByb3BzPFM+KSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKG5leHRTdGF0ZTogTmF2aWdhdGlvbjxTPiB8IHVuZGVmaW5lZCkge1xyXG4gICAgICBpZiAobmV4dFN0YXRlKSB7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihoaXN0b3J5UHJvcHMsIG5leHRTdGF0ZSk7XHJcbiAgICAgIH1cclxuICAgICAgaGlzdG9yeVByb3BzLmxlbmd0aCA9IGJyb3dzZXJIaXN0b3J5Lmxlbmd0aDtcclxuICAgICAgY29uc3QgYXJncyA9IHsgbG9jYXRpb246IGhpc3RvcnlQcm9wcy5sb2NhdGlvbiwgYWN0aW9uOiBoaXN0b3J5UHJvcHMuYWN0aW9uIH07XHJcbiAgICAgIHRyYW5zaXRpb25NYW5hZ2VyLm5vdGlmeUxpc3RlbmVycyhhcmdzKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBnbywgZ29CYWNrLCBnb0ZvcndhcmQsIGxpc3RlbiwgYmxvY2ssIGdldFVwZGF0ZVN0YXRlRnVuYyB9O1xyXG59XHJcbiIsImltcG9ydCB7IGdldERlZmF1bHRDb25maXJtYXRpb24sIGlzU3VwcG9ydEhpc3RvcnksIGlzU3VwcG9ydHNQb3BTdGF0ZSB9IGZyb20gJy4vZG9tJztcclxuaW1wb3J0IHsgQWN0aW9uLCBCYXNlT3B0aW9uLCBEZWZhdWx0U3RhdGVUeXBlLCBFdmVudFR5cGUsIEhpc3RvcnksIEhpc3RvcnlTdGF0ZSwgTG9jYXRpb24sIFBhdGgsIFRvIH0gZnJvbSAnLi90eXBlcyc7XHJcbmltcG9ydCB7IG5vcm1hbGl6ZVNsYXNoLCBjcmVhdGVNZW1vcnlSZWNvcmQsIGNyZWF0ZVBhdGgsIGNyZWF0ZUxvY2F0aW9uLCBzdHJpcEJhc2VuYW1lIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCBUcmFuc2l0aW9uTWFuYWdlciBmcm9tICcuL3RyYW5zaXRpb25NYW5hZ2VyJztcclxuXHJcbmltcG9ydCB3YXJuaW5nIGZyb20gJy4vd2FyaW5nJztcclxuaW1wb3J0IHsgZ2V0QmFzZUhpc3RvcnkgfSBmcm9tICcuL2Jhc2VIaXN0b3J5JztcclxuXHJcbmV4cG9ydCB0eXBlIEJyb3dzZXJIaXN0b3J5T3B0aW9uID0ge1xyXG4gIC8qKlxyXG4gICAqIGZvcmNlUmVmcmVzaOS4ulRydWXml7bot7Povazml7bkvJrlvLrliLbliLfmlrDpobXpnaJcclxuICAgKi9cclxuICBmb3JjZVJlZnJlc2g/OiBib29sZWFuO1xyXG59ICYgQmFzZU9wdGlvbjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCcm93c2VySGlzdG9yeTxTID0gRGVmYXVsdFN0YXRlVHlwZT4ob3B0aW9uczogQnJvd3Nlckhpc3RvcnlPcHRpb24gPSB7fSk6IEhpc3Rvcnk8Uz4ge1xyXG4gIGNvbnN0IHN1cHBvcnRIaXN0b3J5ID0gaXNTdXBwb3J0SGlzdG9yeSgpO1xyXG4gIGNvbnN0IGlzU3VwcG9ydFBvcFN0YXRlID0gaXNTdXBwb3J0c1BvcFN0YXRlKCk7XHJcbiAgY29uc3QgYnJvd3Nlckhpc3RvcnkgPSB3aW5kb3cuaGlzdG9yeTtcclxuICBjb25zdCB7IGZvcmNlUmVmcmVzaCA9IGZhbHNlLCBnZXRVc2VyQ29uZmlybWF0aW9uID0gZ2V0RGVmYXVsdENvbmZpcm1hdGlvbiB9ID0gb3B0aW9ucztcclxuXHJcbiAgY29uc3QgYmFzZW5hbWUgPSBvcHRpb25zLmJhc2VuYW1lID8gbm9ybWFsaXplU2xhc2gob3B0aW9ucy5iYXNlbmFtZSkgOiAnJztcclxuXHJcbiAgY29uc3QgaW5pdExvY2F0aW9uID0gZ2V0TG9jYXRpb24oZ2V0SGlzdG9yeVN0YXRlKCkpO1xyXG5cclxuICBjb25zdCByZWNvcmRPcGVyYXRvciA9IGNyZWF0ZU1lbW9yeVJlY29yZDxzdHJpbmcsIExvY2F0aW9uPFM+Pihpbml0TG9jYXRpb24sIGwgPT4gbC5rZXkpO1xyXG5cclxuICBjb25zdCB0cmFuc2l0aW9uTWFuYWdlciA9IG5ldyBUcmFuc2l0aW9uTWFuYWdlcjxTPigpO1xyXG5cclxuICBjb25zdCB7IGdvLCBnb0JhY2ssIGdvRm9yd2FyZCwgbGlzdGVuLCBibG9jaywgZ2V0VXBkYXRlU3RhdGVGdW5jIH0gPSBnZXRCYXNlSGlzdG9yeTxTPihcclxuICAgIHRyYW5zaXRpb25NYW5hZ2VyLFxyXG4gICAgc2V0TGlzdGVuZXIsXHJcbiAgICBicm93c2VySGlzdG9yeSxcclxuICApO1xyXG5cclxuICBjb25zdCBoaXN0b3J5OiBIaXN0b3J5PFM+ID0ge1xyXG4gICAgYWN0aW9uOiBBY3Rpb24ucG9wLFxyXG4gICAgbGVuZ3RoOiBicm93c2VySGlzdG9yeS5sZW5ndGgsXHJcbiAgICBsb2NhdGlvbjogaW5pdExvY2F0aW9uLFxyXG4gICAgZ28sXHJcbiAgICBnb0JhY2ssXHJcbiAgICBnb0ZvcndhcmQsXHJcbiAgICBsaXN0ZW4sXHJcbiAgICBibG9jayxcclxuICAgIHB1c2gsXHJcbiAgICByZXBsYWNlLFxyXG4gICAgY3JlYXRlSHJlZixcclxuICB9O1xyXG5cclxuICBjb25zdCB1cGRhdGVTdGF0ZSA9IGdldFVwZGF0ZVN0YXRlRnVuYyhoaXN0b3J5KTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0SGlzdG9yeVN0YXRlKCkge1xyXG4gICAgcmV0dXJuIHN1cHBvcnRIaXN0b3J5ID8gd2luZG93Lmhpc3Rvcnkuc3RhdGUgOiB7fTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldExvY2F0aW9uKGhpc3RvcnlTdGF0ZTogUGFydGlhbDxIaXN0b3J5U3RhdGU8Uz4+KSB7XHJcbiAgICBjb25zdCB7IHNlYXJjaCwgaGFzaCB9ID0gd2luZG93LmxvY2F0aW9uO1xyXG4gICAgY29uc3QgeyBrZXksIHN0YXRlIH0gPSBoaXN0b3J5U3RhdGUgfHwge307XHJcbiAgICBsZXQgcGF0aG5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICBwYXRobmFtZSA9IGJhc2VuYW1lID8gc3RyaXBCYXNlbmFtZShwYXRobmFtZSwgYmFzZW5hbWUpIDogcGF0aG5hbWU7XHJcblxyXG4gICAgcmV0dXJuIGNyZWF0ZUxvY2F0aW9uPFM+KCcnLCB7IHBhdGhuYW1lLCBzZWFyY2gsIGhhc2ggfSwgc3RhdGUsIGtleSk7XHJcbiAgfVxyXG5cclxuICAvLyDmi6bmiKrpobXpnaJQT1Dkuovku7blkI7vvIzpmLLmraLov5Tlm57liLDnmoTpobXpnaLooqvph43lpI3mi6bmiKpcclxuICBsZXQgZm9yY2VKdW1wID0gZmFsc2U7XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZVBvcFN0YXRlKGxvY2F0aW9uOiBMb2NhdGlvbjxTPikge1xyXG4gICAgaWYgKGZvcmNlSnVtcCkge1xyXG4gICAgICBmb3JjZUp1bXAgPSBmYWxzZTtcclxuICAgICAgdXBkYXRlU3RhdGUodW5kZWZpbmVkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGFjdGlvbiA9IEFjdGlvbi5wb3A7XHJcblxyXG4gICAgICBjb25zdCBjYWxsYmFjayA9IChpc0p1bXA6IGJvb2xlYW4pID0+IHtcclxuICAgICAgICBpZiAoaXNKdW1wKSB7XHJcbiAgICAgICAgICAvLyDmiafooYzot7PovazooYzkuLpcclxuICAgICAgICAgIHVwZGF0ZVN0YXRlKHsgYWN0aW9uOiBhY3Rpb24sIGxvY2F0aW9uOiBsb2NhdGlvbiB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV2ZXJ0UG9wU3RhdGUobG9jYXRpb24sIGhpc3RvcnkubG9jYXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRyYW5zaXRpb25NYW5hZ2VyLmNvbmZpcm1KdW1wVG8obG9jYXRpb24sIGFjdGlvbiwgZ2V0VXNlckNvbmZpcm1hdGlvbiwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcG9wU3RhdGVMaXN0ZW5lcihldmVudDogUG9wU3RhdGVFdmVudCkge1xyXG4gICAgaGFuZGxlUG9wU3RhdGUoZ2V0TG9jYXRpb24oZXZlbnQuc3RhdGUpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhhc2hDaGFuZ2VMaXN0ZW5lcigpIHtcclxuICAgIGNvbnN0IGxvY2F0aW9uID0gZ2V0TG9jYXRpb24oZ2V0SGlzdG9yeVN0YXRlKCkpO1xyXG4gICAgaGFuZGxlUG9wU3RhdGUobG9jYXRpb24pO1xyXG4gIH1cclxuXHJcbiAgbGV0IGxpc3RlbmVyQ291bnQgPSAwO1xyXG5cclxuICBmdW5jdGlvbiBzZXRMaXN0ZW5lcihjb3VudDogbnVtYmVyKSB7XHJcbiAgICBsaXN0ZW5lckNvdW50ICs9IGNvdW50O1xyXG4gICAgaWYgKGxpc3RlbmVyQ291bnQgPT09IDEgJiYgY291bnQgPT09IDEpIHtcclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoRXZlbnRUeXBlLlBvcFN0YXRlLCBwb3BTdGF0ZUxpc3RlbmVyKTtcclxuICAgICAgaWYgKCFpc1N1cHBvcnRQb3BTdGF0ZSkge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKEV2ZW50VHlwZS5IYXNoQ2hhbmdlLCBoYXNoQ2hhbmdlTGlzdGVuZXIpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGxpc3RlbmVyQ291bnQgPT09IDApIHtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnRUeXBlLlBvcFN0YXRlLCBwb3BTdGF0ZUxpc3RlbmVyKTtcclxuICAgICAgaWYgKCFpc1N1cHBvcnRQb3BTdGF0ZSkge1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50VHlwZS5IYXNoQ2hhbmdlLCBoYXNoQ2hhbmdlTGlzdGVuZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDlj5bmtojpobXpnaLot7PovazlubbmgaLlpI3liLDot7PovazliY3nmoTpobXpnaJcclxuICBmdW5jdGlvbiByZXZlcnRQb3BTdGF0ZShmb3JtOiBMb2NhdGlvbjxTPiwgdG86IExvY2F0aW9uPFM+KSB7XHJcbiAgICBjb25zdCBkZWx0YSA9IHJlY29yZE9wZXJhdG9yLmdldERlbHRhKHRvLCBmb3JtKTtcclxuICAgIGlmIChkZWx0YSAhPT0gMCkge1xyXG4gICAgICBnbyhkZWx0YSk7XHJcbiAgICAgIGZvcmNlSnVtcCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVIcmVmKHBhdGg6IFBhcnRpYWw8UGF0aD4pIHtcclxuICAgIHJldHVybiBiYXNlbmFtZSArIGNyZWF0ZVBhdGgocGF0aCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwdXNoKHRvOiBUbywgc3RhdGU/OiBTKSB7XHJcbiAgICBjb25zdCBhY3Rpb24gPSBBY3Rpb24ucHVzaDtcclxuICAgIGNvbnN0IGxvY2F0aW9uID0gY3JlYXRlTG9jYXRpb248Uz4oaGlzdG9yeS5sb2NhdGlvbiwgdG8sIHN0YXRlLCB1bmRlZmluZWQpO1xyXG5cclxuICAgIHRyYW5zaXRpb25NYW5hZ2VyLmNvbmZpcm1KdW1wVG8obG9jYXRpb24sIGFjdGlvbiwgZ2V0VXNlckNvbmZpcm1hdGlvbiwgaXNKdW1wID0+IHtcclxuICAgICAgaWYgKCFpc0p1bXApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgaHJlZiA9IGNyZWF0ZUhyZWYobG9jYXRpb24pO1xyXG4gICAgICBjb25zdCB7IGtleSwgc3RhdGUgfSA9IGxvY2F0aW9uO1xyXG5cclxuICAgICAgaWYgKHN1cHBvcnRIaXN0b3J5KSB7XHJcbiAgICAgICAgaWYgKGZvcmNlUmVmcmVzaCkge1xyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBicm93c2VySGlzdG9yeS5wdXNoU3RhdGUoeyBrZXk6IGtleSwgc3RhdGU6IHN0YXRlIH0sICcnLCBocmVmKTtcclxuICAgICAgICAgIHJlY29yZE9wZXJhdG9yLmFkZFJlY29yZChoaXN0b3J5LmxvY2F0aW9uLCBsb2NhdGlvbiwgYWN0aW9uKTtcclxuICAgICAgICAgIHVwZGF0ZVN0YXRlKHsgYWN0aW9uLCBsb2NhdGlvbiB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd2FybmluZyhzdGF0ZSAhPT0gdW5kZWZpbmVkLCAnQnJvd3NlciBoaXN0b3J5IGNhbm5vdCBwdXNoIHN0YXRlIGluIGJyb3dzZXJzIHRoYXQgZG8gbm90IHN1cHBvcnQgSFRNTDUgaGlzdG9yeScpO1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gaHJlZjtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXBsYWNlKHRvOiBUbywgc3RhdGU/OiBTKSB7XHJcbiAgICBjb25zdCBhY3Rpb24gPSBBY3Rpb24ucmVwbGFjZTtcclxuICAgIGNvbnN0IGxvY2F0aW9uID0gY3JlYXRlTG9jYXRpb248Uz4oaGlzdG9yeS5sb2NhdGlvbiwgdG8sIHN0YXRlLCB1bmRlZmluZWQpO1xyXG5cclxuICAgIHRyYW5zaXRpb25NYW5hZ2VyLmNvbmZpcm1KdW1wVG8obG9jYXRpb24sIGFjdGlvbiwgZ2V0VXNlckNvbmZpcm1hdGlvbiwgaXNKdW1wID0+IHtcclxuICAgICAgaWYgKCFpc0p1bXApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgaHJlZiA9IGNyZWF0ZUhyZWYobG9jYXRpb24pO1xyXG4gICAgICBjb25zdCB7IGtleSwgc3RhdGUgfSA9IGxvY2F0aW9uO1xyXG4gICAgICBpZiAoc3VwcG9ydEhpc3RvcnkpIHtcclxuICAgICAgICBpZiAoZm9yY2VSZWZyZXNoKSB7XHJcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShocmVmKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYnJvd3Nlckhpc3RvcnkucmVwbGFjZVN0YXRlKHsga2V5OiBrZXksIHN0YXRlOiBzdGF0ZSB9LCAnJywgaHJlZik7XHJcbiAgICAgICAgICByZWNvcmRPcGVyYXRvci5hZGRSZWNvcmQoaGlzdG9yeS5sb2NhdGlvbiwgbG9jYXRpb24sIGFjdGlvbik7XHJcbiAgICAgICAgICB1cGRhdGVTdGF0ZSh7IGFjdGlvbiwgbG9jYXRpb24gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHdhcm5pbmcoc3RhdGUgIT09IHVuZGVmaW5lZCwgJ0Jyb3dzZXIgaGlzdG9yeSBjYW5ub3QgcHVzaCBzdGF0ZSBpbiBicm93c2VycyB0aGF0IGRvIG5vdCBzdXBwb3J0IEhUTUw1IGhpc3RvcnknKTtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShocmVmKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gaGlzdG9yeTtcclxufVxyXG4iLCJpbXBvcnQgeyBBY3Rpb24sIEJhc2VPcHRpb24sIERlZmF1bHRTdGF0ZVR5cGUsIEV2ZW50VHlwZSwgSGlzdG9yeSwgTG9jYXRpb24sIFRvIH0gZnJvbSAnLi90eXBlcyc7XHJcbmltcG9ydCB7XHJcbiAgYWRkSGVhZFNsYXNoLFxyXG4gIG5vcm1hbGl6ZVNsYXNoLFxyXG4gIGNyZWF0ZU1lbW9yeVJlY29yZCxcclxuICBjcmVhdGVQYXRoLFxyXG4gIGNyZWF0ZUxvY2F0aW9uLFxyXG4gIGlzTG9jYXRpb25FcXVhbCxcclxuICBzdHJpcEJhc2VuYW1lLFxyXG4gIHN0cmlwSGVhZFNsYXNoLFxyXG59IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBnZXREZWZhdWx0Q29uZmlybWF0aW9uIH0gZnJvbSAnLi9kb20nO1xyXG5pbXBvcnQgVHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi90cmFuc2l0aW9uTWFuYWdlcic7XHJcblxyXG5pbXBvcnQgd2FybmluZyBmcm9tICcuL3dhcmluZyc7XHJcbmltcG9ydCB7IGdldEJhc2VIaXN0b3J5IH0gZnJvbSAnLi9iYXNlSGlzdG9yeSc7XHJcblxyXG5leHBvcnQgdHlwZSB1cmxIYXNoVHlwZSA9ICdzbGFzaCcgfCAnbm9zbGFzaCc7XHJcblxyXG50eXBlIEhhc2hIaXN0b3J5T3B0aW9uID0ge1xyXG4gIGhhc2hUeXBlPzogdXJsSGFzaFR5cGU7XHJcbn0gJiBCYXNlT3B0aW9uO1xyXG5cclxuLy8g6I635Y+WI+WJjeeahOWGheWuuVxyXG5mdW5jdGlvbiBzdHJpcEhhc2gocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBpZHggPSBwYXRoLmluZGV4T2YoJyMnKTtcclxuICByZXR1cm4gaWR4ID09PSAtMSA/IHBhdGggOiBwYXRoLnN1YnN0cmluZygwLCBpZHgpO1xyXG59XHJcblxyXG4vLyDojrflj5Yj5ZCO55qE5YaF5a65XHJcbmZ1bmN0aW9uIGdldEhhc2hDb250ZW50KHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgaWR4ID0gcGF0aC5pbmRleE9mKCcjJyk7XHJcbiAgcmV0dXJuIGlkeCA9PT0gLTEgPyAnJyA6IHBhdGguc3Vic3RyaW5nKGlkeCArIDEpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSGFzaEhpc3Rvcnk8UyA9IERlZmF1bHRTdGF0ZVR5cGU+KG9wdGlvbjogSGFzaEhpc3RvcnlPcHRpb24gPSB7fSk6IEhpc3Rvcnk8Uz4ge1xyXG4gIGNvbnN0IGJyb3dzZXJIaXN0b3J5ID0gd2luZG93Lmhpc3Rvcnk7XHJcbiAgY29uc3QgeyBoYXNoVHlwZSA9ICdzbGFzaCcsIGdldFVzZXJDb25maXJtYXRpb24gPSBnZXREZWZhdWx0Q29uZmlybWF0aW9uIH0gPSBvcHRpb247XHJcblxyXG4gIGNvbnN0IGJhc2VuYW1lID0gb3B0aW9uLmJhc2VuYW1lID8gbm9ybWFsaXplU2xhc2gob3B0aW9uLmJhc2VuYW1lKSA6ICcnO1xyXG5cclxuICBjb25zdCBwYXRoRGVjb2RlciA9IGFkZEhlYWRTbGFzaDtcclxuICBjb25zdCBwYXRoRW5jb2RlciA9IGhhc2hUeXBlID09PSAnc2xhc2gnID8gYWRkSGVhZFNsYXNoIDogc3RyaXBIZWFkU2xhc2g7XHJcblxyXG4gIGZ1bmN0aW9uIGdldExvY2F0aW9uKCkge1xyXG4gICAgbGV0IGhhc2hQYXRoID0gcGF0aERlY29kZXIoZ2V0SGFzaENvbnRlbnQod2luZG93LmxvY2F0aW9uLmhhc2gpKTtcclxuICAgIGlmIChiYXNlbmFtZSkge1xyXG4gICAgICBoYXNoUGF0aCA9IHN0cmlwQmFzZW5hbWUoaGFzaFBhdGgsIGJhc2VuYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY3JlYXRlTG9jYXRpb248Uz4oJycsIGhhc2hQYXRoLCB1bmRlZmluZWQsICdkZWZhdWx0Jyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBpbml0TG9jYXRpb24gPSBnZXRMb2NhdGlvbigpO1xyXG5cclxuICBjb25zdCBtZW1SZWNvcmRzID0gY3JlYXRlTWVtb3J5UmVjb3JkPHN0cmluZywgTG9jYXRpb248Uz4+KGluaXRMb2NhdGlvbiwgY3JlYXRlUGF0aCk7XHJcblxyXG4gIGNvbnN0IHRyYW5zaXRpb25NYW5hZ2VyID0gbmV3IFRyYW5zaXRpb25NYW5hZ2VyPFM+KCk7XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZUhyZWYobG9jYXRpb246IExvY2F0aW9uPFM+KSB7XHJcbiAgICBjb25zdCB0YWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdiYXNlJyk7XHJcbiAgICBjb25zdCBiYXNlID0gdGFnICYmIHRhZy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA/IHN0cmlwSGFzaCh3aW5kb3cubG9jYXRpb24uaHJlZikgOiAnJztcclxuICAgIHJldHVybiBiYXNlICsgJyMnICsgcGF0aEVuY29kZXIoYmFzZW5hbWUgKyBjcmVhdGVQYXRoKGxvY2F0aW9uKSk7XHJcbiAgfVxyXG5cclxuICBsZXQgZm9yY2VOZXh0UG9wID0gZmFsc2U7XHJcbiAgbGV0IGlnbm9yZVBhdGg6IG51bGwgfCBzdHJpbmcgPSBudWxsO1xyXG5cclxuICBjb25zdCB7IGdvLCBnb0JhY2ssIGdvRm9yd2FyZCwgbGlzdGVuLCBibG9jaywgZ2V0VXBkYXRlU3RhdGVGdW5jIH0gPSBnZXRCYXNlSGlzdG9yeShcclxuICAgIHRyYW5zaXRpb25NYW5hZ2VyLFxyXG4gICAgc2V0TGlzdGVuZXIsXHJcbiAgICBicm93c2VySGlzdG9yeSxcclxuICApO1xyXG5cclxuICBjb25zdCBoaXN0b3J5OiBIaXN0b3J5PFM+ID0ge1xyXG4gICAgYWN0aW9uOiBBY3Rpb24ucG9wLFxyXG4gICAgbGVuZ3RoOiBicm93c2VySGlzdG9yeS5sZW5ndGgsXHJcbiAgICBsb2NhdGlvbjogaW5pdExvY2F0aW9uLFxyXG4gICAgZ28sXHJcbiAgICBnb0JhY2ssXHJcbiAgICBnb0ZvcndhcmQsXHJcbiAgICBwdXNoLFxyXG4gICAgcmVwbGFjZSxcclxuICAgIGxpc3RlbixcclxuICAgIGJsb2NrLFxyXG4gICAgY3JlYXRlSHJlZixcclxuICB9O1xyXG5cclxuICBjb25zdCB1cGRhdGVTdGF0ZSA9IGdldFVwZGF0ZVN0YXRlRnVuYyhoaXN0b3J5KTtcclxuXHJcbiAgZnVuY3Rpb24gcHVzaCh0bzogVG8sIHN0YXRlPzogUykge1xyXG4gICAgd2FybmluZyhzdGF0ZSAhPT0gdW5kZWZpbmVkLCAnSGFzaCBoaXN0b3J5IGRvZXMgbm90IHN1cHBvcnQgc3RhdGUsIGl0IHdpbGwgYmUgaWdub3JlZCcpO1xyXG5cclxuICAgIGNvbnN0IGFjdGlvbiA9IEFjdGlvbi5wdXNoO1xyXG4gICAgY29uc3QgbG9jYXRpb24gPSBjcmVhdGVMb2NhdGlvbjxTPihoaXN0b3J5LmxvY2F0aW9uLCB0bywgdW5kZWZpbmVkLCAnJyk7XHJcblxyXG4gICAgdHJhbnNpdGlvbk1hbmFnZXIuY29uZmlybUp1bXBUbyhsb2NhdGlvbiwgYWN0aW9uLCBnZXRVc2VyQ29uZmlybWF0aW9uLCBpc0p1bXAgPT4ge1xyXG4gICAgICBpZiAoIWlzSnVtcCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBwYXRoID0gY3JlYXRlUGF0aChsb2NhdGlvbik7XHJcbiAgICAgIGNvbnN0IGVuY29kZWRQYXRoID0gcGF0aEVuY29kZXIoYmFzZW5hbWUgKyBwYXRoKTtcclxuICAgICAgLy8g5YmN5ZCOaGFzaOS4jeS4gOagt+aJjei/m+ihjOi3s+i9rFxyXG4gICAgICBpZiAoZ2V0SGFzaENvbnRlbnQod2luZG93LmxvY2F0aW9uLmhyZWYpICE9PSBlbmNvZGVkUGF0aCkge1xyXG4gICAgICAgIGlnbm9yZVBhdGggPSBlbmNvZGVkUGF0aDtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZWRQYXRoO1xyXG5cclxuICAgICAgICBtZW1SZWNvcmRzLmFkZFJlY29yZChoaXN0b3J5LmxvY2F0aW9uLCBsb2NhdGlvbiwgYWN0aW9uKTtcclxuXHJcbiAgICAgICAgdXBkYXRlU3RhdGUoeyBhY3Rpb24sIGxvY2F0aW9uIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHVwZGF0ZVN0YXRlKHVuZGVmaW5lZCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVwbGFjZSh0bzogVG8sIHN0YXRlPzogUykge1xyXG4gICAgd2FybmluZyhzdGF0ZSAhPT0gdW5kZWZpbmVkLCAnSGFzaCBoaXN0b3J5IGRvZXMgbm90IHN1cHBvcnQgc3RhdGUsIGl0IHdpbGwgYmUgaWdub3JlZCcpO1xyXG4gICAgY29uc3QgYWN0aW9uID0gQWN0aW9uLnJlcGxhY2U7XHJcbiAgICBjb25zdCBsb2NhdGlvbiA9IGNyZWF0ZUxvY2F0aW9uPFM+KGhpc3RvcnkubG9jYXRpb24sIHRvLCB1bmRlZmluZWQsICcnKTtcclxuXHJcbiAgICB0cmFuc2l0aW9uTWFuYWdlci5jb25maXJtSnVtcFRvKGxvY2F0aW9uLCBhY3Rpb24sIGdldFVzZXJDb25maXJtYXRpb24sIGlzSnVtcCA9PiB7XHJcbiAgICAgIGlmICghaXNKdW1wKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHBhdGggPSBjcmVhdGVQYXRoKGxvY2F0aW9uKTtcclxuICAgICAgY29uc3QgZW5jb2RlZFBhdGggPSBwYXRoRW5jb2RlcihiYXNlbmFtZSArIHBhdGgpO1xyXG4gICAgICBpZiAoZ2V0SGFzaENvbnRlbnQod2luZG93LmxvY2F0aW9uLmhyZWYpICE9PSBlbmNvZGVkUGF0aCkge1xyXG4gICAgICAgIGlnbm9yZVBhdGggPSBwYXRoO1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHN0cmlwSGFzaCh3aW5kb3cubG9jYXRpb24uaHJlZikgKyAnIycgKyBlbmNvZGVkUGF0aCk7XHJcbiAgICAgIH1cclxuICAgICAgbWVtUmVjb3Jkcy5hZGRSZWNvcmQoaGlzdG9yeS5sb2NhdGlvbiwgbG9jYXRpb24sIGFjdGlvbik7XHJcbiAgICAgIHVwZGF0ZVN0YXRlKHsgYWN0aW9uLCBsb2NhdGlvbiB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlSGFzaENoYW5nZSgpIHtcclxuICAgIGNvbnN0IGhhc2hQYXRoID0gZ2V0SGFzaENvbnRlbnQod2luZG93LmxvY2F0aW9uLmhyZWYpO1xyXG4gICAgY29uc3QgZW5jb2RlZFBhdGggPSBwYXRoRW5jb2RlcihoYXNoUGF0aCk7XHJcbiAgICBpZiAoaGFzaFBhdGggIT09IGVuY29kZWRQYXRoKSB7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHN0cmlwSGFzaCh3aW5kb3cubG9jYXRpb24uaHJlZikgKyAnIycgKyBlbmNvZGVkUGF0aCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsb2NhdGlvbiA9IGdldExvY2F0aW9uKCk7XHJcbiAgICAgIGNvbnN0IHByZXZMb2NhdGlvbiA9IGhpc3RvcnkubG9jYXRpb247XHJcbiAgICAgIGlmICghZm9yY2VOZXh0UG9wICYmIGlzTG9jYXRpb25FcXVhbChsb2NhdGlvbiwgcHJldkxvY2F0aW9uKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaWdub3JlUGF0aCA9PT0gY3JlYXRlUGF0aChsb2NhdGlvbikpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaWdub3JlUGF0aCA9IG51bGw7XHJcbiAgICAgIGhhbmRsZVBvcFN0YXRlKGxvY2F0aW9uKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZVBvcFN0YXRlKGxvY2F0aW9uOiBMb2NhdGlvbjxTPikge1xyXG4gICAgaWYgKGZvcmNlTmV4dFBvcCkge1xyXG4gICAgICBmb3JjZU5leHRQb3AgPSBmYWxzZTtcclxuICAgICAgdXBkYXRlU3RhdGUodW5kZWZpbmVkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGFjdGlvbiA9IEFjdGlvbi5wb3A7XHJcblxyXG4gICAgICBjb25zdCBjYWxsYmFjayA9IChpc0p1bXA6IGJvb2xlYW4pID0+IHtcclxuICAgICAgICBpZiAoaXNKdW1wKSB7XHJcbiAgICAgICAgICB1cGRhdGVTdGF0ZSh7IGFjdGlvbjogYWN0aW9uLCBsb2NhdGlvbjogbG9jYXRpb24gfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldmVydFBvcFN0YXRlKGxvY2F0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0cmFuc2l0aW9uTWFuYWdlci5jb25maXJtSnVtcFRvKGxvY2F0aW9uLCBhY3Rpb24sIGdldFVzZXJDb25maXJtYXRpb24sIGNhbGxiYWNrKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIOWcqOi3s+i9rOihjOS4uuiiq0Jsb2Nr5ZCO77yM55SoSGlzdG9yeS5nbygp6Lez6L2s5Zue5LmL5YmN55qE6aG16Z2iXHJcbiAgZnVuY3Rpb24gcmV2ZXJ0UG9wU3RhdGUoZm9ybTogTG9jYXRpb248Uz4pIHtcclxuICAgIGNvbnN0IHRvID0gaGlzdG9yeS5sb2NhdGlvbjtcclxuICAgIGNvbnN0IGRlbHRhID0gbWVtUmVjb3Jkcy5nZXREZWx0YSh0bywgZm9ybSk7XHJcbiAgICBpZiAoZGVsdGEgIT09IDApIHtcclxuICAgICAgZ28oZGVsdGEpO1xyXG4gICAgICBmb3JjZU5leHRQb3AgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbGV0IGxpc3RlbmVyQ291bnQgPSAwO1xyXG5cclxuICBmdW5jdGlvbiBzZXRMaXN0ZW5lcihkZWx0YTogbnVtYmVyKSB7XHJcbiAgICBsaXN0ZW5lckNvdW50ICs9IGRlbHRhO1xyXG4gICAgaWYgKGxpc3RlbmVyQ291bnQgPT09IDEgJiYgZGVsdGEgPT09IDEpIHtcclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoRXZlbnRUeXBlLkhhc2hDaGFuZ2UsIGhhbmRsZUhhc2hDaGFuZ2UpO1xyXG4gICAgfSBlbHNlIGlmIChsaXN0ZW5lckNvdW50ID09PSAwKSB7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50VHlwZS5IYXNoQ2hhbmdlLCBoYW5kbGVIYXNoQ2hhbmdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBoaXN0b3J5O1xyXG59XHJcbiIsImltcG9ydCB7IGNyZWF0ZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IEhpc3RvcnksIExvY2F0aW9uIH0gZnJvbSAnLi9pbmRleCc7XHJcbmltcG9ydCB7IE1hdGNoZWQgfSBmcm9tICcuL21hdGNoZXIvcGFyc2VyJztcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZU5hbWVkQ29udGV4dDxUPihuYW1lOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogVCkge1xyXG4gIGNvbnN0IGNvbnRleHQgPSBjcmVhdGVDb250ZXh0PFQ+KGRlZmF1bHRWYWx1ZSk7XHJcbiAgY29udGV4dC5kaXNwbGF5TmFtZSA9IG5hbWU7XHJcbiAgcmV0dXJuIGNvbnRleHQ7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFJvdXRlckNvbnRleHRWYWx1ZSA9IHtcclxuICBoaXN0b3J5OiBIaXN0b3J5O1xyXG4gIGxvY2F0aW9uOiBMb2NhdGlvbjtcclxuICBtYXRjaDogTWF0Y2hlZCB8IG51bGw7XHJcbn07XHJcblxyXG5jb25zdCBSb3V0ZXJDb250ZXh0ID0gY3JlYXRlTmFtZWRDb250ZXh0PFJvdXRlckNvbnRleHRWYWx1ZT4oJ1JvdXRlcicsIHt9IGFzIGFueSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSb3V0ZXJDb250ZXh0OyIsImltcG9ydCB7IE1hdGNoZWQsIFBhcmFtcyB9IGZyb20gJy4vcGFyc2VyJztcclxuXHJcbmV4cG9ydCB0eXBlIFRva2VuID0ge1xyXG4gIHR5cGU6IFRva2VuVHlwZTtcclxuICB2YWx1ZTogc3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0IGVudW0gVG9rZW5UeXBlIHtcclxuICBEZWxpbWl0ZXIgPSAnZGVsaW1pdGVyJyxcclxuICBTdGF0aWMgPSAnc3RhdGljJyxcclxuICBQYXJhbSA9ICdwYXJhbScsXHJcbiAgV2lsZENhcmQgPSAnd2lsZGNhcmQnLFxyXG4gIExCcmFja2V0ID0gJygnLFxyXG4gIFJCcmFja2V0ID0gJyknLFxyXG4gIFBhdHRlcm4gPSAncGF0dGVybicsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VyPFA+IHtcclxuICByZWdleHA6IFJlZ0V4cDtcclxuXHJcbiAga2V5czogc3RyaW5nW107XHJcblxyXG4gIHBhcnNlKHVybDogc3RyaW5nKTogTWF0Y2hlZDxQPiB8IG51bGw7XHJcblxyXG4gIGNvbXBpbGUocGFyYW1zOiBQYXJhbXM8UD4pOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFBhcnNlck9wdGlvbiA9IHtcclxuICAvLyDmmK/lkKblpKflsI/lhpnmlY/mhJ9cclxuICBjYXNlU2Vuc2l0aXZlPzogYm9vbGVhbjtcclxuICAvLyDmmK/lkKblkK/nlKjkuKXmoLzmqKHlvI9cclxuICBzdHJpY3RNb2RlPzogYm9vbGVhbjtcclxuICAvLyDnsr7lh4bljLnphY0g5YW85a65IFJlYWN0LVJvdXRlclY1XHJcbiAgZXhhY3Q/OiBib29sZWFuO1xyXG59O1xyXG5cclxudHlwZSBDbGVhckxlYWRpbmc8VSBleHRlbmRzIHN0cmluZz4gPSBVIGV4dGVuZHMgYC8ke2luZmVyIFJ9YCA/IENsZWFyTGVhZGluZzxSPiA6IFU7XHJcbnR5cGUgQ2xlYXJUYWlsaW5nPFUgZXh0ZW5kcyBzdHJpbmc+ID0gVSBleHRlbmRzIGAke2luZmVyIEx9L2AgPyBDbGVhclRhaWxpbmc8TD4gOiBVO1xyXG5cclxudHlwZSBQYXJzZVBhcmFtPFBhcmFtIGV4dGVuZHMgc3RyaW5nPiA9IFBhcmFtIGV4dGVuZHMgYDoke2luZmVyIFJ9YFxyXG4gID8ge1xyXG4gICAgW0sgaW4gUl06IHN0cmluZztcclxuICB9XHJcbiAgOiB7fTtcclxuXHJcbnR5cGUgTWVyZ2VQYXJhbXM8T25lUGFyYW0gZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBPdGhlclBhcmFtIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55Pj4gPSB7XHJcbiAgcmVhZG9ubHkgW0tleSBpbiBrZXlvZiBPbmVQYXJhbSB8IGtleW9mIE90aGVyUGFyYW1dPzogc3RyaW5nO1xyXG59O1xyXG5cclxudHlwZSBQYXJzZVVSTFN0cmluZzxTdHIgZXh0ZW5kcyBzdHJpbmc+ID0gU3RyIGV4dGVuZHMgYCR7aW5mZXIgUGFyYW19LyR7aW5mZXIgUmVzdH1gXHJcbiAgPyBNZXJnZVBhcmFtczxQYXJzZVBhcmFtPFBhcmFtPiwgUGFyc2VVUkxTdHJpbmc8Q2xlYXJMZWFkaW5nPFJlc3Q+Pj5cclxuICA6IFBhcnNlUGFyYW08U3RyPjtcclxuXHJcbi8vIOino+aekFVSTOS4reeahOWKqOaAgeWPguaVsO+8jOS7peWunueOsFR5cGVTY3JpcHTmj5DnpLrlip/og71cclxuZXhwb3J0IHR5cGUgR2V0VVJMUGFyYW1zPFUgZXh0ZW5kcyBzdHJpbmc+ID0gUGFyc2VVUkxTdHJpbmc8Q2xlYXJMZWFkaW5nPENsZWFyVGFpbGluZzxVPj4+O1xyXG4iLCIvKipcclxuICogQGRlc2NyaXB0aW9uIOWwhnVybOS4reeahC8v6L2s5o2i5Li6L1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLysvZywgJy8nKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlQ29tcGFyZShzY29yZTE6IG51bWJlcltdLCBzY29yZTI6IG51bWJlcltdKTogbnVtYmVyIHtcclxuICBjb25zdCBzY29yZTFMZW5ndGggPSBzY29yZTEubGVuZ3RoO1xyXG4gIGNvbnN0IHNjb3JlMkxlbmd0aCA9IHNjb3JlMi5sZW5ndGg7XHJcbiAgY29uc3QgZW5kID0gTWF0aC5taW4oc2NvcmUxTGVuZ3RoLCBzY29yZTJMZW5ndGgpO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZW5kOyBpKyspIHtcclxuICAgIGNvbnN0IGRlbHRhID0gc2NvcmUyW2ldIC0gc2NvcmUxW2ldO1xyXG4gICAgaWYgKGRlbHRhICE9PSAwKSB7XHJcbiAgICAgIHJldHVybiBkZWx0YTtcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKHNjb3JlMUxlbmd0aCA9PT0gc2NvcmUyTGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcbiAgcmV0dXJuIHNjb3JlMUxlbmd0aCA+IHNjb3JlMkxlbmd0aCA/IC0xIDogMTtcclxufVxyXG5cclxuLy8g5oqK5q2j5YiZ6KGo6L6+5byP55qE54m55q6K56ym5Y+35Yqg5Lik5Liq5Y+N5pac5p2g6L+b6KGM6L2s5LmJXHJcbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVTdHIoc3RyOiBzdHJpbmcpIHtcclxuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbLisqPz1eIToke30oKVtcXF18L1xcXFxdKS9nLCAnXFxcXCQxJyk7XHJcbn1cclxuIiwiaW1wb3J0IHsgVG9rZW4sIFRva2VuVHlwZSB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgeyBjbGVhblBhdGggfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmNvbnN0IHZhbGlkQ2hhciA9IC9bXi86KigpXS87XHJcblxyXG4vLyDlr7lVcmzmqKHmnb/ov5vooYzor43ms5Xop6PmnpDvvIzop6PmnpDnu5PmnpzkuLpUb2tlbnNcclxuZXhwb3J0IGZ1bmN0aW9uIGxleGVyKHBhdGg6IHN0cmluZyk6IFRva2VuW10ge1xyXG4gIGNvbnN0IHRva2VuczogVG9rZW5bXSA9IFtdO1xyXG5cclxuICBpZiAoIXBhdGgpIHtcclxuICAgIHJldHVybiB0b2tlbnM7XHJcbiAgfVxyXG5cclxuICBsZXQgdXJsUGF0aCA9IGNsZWFuUGF0aChwYXRoKTtcclxuICBpZiAodXJsUGF0aCAhPT0gJyonICYmICF1cmxQYXRoLnN0YXJ0c1dpdGgoJy8nKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBVcmwgbXVzdCBzdGFydCB3aXRoIFwiL1wiLmApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZ2V0TGl0ZXJhbCA9ICgpID0+IHtcclxuICAgIGxldCBuYW1lID0gJyc7XHJcbiAgICB3aGlsZSAoaSA8IHVybFBhdGgubGVuZ3RoICYmIHZhbGlkQ2hhci50ZXN0KHVybFBhdGhbaV0pKSB7XHJcbiAgICAgIG5hbWUgKz0gdXJsUGF0aFtpXTtcclxuICAgICAgc2tpcENoYXIoMSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9O1xyXG5cclxuICBjb25zdCBza2lwQ2hhciA9IChzdGVwOiBudW1iZXIpID0+IHtcclxuICAgIGkgKz0gc3RlcDtcclxuICB9O1xyXG5cclxuICBsZXQgaSA9IDA7XHJcbiAgd2hpbGUgKGkgPCB1cmxQYXRoLmxlbmd0aCkge1xyXG4gICAgY29uc3QgY3VyQ2hhciA9IHVybFBhdGhbaV07XHJcbiAgICBjb25zdCBwcmV2Q2hhciA9IHVybFBhdGhbaSAtIDFdO1xyXG5cclxuICAgIGlmIChjdXJDaGFyID09PSAnLycpIHtcclxuICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBUb2tlblR5cGUuRGVsaW1pdGVyLCB2YWx1ZTogdXJsUGF0aFtpXSB9KTtcclxuICAgICAgc2tpcENoYXIoMSk7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gICAgLy8gZHluYW1pYyBwYXJhbXMgKC86YSlcclxuICAgIGlmIChwcmV2Q2hhciA9PT0gJy8nICYmIGN1ckNoYXIgPT09ICc6Jykge1xyXG4gICAgICBza2lwQ2hhcigxKTtcclxuICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBUb2tlblR5cGUuUGFyYW0sIHZhbHVlOiBnZXRMaXRlcmFsKCkgfSk7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gICAgLy8gd2lsZENhcmQgcGFyYW1zICgvOiopXHJcbiAgICBpZiAoKHByZXZDaGFyID09PSAnLycgfHwgcHJldkNoYXIgPT09IHVuZGVmaW5lZCkgJiYgY3VyQ2hhciA9PT0gJyonKSB7XHJcbiAgICAgIHRva2Vucy5wdXNoKHsgdHlwZTogVG9rZW5UeXBlLldpbGRDYXJkLCB2YWx1ZTogdXJsUGF0aFtpXSB9KTtcclxuICAgICAgc2tpcENoYXIoMSk7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gICAgLy8gc3RhdGljIHBhcmFtc1xyXG4gICAgaWYgKHByZXZDaGFyID09PSAnLycgJiYgdmFsaWRDaGFyLnRlc3QoY3VyQ2hhcikpIHtcclxuICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBUb2tlblR5cGUuU3RhdGljLCB2YWx1ZTogZ2V0TGl0ZXJhbCgpIH0pO1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIGlmIChjdXJDaGFyID09PSAnKCcpIHtcclxuICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBUb2tlblR5cGUuTEJyYWNrZXQsIHZhbHVlOiAnKCcgfSk7XHJcbiAgICAgIHNraXBDaGFyKDEpO1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIGlmIChjdXJDaGFyID09PSAnKScpIHtcclxuICAgICAgdG9rZW5zLnB1c2goeyB0eXBlOiBUb2tlblR5cGUuUkJyYWNrZXQsIHZhbHVlOiAnKScgfSk7XHJcbiAgICAgIHNraXBDaGFyKDEpO1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIGlmICh2YWxpZENoYXIudGVzdChjdXJDaGFyKSkge1xyXG4gICAgICB0b2tlbnMucHVzaCh7IHR5cGU6IFRva2VuVHlwZS5QYXR0ZXJuLCB2YWx1ZTogZ2V0TGl0ZXJhbCgpIH0pO1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIC8vIOi3s+i/h+mdnuazleWtl+esplxyXG4gICAgc2tpcENoYXIoMSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdG9rZW5zO1xyXG59XHJcbiIsImltcG9ydCB7IEdldFVSTFBhcmFtcywgUGFyc2VyLCBQYXJzZXJPcHRpb24sIFRva2VuVHlwZSB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgeyBsZXhlciB9IGZyb20gJy4vbGV4ZXInO1xyXG5pbXBvcnQgeyBlc2NhcGVTdHIsIHNjb3JlQ29tcGFyZSB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuLy8g5LiN5ZCM57G75Z6L5Y+C5pWw55qE5Yy56YWN5b6X5YiGXHJcbmVudW0gTWF0Y2hTY29yZSB7XHJcbiAgLy8g5Zu65a6a5Y+C5pWwXHJcbiAgc3RhdGljID0gMTAsXHJcbiAgLy8g5Yqo5oCB5Y+C5pWwXHJcbiAgcGFyYW0gPSA2LFxyXG4gIC8vIOmAmumFjeespuWPguaVsFxyXG4gIHdpbGRjYXJkID0gMyxcclxuICBwbGFjZWhvbGRlciA9IC0xLFxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBQYXJhbXM8UD4gPSB7IFtLIGluIGtleW9mIFBdPzogUFtLXSB9O1xyXG5cclxuLy8g5YW85a65IHJlYWN0IHY1IG1hdGNoZWTnsbvlnotcclxuZXhwb3J0IHR5cGUgTWF0Y2hlZDxQID0gYW55PiA9IHtcclxuICBzY29yZTogbnVtYmVyW107XHJcbiAgcGFyYW1zOiBQYXJhbXM8UD47XHJcbiAgcGF0aDogc3RyaW5nO1xyXG4gIHVybDogc3RyaW5nO1xyXG4gIGlzRXhhY3Q6IGJvb2xlYW47XHJcbn07XHJcblxyXG5jb25zdCBkZWZhdWx0T3B0aW9uOiBSZXF1aXJlZDxQYXJzZXJPcHRpb24+ID0ge1xyXG4gIC8vIHVybOWMuemFjeaXtuaYr+WQpuWkp+Wwj+WGmeaVj+aEn1xyXG4gIGNhc2VTZW5zaXRpdmU6IHRydWUsXHJcbiAgLy8g5piv5ZCm5Lil5qC85Yy56YWNdXJs57uT5bC+55qEL1xyXG4gIHN0cmljdE1vZGU6IGZhbHNlLFxyXG4gIC8vIOaYr+WQpuWujOWFqOeyvuehruWMuemFjVxyXG4gIGV4YWN0OiBmYWxzZSxcclxufTtcclxuLy8g5q2j5YiZ6KGo6L6+5byP5Lit6ZyA6KaB6L2s5LmJ55qE5a2X56ymXHJcbmNvbnN0IFJFR0VYX0NIQVJTX1JFID0gL1suKyo/XiR7fSgpW1xcXS9cXFxcXS9nO1xyXG4vLyDnlKjkuo7ljLnphY3kuKTkuKovL+S4reeahOeahOWAvFxyXG5jb25zdCBCQVNFX1BBUkFNX1BBVFRFUk4gPSAnW14vXSsnO1xyXG5cclxuY29uc3QgRGVmYXVsdERlbGltaXRlciA9ICcvIz8nO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGhQYXJzZXI8U3RyIGV4dGVuZHMgc3RyaW5nPihwYXRobmFtZTogU3RyLCBvcHRpb24/OiBQYXJzZXJPcHRpb24pOiBQYXJzZXI8R2V0VVJMUGFyYW1zPFN0cj4+O1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGF0aFBhcnNlcjxQID0gdW5rbm93bj4ocGF0aG5hbWU6IHN0cmluZywgb3B0aW9uPzogUGFyc2VyT3B0aW9uKTogUGFyc2VyPFA+O1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGF0aFBhcnNlcjxQID0gdW5rbm93bj4ocGF0aG5hbWU6IHN0cmluZywgb3B0aW9uOiBQYXJzZXJPcHRpb24gPSBkZWZhdWx0T3B0aW9uKTogUGFyc2VyPFA+IHtcclxuICBjb25zdCB7XHJcbiAgICBjYXNlU2Vuc2l0aXZlID0gZGVmYXVsdE9wdGlvbi5jYXNlU2Vuc2l0aXZlLFxyXG4gICAgc3RyaWN0TW9kZSA9IGRlZmF1bHRPcHRpb24uc3RyaWN0TW9kZSxcclxuICAgIGV4YWN0ID0gZGVmYXVsdE9wdGlvbi5leGFjdCxcclxuICB9ID0gb3B0aW9uO1xyXG4gIC8qKlxyXG4gICAqIFVSTOWMuemFjeaVtOS9k+a1geeoi1xyXG4gICAqIDEu6K+N5rOV6Kej5p6Q77yM5bCGVVJM5qih5p2/6Kej5p6Q5Li6VG9rZW5cclxuICAgKiAyLuS9v+eUqFRva2Vu55Sf5oiQ5q2j5YiZ6KGo6L6+5byPXHJcbiAgICogMy7liKnnlKjmraPliJnooajovr7lvI/op6PmnpBVUkzkuK3lj4LmlbDmiJbloavlhYVVUkzmqKHmnb9cclxuICAgKi9cclxuICBsZXQgcGF0dGVybiA9ICdeJztcclxuICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xyXG4gIGNvbnN0IHNjb3JlczogbnVtYmVyW10gPSBbXTtcclxuXHJcbiAgY29uc3QgdG9rZW5zID0gbGV4ZXIocGF0aG5hbWUpO1xyXG4gIGNvbnN0IG9ubHlIYXNXaWxkQ2FyZCA9IHRva2Vucy5sZW5ndGggPT09IDEgJiYgdG9rZW5zWzBdLnR5cGUgPT09IFRva2VuVHlwZS5XaWxkQ2FyZDtcclxuICBjb25zdCB0b2tlbkNvdW50ID0gdG9rZW5zLmxlbmd0aDtcclxuICBjb25zdCBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5Db3VudCAtIDFdO1xyXG5cclxuICBmb3IgKGxldCB0b2tlbklkeCA9IDA7IHRva2VuSWR4IDwgdG9rZW5Db3VudDsgdG9rZW5JZHgrKykge1xyXG4gICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbdG9rZW5JZHhdO1xyXG4gICAgY29uc3QgbmV4dFRva2VuID0gdG9rZW5zW3Rva2VuSWR4ICsgMV07XHJcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuICAgICAgY2FzZSBUb2tlblR5cGUuRGVsaW1pdGVyOlxyXG4gICAgICAgIHBhdHRlcm4gKz0gJy8nO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFRva2VuVHlwZS5TdGF0aWM6XHJcbiAgICAgICAgcGF0dGVybiArPSB0b2tlbi52YWx1ZS5yZXBsYWNlKFJFR0VYX0NIQVJTX1JFLCAnXFxcXCQmJyk7XHJcbiAgICAgICAgc2NvcmVzLnB1c2goTWF0Y2hTY29yZS5zdGF0aWMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFRva2VuVHlwZS5QYXJhbTpcclxuICAgICAgICBsZXQgcGFyYW1SZWdleHAgPSAnJztcclxuICAgICAgICBpZiAobmV4dFRva2VuICYmIG5leHRUb2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJyYWNrZXQpIHtcclxuICAgICAgICAgIC8vIOi3s+i/h+W9k+WJjVRva2Vu5ZKM5bem5ous5Y+3XHJcbiAgICAgICAgICB0b2tlbklkeCArPSAyO1xyXG4gICAgICAgICAgd2hpbGUgKHRva2Vuc1t0b2tlbklkeF0udHlwZSAhPT0gVG9rZW5UeXBlLlJCcmFja2V0KSB7XHJcbiAgICAgICAgICAgIHBhcmFtUmVnZXhwICs9IHRva2Vuc1t0b2tlbklkeF0udmFsdWU7XHJcbiAgICAgICAgICAgIHRva2VuSWR4Kys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBhdHRlcm4gKz0gcGFyYW1SZWdleHAgPyBgKCg/OiR7cGFyYW1SZWdleHB9KSlgIDogYCgke0JBU0VfUEFSQU1fUEFUVEVSTn0pYDtcclxuICAgICAgICBrZXlzLnB1c2godG9rZW4udmFsdWUpO1xyXG4gICAgICAgIHNjb3Jlcy5wdXNoKE1hdGNoU2NvcmUucGFyYW0pO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFRva2VuVHlwZS5XaWxkQ2FyZDpcclxuICAgICAgICBrZXlzLnB1c2godG9rZW4udmFsdWUpO1xyXG4gICAgICAgIHBhdHRlcm4gKz0gYCgoPzoke0JBU0VfUEFSQU1fUEFUVEVSTn0pJHtvbmx5SGFzV2lsZENhcmQgPyAnPycgOiAnJ30oPzovKD86JHtCQVNFX1BBUkFNX1BBVFRFUk59KSkqKWA7XHJcbiAgICAgICAgc2NvcmVzLnB1c2gob25seUhhc1dpbGRDYXJkID8gTWF0Y2hTY29yZS53aWxkY2FyZCA6IE1hdGNoU2NvcmUucGxhY2Vob2xkZXIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBjb25zdCBpc1dpbGRDYXJkID0gbGFzdFRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5XaWxkQ2FyZDtcclxuXHJcbiAgaWYgKCFpc1dpbGRDYXJkICYmICFleGFjdCkge1xyXG4gICAgaWYgKCFzdHJpY3RNb2RlKSB7XHJcbiAgICAgIHBhdHRlcm4gKz0gYCg/Olske2VzY2FwZVN0cihEZWZhdWx0RGVsaW1pdGVyKX1dKD89JCkpP2A7XHJcbiAgICB9XHJcbiAgICBpZiAobGFzdFRva2VuLnR5cGUgIT09IFRva2VuVHlwZS5EZWxpbWl0ZXIpIHtcclxuICAgICAgcGF0dGVybiArPSBgKD89WyR7ZXNjYXBlU3RyKERlZmF1bHREZWxpbWl0ZXIpfV18JClgO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBwYXR0ZXJuICs9IHN0cmljdE1vZGUgPyAnJCcgOiBgWyR7ZXNjYXBlU3RyKERlZmF1bHREZWxpbWl0ZXIpfV0/JGA7XHJcbiAgfVxyXG5cclxuICBjb25zdCBmbGFnID0gY2FzZVNlbnNpdGl2ZSA/ICcnIDogJ2knO1xyXG4gIGNvbnN0IHJlZ2V4cCA9IG5ldyBSZWdFeHAocGF0dGVybiwgZmxhZyk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiDmoLnmja7nu5nlrppQYXR0ZXJu6Kej5p6QcGF0aFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHBhcnNlKHBhdGg6IHN0cmluZyk6IE1hdGNoZWQ8UD4gfCBudWxsIHtcclxuICAgIGNvbnN0IHJlTWF0Y2ggPSBwYXRoLm1hdGNoKHJlZ2V4cCk7XHJcblxyXG4gICAgaWYgKCFyZU1hdGNoKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWF0Y2hlZFBhdGggPSByZU1hdGNoWzBdO1xyXG4gICAgbGV0IHBhcmFtczogUGFyYW1zPFA+ID0ge307XHJcbiAgICBsZXQgcGFyc2VTY29yZTogbnVtYmVyW10gPSBBcnJheS5mcm9tKHNjb3Jlcyk7XHJcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHJlTWF0Y2gubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbGV0IHBhcmFtID0gcmVNYXRjaFtpXTtcclxuICAgICAgbGV0IGtleSA9IGtleXNbaSAtIDFdO1xyXG4gICAgICBpZiAoa2V5ID09PSAnKicgJiYgcGFyYW0pIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBwYXJhbS5zcGxpdCgnLycpO1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShwYXJhbXNbJyonXSkpIHtcclxuICAgICAgICAgIHBhcmFtc1snKiddID0gdmFsdWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBhcmFtc1snKiddLnB1c2goLi4udmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDlrozmiJDpgJrphY3nrKblj4LmlbDop6PmnpDlkI7lsIZwbGFjZWhvbGRlcuabv+aNouS4undpbGRjYXJk5Y+C5pWw55qE5YiG5YC8XHJcbiAgICAgICAgcGFyc2VTY29yZS5zcGxpY2UoXHJcbiAgICAgICAgICBzY29yZXMuaW5kZXhPZihNYXRjaFNjb3JlLnBsYWNlaG9sZGVyKSxcclxuICAgICAgICAgIDEsXHJcbiAgICAgICAgICAuLi5uZXcgQXJyYXkodmFsdWUubGVuZ3RoKS5maWxsKE1hdGNoU2NvcmUud2lsZGNhcmQpLFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGFyYW1zW2tleV0gPSBwYXJhbSA/IHBhcmFtIDogW107XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0V4YWN0ID0gcGF0aCA9PT0gbWF0Y2hlZFBhdGg7XHJcbiAgICBjb25zdCB1cmwgPSBwYXRoID09PSAnLycgJiYgbWF0Y2hlZFBhdGggPT09ICcnID8gJy8nIDogbWF0Y2hlZFBhdGg7XHJcbiAgICByZXR1cm4geyBpc0V4YWN0OiBpc0V4YWN0LCBwYXRoOiBwYXRobmFtZSwgdXJsOiB1cmwsIHNjb3JlOiBwYXJzZVNjb3JlLCBwYXJhbXM6IHBhcmFtcyB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIOS9v+eUqOe7meWumuWPguaVsOWhq+WFhXBhdHRlcm7vvIzlvpfliLDnm67moIdVUkxcclxuICAgKi9cclxuICBmdW5jdGlvbiBjb21waWxlKHBhcmFtczogUGFyYW1zPFA+KTogc3RyaW5nIHtcclxuICAgIGxldCBwYXRoID0gJyc7XHJcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xyXG4gICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuICAgICAgICBjYXNlIFRva2VuVHlwZS5TdGF0aWM6XHJcbiAgICAgICAgICBwYXRoICs9IHRva2VuLnZhbHVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBUb2tlblR5cGUuUGFyYW06XHJcbiAgICAgICAgICBpZiAoIXBhcmFtc1t0b2tlbi52YWx1ZV0pIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJhbSBpcyBpbnZhbGlkLicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGF0aCArPSBwYXJhbXNbdG9rZW4udmFsdWVdO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBUb2tlblR5cGUuV2lsZENhcmQ6XHJcbiAgICAgICAgICBsZXQgd2lsZENhcmQgPSBwYXJhbXNbJyonXTtcclxuICAgICAgICAgIGlmICh3aWxkQ2FyZCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIHBhdGggKz0gd2lsZENhcmQuam9pbignLycpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGF0aCArPSB3aWxkQ2FyZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgVG9rZW5UeXBlLkRlbGltaXRlcjpcclxuICAgICAgICAgIHBhdGggKz0gdG9rZW4udmFsdWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhdGg7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZ2V0IHJlZ2V4cCgpIHtcclxuICAgICAgcmV0dXJuIHJlZ2V4cDtcclxuICAgIH0sXHJcbiAgICBnZXQga2V5cygpIHtcclxuICAgICAgcmV0dXJuIGtleXM7XHJcbiAgICB9LFxyXG4gICAgY29tcGlsZSxcclxuICAgIHBhcnNlLFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24g5L6d5qyh5L2/55SocGF0aG5hbWXkuI5wYXR0ZXJu6L+b6KGM5Yy56YWN77yM5qC55o2u5Yy56YWN5YiG5pWw5Y+W5b6X5YiG5pWw5pyA6auY57uT5p6cXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hQYXRoPFAgPSBhbnk+KFxyXG4gIHBhdGhuYW1lOiBzdHJpbmcsXHJcbiAgcGF0dGVybjogc3RyaW5nIHwgc3RyaW5nW10sXHJcbiAgb3B0aW9uPzogUGFyc2VyT3B0aW9uLFxyXG4pOiBNYXRjaGVkPFA+IHwgbnVsbCB7XHJcbiAgY29uc3QgcGF0dGVybnMgPSBBcnJheS5pc0FycmF5KHBhdHRlcm4pID8gWy4uLnBhdHRlcm5dIDogW3BhdHRlcm5dO1xyXG4gIGNvbnN0IG1hdGNoZWRSZXN1bHRzOiBNYXRjaGVkPFA+W10gPSBbXTtcclxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgcGF0dGVybnMpIHtcclxuICAgIGNvbnN0IHBhcnNlciA9IGNyZWF0ZVBhdGhQYXJzZXIoaXRlbSwgb3B0aW9uKTtcclxuICAgIGNvbnN0IG1hdGNoZWQgPSBwYXJzZXIucGFyc2UocGF0aG5hbWUpO1xyXG4gICAgaWYgKG1hdGNoZWQpIHtcclxuICAgICAgbWF0Y2hlZFJlc3VsdHMucHVzaChtYXRjaGVkKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuICFtYXRjaGVkUmVzdWx0cy5sZW5ndGggPyBudWxsIDogbWF0Y2hlZFJlc3VsdHMuc29ydCgoYSwgYikgPT4gc2NvcmVDb21wYXJlKGEuc2NvcmUsIGIuc2NvcmUpKVswXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUGF0aDxQID0gYW55PihwYXRoOiBzdHJpbmcsIHBhcmFtczogUGFyYW1zPFA+KSB7XHJcbiAgY29uc3QgcGFyc2VyID0gY3JlYXRlUGF0aFBhcnNlcihwYXRoKTtcclxuICByZXR1cm4gcGFyc2VyLmNvbXBpbGUocGFyYW1zKTtcclxufSIsImltcG9ydCB7IHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBSb3V0ZXJDb250ZXh0IGZyb20gJy4vY29udGV4dCc7XHJcbmltcG9ydCB7IE1hdGNoZWQsIG1hdGNoUGF0aCwgUGFyYW1zIH0gZnJvbSAnLi9tYXRjaGVyL3BhcnNlcic7XHJcbmltcG9ydCB7IEhpc3RvcnkgfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tICcuL2luZGV4JztcclxuXHJcbmZ1bmN0aW9uIHVzZUhpc3Rvcnk8Uz4oKTogSGlzdG9yeTxTPjtcclxuZnVuY3Rpb24gdXNlSGlzdG9yeSgpIHtcclxuICByZXR1cm4gdXNlQ29udGV4dChSb3V0ZXJDb250ZXh0KS5oaXN0b3J5O1xyXG59XHJcblxyXG5mdW5jdGlvbiB1c2VMb2NhdGlvbjxTPigpOiBMb2NhdGlvbjxTPjtcclxuZnVuY3Rpb24gdXNlTG9jYXRpb24oKSB7XHJcbiAgcmV0dXJuIHVzZUNvbnRleHQoUm91dGVyQ29udGV4dCkubG9jYXRpb247XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVzZVBhcmFtczxQPigpOiBQYXJhbXM8UD4gfCB7fTtcclxuZnVuY3Rpb24gdXNlUGFyYW1zKCkge1xyXG4gIGNvbnN0IG1hdGNoID0gdXNlQ29udGV4dChSb3V0ZXJDb250ZXh0KS5tYXRjaDtcclxuICByZXR1cm4gbWF0Y2ggPyBtYXRjaC5wYXJhbXMgOiB7fTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXNlUm91dGVNYXRjaDxQPihwYXRoPzogc3RyaW5nKTogTWF0Y2hlZDxQPiB8IG51bGw7XHJcbmZ1bmN0aW9uIHVzZVJvdXRlTWF0Y2gocGF0aD86IHN0cmluZykge1xyXG4gIGNvbnN0IHBhdGhuYW1lID0gdXNlTG9jYXRpb24oKS5wYXRobmFtZTtcclxuICBjb25zdCBtYXRjaCA9IHVzZUNvbnRleHQoUm91dGVyQ29udGV4dCkubWF0Y2g7XHJcbiAgaWYgKHBhdGgpIHtcclxuICAgIHJldHVybiBtYXRjaFBhdGgocGF0aG5hbWUsIHBhdGgpO1xyXG4gIH1cclxuICByZXR1cm4gbWF0Y2g7XHJcbn1cclxuXHJcbmV4cG9ydCB7IHVzZUhpc3RvcnksIHVzZUxvY2F0aW9uLCB1c2VQYXJhbXMsIHVzZVJvdXRlTWF0Y2ggfTtcclxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBIaXN0b3J5LCBMb2NhdGlvbiB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyBNYXRjaGVkLCBtYXRjaFBhdGggfSBmcm9tICcuL21hdGNoZXIvcGFyc2VyJztcclxuaW1wb3J0IHsgdXNlQ29udGV4dCwgQ2hpbGRyZW4sIGNyZWF0ZUVsZW1lbnQgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBSb3V0ZXJDb250ZXh0IGZyb20gJy4vY29udGV4dCc7XHJcbmltcG9ydCB7IEdldFVSTFBhcmFtcyB9IGZyb20gJy4vbWF0Y2hlci90eXBlcyc7XHJcblxyXG5leHBvcnQgdHlwZSBSb3V0ZUNvbXBvbmVudFByb3BzPFAgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge30sIFMgPSB1bmtub3duPiA9IFJvdXRlQ2hpbGRyZW5Qcm9wczxQLCBTPjtcclxuXHJcbmV4cG9ydCB0eXBlIFJvdXRlQ2hpbGRyZW5Qcm9wczxQIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA9IHt9LCBTID0gdW5rbm93bj4gPSB7XHJcbiAgaGlzdG9yeTogSGlzdG9yeTxTPjtcclxuICBsb2NhdGlvbjogTG9jYXRpb248Uz47XHJcbiAgbWF0Y2g6IE1hdGNoZWQ8UD4gfCBudWxsXHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFJvdXRlUHJvcHM8UCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fSwgUGF0aCBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSB7XHJcbiAgbG9jYXRpb24/OiBMb2NhdGlvbjtcclxuICBjb21wb25lbnQ/OiBSZWFjdC5Db21wb25lbnRUeXBlPFJvdXRlQ29tcG9uZW50UHJvcHM8UD4+IHwgUmVhY3QuQ29tcG9uZW50VHlwZTxhbnk+IHwgdW5kZWZpbmVkO1xyXG4gIGNoaWxkcmVuPzogKChwcm9wczogUm91dGVDaGlsZHJlblByb3BzPFA+KSA9PiBSZWFjdC5SZWFjdE5vZGUpIHwgUmVhY3QuUmVhY3ROb2RlO1xyXG4gIHJlbmRlcj86IChwcm9wczogUm91dGVDb21wb25lbnRQcm9wczxQPikgPT4gUmVhY3QuUmVhY3ROb2RlO1xyXG4gIHBhdGg/OiBQYXRoIHwgUGF0aFtdO1xyXG4gIGV4YWN0PzogYm9vbGVhbjtcclxuICBzZW5zaXRpdmU/OiBib29sZWFuO1xyXG4gIHN0cmljdD86IGJvb2xlYW47XHJcbiAgY29tcHV0ZWQ/OiBNYXRjaGVkPFA+O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gUm91dGU8UGF0aCBleHRlbmRzIHN0cmluZywgUCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBHZXRVUkxQYXJhbXM8UGF0aD4+KHByb3BzOiBSb3V0ZVByb3BzPFAsIFBhdGg+KSB7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoUm91dGVyQ29udGV4dCk7XHJcblxyXG4gIGNvbnN0IHsgY29tcHV0ZWQsIGxvY2F0aW9uLCBwYXRoIH0gPSBwcm9wcztcclxuICBsZXQgeyBjaGlsZHJlbiwgY29tcG9uZW50LCByZW5kZXIgfSA9IHByb3BzO1xyXG4gIGxldCBtYXRjaDogTWF0Y2hlZDxQPiB8IG51bGw7XHJcblxyXG4gIGNvbnN0IHJvdXRlTG9jYXRpb24gPSBsb2NhdGlvbiB8fCBjb250ZXh0LmxvY2F0aW9uO1xyXG4gIGlmIChjb21wdXRlZCkge1xyXG4gICAgbWF0Y2ggPSBjb21wdXRlZDtcclxuICB9IGVsc2UgaWYgKHBhdGgpIHtcclxuICAgIG1hdGNoID0gbWF0Y2hQYXRoPFA+KHJvdXRlTG9jYXRpb24ucGF0aG5hbWUsIHBhdGgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBtYXRjaCA9IGNvbnRleHQubWF0Y2g7XHJcbiAgfVxyXG4gIGNvbnN0IG5ld1Byb3BzID0geyAuLi5jb250ZXh0LCBsb2NhdGlvbjogcm91dGVMb2NhdGlvbiwgbWF0Y2g6IG1hdGNoIH07XHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSAmJiBDaGlsZHJlbi5jb3VudChjaGlsZHJlbikgPT09IDApIHtcclxuICAgIGNoaWxkcmVuID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIOaMiemhuuW6j+iOt+WPlumcgOimgea4suafk+eahOe7hOS7tlxyXG4gICAqIDEuY2hpbGRyZW5cclxuICAgKiAyLmNvbXBvbmVudFxyXG4gICAqIDMucmVuZGVyXHJcbiAgICog6YO95rKh5pyJ5Yy56YWN5Yiw6L+U5ZueTnVsbFxyXG4gICAqL1xyXG4gIGNvbnN0IGdldENoaWxkcmVuID0gKCk6IFJlYWN0LlJlYWN0Tm9kZSB8IG51bGwgPT4ge1xyXG4gICAgLy8g5aaC5p6cIG1hdGNoIOWtmOWcqFxyXG4gICAgaWYgKG5ld1Byb3BzLm1hdGNoKSB7XHJcbiAgICAgIGlmIChjaGlsZHJlbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY2hpbGRyZW4gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHJldHVybiBjaGlsZHJlbihuZXdQcm9wcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNvbXBvbmVudCkge1xyXG4gICAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KGNvbXBvbmVudCwgbmV3UHJvcHMpO1xyXG4gICAgICB9IGVsc2UgaWYgKHJlbmRlcikge1xyXG4gICAgICAgIHJldHVybiByZW5kZXIobmV3UHJvcHMpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBtYXRjaOS4um51bGxcclxuICAgICAgaWYgKHR5cGVvZiBjaGlsZHJlbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHJldHVybiBjaGlsZHJlbihuZXdQcm9wcyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIDxSb3V0ZXJDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtuZXdQcm9wc30+e2dldENoaWxkcmVuKCl9PC9Sb3V0ZXJDb250ZXh0LlByb3ZpZGVyPjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm91dGU7XHJcbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlTGF5b3V0RWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5cclxuaW1wb3J0IHsgSGlzdG9yeSwgTG9jYXRpb24gfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuXHJcbmltcG9ydCBSb3V0ZXJDb250ZXh0LCB7IFJvdXRlckNvbnRleHRWYWx1ZSB9IGZyb20gJy4vY29udGV4dCc7XHJcblxyXG5leHBvcnQgdHlwZSBSb3V0ZXJQcm9wcyA9IHtcclxuICBoaXN0b3J5OiBIaXN0b3J5O1xyXG4gIGNoaWxkcmVuPzogUmVhY3QuUmVhY3ROb2RlO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gUm91dGVyPFAgZXh0ZW5kcyBSb3V0ZXJQcm9wcz4ocHJvcHM6IFApIHtcclxuICBjb25zdCB7IGhpc3RvcnksIGNoaWxkcmVuID0gbnVsbCB9ID0gcHJvcHM7XHJcbiAgY29uc3QgW2xvY2F0aW9uLCBzZXRMb2NhdGlvbl0gPSB1c2VTdGF0ZShwcm9wcy5oaXN0b3J5LmxvY2F0aW9uKTtcclxuICBjb25zdCBwZW5kaW5nTG9jYXRpb24gPSB1c2VSZWY8TG9jYXRpb24gfCBudWxsPihudWxsKTtcclxuXHJcbiAgLy8g5ZyoUm91dGVy5Yqg6L295pe25bCx55uR5ZCsaGlzdG9yeeWcsOWdgOWPmOWMlu+8jOS7peS/neivgeWcqOWni+a4suafk+aXtumHjeWumuWQkeiDveato+ehruinpuWPkVxyXG4gIGxldCB1bkxpc3RlbjogbnVsbCB8ICgoKSA9PiB2b2lkKSA9IGhpc3RvcnkubGlzdGVuKGFyZyA9PiB7XHJcbiAgICBwZW5kaW5nTG9jYXRpb24uY3VycmVudCA9IGFyZy5sb2NhdGlvbjtcclxuICB9KTtcclxuXHJcbiAgLy8g5qih5oufY29tcG9uZW50RGlkTW91bnTlkoxjb21wb25lbnRXaWxsVW5tb3VudFxyXG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAodW5MaXN0ZW4pIHtcclxuICAgICAgdW5MaXN0ZW4oKTtcclxuICAgIH1cclxuICAgIC8vIOebkeWQrGhpc3RvcnnkuK3nmoTkvY3nva7lj5jljJZcclxuICAgIHVuTGlzdGVuID0gaGlzdG9yeS5saXN0ZW4oYXJnID0+IHtcclxuICAgICAgc2V0TG9jYXRpb24oYXJnLmxvY2F0aW9uKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChwZW5kaW5nTG9jYXRpb24uY3VycmVudCkge1xyXG4gICAgICBzZXRMb2NhdGlvbihwZW5kaW5nTG9jYXRpb24uY3VycmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgaWYgKHVuTGlzdGVuKSB7XHJcbiAgICAgICAgdW5MaXN0ZW4oKTtcclxuICAgICAgICB1bkxpc3RlbiA9IG51bGw7XHJcbiAgICAgICAgcGVuZGluZ0xvY2F0aW9uLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgY29uc3QgaW5pdENvbnRleHRWYWx1ZTogUm91dGVyQ29udGV4dFZhbHVlID0gdXNlTWVtbyhcclxuICAgICgpID0+ICh7XHJcbiAgICAgIGhpc3Rvcnk6IGhpc3RvcnksXHJcbiAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbixcclxuICAgICAgbWF0Y2g6IHsgaXNFeGFjdDogbG9jYXRpb24ucGF0aG5hbWUgPT09ICcvJywgcGFyYW1zOiB7fSwgcGF0aDogJy8nLCBzY29yZTogW10sIHVybDogJy8nIH0sXHJcbiAgICB9KSxcclxuICAgIFtsb2NhdGlvbl0sXHJcbiAgKTtcclxuXHJcbiAgcmV0dXJuIDxSb3V0ZXJDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtpbml0Q29udGV4dFZhbHVlfSBjaGlsZHJlbj17Y2hpbGRyZW59IC8+O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSb3V0ZXI7XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHNvdXJjZSwgZXhjbHVkZWQpIHtcbiAgaWYgKHNvdXJjZSA9PSBudWxsKSByZXR1cm4ge307XG4gIHZhciB0YXJnZXQgPSB7fTtcbiAgdmFyIHNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpO1xuICB2YXIga2V5LCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgc291cmNlS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGtleSA9IHNvdXJjZUtleXNbaV07XG4gICAgaWYgKGV4Y2x1ZGVkLmluZGV4T2Yoa2V5KSA+PSAwKSBjb250aW51ZTtcbiAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59IiwiaW1wb3J0IHsgdXNlTGF5b3V0RWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XHJcblxyXG5leHBvcnQgdHlwZSBMaWZlQ3ljbGVQcm9wcyA9IHtcclxuICBvbk1vdW50PzogKCkgPT4gdm9pZDtcclxuICBvblVwZGF0ZT86IChwcmV2UHJvcHM/OiBMaWZlQ3ljbGVQcm9wcykgPT4gdm9pZDtcclxuICBvblVubW91bnQ/OiAoKSA9PiB2b2lkO1xyXG4gIGRhdGE/OiBhbnk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gTGlmZUN5Y2xlKHByb3BzOiBMaWZlQ3ljbGVQcm9wcykge1xyXG4gIC8vIOS9v+eUqHJlZuS/neWtmOS4iuS4gOasoeeahHByb3Bz77yM6Ziy5q2i6YeN5paw5riy5p+TXHJcbiAgY29uc3QgcHJldlByb3BzID0gdXNlUmVmPExpZmVDeWNsZVByb3BzIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3QgaXNNb3VudCA9IHVzZVJlZihmYWxzZSk7XHJcblxyXG4gIGNvbnN0IHsgb25Nb3VudCwgb25VcGRhdGUsIG9uVW5tb3VudCB9ID0gcHJvcHM7XHJcblxyXG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XHJcbiAgICAvLyDpppbmrKHmjILovb0g5qih5oufY29tcG9uZW50RGlkTW91bnRcclxuICAgIGlmICghaXNNb3VudC5jdXJyZW50KSB7XHJcbiAgICAgIGlzTW91bnQuY3VycmVudCA9IHRydWU7XHJcbiAgICAgIGlmIChvbk1vdW50KSB7XHJcbiAgICAgICAgb25Nb3VudCgpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyDkuI3mmK/pppbmrKHmuLLmn5Mg5qih5oufY29tcG9uZW50RGlkVXBkYXRlXHJcbiAgICAgIGlmIChvblVwZGF0ZSkge1xyXG4gICAgICAgIHByZXZQcm9wcy5jdXJyZW50ID8gb25VcGRhdGUocHJldlByb3BzLmN1cnJlbnQpIDogb25VcGRhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJldlByb3BzLmN1cnJlbnQgPSBwcm9wcztcclxuICB9KTtcclxuXHJcbiAgLy8g5qih5oufY29tcG9uZW50V2lsbFVubW91bnRcclxuICB1c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgaWYgKG9uVW5tb3VudCkge1xyXG4gICAgICAgIG9uVW5tb3VudCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUm91dGVyQ29udGV4dCBmcm9tICcuL2NvbnRleHQnO1xyXG5pbXBvcnQgeyBMaWZlQ3ljbGUsIExpZmVDeWNsZVByb3BzIH0gZnJvbSAnLi9saWZlQ3ljbGVIb29rJztcclxuaW1wb3J0IHsgTWF0Y2hlZCwgY3JlYXRlUGF0aFBhcnNlciB9IGZyb20gJy4vbWF0Y2hlci9wYXJzZXInO1xyXG5pbXBvcnQgeyBhZGRIZWFkU2xhc2gsIGlzTG9jYXRpb25FcXVhbCwgcGFyc2VQYXRoIH0gZnJvbSAnLi4vaGlzdG9yeS91dGlscyc7XHJcbmltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSAnLi9pbmRleCc7XHJcblxyXG5leHBvcnQgdHlwZSBSZWRpcmVjdFByb3BzID0ge1xyXG4gIHRvOiBzdHJpbmcgfCBQYXJ0aWFsPExvY2F0aW9uPjtcclxuICBwdXNoPzogYm9vbGVhbjtcclxuICBwYXRoPzogc3RyaW5nO1xyXG4gIGZyb20/OiBzdHJpbmc7XHJcbiAgZXhhY3Q/OiBib29sZWFuO1xyXG4gIHN0cmljdD86IGJvb2xlYW47XHJcblxyXG4gIC8vIOeUsVN3aXRjaOiuoeeul+W+l+WIsFxyXG4gIHJlYWRvbmx5IGNvbXB1dGVkPzogTWF0Y2hlZCB8IG51bGw7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBSZWRpcmVjdDxQIGV4dGVuZHMgUmVkaXJlY3RQcm9wcz4ocHJvcHM6IFApIHtcclxuICBjb25zdCB7IHRvLCBwdXNoID0gZmFsc2UsIGNvbXB1dGVkIH0gPSBwcm9wcztcclxuXHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoUm91dGVyQ29udGV4dCk7XHJcbiAgY29uc3QgeyBoaXN0b3J5IH0gPSBjb250ZXh0O1xyXG5cclxuICBjb25zdCBjYWxjTG9jYXRpb24gPSAoKTogUGFydGlhbDxMb2NhdGlvbj4gPT4ge1xyXG4gICAgaWYgKGNvbXB1dGVkKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgdG8gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VyID0gY3JlYXRlUGF0aFBhcnNlcih0byk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gcGFyc2VyLmNvbXBpbGUoY29tcHV0ZWQucGFyYW1zKTtcclxuICAgICAgICByZXR1cm4gcGFyc2VQYXRoKHRhcmdldCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcGF0aG5hbWUgPSB0by5wYXRobmFtZSA/IGFkZEhlYWRTbGFzaCh0by5wYXRobmFtZSkgOiAnLyc7XHJcbiAgICAgICAgY29uc3QgcGFyc2VyID0gY3JlYXRlUGF0aFBhcnNlcihwYXRobmFtZSk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gcGFyc2VyLmNvbXBpbGUoY29tcHV0ZWQucGFyYW1zKTtcclxuICAgICAgICByZXR1cm4geyAuLi50bywgcGF0aG5hbWU6IHRhcmdldCB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHlwZW9mIHRvID09PSAnc3RyaW5nJyA/IHBhcnNlUGF0aCh0bykgOiB0bztcclxuICB9O1xyXG5cclxuICBjb25zdCBuYXZpZ2F0ZSA9IHB1c2ggPyBoaXN0b3J5LnB1c2ggOiBoaXN0b3J5LnJlcGxhY2U7XHJcbiAgY29uc3QgeyBzdGF0ZSwgLi4ucGF0aCB9ID0gY2FsY0xvY2F0aW9uKCk7XHJcblxyXG4gIGNvbnN0IG9uTW91bnRGdW5jID0gKCkgPT4ge1xyXG4gICAgbmF2aWdhdGUocGF0aCwgc3RhdGUpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG9uVXBkYXRlRnVuYyA9IChwcmV2UHJvcHM/OiBMaWZlQ3ljbGVQcm9wcykgPT4ge1xyXG4gICAgLy8g5aaC5p6c5b2T5YmN6aG16Z2i5LiO6YeN5a6a5ZCR5YmN6aG16Z2i5LiN5LiA6Ie077yM5omn6KGM6Lez6L2sXHJcbiAgICBjb25zdCBwcmV2UGF0aCA9IHByZXZQcm9wcz8uZGF0YSBhcyBMb2NhdGlvbjtcclxuICAgIGlmICghaXNMb2NhdGlvbkVxdWFsKHByZXZQYXRoLCBwYXRoKSkge1xyXG4gICAgICBuYXZpZ2F0ZShwYXRoLCBzdGF0ZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIDxMaWZlQ3ljbGUgb25Nb3VudD17b25Nb3VudEZ1bmN9IG9uVXBkYXRlPXtvblVwZGF0ZUZ1bmN9IGRhdGE9e3BhdGh9IC8+O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZWRpcmVjdDtcclxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VDb250ZXh0LCBDaGlsZHJlbiwgaXNWYWxpZEVsZW1lbnQsIGNsb25lRWxlbWVudCB9IGZyb20gJ3JlYWN0JztcclxuXHJcbmltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSAnLi9pbmRleCc7XHJcbmltcG9ydCBSb3V0ZXJDb250ZXh0IGZyb20gJy4vY29udGV4dCc7XHJcbmltcG9ydCB7IE1hdGNoZWQsIG1hdGNoUGF0aCB9IGZyb20gJy4vbWF0Y2hlci9wYXJzZXInO1xyXG5pbXBvcnQgUm91dGUsIHsgUm91dGVQcm9wcyB9IGZyb20gJy4vUm91dGUnO1xyXG5pbXBvcnQgUmVkaXJlY3QsIHsgUmVkaXJlY3RQcm9wcyB9IGZyb20gJy4vUmVkaXJlY3QnO1xyXG5cclxuZXhwb3J0IHR5cGUgU3dpdGNoUHJvcHMgPSB7XHJcbiAgbG9jYXRpb24/OiBMb2NhdGlvbjtcclxuICBjaGlsZHJlbj86IFJlYWN0LlJlYWN0Tm9kZTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFN3aXRjaDxQIGV4dGVuZHMgU3dpdGNoUHJvcHM+KHByb3BzOiBQKTogUmVhY3QuUmVhY3RFbGVtZW50IHwgbnVsbCB7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoUm91dGVyQ29udGV4dCk7XHJcbiAgY29uc3QgbG9jYXRpb24gPSBwcm9wcy5sb2NhdGlvbiB8fCBjb250ZXh0LmxvY2F0aW9uO1xyXG5cclxuICBsZXQgZWxlbWVudDogUmVhY3QuUmVhY3RFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgbGV0IG1hdGNoOiBNYXRjaGVkIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIOS9v+eUqGZvckVhY2jkuI3kvJrnu5lSZWFjdC5SZWFjdE5vZGXlop7liqBrZXnlsZ7mgKcs6Ziy5q2i6YeN5paw5riy5p+TXHJcbiAgQ2hpbGRyZW4uZm9yRWFjaChwcm9wcy5jaGlsZHJlbiwgbm9kZSA9PiB7XHJcbiAgICBpZiAobWF0Y2ggPT09IG51bGwgJiYgaXNWYWxpZEVsZW1lbnQobm9kZSkpIHtcclxuICAgICAgZWxlbWVudCA9IG5vZGU7XHJcblxyXG4gICAgICBsZXQgc3RyaWN0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xyXG4gICAgICBsZXQgc2Vuc2l0aXZlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xyXG4gICAgICBsZXQgcGF0aDogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQ7XHJcbiAgICAgIGxldCBmcm9tOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAvLyBub2Rl5Y+v6IO95pivUm91dGXlkoxSZWRpcmVjdFxyXG4gICAgICBpZiAobm9kZS50eXBlID09PSBSb3V0ZSkge1xyXG4gICAgICAgIGNvbnN0IHByb3BzID0gbm9kZS5wcm9wcyBhcyBSb3V0ZVByb3BzO1xyXG4gICAgICAgIHN0cmljdCA9IHByb3BzLnN0cmljdDtcclxuICAgICAgICBzZW5zaXRpdmUgPSBwcm9wcy5zZW5zaXRpdmU7XHJcbiAgICAgICAgcGF0aCA9IHByb3BzLnBhdGg7XHJcbiAgICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09PSBSZWRpcmVjdCkge1xyXG4gICAgICAgIGNvbnN0IHByb3BzID0gbm9kZS5wcm9wcyBhcyBSZWRpcmVjdFByb3BzO1xyXG4gICAgICAgIHBhdGggPSBwcm9wcy5wYXRoO1xyXG4gICAgICAgIHN0cmljdCA9IHByb3BzLnN0cmljdDtcclxuICAgICAgICBmcm9tID0gcHJvcHMuZnJvbTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZXhhY3QgPSBub2RlLnByb3BzLmV4YWN0O1xyXG4gICAgICBjb25zdCB0YXJnZXQgPSBwYXRoIHx8IGZyb207XHJcblxyXG4gICAgICAvLyDmm7TmlrDljLnphY3nirbmgIHvvIzkuIDml6bljLnphY3liLDlgZzmraLpgY3ljoZcclxuICAgICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIG1hdGNoID0gbWF0Y2hQYXRoKGxvY2F0aW9uLnBhdGhuYW1lLCB0YXJnZXQsIHtcclxuICAgICAgICAgIHN0cmljdE1vZGU6IHN0cmljdCxcclxuICAgICAgICAgIGNhc2VTZW5zaXRpdmU6IHNlbnNpdGl2ZSxcclxuICAgICAgICAgIGV4YWN0OiBleGFjdCxcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtYXRjaCA9IGNvbnRleHQubWF0Y2g7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgaWYgKG1hdGNoICYmIGVsZW1lbnQpIHtcclxuICAgIC8vIOS9v+eUqGNsb25lRWxlbWVudOWkjeWItuW3suaciee7hOS7tuW5tuabtOaWsOWFtlByb3BzXHJcbiAgICByZXR1cm4gY2xvbmVFbGVtZW50KGVsZW1lbnQsIHsgbG9jYXRpb246IGxvY2F0aW9uLCBjb21wdXRlZDogbWF0Y2ggfSk7XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTd2l0Y2g7XHJcbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgTGlmZUN5Y2xlLCBMaWZlQ3ljbGVQcm9wcyB9IGZyb20gJy4vbGlmZUN5Y2xlSG9vayc7XHJcbmltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSAnLi9pbmRleCc7XHJcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uL2hpc3RvcnkvdHlwZXMnO1xyXG5pbXBvcnQgUm91dGVyQ29udGV4dCBmcm9tICcuL2NvbnRleHQnO1xyXG5cclxudHlwZSBQcm9tcHRQcm9wcyA9IHtcclxuICBtZXNzYWdlPzogc3RyaW5nIHwgKChsb2NhdGlvbjogUGFydGlhbDxMb2NhdGlvbj4sIGFjdGlvbjogQWN0aW9uKSA9PiB2b2lkKTtcclxuICB3aGVuPzogYm9vbGVhbiB8ICgobG9jYXRpb246IFBhcnRpYWw8TG9jYXRpb24+KSA9PiBib29sZWFuKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFByb21wdDxQIGV4dGVuZHMgUHJvbXB0UHJvcHM+KHByb3BzOiBQKSB7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoUm91dGVyQ29udGV4dCk7XHJcblxyXG4gIGNvbnN0IHsgbWVzc2FnZSwgd2hlbiA9IHRydWUgfSA9IHByb3BzO1xyXG5cclxuICBpZiAoKHR5cGVvZiB3aGVuID09PSAnZnVuY3Rpb24nICYmIHdoZW4oY29udGV4dC5sb2NhdGlvbikgPT09IGZhbHNlKSB8fCAhd2hlbikge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBjb25zdCBuYXZpZ2F0ZSA9IGNvbnRleHQuaGlzdG9yeS5ibG9jaztcclxuXHJcbiAgbGV0IHJlbGVhc2U6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG5cclxuICBjb25zdCBvbk1vdW50RnVuYyA9ICgpID0+IHtcclxuICAgIHJlbGVhc2UgPSBtZXNzYWdlID8gbmF2aWdhdGUobWVzc2FnZSkgOiBudWxsO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG9uVXBkYXRlRnVuYyA9IChwcmV2UHJvcHM/OiBMaWZlQ3ljbGVQcm9wcykgPT4ge1xyXG4gICAgaWYgKHByZXZQcm9wcyAmJiBwcmV2UHJvcHMuZGF0YSAhPT0gbWVzc2FnZSkge1xyXG4gICAgICBpZiAocmVsZWFzZSkge1xyXG4gICAgICAgIHJlbGVhc2UoKTtcclxuICAgICAgfVxyXG4gICAgICByZWxlYXNlID0gbWVzc2FnZSA/IG5hdmlnYXRlKG1lc3NhZ2UpIDogbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBvblVubW91bnRGdW5jID0gKCkgPT4ge1xyXG4gICAgaWYgKHJlbGVhc2UpIHtcclxuICAgICAgcmVsZWFzZSgpO1xyXG4gICAgfVxyXG4gICAgcmVsZWFzZSA9IG51bGw7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIDxMaWZlQ3ljbGUgb25Nb3VudD17b25Nb3VudEZ1bmN9IG9uVXBkYXRlPXtvblVwZGF0ZUZ1bmN9IG9uVW5tb3VudD17b25Vbm1vdW50RnVuY30gZGF0YT17bWVzc2FnZX0gLz47XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFByb21wdDtcclxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUm91dGVyQ29udGV4dCBmcm9tICcuL2NvbnRleHQnO1xyXG5cclxuZnVuY3Rpb24gd2l0aFJvdXRlcjxDIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50VHlwZT4oQ29tcG9uZW50OiBDKSB7XHJcblxyXG4gIGZ1bmN0aW9uIENvbXBvbmVudFdpdGhSb3V0ZXJQcm9wKHByb3BzOiBhbnkpIHtcclxuICAgIGNvbnN0IHsgaGlzdG9yeSwgbG9jYXRpb24sIG1hdGNoIH0gPSB1c2VDb250ZXh0KFJvdXRlckNvbnRleHQpO1xyXG4gICAgY29uc3Qgcm91dGVQcm9wcyA9IHsgaGlzdG9yeTogaGlzdG9yeSwgbG9jYXRpb246IGxvY2F0aW9uLCBtYXRjaDogbWF0Y2ggfTtcclxuXHJcbiAgICByZXR1cm4gPENvbXBvbmVudCB7Li4ucHJvcHN9IHsuLi5yb3V0ZVByb3BzfSAvPjtcclxuICB9XHJcblxyXG4gIHJldHVybiBDb21wb25lbnRXaXRoUm91dGVyUHJvcDtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgd2l0aFJvdXRlcjsiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgSGlzdG9yeSB9IGZyb20gJy4uL2hpc3RvcnkvdHlwZXMnO1xyXG5pbXBvcnQgeyBCYXNlUm91dGVyUHJvcHMgfSBmcm9tICcuL0Jyb3dzZXJSb3V0ZXInO1xyXG5pbXBvcnQgeyBjcmVhdGVIYXNoSGlzdG9yeSwgdXJsSGFzaFR5cGUgfSBmcm9tICcuLi9oaXN0b3J5L2hhc2hIaXN0b3J5JztcclxuaW1wb3J0IFJvdXRlciBmcm9tICcuL1JvdXRlcic7XHJcblxyXG5leHBvcnQgdHlwZSBIYXNoUm91dGVyUHJvcHMgPSBCYXNlUm91dGVyUHJvcHMgJiB7XHJcbiAgaGFzaFR5cGU6IHVybEhhc2hUeXBlO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gSGFzaFJvdXRlcjxQIGV4dGVuZHMgUGFydGlhbDxIYXNoUm91dGVyUHJvcHM+Pihwcm9wczogUCkge1xyXG4gIGxldCBoaXN0b3J5UmVmID0gdXNlUmVmPEhpc3Rvcnk+KCk7XHJcbiAgaWYgKGhpc3RvcnlSZWYuY3VycmVudCA9PT0gbnVsbCB8fCBoaXN0b3J5UmVmLmN1cnJlbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgaGlzdG9yeVJlZi5jdXJyZW50ID0gY3JlYXRlSGFzaEhpc3Rvcnkoe1xyXG4gICAgICBiYXNlbmFtZTogcHJvcHMuYmFzZW5hbWUsXHJcbiAgICAgIGdldFVzZXJDb25maXJtYXRpb246IHByb3BzLmdldFVzZXJDb25maXJtYXRpb24sXHJcbiAgICAgIGhhc2hUeXBlOiBwcm9wcy5oYXNoVHlwZSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIDxSb3V0ZXIgaGlzdG9yeT17aGlzdG9yeVJlZi5jdXJyZW50fT57cHJvcHMuY2hpbGRyZW59PC9Sb3V0ZXI+O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBIYXNoUm91dGVyOyIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlUmVmLCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBSb3V0ZXIgZnJvbSAnLi9Sb3V0ZXInO1xyXG5pbXBvcnQgeyBjcmVhdGVCcm93c2VySGlzdG9yeSB9IGZyb20gJy4uL2hpc3RvcnkvYnJvd2VySGlzdG9yeSc7XHJcbmltcG9ydCB7IENvbmZpcm1hdGlvbkZ1bmMsIEhpc3RvcnkgfSBmcm9tICcuLi9oaXN0b3J5L3R5cGVzJztcclxuXHJcbmV4cG9ydCB0eXBlIEJhc2VSb3V0ZXJQcm9wcyA9IHtcclxuICBiYXNlbmFtZTogc3RyaW5nO1xyXG4gIGdldFVzZXJDb25maXJtYXRpb246IENvbmZpcm1hdGlvbkZ1bmM7XHJcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBCcm93c2VyUm91dGVyUHJvcHMgPSBCYXNlUm91dGVyUHJvcHMgJiB7XHJcbiAgZm9yY2VSZWZyZXNoOiBib29sZWFuO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gQnJvd3NlclJvdXRlcjxQIGV4dGVuZHMgUGFydGlhbDxCcm93c2VyUm91dGVyUHJvcHM+Pihwcm9wczogUCkge1xyXG4gIC8vIOS9v+eUqFJlZuaMgeaciUhpc3Rvcnnlr7nosaHvvIzpmLLmraLph43lpI3muLLmn5NcclxuICBsZXQgaGlzdG9yeVJlZiA9IHVzZVJlZjxIaXN0b3J5PigpO1xyXG5cclxuICBpZiAoaGlzdG9yeVJlZi5jdXJyZW50ID09PSBudWxsIHx8IGhpc3RvcnlSZWYuY3VycmVudCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBoaXN0b3J5UmVmLmN1cnJlbnQgPSBjcmVhdGVCcm93c2VySGlzdG9yeSh7XHJcbiAgICAgIGJhc2VuYW1lOiBwcm9wcy5iYXNlbmFtZSxcclxuICAgICAgZm9yY2VSZWZyZXNoOiBwcm9wcy5mb3JjZVJlZnJlc2gsXHJcbiAgICAgIGdldFVzZXJDb25maXJtYXRpb246IHByb3BzLmdldFVzZXJDb25maXJtYXRpb24sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHJldHVybiA8Um91dGVyIGhpc3Rvcnk9e2hpc3RvcnlSZWYuY3VycmVudH0+e3Byb3BzLmNoaWxkcmVufTwvUm91dGVyPjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQnJvd3NlclJvdXRlcjsiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBSb3V0ZXJDb250ZXh0IGZyb20gJy4vY29udGV4dCc7XHJcbmltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSAnLi9pbmRleCc7XHJcbmltcG9ydCB7IGNyZWF0ZVBhdGgsIHBhcnNlUGF0aCB9IGZyb20gJy4uL2hpc3RvcnkvdXRpbHMnO1xyXG5pbXBvcnQgeyBQYXRoIH0gZnJvbSAnLi4vaGlzdG9yeS90eXBlcyc7XHJcblxyXG5leHBvcnQgdHlwZSBMaW5rUHJvcHMgPSB7XHJcbiAgY29tcG9uZW50PzogUmVhY3QuQ29tcG9uZW50VHlwZTxhbnk+O1xyXG4gIHRvOiBQYXJ0aWFsPExvY2F0aW9uPiB8IHN0cmluZyB8ICgobG9jYXRpb246IExvY2F0aW9uKSA9PiBzdHJpbmcgfCBQYXJ0aWFsPExvY2F0aW9uPik7XHJcbiAgcmVwbGFjZT86IGJvb2xlYW47XHJcbiAgdGFnPzogc3RyaW5nO1xyXG4gIC8qKlxyXG4gICAqIEBkZXByZWNhdGVkXHJcbiAgICogUmVhY3QxNuS7peWQjuS4jeWGjemcgOimgeivpeWxnuaAp1xyXG4gICAqKi9cclxuICBpbm5lclJlZj86IFJlYWN0LlJlZjxIVE1MQW5jaG9yRWxlbWVudD47XHJcbn0gJiBSZWFjdC5BbmNob3JIVE1MQXR0cmlidXRlczxIVE1MQW5jaG9yRWxlbWVudD47XHJcblxyXG5jb25zdCBpc01vZGlmaWVkRXZlbnQgPSAoZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcclxuICByZXR1cm4gZXZlbnQubWV0YUtleSB8fCBldmVudC5hbHRLZXkgfHwgZXZlbnQuY3RybEtleSB8fCBldmVudC5zaGlmdEtleTtcclxufTtcclxuXHJcbmNvbnN0IGNoZWNrVGFyZ2V0ID0gKHRhcmdldD86IFJlYWN0LkhUTUxBdHRyaWJ1dGVBbmNob3JUYXJnZXQpID0+IHtcclxuICByZXR1cm4gIXRhcmdldCB8fCB0YXJnZXQgPT09ICdfc2VsZic7XHJcbn07XHJcblxyXG5cclxuZnVuY3Rpb24gTGluazxQIGV4dGVuZHMgTGlua1Byb3BzPihwcm9wczogUCkge1xyXG4gIGNvbnN0IHsgdG8sIHJlcGxhY2UsIGNvbXBvbmVudCwgb25DbGljaywgdGFyZ2V0LCAuLi5vdGhlciB9ID0gcHJvcHM7XHJcblxyXG4gIGNvbnN0IHRhZyA9IHByb3BzLnRhZyB8fCAnYSc7XHJcblxyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFJvdXRlckNvbnRleHQpO1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBjb250ZXh0Lmhpc3Rvcnk7XHJcblxyXG4gIGxldCBsb2NhdGlvbiA9IHR5cGVvZiB0byA9PT0gJ2Z1bmN0aW9uJyA/IHRvKGNvbnRleHQubG9jYXRpb24pIDogdG87XHJcblxyXG4gIGxldCBzdGF0ZTogYW55O1xyXG4gIGxldCBwYXRoOiBQYXJ0aWFsPFBhdGg+O1xyXG4gIGlmICh0eXBlb2YgbG9jYXRpb24gPT09ICdzdHJpbmcnKSB7XHJcbiAgICBwYXRoID0gcGFyc2VQYXRoKGxvY2F0aW9uKTtcclxuICB9IGVsc2Uge1xyXG4gICAgY29uc3QgeyBwYXRobmFtZSwgaGFzaCwgc2VhcmNoIH0gPSBsb2NhdGlvbjtcclxuICAgIHBhdGggPSB7IHBhdGhuYW1lLCBoYXNoLCBzZWFyY2ggfTtcclxuICAgIHN0YXRlID0gbG9jYXRpb24uc3RhdGU7XHJcbiAgfVxyXG4gIGNvbnN0IGhyZWYgPSBoaXN0b3J5LmNyZWF0ZUhyZWYocGF0aCk7XHJcblxyXG4gIGNvbnN0IGxpbmtDbGlja0V2ZW50ID0gKGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxBbmNob3JFbGVtZW50PikgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKG9uQ2xpY2spIHtcclxuICAgICAgICBvbkNsaWNrKGV2ZW50KTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiBldmVudC5idXR0b24gPT09IDAgJiYgY2hlY2tUYXJnZXQodGFyZ2V0KSAmJiAhaXNNb2RpZmllZEV2ZW50KGV2ZW50KSkge1xyXG4gICAgICAvLyDkuI3mmK/nm7jlkIznmoTot6/lvoTmiafooYxwdXNo5pON5L2c77yM5piv55u45ZCM55qE6Lev5b6E5omn6KGMcmVwbGFjZVxyXG4gICAgICBjb25zdCBpc1NhbWVQYXRoID0gY3JlYXRlUGF0aChjb250ZXh0LmxvY2F0aW9uKSA9PT0gY3JlYXRlUGF0aChwYXRoKTtcclxuICAgICAgY29uc3QgbmF2aWdhdGUgPSByZXBsYWNlIHx8IGlzU2FtZVBhdGggPyBoaXN0b3J5LnJlcGxhY2UgOiBoaXN0b3J5LnB1c2g7XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIG5hdmlnYXRlKHBhdGgsIHN0YXRlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBsaW5rUHJvcHMgPSB7IGhyZWY6IGhyZWYsIG9uQ2xpY2s6IGxpbmtDbGlja0V2ZW50LCAuLi5vdGhlciB9O1xyXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHRhZywgbGlua1Byb3BzKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGluazsiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB0eXBlIHsgTGlua1Byb3BzIH0gZnJvbSAnLi9MaW5rJztcclxuaW1wb3J0IExpbmsgZnJvbSAnLi9MaW5rJztcclxuaW1wb3J0IHsgTG9jYXRpb24sIG1hdGNoUGF0aCB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyBNYXRjaGVkIH0gZnJvbSAnLi9tYXRjaGVyL3BhcnNlcic7XHJcbmltcG9ydCBDb250ZXh0IGZyb20gJy4vY29udGV4dCc7XHJcbmltcG9ydCB7IHBhcnNlUGF0aCB9IGZyb20gJy4uL2hpc3RvcnkvdXRpbHMnO1xyXG5pbXBvcnQgeyBlc2NhcGVTdHIgfSBmcm9tICcuL21hdGNoZXIvdXRpbHMnO1xyXG5cclxudHlwZSBOYXZMaW5rUHJvcHMgPSB7XHJcbiAgdG86IFBhcnRpYWw8TG9jYXRpb24+IHwgc3RyaW5nIHwgKChsb2NhdGlvbjogTG9jYXRpb24pID0+IHN0cmluZyB8IFBhcnRpYWw8TG9jYXRpb24+KTtcclxuICBpc0FjdGl2ZT86IChtYXRjaDogTWF0Y2hlZCB8IG51bGwsIGxvY2F0aW9uOiBMb2NhdGlvbikgPT4gYm9vbGVhbjtcclxuICAvLyBjb21wYXQgcmVhY3Qtcm91dGVyIE5hdkxpbmsgcHJvcHMgdHlwZVxyXG4gIFtrZXk6IHN0cmluZ106IGFueTtcclxufSAmIExpbmtQcm9wcztcclxuXHJcbnR5cGUgUGFnZSA9ICdwYWdlJztcclxuXHJcbmZ1bmN0aW9uIE5hdkxpbms8UCBleHRlbmRzIE5hdkxpbmtQcm9wcz4ocHJvcHM6IFApIHtcclxuICBjb25zdCB7IHRvLCBpc0FjdGl2ZSwgLi4ucmVzdCB9ID0gcHJvcHM7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQ29udGV4dCk7XHJcblxyXG4gIGNvbnN0IHRvTG9jYXRpb24gPSB0eXBlb2YgdG8gPT09ICdmdW5jdGlvbicgPyB0byhjb250ZXh0LmxvY2F0aW9uKSA6IHRvO1xyXG5cclxuICBjb25zdCB7IHBhdGhuYW1lOiBwYXRoIH0gPSB0eXBlb2YgdG9Mb2NhdGlvbiA9PT0gJ3N0cmluZycgPyBwYXJzZVBhdGgodG9Mb2NhdGlvbikgOiB0b0xvY2F0aW9uO1xyXG4gIC8vIOaKiuato+WImeihqOi+vuW8j+eahOeJueauiuespuWPt+WKoOS4pOS4quWPjeaWnOadoOi/m+ihjOi9rOS5iVxyXG4gIGNvbnN0IGVzY2FwZWRQYXRoID0gcGF0aCA/IGVzY2FwZVN0cihwYXRoKSA6ICcnO1xyXG4gIGNvbnN0IG1hdGNoID0gZXNjYXBlZFBhdGggPyBtYXRjaFBhdGgoY29udGV4dC5sb2NhdGlvbi5wYXRobmFtZSwgZXNjYXBlZFBhdGgpIDogbnVsbDtcclxuXHJcbiAgY29uc3QgaXNMaW5rQWN0aXZlID0gbWF0Y2ggJiYgaXNBY3RpdmUgPyBpc0FjdGl2ZShtYXRjaCwgY29udGV4dC5sb2NhdGlvbikgOiBmYWxzZTtcclxuXHJcbiAgY29uc3QgcGFnZTogUGFnZSA9ICdwYWdlJztcclxuICBjb25zdCBvdGhlclByb3BzID0ge1xyXG4gICAgJ2FyaWEtY3VycmVudCc6IGlzTGlua0FjdGl2ZSA/IHBhZ2UgOiBmYWxzZSxcclxuICAgIC4uLnJlc3QsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIDxMaW5rIHRvPXt0b30gey4uLm90aGVyUHJvcHN9IC8+O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOYXZMaW5rO1xyXG4iXSwibmFtZXMiOlsiaXNCcm93c2VyIiwid2luZG93IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZ2V0RGVmYXVsdENvbmZpcm1hdGlvbiIsIm1lc3NhZ2UiLCJjYWxsQmFjayIsImNvbmZpcm0iLCJpc1N1cHBvcnRIaXN0b3J5IiwiaGlzdG9yeSIsImlzU3VwcG9ydHNQb3BTdGF0ZSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImluZGV4T2YiLCJBY3Rpb24iLCJFdmVudFR5cGUiLCJfZXh0ZW5kcyIsIk9iamVjdCIsImFzc2lnbiIsImJpbmQiLCJ0YXJnZXQiLCJpIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwic291cmNlIiwia2V5IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiYXBwbHkiLCJjcmVhdGVQYXRoIiwicGF0aCIsInNlYXJjaCIsImhhc2giLCJwYXRobmFtZSIsInN0YXJ0c1dpdGgiLCJwYXJzZVBhdGgiLCJ1cmwiLCJwYXJzZWRQYXRoIiwiaGFzaElkeCIsInN1YnN0cmluZyIsInNlYXJjaElkeCIsImNyZWF0ZUxvY2F0aW9uIiwiY3VycmVudCIsInRvIiwic3RhdGUiLCJ1cmxPYmoiLCJnZXRSYW5kS2V5IiwiZ2VuUmFuZG9tS2V5IiwibG9jYXRpb24iLCJpc0xvY2F0aW9uRXF1YWwiLCJwMSIsInAyIiwiYWRkSGVhZFNsYXNoIiwic3RyaXBIZWFkU2xhc2giLCJub3JtYWxpemVTbGFzaCIsInRlbXBQYXRoIiwiaGFzQmFzZW5hbWUiLCJwcmVmaXgiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwiY2hhckF0Iiwic3RyaXBCYXNlbmFtZSIsImNyZWF0ZU1lbW9yeVJlY29yZCIsImluaXRWYWwiLCJmbiIsInZpc2l0ZWRSZWNvcmQiLCJnZXREZWx0YSIsImZvcm0iLCJ0b0lkeCIsImxhc3RJbmRleE9mIiwiZnJvbUlkeCIsImFkZFJlY29yZCIsIm5ld1JlY29yZCIsImFjdGlvbiIsImN1clZhbCIsIk5ld1ZhbCIsInB1c2giLCJwcmV2SWR4IiwibmV3VmlzaXRlZFJlY29yZCIsInNsaWNlIiwicmVwbGFjZSIsImVuZCIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsIl9jbGFzc0NhbGxDaGVjayIsImluc3RhbmNlIiwiQ29uc3RydWN0b3IiLCJUeXBlRXJyb3IiLCJfdHlwZW9mIiwib2JqIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJjb25zdHJ1Y3RvciIsIl90b1ByaW1pdGl2ZSIsImlucHV0IiwiaGludCIsInByaW0iLCJ0b1ByaW1pdGl2ZSIsInVuZGVmaW5lZCIsInJlcyIsIlN0cmluZyIsIk51bWJlciIsIl90b1Byb3BlcnR5S2V5IiwiYXJnIiwiX2RlZmluZVByb3BlcnRpZXMiLCJwcm9wcyIsImRlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJkZWZpbmVQcm9wZXJ0eSIsInRvUHJvcGVydHlLZXkiLCJfY3JlYXRlQ2xhc3MiLCJwcm90b1Byb3BzIiwic3RhdGljUHJvcHMiLCJUcmFuc2l0aW9uTWFuYWdlciIsInByb21wdCIsImxpc3RlbmVycyIsInZhbHVlIiwic2V0UHJvbXB0IiwiX3RoaXMiLCJhZGRMaXN0ZW5lciIsImZ1bmMiLCJfdGhpczIiLCJpc0FjdGl2ZSIsImxpc3RlbmVyIiwiYXJncyIsImZpbHRlciIsIml0ZW0iLCJub3RpZnlMaXN0ZW5lcnMiLCJfaXRlcmF0b3IiLCJfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlciIsIl9zdGVwIiwicyIsIm4iLCJkb25lIiwiZXJyIiwiZSIsImYiLCJjb25maXJtSnVtcFRvIiwidXNlckNvbmZpcm1hdGlvbkZ1bmMiLCJyZXN1bHQiLCJ3YXJuaW5nIiwiY29uZGl0aW9uIiwiY29uc29sZSIsIndhcm4iLCJnZXRCYXNlSGlzdG9yeSIsInRyYW5zaXRpb25NYW5hZ2VyIiwic2V0TGlzdGVuZXIiLCJicm93c2VySGlzdG9yeSIsImdvIiwic3RlcCIsImdvQmFjayIsImdvRm9yd2FyZCIsImxpc3RlbiIsImNhbmNlbCIsImlzQmxvY2tlZCIsImJsb2NrIiwidW5ibG9jayIsImdldFVwZGF0ZVN0YXRlRnVuYyIsImhpc3RvcnlQcm9wcyIsIm5leHRTdGF0ZSIsImNyZWF0ZUJyb3dzZXJIaXN0b3J5Iiwib3B0aW9ucyIsInN1cHBvcnRIaXN0b3J5IiwiaXNTdXBwb3J0UG9wU3RhdGUiLCJfb3B0aW9ucyRmb3JjZVJlZnJlc2giLCJmb3JjZVJlZnJlc2giLCJfb3B0aW9ucyRnZXRVc2VyQ29uZmkiLCJnZXRVc2VyQ29uZmlybWF0aW9uIiwiYmFzZW5hbWUiLCJpbml0TG9jYXRpb24iLCJnZXRMb2NhdGlvbiIsImdldEhpc3RvcnlTdGF0ZSIsInJlY29yZE9wZXJhdG9yIiwibCIsIl9nZXRCYXNlSGlzdG9yeSIsInBvcCIsImNyZWF0ZUhyZWYiLCJ1cGRhdGVTdGF0ZSIsImhpc3RvcnlTdGF0ZSIsIl93aW5kb3ckbG9jYXRpb24iLCJfcmVmIiwiZm9yY2VKdW1wIiwiaGFuZGxlUG9wU3RhdGUiLCJjYWxsYmFjayIsImlzSnVtcCIsInJldmVydFBvcFN0YXRlIiwicG9wU3RhdGVMaXN0ZW5lciIsImV2ZW50IiwiaGFzaENoYW5nZUxpc3RlbmVyIiwibGlzdGVuZXJDb3VudCIsImNvdW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsIlBvcFN0YXRlIiwiSGFzaENoYW5nZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJkZWx0YSIsImhyZWYiLCJwdXNoU3RhdGUiLCJyZXBsYWNlU3RhdGUiLCJzdHJpcEhhc2giLCJpZHgiLCJnZXRIYXNoQ29udGVudCIsImNyZWF0ZUhhc2hIaXN0b3J5Iiwib3B0aW9uIiwiX29wdGlvbiRoYXNoVHlwZSIsImhhc2hUeXBlIiwiX29wdGlvbiRnZXRVc2VyQ29uZmlyIiwicGF0aERlY29kZXIiLCJwYXRoRW5jb2RlciIsImhhc2hQYXRoIiwibWVtUmVjb3JkcyIsInRhZyIsInF1ZXJ5U2VsZWN0b3IiLCJiYXNlIiwiZ2V0QXR0cmlidXRlIiwiZm9yY2VOZXh0UG9wIiwiaWdub3JlUGF0aCIsImVuY29kZWRQYXRoIiwiaGFuZGxlSGFzaENoYW5nZSIsInByZXZMb2NhdGlvbiIsImNyZWF0ZU5hbWVkQ29udGV4dCIsIm5hbWUiLCJkZWZhdWx0VmFsdWUiLCJjb250ZXh0IiwiY3JlYXRlQ29udGV4dCIsImRpc3BsYXlOYW1lIiwiUm91dGVyQ29udGV4dCIsIlRva2VuVHlwZSIsImNsZWFuUGF0aCIsInNjb3JlQ29tcGFyZSIsInNjb3JlMSIsInNjb3JlMiIsInNjb3JlMUxlbmd0aCIsInNjb3JlMkxlbmd0aCIsIm1pbiIsImVzY2FwZVN0ciIsInN0ciIsInZhbGlkQ2hhciIsImxleGVyIiwidG9rZW5zIiwidXJsUGF0aCIsIkVycm9yIiwiZ2V0TGl0ZXJhbCIsInRlc3QiLCJza2lwQ2hhciIsImN1ckNoYXIiLCJwcmV2Q2hhciIsInR5cGUiLCJEZWxpbWl0ZXIiLCJQYXJhbSIsIldpbGRDYXJkIiwiU3RhdGljIiwiTEJyYWNrZXQiLCJSQnJhY2tldCIsIlBhdHRlcm4iLCJNYXRjaFNjb3JlIiwiZGVmYXVsdE9wdGlvbiIsImNhc2VTZW5zaXRpdmUiLCJzdHJpY3RNb2RlIiwiZXhhY3QiLCJSRUdFWF9DSEFSU19SRSIsIkJBU0VfUEFSQU1fUEFUVEVSTiIsIkRlZmF1bHREZWxpbWl0ZXIiLCJjcmVhdGVQYXRoUGFyc2VyIiwiX29wdGlvbiRjYXNlU2Vuc2l0aXZlIiwiX29wdGlvbiRzdHJpY3RNb2RlIiwiX29wdGlvbiRleGFjdCIsInBhdHRlcm4iLCJrZXlzIiwic2NvcmVzIiwib25seUhhc1dpbGRDYXJkIiwidG9rZW5Db3VudCIsImxhc3RUb2tlbiIsInRva2VuSWR4IiwidG9rZW4iLCJuZXh0VG9rZW4iLCJzdGF0aWMiLCJwYXJhbVJlZ2V4cCIsInBhcmFtIiwid2lsZGNhcmQiLCJwbGFjZWhvbGRlciIsImlzV2lsZENhcmQiLCJmbGFnIiwicmVnZXhwIiwiUmVnRXhwIiwicGFyc2UiLCJyZU1hdGNoIiwibWF0Y2giLCJtYXRjaGVkUGF0aCIsInBhcmFtcyIsInBhcnNlU2NvcmUiLCJBcnJheSIsImZyb20iLCJzcGxpdCIsImlzQXJyYXkiLCJfcGFyYW1zJCIsInNwbGljZSIsImNvbmNhdCIsImZpbGwiLCJpc0V4YWN0Iiwic2NvcmUiLCJjb21waWxlIiwid2lsZENhcmQiLCJqb2luIiwibWF0Y2hQYXRoIiwicGF0dGVybnMiLCJtYXRjaGVkUmVzdWx0cyIsIl9pdGVyYXRvcjIiLCJfc3RlcDIiLCJwYXJzZXIiLCJtYXRjaGVkIiwic29ydCIsImEiLCJiIiwiZ2VuZXJhdGVQYXRoIiwidXNlSGlzdG9yeSIsInVzZUNvbnRleHQiLCJ1c2VMb2NhdGlvbiIsInVzZVBhcmFtcyIsInVzZVJvdXRlTWF0Y2giLCJSb3V0ZSIsImNvbXB1dGVkIiwiY2hpbGRyZW4iLCJjb21wb25lbnQiLCJyZW5kZXIiLCJyb3V0ZUxvY2F0aW9uIiwibmV3UHJvcHMiLCJDaGlsZHJlbiIsImdldENoaWxkcmVuIiwiUmVhY3QiLCJQcm92aWRlciIsIlJvdXRlciIsIl9wcm9wcyRjaGlsZHJlbiIsIl91c2VTdGF0ZSIsInVzZVN0YXRlIiwic2V0TG9jYXRpb24iLCJwZW5kaW5nTG9jYXRpb24iLCJ1c2VSZWYiLCJ1bkxpc3RlbiIsInVzZUxheW91dEVmZmVjdCIsImluaXRDb250ZXh0VmFsdWUiLCJ1c2VNZW1vIiwiX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UiLCJleGNsdWRlZCIsInNvdXJjZUtleXMiLCJMaWZlQ3ljbGUiLCJwcmV2UHJvcHMiLCJpc01vdW50Iiwib25Nb3VudCIsIm9uVXBkYXRlIiwib25Vbm1vdW50IiwiUmVkaXJlY3QiLCJfcHJvcHMkcHVzaCIsImNhbGNMb2NhdGlvbiIsIm5hdmlnYXRlIiwiX2NhbGNMb2NhdGlvbiIsIl9leGNsdWRlZCIsIm9uTW91bnRGdW5jIiwib25VcGRhdGVGdW5jIiwicHJldlBhdGgiLCJkYXRhIiwiU3dpdGNoIiwiZWxlbWVudCIsImZvckVhY2giLCJub2RlIiwiaXNWYWxpZEVsZW1lbnQiLCJzdHJpY3QiLCJzZW5zaXRpdmUiLCJjbG9uZUVsZW1lbnQiLCJQcm9tcHQiLCJfcHJvcHMkd2hlbiIsIndoZW4iLCJyZWxlYXNlIiwib25Vbm1vdW50RnVuYyIsIndpdGhSb3V0ZXIiLCJDb21wb25lbnQiLCJDb21wb25lbnRXaXRoUm91dGVyUHJvcCIsIl91c2VDb250ZXh0Iiwicm91dGVQcm9wcyIsIkhhc2hSb3V0ZXIiLCJoaXN0b3J5UmVmIiwiQnJvd3NlclJvdXRlciIsImlzTW9kaWZpZWRFdmVudCIsIm1ldGFLZXkiLCJhbHRLZXkiLCJjdHJsS2V5Iiwic2hpZnRLZXkiLCJjaGVja1RhcmdldCIsIkxpbmsiLCJvbkNsaWNrIiwib3RoZXIiLCJsaW5rQ2xpY2tFdmVudCIsInByZXZlbnREZWZhdWx0IiwiZGVmYXVsdFByZXZlbnRlZCIsImJ1dHRvbiIsImlzU2FtZVBhdGgiLCJsaW5rUHJvcHMiLCJOYXZMaW5rIiwicmVzdCIsIkNvbnRleHQiLCJ0b0xvY2F0aW9uIiwiZXNjYXBlZFBhdGgiLCJpc0xpbmtBY3RpdmUiLCJwYWdlIiwib3RoZXJQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTyxTQUFTQSxTQUFTQSxHQUFZO0FBQ25DLEVBQUEsT0FBTyxPQUFPQyxNQUFNLEtBQUssV0FBVyxJQUFJQSxNQUFNLENBQUNDLFFBQVEsSUFBSSxPQUFPRCxNQUFNLENBQUNDLFFBQVEsQ0FBQ0MsYUFBYSxLQUFLLFVBQVUsQ0FBQTtBQUNoSCxDQUFBO0FBRU8sU0FBU0Msc0JBQXNCQSxDQUFDQyxPQUFlLEVBQUVDLFFBQW1DLEVBQUU7QUFDM0ZBLEVBQUFBLFFBQVEsQ0FBQ0wsTUFBTSxDQUFDTSxPQUFPLENBQUNGLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDbkMsQ0FBQTs7QUFFQTtBQUNPLFNBQVNHLGdCQUFnQkEsR0FBWTtBQUMxQyxFQUFBLE9BQU9SLFNBQVMsRUFBRSxJQUFJQyxNQUFNLENBQUNRLE9BQU8sSUFBSSxXQUFXLElBQUlSLE1BQU0sQ0FBQ1EsT0FBTyxDQUFBO0FBQ3ZFLENBQUE7O0FBRUE7QUFDTyxTQUFTQyxrQkFBa0JBLEdBQVk7QUFDNUMsRUFBQSxPQUFPVCxNQUFNLENBQUNVLFNBQVMsQ0FBQ0MsU0FBUyxDQUFDQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDN0Q7O0FDZVlDLElBQUFBLE1BQU0sMEJBQU5BLE1BQU0sRUFBQTtFQUFOQSxNQUFNLENBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0VBQU5BLE1BQU0sQ0FBQSxNQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7RUFBTkEsTUFBTSxDQUFBLFNBQUEsQ0FBQSxHQUFBLFNBQUEsQ0FBQTtBQUFBLEVBQUEsT0FBTkEsTUFBTSxDQUFBO0FBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBTU5DLElBQUFBLFNBQVMsMEJBQVRBLFNBQVMsRUFBQTtFQUFUQSxTQUFTLENBQUEsVUFBQSxDQUFBLEdBQUEsVUFBQSxDQUFBO0VBQVRBLFNBQVMsQ0FBQSxZQUFBLENBQUEsR0FBQSxZQUFBLENBQUE7QUFBQSxFQUFBLE9BQVRBLFNBQVMsQ0FBQTtBQUFBLENBQUEsQ0FBQSxFQUFBLENBQUE7O0FDckNOLFNBQVNDLFFBQVFBLEdBQUc7QUFDakNBLEVBQUFBLFFBQVEsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLEdBQUdELE1BQU0sQ0FBQ0MsTUFBTSxDQUFDQyxJQUFJLEVBQUUsR0FBRyxVQUFVQyxNQUFNLEVBQUU7QUFDbEUsSUFBQSxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0MsU0FBUyxDQUFDQyxNQUFNLEVBQUVGLENBQUMsRUFBRSxFQUFFO0FBQ3pDLE1BQUEsSUFBSUcsTUFBTSxHQUFHRixTQUFTLENBQUNELENBQUMsQ0FBQyxDQUFBO0FBQ3pCLE1BQUEsS0FBSyxJQUFJSSxHQUFHLElBQUlELE1BQU0sRUFBRTtBQUN0QixRQUFBLElBQUlQLE1BQU0sQ0FBQ1MsU0FBUyxDQUFDQyxjQUFjLENBQUNDLElBQUksQ0FBQ0osTUFBTSxFQUFFQyxHQUFHLENBQUMsRUFBRTtBQUNyREwsVUFBQUEsTUFBTSxDQUFDSyxHQUFHLENBQUMsR0FBR0QsTUFBTSxDQUFDQyxHQUFHLENBQUMsQ0FBQTtBQUMzQixTQUFBO0FBQ0YsT0FBQTtBQUNGLEtBQUE7QUFDQSxJQUFBLE9BQU9MLE1BQU0sQ0FBQTtHQUNkLENBQUE7QUFDRCxFQUFBLE9BQU9KLFFBQVEsQ0FBQ2EsS0FBSyxDQUFDLElBQUksRUFBRVAsU0FBUyxDQUFDLENBQUE7QUFDeEM7O0FDWE8sU0FBU1EsVUFBVUEsQ0FBQ0MsSUFBbUIsRUFBVTtBQUN0RCxFQUFBLElBQVFDLE1BQU0sR0FBV0QsSUFBSSxDQUFyQkMsTUFBTTtJQUFFQyxJQUFJLEdBQUtGLElBQUksQ0FBYkUsSUFBSSxDQUFBO0FBQ3BCLEVBQUEsSUFBSUMsUUFBUSxHQUFHSCxJQUFJLENBQUNHLFFBQVEsSUFBSSxHQUFHLENBQUE7QUFDbkMsRUFBQSxJQUFJRixNQUFNLElBQUlBLE1BQU0sS0FBSyxHQUFHLEVBQUU7QUFDNUJFLElBQUFBLFFBQVEsSUFBSUYsTUFBTSxDQUFDRyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUdILE1BQU0sR0FBRyxHQUFHLEdBQUdBLE1BQU0sQ0FBQTtBQUM1RCxHQUFBO0FBQ0EsRUFBQSxJQUFJQyxJQUFJLElBQUlBLElBQUksS0FBSyxHQUFHLEVBQUU7QUFDeEJDLElBQUFBLFFBQVEsSUFBSUQsSUFBSSxDQUFDRSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUdGLElBQUksR0FBRyxHQUFHLEdBQUdBLElBQUksQ0FBQTtBQUN0RCxHQUFBO0FBQ0EsRUFBQSxPQUFPQyxRQUFRLENBQUE7QUFDakIsQ0FBQTtBQUVPLFNBQVNFLFNBQVNBLENBQUNDLEdBQVcsRUFBaUI7RUFDcEQsSUFBSSxDQUFDQSxHQUFHLEVBQUU7QUFDUixJQUFBLE9BQU8sRUFBRSxDQUFBO0FBQ1gsR0FBQTtFQUNBLElBQUlDLFVBQXlCLEdBQUcsRUFBRSxDQUFBO0FBRWxDLEVBQUEsSUFBSUMsT0FBTyxHQUFHRixHQUFHLENBQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDOUIsRUFBQSxJQUFJMEIsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ2hCRCxVQUFVLENBQUNMLElBQUksR0FBR0ksR0FBRyxDQUFDRyxTQUFTLENBQUNELE9BQU8sQ0FBQyxDQUFBO0lBQ3hDRixHQUFHLEdBQUdBLEdBQUcsQ0FBQ0csU0FBUyxDQUFDLENBQUMsRUFBRUQsT0FBTyxDQUFDLENBQUE7QUFDakMsR0FBQTtBQUVBLEVBQUEsSUFBSUUsU0FBUyxHQUFHSixHQUFHLENBQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDaEMsRUFBQSxJQUFJNEIsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ2xCSCxVQUFVLENBQUNOLE1BQU0sR0FBR0ssR0FBRyxDQUFDRyxTQUFTLENBQUNDLFNBQVMsQ0FBQyxDQUFBO0lBQzVDSixHQUFHLEdBQUdBLEdBQUcsQ0FBQ0csU0FBUyxDQUFDLENBQUMsRUFBRUMsU0FBUyxDQUFDLENBQUE7QUFDbkMsR0FBQTtBQUNBLEVBQUEsSUFBSUosR0FBRyxFQUFFO0lBQ1BDLFVBQVUsQ0FBQ0osUUFBUSxHQUFHRyxHQUFHLENBQUE7QUFDM0IsR0FBQTtBQUNBLEVBQUEsT0FBT0MsVUFBVSxDQUFBO0FBQ25CLENBQUE7QUFFTyxTQUFTSSxjQUFjQSxDQUFJQyxPQUEwQixFQUFFQyxFQUFNLEVBQUVDLEtBQVMsRUFBRXBCLEdBQVksRUFBeUI7RUFDcEgsSUFBSVMsUUFBUSxHQUFHLE9BQU9TLE9BQU8sS0FBSyxRQUFRLEdBQUdBLE9BQU8sR0FBR0EsT0FBTyxDQUFDVCxRQUFRLENBQUE7QUFDdkUsRUFBQSxJQUFJWSxNQUFNLEdBQUcsT0FBT0YsRUFBRSxLQUFLLFFBQVEsR0FBR1IsU0FBUyxDQUFDUSxFQUFFLENBQUMsR0FBR0EsRUFBRSxDQUFBO0FBQ3hEO0FBQ0EsRUFBQSxJQUFNRyxVQUFVLEdBQUdDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUNsQyxJQUFNQyxRQUFRLEdBQUFqQyxRQUFBLENBQUE7QUFDWmtCLElBQUFBLFFBQVEsRUFBRUEsUUFBUTtBQUNsQkYsSUFBQUEsTUFBTSxFQUFFLEVBQUU7QUFDVkMsSUFBQUEsSUFBSSxFQUFFLEVBQUU7QUFDUlksSUFBQUEsS0FBSyxFQUFFQSxLQUFLO0lBQ1pwQixHQUFHLEVBQUUsT0FBT0EsR0FBRyxLQUFLLFFBQVEsR0FBR0EsR0FBRyxHQUFHc0IsVUFBVSxFQUFDO0FBQUMsR0FBQSxFQUM5Q0QsTUFBTSxDQUNWLENBQUE7QUFDRCxFQUFBLElBQUksQ0FBQ0csUUFBUSxDQUFDZixRQUFRLEVBQUU7SUFDdEJlLFFBQVEsQ0FBQ2YsUUFBUSxHQUFHLEdBQUcsQ0FBQTtBQUN6QixHQUFBO0FBQ0EsRUFBQSxPQUFPZSxRQUFRLENBQUE7QUFDakIsQ0FBQTtBQUVPLFNBQVNDLGVBQWVBLENBQUNDLEVBQWlCLEVBQUVDLEVBQWlCLEVBQUU7RUFDcEUsT0FBT0QsRUFBRSxDQUFDakIsUUFBUSxLQUFLa0IsRUFBRSxDQUFDbEIsUUFBUSxJQUFJaUIsRUFBRSxDQUFDbkIsTUFBTSxLQUFLb0IsRUFBRSxDQUFDcEIsTUFBTSxJQUFJbUIsRUFBRSxDQUFDbEIsSUFBSSxLQUFLbUIsRUFBRSxDQUFDbkIsSUFBSSxDQUFBO0FBQ3RGLENBQUE7QUFFTyxTQUFTb0IsWUFBWUEsQ0FBQ3RCLElBQVksRUFBVTtBQUNqRCxFQUFBLElBQUlBLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDbkIsSUFBQSxPQUFPQSxJQUFJLENBQUE7QUFDYixHQUFBO0VBQ0EsT0FBTyxHQUFHLEdBQUdBLElBQUksQ0FBQTtBQUNuQixDQUFBO0FBRU8sU0FBU3VCLGNBQWNBLENBQUN2QixJQUFZLEVBQVU7QUFDbkQsRUFBQSxJQUFJQSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ25CLElBQUEsT0FBT0EsSUFBSSxDQUFDUyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDMUIsR0FBQTtBQUNBLEVBQUEsT0FBT1QsSUFBSSxDQUFBO0FBQ2IsQ0FBQTtBQUVPLFNBQVN3QixjQUFjQSxDQUFDeEIsSUFBWSxFQUFVO0FBQ25ELEVBQUEsSUFBTXlCLFFBQVEsR0FBR0gsWUFBWSxDQUFDdEIsSUFBSSxDQUFDLENBQUE7RUFDbkMsSUFBSXlCLFFBQVEsQ0FBQ0EsUUFBUSxDQUFDakMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtJQUN6QyxPQUFPaUMsUUFBUSxDQUFDaEIsU0FBUyxDQUFDLENBQUMsRUFBRWdCLFFBQVEsQ0FBQ2pDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxHQUFBO0FBQ0EsRUFBQSxPQUFPaUMsUUFBUSxDQUFBO0FBQ2pCLENBQUE7QUFFTyxTQUFTQyxXQUFXQSxDQUFDMUIsSUFBWSxFQUFFMkIsTUFBYyxFQUFXO0FBQ2pFLEVBQUEsT0FDRTNCLElBQUksQ0FBQzRCLFdBQVcsRUFBRSxDQUFDOUMsT0FBTyxDQUFDNkMsTUFBTSxDQUFDQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDQyxRQUFRLENBQUM3QixJQUFJLENBQUM4QixNQUFNLENBQUNILE1BQU0sQ0FBQ25DLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFFdEgsQ0FBQTtBQUVPLFNBQVN1QyxhQUFhQSxDQUFDL0IsSUFBWSxFQUFFMkIsTUFBYyxFQUFVO0FBQ2xFLEVBQUEsT0FBT0QsV0FBVyxDQUFDMUIsSUFBSSxFQUFFMkIsTUFBTSxDQUFDLEdBQUczQixJQUFJLENBQUNTLFNBQVMsQ0FBQ2tCLE1BQU0sQ0FBQ25DLE1BQU0sQ0FBQyxHQUFHUSxJQUFJLENBQUE7QUFDekUsQ0FBQTs7QUFFQTtBQUNPLFNBQVNnQyxrQkFBa0JBLENBQU9DLE9BQVUsRUFBRUMsRUFBaUIsRUFBRTtBQUN0RSxFQUFBLElBQUlDLGFBQWtCLEdBQUcsQ0FBQ0QsRUFBRSxDQUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBRXRDLEVBQUEsU0FBU0csUUFBUUEsQ0FBQ3ZCLEVBQUssRUFBRXdCLElBQU8sRUFBVTtJQUN4QyxJQUFJQyxLQUFLLEdBQUdILGFBQWEsQ0FBQ0ksV0FBVyxDQUFDTCxFQUFFLENBQUNyQixFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQzdDLElBQUEsSUFBSXlCLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNoQkEsTUFBQUEsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNYLEtBQUE7SUFDQSxJQUFJRSxPQUFPLEdBQUdMLGFBQWEsQ0FBQ0ksV0FBVyxDQUFDTCxFQUFFLENBQUNHLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDakQsSUFBQSxJQUFJRyxPQUFPLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDbEJBLE1BQUFBLE9BQU8sR0FBRyxDQUFDLENBQUE7QUFDYixLQUFBO0lBQ0EsT0FBT0YsS0FBSyxHQUFHRSxPQUFPLENBQUE7QUFDeEIsR0FBQTtBQUVBLEVBQUEsU0FBU0MsU0FBU0EsQ0FBQzdCLE9BQVUsRUFBRThCLFNBQVksRUFBRUMsTUFBYyxFQUFFO0FBQzNELElBQUEsSUFBTUMsTUFBTSxHQUFHVixFQUFFLENBQUN0QixPQUFPLENBQUMsQ0FBQTtBQUMxQixJQUFBLElBQU1pQyxNQUFNLEdBQUdYLEVBQUUsQ0FBQ1EsU0FBUyxDQUFDLENBQUE7QUFDNUIsSUFBQSxJQUFJQyxNQUFNLEtBQUs1RCxNQUFNLENBQUMrRCxJQUFJLEVBQUU7QUFDMUIsTUFBQSxJQUFNQyxPQUFPLEdBQUdaLGFBQWEsQ0FBQ0ksV0FBVyxDQUFDSyxNQUFNLENBQUMsQ0FBQTtNQUNqRCxJQUFNSSxnQkFBZ0IsR0FBR2IsYUFBYSxDQUFDYyxLQUFLLENBQUMsQ0FBQyxFQUFFRixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDNURDLE1BQUFBLGdCQUFnQixDQUFDRixJQUFJLENBQUNELE1BQU0sQ0FBQyxDQUFBO0FBQzdCVixNQUFBQSxhQUFhLEdBQUdhLGdCQUFnQixDQUFBO0FBQ2xDLEtBQUE7QUFDQSxJQUFBLElBQUlMLE1BQU0sS0FBSzVELE1BQU0sQ0FBQ21FLE9BQU8sRUFBRTtBQUM3QixNQUFBLElBQU1ILFFBQU8sR0FBR1osYUFBYSxDQUFDSSxXQUFXLENBQUNLLE1BQU0sQ0FBQyxDQUFBO0FBQ2pELE1BQUEsSUFBSUcsUUFBTyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2xCWixRQUFBQSxhQUFhLENBQUNZLFFBQU8sQ0FBQyxHQUFHRixNQUFNLENBQUE7QUFDakMsT0FBQTtBQUNGLEtBQUE7QUFDRixHQUFBO0VBRUEsT0FBTztBQUFFVCxJQUFBQSxRQUFRLEVBQVJBLFFBQVE7QUFBRUssSUFBQUEsU0FBUyxFQUFUQSxTQUFBQTtHQUFXLENBQUE7QUFDaEMsQ0FBQTtBQUVBLFNBQVN4QixZQUFZQSxDQUFDekIsTUFBYyxFQUFnQjtBQUNsRCxFQUFBLElBQU0yRCxHQUFHLEdBQUczRCxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLEVBQUEsT0FBTyxZQUFNO0FBQ1gsSUFBQSxPQUFPNEQsSUFBSSxDQUFDQyxNQUFNLEVBQUUsQ0FBQ0MsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDN0MsU0FBUyxDQUFDLENBQUMsRUFBRTBDLEdBQUcsQ0FBQyxDQUFBO0dBQ3BELENBQUE7QUFDSDs7QUNySWUsU0FBU0ksZUFBZUEsQ0FBQ0MsUUFBUSxFQUFFQyxXQUFXLEVBQUU7QUFDN0QsRUFBQSxJQUFJLEVBQUVELFFBQVEsWUFBWUMsV0FBVyxDQUFDLEVBQUU7QUFDdEMsSUFBQSxNQUFNLElBQUlDLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBQzFELEdBQUE7QUFDRjs7QUNKZSxTQUFTQyxPQUFPQSxDQUFDQyxHQUFHLEVBQUU7RUFDbkMseUJBQXlCLENBQUE7O0FBRXpCLEVBQUEsT0FBT0QsT0FBTyxHQUFHLFVBQVUsSUFBSSxPQUFPRSxNQUFNLElBQUksUUFBUSxJQUFJLE9BQU9BLE1BQU0sQ0FBQ0MsUUFBUSxHQUFHLFVBQVVGLEdBQUcsRUFBRTtBQUNsRyxJQUFBLE9BQU8sT0FBT0EsR0FBRyxDQUFBO0dBQ2xCLEdBQUcsVUFBVUEsR0FBRyxFQUFFO0lBQ2pCLE9BQU9BLEdBQUcsSUFBSSxVQUFVLElBQUksT0FBT0MsTUFBTSxJQUFJRCxHQUFHLENBQUNHLFdBQVcsS0FBS0YsTUFBTSxJQUFJRCxHQUFHLEtBQUtDLE1BQU0sQ0FBQ2xFLFNBQVMsR0FBRyxRQUFRLEdBQUcsT0FBT2lFLEdBQUcsQ0FBQTtBQUM3SCxHQUFDLEVBQUVELE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLENBQUE7QUFDakI7O0FDUGUsU0FBU0ksWUFBWUEsQ0FBQ0MsS0FBSyxFQUFFQyxJQUFJLEVBQUU7QUFDaEQsRUFBQSxJQUFJUCxPQUFPLENBQUNNLEtBQUssQ0FBQyxLQUFLLFFBQVEsSUFBSUEsS0FBSyxLQUFLLElBQUksRUFBRSxPQUFPQSxLQUFLLENBQUE7QUFDL0QsRUFBQSxJQUFJRSxJQUFJLEdBQUdGLEtBQUssQ0FBQ0osTUFBTSxDQUFDTyxXQUFXLENBQUMsQ0FBQTtFQUNwQyxJQUFJRCxJQUFJLEtBQUtFLFNBQVMsRUFBRTtJQUN0QixJQUFJQyxHQUFHLEdBQUdILElBQUksQ0FBQ3RFLElBQUksQ0FBQ29FLEtBQUssRUFBRUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxDQUFBO0lBQzdDLElBQUlQLE9BQU8sQ0FBQ1csR0FBRyxDQUFDLEtBQUssUUFBUSxFQUFFLE9BQU9BLEdBQUcsQ0FBQTtBQUN6QyxJQUFBLE1BQU0sSUFBSVosU0FBUyxDQUFDLDhDQUE4QyxDQUFDLENBQUE7QUFDckUsR0FBQTtFQUNBLE9BQU8sQ0FBQ1EsSUFBSSxLQUFLLFFBQVEsR0FBR0ssTUFBTSxHQUFHQyxNQUFNLEVBQUVQLEtBQUssQ0FBQyxDQUFBO0FBQ3JEOztBQ1JlLFNBQVNRLGNBQWNBLENBQUNDLEdBQUcsRUFBRTtBQUMxQyxFQUFBLElBQUloRixHQUFHLEdBQUcwRSxZQUFXLENBQUNNLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUNwQyxFQUFBLE9BQU9mLE9BQU8sQ0FBQ2pFLEdBQUcsQ0FBQyxLQUFLLFFBQVEsR0FBR0EsR0FBRyxHQUFHNkUsTUFBTSxDQUFDN0UsR0FBRyxDQUFDLENBQUE7QUFDdEQ7O0FDSkEsU0FBU2lGLGlCQUFpQkEsQ0FBQ3RGLE1BQU0sRUFBRXVGLEtBQUssRUFBRTtBQUN4QyxFQUFBLEtBQUssSUFBSXRGLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3NGLEtBQUssQ0FBQ3BGLE1BQU0sRUFBRUYsQ0FBQyxFQUFFLEVBQUU7QUFDckMsSUFBQSxJQUFJdUYsVUFBVSxHQUFHRCxLQUFLLENBQUN0RixDQUFDLENBQUMsQ0FBQTtBQUN6QnVGLElBQUFBLFVBQVUsQ0FBQ0MsVUFBVSxHQUFHRCxVQUFVLENBQUNDLFVBQVUsSUFBSSxLQUFLLENBQUE7SUFDdERELFVBQVUsQ0FBQ0UsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUM5QixJQUFJLE9BQU8sSUFBSUYsVUFBVSxFQUFFQSxVQUFVLENBQUNHLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDckQ5RixJQUFBQSxNQUFNLENBQUMrRixjQUFjLENBQUM1RixNQUFNLEVBQUU2RixjQUFhLENBQUNMLFVBQVUsQ0FBQ25GLEdBQUcsQ0FBQyxFQUFFbUYsVUFBVSxDQUFDLENBQUE7QUFDMUUsR0FBQTtBQUNGLENBQUE7QUFDZSxTQUFTTSxZQUFZQSxDQUFDMUIsV0FBVyxFQUFFMkIsVUFBVSxFQUFFQyxXQUFXLEVBQUU7RUFDekUsSUFBSUQsVUFBVSxFQUFFVCxpQkFBaUIsQ0FBQ2xCLFdBQVcsQ0FBQzlELFNBQVMsRUFBRXlGLFVBQVUsQ0FBQyxDQUFBO0FBQ3BFLEVBQUEsSUFBSUMsV0FBVyxFQUFFVixpQkFBaUIsQ0FBQ2xCLFdBQVcsRUFBRTRCLFdBQVcsQ0FBQyxDQUFBO0FBQzVEbkcsRUFBQUEsTUFBTSxDQUFDK0YsY0FBYyxDQUFDeEIsV0FBVyxFQUFFLFdBQVcsRUFBRTtBQUM5Q3VCLElBQUFBLFFBQVEsRUFBRSxLQUFBO0FBQ1osR0FBQyxDQUFDLENBQUE7QUFDRixFQUFBLE9BQU92QixXQUFXLENBQUE7QUFDcEI7Ozs7O0lDZk02QixpQkFBaUIsZ0JBQUEsWUFBQTtBQUlyQixFQUFBLFNBQUFBLG9CQUFjO0FBQUEvQixJQUFBQSxlQUFBLE9BQUErQixpQkFBQSxDQUFBLENBQUE7QUFBQSxJQUFBLElBQUEsQ0FITkMsTUFBTSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFBLENBQ05DLFNBQVMsR0FBQSxLQUFBLENBQUEsQ0FBQTtJQUdmLElBQUksQ0FBQ0QsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNsQixJQUFJLENBQUNDLFNBQVMsR0FBRyxFQUFFLENBQUE7QUFDckIsR0FBQTtBQUFDTCxFQUFBQSxZQUFBLENBQUFHLGlCQUFBLEVBQUEsQ0FBQTtJQUFBNUYsR0FBQSxFQUFBLFdBQUE7QUFBQStGLElBQUFBLEtBQUEsRUFFRCxTQUFBQyxTQUFpQkgsQ0FBQUEsTUFBaUIsRUFBYztBQUFBLE1BQUEsSUFBQUksS0FBQSxHQUFBLElBQUEsQ0FBQTtNQUM5QyxJQUFJLENBQUNKLE1BQU0sR0FBR0EsTUFBTSxDQUFBOztBQUVwQjtBQUNBLE1BQUEsT0FBTyxZQUFNO0FBQ1gsUUFBQSxJQUFJSSxLQUFJLENBQUNKLE1BQU0sS0FBS0EsTUFBTSxFQUFFO1VBQzFCSSxLQUFJLENBQUNKLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDcEIsU0FBQTtPQUNELENBQUE7QUFDSCxLQUFBOztBQUVBO0FBQUEsR0FBQSxFQUFBO0lBQUE3RixHQUFBLEVBQUEsYUFBQTtBQUFBK0YsSUFBQUEsS0FBQSxFQUNBLFNBQUFHLFdBQW1CQyxDQUFBQSxJQUFpQixFQUFjO0FBQUEsTUFBQSxJQUFBQyxNQUFBLEdBQUEsSUFBQSxDQUFBO01BQ2hELElBQUlDLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDbkIsTUFBQSxJQUFNQyxRQUFRLEdBQUcsVUFBQ0MsSUFBbUIsRUFBSztBQUN4QyxRQUFBLElBQUlGLFFBQVEsRUFBRTtVQUNaRixJQUFJLENBQUNJLElBQUksQ0FBQyxDQUFBO0FBQ1osU0FBQTtPQUNELENBQUE7QUFDRCxNQUFBLElBQUksQ0FBQ1QsU0FBUyxDQUFDMUMsSUFBSSxDQUFDa0QsUUFBUSxDQUFDLENBQUE7QUFDN0IsTUFBQSxPQUFPLFlBQU07QUFDWEQsUUFBQUEsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNoQjtRQUNBRCxNQUFJLENBQUNOLFNBQVMsR0FBR00sTUFBSSxDQUFDTixTQUFTLENBQUNVLE1BQU0sQ0FBQyxVQUFBQyxJQUFJLEVBQUE7VUFBQSxPQUFJQSxJQUFJLEtBQUtILFFBQVEsQ0FBQTtTQUFDLENBQUEsQ0FBQTtPQUNsRSxDQUFBO0FBQ0gsS0FBQTtBQUFDLEdBQUEsRUFBQTtJQUFBdEcsR0FBQSxFQUFBLGlCQUFBO0FBQUErRixJQUFBQSxLQUFBLEVBRUQsU0FBQVcsZUFBdUJILENBQUFBLElBQW1CLEVBQUU7QUFBQSxNQUFBLElBQUFJLFNBQUEsR0FBQUMsNEJBQUEsQ0FDbkIsSUFBSSxDQUFDZCxTQUFTLENBQUE7UUFBQWUsS0FBQSxDQUFBO0FBQUEsTUFBQSxJQUFBO1FBQXJDLEtBQUFGLFNBQUEsQ0FBQUcsQ0FBQSxFQUFBRCxFQUFBQSxDQUFBQSxDQUFBQSxLQUFBLEdBQUFGLFNBQUEsQ0FBQUksQ0FBQSxFQUFBQyxFQUFBQSxJQUFBLEdBQXVDO0FBQUEsVUFBQSxJQUE1QlYsUUFBUSxHQUFBTyxLQUFBLENBQUFkLEtBQUEsQ0FBQTtVQUNqQk8sUUFBUSxDQUFDQyxJQUFJLENBQUMsQ0FBQTtBQUNoQixTQUFBO0FBQUMsT0FBQSxDQUFBLE9BQUFVLEdBQUEsRUFBQTtRQUFBTixTQUFBLENBQUFPLENBQUEsQ0FBQUQsR0FBQSxDQUFBLENBQUE7QUFBQSxPQUFBLFNBQUE7QUFBQU4sUUFBQUEsU0FBQSxDQUFBUSxDQUFBLEVBQUEsQ0FBQTtBQUFBLE9BQUE7QUFDSCxLQUFBO0FBQUMsR0FBQSxFQUFBO0lBQUFuSCxHQUFBLEVBQUEsZUFBQTtJQUFBK0YsS0FBQSxFQUVELFNBQUFxQixhQUFBQSxDQUNFNUYsUUFBcUIsRUFDckJ5QixNQUFjLEVBQ2RvRSxvQkFBc0MsRUFDdEN4SSxRQUFzQixFQUN0QjtBQUNBLE1BQUEsSUFBSSxJQUFJLENBQUNnSCxNQUFNLEtBQUssSUFBSSxFQUFFO1FBQ3hCLElBQU15QixNQUFNLEdBQUcsT0FBTyxJQUFJLENBQUN6QixNQUFNLEtBQUssVUFBVSxHQUFHLElBQUksQ0FBQ0EsTUFBTSxDQUFDckUsUUFBUSxFQUFFeUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDNEMsTUFBTSxDQUFBO0FBQzlGLFFBQUEsSUFBSSxPQUFPeUIsTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM5QixVQUFBLE9BQU9ELG9CQUFvQixLQUFLLFVBQVUsR0FBR0Esb0JBQW9CLENBQUNDLE1BQU0sRUFBRXpJLFFBQVEsQ0FBQyxHQUFHQSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEcsU0FBQyxNQUFNO0FBQ0xBLFVBQUFBLFFBQVEsQ0FBQ3lJLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQTtBQUM1QixTQUFBO0FBQ0YsT0FBQyxNQUFNO1FBQ0x6SSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEIsT0FBQTtBQUNGLEtBQUE7QUFBQyxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQUEsRUFBQSxPQUFBK0csaUJBQUEsQ0FBQTtBQUFBLENBQUEsRUFBQTs7QUM1REgsU0FBUzJCLE9BQU9BLENBQUNDLFNBQWMsRUFBRTVJLE9BQWUsRUFBRTtBQUNoRCxFQUFBLElBQUk0SSxTQUFTLEVBQUU7SUFDYixJQUFJQyxPQUFPLElBQUksT0FBT0EsT0FBTyxDQUFDQyxJQUFJLEtBQUssVUFBVSxFQUFFO0FBQ2pERCxNQUFBQSxPQUFPLENBQUNDLElBQUksQ0FBQzlJLE9BQU8sQ0FBQyxDQUFBO0FBQ3ZCLEtBQUE7QUFDRixHQUFBO0FBQ0Y7O0FDSEE7QUFDTyxTQUFTK0ksY0FBY0EsQ0FDNUJDLGlCQUF1QyxFQUN2Q0MsV0FBb0MsRUFDcENDLGNBQXVCLEVBQ3ZCO0VBQ0EsU0FBU0MsRUFBRUEsQ0FBQ0MsSUFBWSxFQUFFO0FBQ3hCRixJQUFBQSxjQUFjLENBQUNDLEVBQUUsQ0FBQ0MsSUFBSSxDQUFDLENBQUE7QUFDekIsR0FBQTtFQUVBLFNBQVNDLE1BQU1BLEdBQUc7QUFDaEJILElBQUFBLGNBQWMsQ0FBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdkIsR0FBQTtFQUVBLFNBQVNHLFNBQVNBLEdBQUc7QUFDbkJKLElBQUFBLGNBQWMsQ0FBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3RCLEdBQUE7RUFFQSxTQUFTSSxNQUFNQSxDQUFDN0IsUUFBcUIsRUFBYztBQUNqRCxJQUFBLElBQU04QixNQUFNLEdBQUdSLGlCQUFpQixDQUFDMUIsV0FBVyxDQUFDSSxRQUFRLENBQUMsQ0FBQTtJQUN0RHVCLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNkLElBQUEsT0FBTyxZQUFNO01BQ1hBLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZPLE1BQUFBLE1BQU0sRUFBRSxDQUFBO0tBQ1QsQ0FBQTtBQUNILEdBQUE7RUFFQSxJQUFJQyxTQUFTLEdBQUcsS0FBSyxDQUFBO0VBRXJCLFNBQVNDLEtBQUtBLEdBQXdDO0FBQUEsSUFBQSxJQUF2Q3pDLE1BQWlCLEdBQUFoRyxTQUFBLENBQUFDLE1BQUEsR0FBQSxDQUFBLElBQUFELFNBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQThFLFNBQUEsR0FBQTlFLFNBQUEsQ0FBQSxDQUFBLENBQUEsR0FBRyxLQUFLLENBQUE7QUFDdEMsSUFBQSxJQUFNMEksT0FBTyxHQUFHWCxpQkFBaUIsQ0FBQzVCLFNBQVMsQ0FBQ0gsTUFBTSxDQUFDLENBQUE7SUFDbkQsSUFBSSxDQUFDd0MsU0FBUyxFQUFFO01BQ2RSLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNkUSxNQUFBQSxTQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLEtBQUE7QUFDQSxJQUFBLE9BQU8sWUFBTTtBQUNYLE1BQUEsSUFBSUEsU0FBUyxFQUFFO0FBQ2JBLFFBQUFBLFNBQVMsR0FBRyxLQUFLLENBQUE7UUFDakJSLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLE9BQUE7QUFDQVUsTUFBQUEsT0FBTyxFQUFFLENBQUE7S0FDVixDQUFBO0FBQ0gsR0FBQTtFQUVBLFNBQVNDLGtCQUFrQkEsQ0FBQ0MsWUFBNkIsRUFBRTtJQUN6RCxPQUFPLFVBQVVDLFNBQW9DLEVBQUU7QUFDckQsTUFBQSxJQUFJQSxTQUFTLEVBQUU7QUFDYm5KLFFBQUFBLFFBQUEsQ0FBY2tKLFlBQVksRUFBRUMsU0FBUyxDQUFDLENBQUE7QUFDeEMsT0FBQTtBQUNBRCxNQUFBQSxZQUFZLENBQUMzSSxNQUFNLEdBQUdnSSxjQUFjLENBQUNoSSxNQUFNLENBQUE7QUFDM0MsTUFBQSxJQUFNeUcsSUFBSSxHQUFHO1FBQUUvRSxRQUFRLEVBQUVpSCxZQUFZLENBQUNqSCxRQUFRO1FBQUV5QixNQUFNLEVBQUV3RixZQUFZLENBQUN4RixNQUFBQTtPQUFRLENBQUE7QUFDN0UyRSxNQUFBQSxpQkFBaUIsQ0FBQ2xCLGVBQWUsQ0FBQ0gsSUFBSSxDQUFDLENBQUE7S0FDeEMsQ0FBQTtBQUNILEdBQUE7RUFFQSxPQUFPO0FBQUV3QixJQUFBQSxFQUFFLEVBQUZBLEVBQUU7QUFBRUUsSUFBQUEsTUFBTSxFQUFOQSxNQUFNO0FBQUVDLElBQUFBLFNBQVMsRUFBVEEsU0FBUztBQUFFQyxJQUFBQSxNQUFNLEVBQU5BLE1BQU07QUFBRUcsSUFBQUEsS0FBSyxFQUFMQSxLQUFLO0FBQUVFLElBQUFBLGtCQUFrQixFQUFsQkEsa0JBQUFBO0dBQW9CLENBQUE7QUFDckU7O0FDNUNPLFNBQVNHLG9CQUFvQkEsR0FBdUU7QUFBQSxFQUFBLElBQWhEQyxPQUE2QixHQUFBL0ksU0FBQSxDQUFBQyxNQUFBLEdBQUEsQ0FBQSxJQUFBRCxTQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUE4RSxTQUFBLEdBQUE5RSxTQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUcsRUFBRSxDQUFBO0FBQzNGLEVBQUEsSUFBTWdKLGNBQWMsR0FBRzlKLGdCQUFnQixFQUFFLENBQUE7QUFDekMsRUFBQSxJQUFNK0osaUJBQWlCLEdBQUc3SixrQkFBa0IsRUFBRSxDQUFBO0FBQzlDLEVBQUEsSUFBTTZJLGNBQWMsR0FBR3RKLE1BQU0sQ0FBQ1EsT0FBTyxDQUFBO0FBQ3JDLEVBQUEsSUFBQStKLHFCQUFBLEdBQStFSCxPQUFPLENBQTlFSSxZQUFZO0FBQVpBLElBQUFBLFlBQVksR0FBQUQscUJBQUEsS0FBRyxLQUFBLENBQUEsR0FBQSxLQUFLLEdBQUFBLHFCQUFBO0lBQUFFLHFCQUFBLEdBQW1ETCxPQUFPLENBQXhETSxtQkFBbUI7QUFBbkJBLElBQUFBLG1CQUFtQixHQUFBRCxxQkFBQSxLQUFHdEssS0FBQUEsQ0FBQUEsR0FBQUEsc0JBQXNCLEdBQUFzSyxxQkFBQSxDQUFBO0FBRTFFLEVBQUEsSUFBTUUsUUFBUSxHQUFHUCxPQUFPLENBQUNPLFFBQVEsR0FBR3JILGNBQWMsQ0FBQzhHLE9BQU8sQ0FBQ08sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBRXpFLEVBQUEsSUFBTUMsWUFBWSxHQUFHQyxXQUFXLENBQUNDLGVBQWUsRUFBRSxDQUFDLENBQUE7QUFFbkQsRUFBQSxJQUFNQyxjQUFjLEdBQUdqSCxrQkFBa0IsQ0FBc0I4RyxZQUFZLEVBQUUsVUFBQUksQ0FBQyxFQUFBO0lBQUEsT0FBSUEsQ0FBQyxDQUFDeEosR0FBRyxDQUFBO0dBQUMsQ0FBQSxDQUFBO0FBRXhGLEVBQUEsSUFBTTRILGlCQUFpQixHQUFHLElBQUloQyxpQkFBaUIsRUFBSyxDQUFBO0VBRXBELElBQUE2RCxlQUFBLEdBQXFFOUIsY0FBYyxDQUNqRkMsaUJBQWlCLEVBQ2pCQyxXQUFXLEVBQ1hDLGNBQ0YsQ0FBQztJQUpPQyxFQUFFLEdBQUEwQixlQUFBLENBQUYxQixFQUFFO0lBQUVFLE1BQU0sR0FBQXdCLGVBQUEsQ0FBTnhCLE1BQU07SUFBRUMsU0FBUyxHQUFBdUIsZUFBQSxDQUFUdkIsU0FBUztJQUFFQyxNQUFNLEdBQUFzQixlQUFBLENBQU50QixNQUFNO0lBQUVHLEtBQUssR0FBQW1CLGVBQUEsQ0FBTG5CLEtBQUs7SUFBRUUsa0JBQWtCLEdBQUFpQixlQUFBLENBQWxCakIsa0JBQWtCLENBQUE7QUFNaEUsRUFBQSxJQUFNeEosT0FBbUIsR0FBRztJQUMxQmlFLE1BQU0sRUFBRTVELE1BQU0sQ0FBQ3FLLEdBQUc7SUFDbEI1SixNQUFNLEVBQUVnSSxjQUFjLENBQUNoSSxNQUFNO0FBQzdCMEIsSUFBQUEsUUFBUSxFQUFFNEgsWUFBWTtBQUN0QnJCLElBQUFBLEVBQUUsRUFBRkEsRUFBRTtBQUNGRSxJQUFBQSxNQUFNLEVBQU5BLE1BQU07QUFDTkMsSUFBQUEsU0FBUyxFQUFUQSxTQUFTO0FBQ1RDLElBQUFBLE1BQU0sRUFBTkEsTUFBTTtBQUNORyxJQUFBQSxLQUFLLEVBQUxBLEtBQUs7QUFDTGxGLElBQUFBLElBQUksRUFBSkEsSUFBSTtBQUNKSSxJQUFBQSxPQUFPLEVBQVBBLE9BQU87QUFDUG1HLElBQUFBLFVBQVUsRUFBVkEsVUFBQUE7R0FDRCxDQUFBO0FBRUQsRUFBQSxJQUFNQyxXQUFXLEdBQUdwQixrQkFBa0IsQ0FBQ3hKLE9BQU8sQ0FBQyxDQUFBO0VBRS9DLFNBQVNzSyxlQUFlQSxHQUFHO0lBQ3pCLE9BQU9ULGNBQWMsR0FBR3JLLE1BQU0sQ0FBQ1EsT0FBTyxDQUFDb0MsS0FBSyxHQUFHLEVBQUUsQ0FBQTtBQUNuRCxHQUFBO0VBRUEsU0FBU2lJLFdBQVdBLENBQUNRLFlBQXNDLEVBQUU7QUFDM0QsSUFBQSxJQUFBQyxnQkFBQSxHQUF5QnRMLE1BQU0sQ0FBQ2dELFFBQVE7TUFBaENqQixNQUFNLEdBQUF1SixnQkFBQSxDQUFOdkosTUFBTTtNQUFFQyxJQUFJLEdBQUFzSixnQkFBQSxDQUFKdEosSUFBSSxDQUFBO0FBQ3BCLElBQUEsSUFBQXVKLElBQUEsR0FBdUJGLFlBQVksSUFBSSxFQUFFO01BQWpDN0osR0FBRyxHQUFBK0osSUFBQSxDQUFIL0osR0FBRztNQUFFb0IsS0FBSyxHQUFBMkksSUFBQSxDQUFMM0ksS0FBSyxDQUFBO0FBQ2xCLElBQUEsSUFBSVgsUUFBUSxHQUFHakMsTUFBTSxDQUFDZ0QsUUFBUSxDQUFDZixRQUFRLENBQUE7SUFDdkNBLFFBQVEsR0FBRzBJLFFBQVEsR0FBRzlHLGFBQWEsQ0FBQzVCLFFBQVEsRUFBRTBJLFFBQVEsQ0FBQyxHQUFHMUksUUFBUSxDQUFBO0lBRWxFLE9BQU9RLGNBQWMsQ0FBSSxFQUFFLEVBQUU7QUFBRVIsTUFBQUEsUUFBUSxFQUFSQSxRQUFRO0FBQUVGLE1BQUFBLE1BQU0sRUFBTkEsTUFBTTtBQUFFQyxNQUFBQSxJQUFJLEVBQUpBLElBQUFBO0FBQUssS0FBQyxFQUFFWSxLQUFLLEVBQUVwQixHQUFHLENBQUMsQ0FBQTtBQUN0RSxHQUFBOztBQUVBO0VBQ0EsSUFBSWdLLFNBQVMsR0FBRyxLQUFLLENBQUE7RUFFckIsU0FBU0MsY0FBY0EsQ0FBQ3pJLFFBQXFCLEVBQUU7QUFDN0MsSUFBQSxJQUFJd0ksU0FBUyxFQUFFO0FBQ2JBLE1BQUFBLFNBQVMsR0FBRyxLQUFLLENBQUE7TUFDakJKLFdBQVcsQ0FBQ2pGLFNBQVMsQ0FBQyxDQUFBO0FBQ3hCLEtBQUMsTUFBTTtBQUNMLE1BQUEsSUFBTTFCLE1BQU0sR0FBRzVELE1BQU0sQ0FBQ3FLLEdBQUcsQ0FBQTtBQUV6QixNQUFBLElBQU1RLFFBQVEsR0FBRyxVQUFDQyxNQUFlLEVBQUs7QUFDcEMsUUFBQSxJQUFJQSxNQUFNLEVBQUU7QUFDVjtBQUNBUCxVQUFBQSxXQUFXLENBQUM7QUFBRTNHLFlBQUFBLE1BQU0sRUFBRUEsTUFBTTtBQUFFekIsWUFBQUEsUUFBUSxFQUFFQSxRQUFBQTtBQUFTLFdBQUMsQ0FBQyxDQUFBO0FBQ3JELFNBQUMsTUFBTTtBQUNMNEksVUFBQUEsY0FBYyxDQUFDNUksUUFBUSxFQUFFeEMsT0FBTyxDQUFDd0MsUUFBUSxDQUFDLENBQUE7QUFDNUMsU0FBQTtPQUNELENBQUE7TUFFRG9HLGlCQUFpQixDQUFDUixhQUFhLENBQUM1RixRQUFRLEVBQUV5QixNQUFNLEVBQUVpRyxtQkFBbUIsRUFBRWdCLFFBQVEsQ0FBQyxDQUFBO0FBQ2xGLEtBQUE7QUFDRixHQUFBO0VBRUEsU0FBU0csZ0JBQWdCQSxDQUFDQyxLQUFvQixFQUFFO0FBQzlDTCxJQUFBQSxjQUFjLENBQUNaLFdBQVcsQ0FBQ2lCLEtBQUssQ0FBQ2xKLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDMUMsR0FBQTtFQUVBLFNBQVNtSixrQkFBa0JBLEdBQUc7QUFDNUIsSUFBQSxJQUFNL0ksUUFBUSxHQUFHNkgsV0FBVyxDQUFDQyxlQUFlLEVBQUUsQ0FBQyxDQUFBO0lBQy9DVyxjQUFjLENBQUN6SSxRQUFRLENBQUMsQ0FBQTtBQUMxQixHQUFBO0VBRUEsSUFBSWdKLGFBQWEsR0FBRyxDQUFDLENBQUE7RUFFckIsU0FBUzNDLFdBQVdBLENBQUM0QyxLQUFhLEVBQUU7QUFDbENELElBQUFBLGFBQWEsSUFBSUMsS0FBSyxDQUFBO0FBQ3RCLElBQUEsSUFBSUQsYUFBYSxLQUFLLENBQUMsSUFBSUMsS0FBSyxLQUFLLENBQUMsRUFBRTtNQUN0Q2pNLE1BQU0sQ0FBQ2tNLGdCQUFnQixDQUFDcEwsU0FBUyxDQUFDcUwsUUFBUSxFQUFFTixnQkFBZ0IsQ0FBQyxDQUFBO01BQzdELElBQUksQ0FBQ3ZCLGlCQUFpQixFQUFFO1FBQ3RCdEssTUFBTSxDQUFDa00sZ0JBQWdCLENBQUNwTCxTQUFTLENBQUNzTCxVQUFVLEVBQUVMLGtCQUFrQixDQUFDLENBQUE7QUFDbkUsT0FBQTtBQUNGLEtBQUMsTUFBTSxJQUFJQyxhQUFhLEtBQUssQ0FBQyxFQUFFO01BQzlCaE0sTUFBTSxDQUFDcU0sbUJBQW1CLENBQUN2TCxTQUFTLENBQUNxTCxRQUFRLEVBQUVOLGdCQUFnQixDQUFDLENBQUE7TUFDaEUsSUFBSSxDQUFDdkIsaUJBQWlCLEVBQUU7UUFDdEJ0SyxNQUFNLENBQUNxTSxtQkFBbUIsQ0FBQ3ZMLFNBQVMsQ0FBQ3NMLFVBQVUsRUFBRUwsa0JBQWtCLENBQUMsQ0FBQTtBQUN0RSxPQUFBO0FBQ0YsS0FBQTtBQUNGLEdBQUE7O0FBRUE7QUFDQSxFQUFBLFNBQVNILGNBQWNBLENBQUN6SCxJQUFpQixFQUFFeEIsRUFBZSxFQUFFO0lBQzFELElBQU0ySixLQUFLLEdBQUd2QixjQUFjLENBQUM3RyxRQUFRLENBQUN2QixFQUFFLEVBQUV3QixJQUFJLENBQUMsQ0FBQTtJQUMvQyxJQUFJbUksS0FBSyxLQUFLLENBQUMsRUFBRTtNQUNmL0MsRUFBRSxDQUFDK0MsS0FBSyxDQUFDLENBQUE7QUFDVGQsTUFBQUEsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNsQixLQUFBO0FBQ0YsR0FBQTtFQUVBLFNBQVNMLFVBQVVBLENBQUNySixJQUFtQixFQUFFO0FBQ3ZDLElBQUEsT0FBTzZJLFFBQVEsR0FBRzlJLFVBQVUsQ0FBQ0MsSUFBSSxDQUFDLENBQUE7QUFDcEMsR0FBQTtBQUVBLEVBQUEsU0FBUzhDLElBQUlBLENBQUNqQyxFQUFNLEVBQUVDLEtBQVMsRUFBRTtBQUMvQixJQUFBLElBQU02QixNQUFNLEdBQUc1RCxNQUFNLENBQUMrRCxJQUFJLENBQUE7QUFDMUIsSUFBQSxJQUFNNUIsUUFBUSxHQUFHUCxjQUFjLENBQUlqQyxPQUFPLENBQUN3QyxRQUFRLEVBQUVMLEVBQUUsRUFBRUMsS0FBSyxFQUFFdUQsU0FBUyxDQUFDLENBQUE7SUFFMUVpRCxpQkFBaUIsQ0FBQ1IsYUFBYSxDQUFDNUYsUUFBUSxFQUFFeUIsTUFBTSxFQUFFaUcsbUJBQW1CLEVBQUUsVUFBQWlCLE1BQU0sRUFBSTtNQUMvRSxJQUFJLENBQUNBLE1BQU0sRUFBRTtBQUNYLFFBQUEsT0FBQTtBQUNGLE9BQUE7QUFDQSxNQUFBLElBQU1ZLElBQUksR0FBR3BCLFVBQVUsQ0FBQ25JLFFBQVEsQ0FBQyxDQUFBO0FBQ2pDLE1BQUEsSUFBUXhCLEdBQUcsR0FBWXdCLFFBQVEsQ0FBdkJ4QixHQUFHO1FBQUVvQixLQUFLLEdBQUtJLFFBQVEsQ0FBbEJKLEtBQUssQ0FBQTtBQUVsQixNQUFBLElBQUl5SCxjQUFjLEVBQUU7QUFDbEIsUUFBQSxJQUFJRyxZQUFZLEVBQUU7QUFDaEJ4SyxVQUFBQSxNQUFNLENBQUNnRCxRQUFRLENBQUN1SixJQUFJLEdBQUdBLElBQUksQ0FBQTtBQUM3QixTQUFDLE1BQU07VUFDTGpELGNBQWMsQ0FBQ2tELFNBQVMsQ0FBQztBQUFFaEwsWUFBQUEsR0FBRyxFQUFFQSxHQUFHO0FBQUVvQixZQUFBQSxLQUFLLEVBQUVBLEtBQUFBO0FBQU0sV0FBQyxFQUFFLEVBQUUsRUFBRTJKLElBQUksQ0FBQyxDQUFBO1VBQzlEeEIsY0FBYyxDQUFDeEcsU0FBUyxDQUFDL0QsT0FBTyxDQUFDd0MsUUFBUSxFQUFFQSxRQUFRLEVBQUV5QixNQUFNLENBQUMsQ0FBQTtBQUM1RDJHLFVBQUFBLFdBQVcsQ0FBQztBQUFFM0csWUFBQUEsTUFBTSxFQUFOQSxNQUFNO0FBQUV6QixZQUFBQSxRQUFRLEVBQVJBLFFBQUFBO0FBQVMsV0FBQyxDQUFDLENBQUE7QUFDbkMsU0FBQTtBQUNGLE9BQUMsTUFBTTtBQUNMK0YsUUFBQUEsT0FBTyxDQUFDbkcsS0FBSyxLQUFLdUQsU0FBUyxFQUFFLGlGQUFpRixDQUFDLENBQUE7QUFDL0duRyxRQUFBQSxNQUFNLENBQUNnRCxRQUFRLENBQUN1SixJQUFJLEdBQUdBLElBQUksQ0FBQTtBQUM3QixPQUFBO0FBQ0YsS0FBQyxDQUFDLENBQUE7QUFDSixHQUFBO0FBRUEsRUFBQSxTQUFTdkgsT0FBT0EsQ0FBQ3JDLEVBQU0sRUFBRUMsS0FBUyxFQUFFO0FBQ2xDLElBQUEsSUFBTTZCLE1BQU0sR0FBRzVELE1BQU0sQ0FBQ21FLE9BQU8sQ0FBQTtBQUM3QixJQUFBLElBQU1oQyxRQUFRLEdBQUdQLGNBQWMsQ0FBSWpDLE9BQU8sQ0FBQ3dDLFFBQVEsRUFBRUwsRUFBRSxFQUFFQyxLQUFLLEVBQUV1RCxTQUFTLENBQUMsQ0FBQTtJQUUxRWlELGlCQUFpQixDQUFDUixhQUFhLENBQUM1RixRQUFRLEVBQUV5QixNQUFNLEVBQUVpRyxtQkFBbUIsRUFBRSxVQUFBaUIsTUFBTSxFQUFJO01BQy9FLElBQUksQ0FBQ0EsTUFBTSxFQUFFO0FBQ1gsUUFBQSxPQUFBO0FBQ0YsT0FBQTtBQUNBLE1BQUEsSUFBTVksSUFBSSxHQUFHcEIsVUFBVSxDQUFDbkksUUFBUSxDQUFDLENBQUE7QUFDakMsTUFBQSxJQUFReEIsR0FBRyxHQUFZd0IsUUFBUSxDQUF2QnhCLEdBQUc7UUFBRW9CLEtBQUssR0FBS0ksUUFBUSxDQUFsQkosS0FBSyxDQUFBO0FBQ2xCLE1BQUEsSUFBSXlILGNBQWMsRUFBRTtBQUNsQixRQUFBLElBQUlHLFlBQVksRUFBRTtBQUNoQnhLLFVBQUFBLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ2dDLE9BQU8sQ0FBQ3VILElBQUksQ0FBQyxDQUFBO0FBQy9CLFNBQUMsTUFBTTtVQUNMakQsY0FBYyxDQUFDbUQsWUFBWSxDQUFDO0FBQUVqTCxZQUFBQSxHQUFHLEVBQUVBLEdBQUc7QUFBRW9CLFlBQUFBLEtBQUssRUFBRUEsS0FBQUE7QUFBTSxXQUFDLEVBQUUsRUFBRSxFQUFFMkosSUFBSSxDQUFDLENBQUE7VUFDakV4QixjQUFjLENBQUN4RyxTQUFTLENBQUMvRCxPQUFPLENBQUN3QyxRQUFRLEVBQUVBLFFBQVEsRUFBRXlCLE1BQU0sQ0FBQyxDQUFBO0FBQzVEMkcsVUFBQUEsV0FBVyxDQUFDO0FBQUUzRyxZQUFBQSxNQUFNLEVBQU5BLE1BQU07QUFBRXpCLFlBQUFBLFFBQVEsRUFBUkEsUUFBQUE7QUFBUyxXQUFDLENBQUMsQ0FBQTtBQUNuQyxTQUFBO0FBQ0YsT0FBQyxNQUFNO0FBQ0wrRixRQUFBQSxPQUFPLENBQUNuRyxLQUFLLEtBQUt1RCxTQUFTLEVBQUUsaUZBQWlGLENBQUMsQ0FBQTtBQUMvR25HLFFBQUFBLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ2dDLE9BQU8sQ0FBQ3VILElBQUksQ0FBQyxDQUFBO0FBQy9CLE9BQUE7QUFDRixLQUFDLENBQUMsQ0FBQTtBQUNKLEdBQUE7QUFFQSxFQUFBLE9BQU8vTCxPQUFPLENBQUE7QUFDaEI7O0FDM0pBO0FBQ0EsU0FBU2tNLFNBQVNBLENBQUM1SyxJQUFZLEVBQVU7QUFDdkMsRUFBQSxJQUFNNkssR0FBRyxHQUFHN0ssSUFBSSxDQUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzdCLEVBQUEsT0FBTytMLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRzdLLElBQUksR0FBR0EsSUFBSSxDQUFDUyxTQUFTLENBQUMsQ0FBQyxFQUFFb0ssR0FBRyxDQUFDLENBQUE7QUFDbkQsQ0FBQTs7QUFFQTtBQUNBLFNBQVNDLGNBQWNBLENBQUM5SyxJQUFZLEVBQVU7QUFDNUMsRUFBQSxJQUFNNkssR0FBRyxHQUFHN0ssSUFBSSxDQUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzdCLEVBQUEsT0FBTytMLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUc3SyxJQUFJLENBQUNTLFNBQVMsQ0FBQ29LLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUNsRCxDQUFBO0FBRU8sU0FBU0UsaUJBQWlCQSxHQUFtRTtBQUFBLEVBQUEsSUFBNUNDLE1BQXlCLEdBQUF6TCxTQUFBLENBQUFDLE1BQUEsR0FBQSxDQUFBLElBQUFELFNBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQThFLFNBQUEsR0FBQTlFLFNBQUEsQ0FBQSxDQUFBLENBQUEsR0FBRyxFQUFFLENBQUE7QUFDcEYsRUFBQSxJQUFNaUksY0FBYyxHQUFHdEosTUFBTSxDQUFDUSxPQUFPLENBQUE7QUFDckMsRUFBQSxJQUFBdU0sZ0JBQUEsR0FBNkVELE1BQU0sQ0FBM0VFLFFBQVE7QUFBUkEsSUFBQUEsUUFBUSxHQUFBRCxnQkFBQSxLQUFHLEtBQUEsQ0FBQSxHQUFBLE9BQU8sR0FBQUEsZ0JBQUE7SUFBQUUscUJBQUEsR0FBbURILE1BQU0sQ0FBdkRwQyxtQkFBbUI7QUFBbkJBLElBQUFBLG1CQUFtQixHQUFBdUMscUJBQUEsS0FBRzlNLEtBQUFBLENBQUFBLEdBQUFBLHNCQUFzQixHQUFBOE0scUJBQUEsQ0FBQTtBQUV4RSxFQUFBLElBQU10QyxRQUFRLEdBQUdtQyxNQUFNLENBQUNuQyxRQUFRLEdBQUdySCxjQUFjLENBQUN3SixNQUFNLENBQUNuQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUE7RUFFdkUsSUFBTXVDLFdBQVcsR0FBRzlKLFlBQVksQ0FBQTtFQUNoQyxJQUFNK0osV0FBVyxHQUFHSCxRQUFRLEtBQUssT0FBTyxHQUFHNUosWUFBWSxHQUFHQyxjQUFjLENBQUE7RUFFeEUsU0FBU3dILFdBQVdBLEdBQUc7QUFDckIsSUFBQSxJQUFJdUMsUUFBUSxHQUFHRixXQUFXLENBQUNOLGNBQWMsQ0FBQzVNLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ2hCLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDaEUsSUFBQSxJQUFJMkksUUFBUSxFQUFFO0FBQ1p5QyxNQUFBQSxRQUFRLEdBQUd2SixhQUFhLENBQUN1SixRQUFRLEVBQUV6QyxRQUFRLENBQUMsQ0FBQTtBQUM5QyxLQUFBO0lBRUEsT0FBT2xJLGNBQWMsQ0FBSSxFQUFFLEVBQUUySyxRQUFRLEVBQUVqSCxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDOUQsR0FBQTtBQUVBLEVBQUEsSUFBTXlFLFlBQVksR0FBR0MsV0FBVyxFQUFFLENBQUE7QUFFbEMsRUFBQSxJQUFNd0MsVUFBVSxHQUFHdkosa0JBQWtCLENBQXNCOEcsWUFBWSxFQUFFL0ksVUFBVSxDQUFDLENBQUE7QUFFcEYsRUFBQSxJQUFNdUgsaUJBQWlCLEdBQUcsSUFBSWhDLGlCQUFpQixFQUFLLENBQUE7RUFFcEQsU0FBUytELFVBQVVBLENBQUNuSSxRQUFxQixFQUFFO0FBQ3pDLElBQUEsSUFBTXNLLEdBQUcsR0FBR3JOLFFBQVEsQ0FBQ3NOLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUMxQyxJQUFNQyxJQUFJLEdBQUdGLEdBQUcsSUFBSUEsR0FBRyxDQUFDRyxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUdmLFNBQVMsQ0FBQzFNLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ3VKLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUNuRixJQUFBLE9BQU9pQixJQUFJLEdBQUcsR0FBRyxHQUFHTCxXQUFXLENBQUN4QyxRQUFRLEdBQUc5SSxVQUFVLENBQUNtQixRQUFRLENBQUMsQ0FBQyxDQUFBO0FBQ2xFLEdBQUE7RUFFQSxJQUFJMEssWUFBWSxHQUFHLEtBQUssQ0FBQTtFQUN4QixJQUFJQyxVQUF5QixHQUFHLElBQUksQ0FBQTtFQUVwQyxJQUFBMUMsZUFBQSxHQUFxRTlCLGNBQWMsQ0FDakZDLGlCQUFpQixFQUNqQkMsV0FBVyxFQUNYQyxjQUNGLENBQUM7SUFKT0MsRUFBRSxHQUFBMEIsZUFBQSxDQUFGMUIsRUFBRTtJQUFFRSxNQUFNLEdBQUF3QixlQUFBLENBQU54QixNQUFNO0lBQUVDLFNBQVMsR0FBQXVCLGVBQUEsQ0FBVHZCLFNBQVM7SUFBRUMsTUFBTSxHQUFBc0IsZUFBQSxDQUFOdEIsTUFBTTtJQUFFRyxLQUFLLEdBQUFtQixlQUFBLENBQUxuQixLQUFLO0lBQUVFLGtCQUFrQixHQUFBaUIsZUFBQSxDQUFsQmpCLGtCQUFrQixDQUFBO0FBTWhFLEVBQUEsSUFBTXhKLE9BQW1CLEdBQUc7SUFDMUJpRSxNQUFNLEVBQUU1RCxNQUFNLENBQUNxSyxHQUFHO0lBQ2xCNUosTUFBTSxFQUFFZ0ksY0FBYyxDQUFDaEksTUFBTTtBQUM3QjBCLElBQUFBLFFBQVEsRUFBRTRILFlBQVk7QUFDdEJyQixJQUFBQSxFQUFFLEVBQUZBLEVBQUU7QUFDRkUsSUFBQUEsTUFBTSxFQUFOQSxNQUFNO0FBQ05DLElBQUFBLFNBQVMsRUFBVEEsU0FBUztBQUNUOUUsSUFBQUEsSUFBSSxFQUFKQSxJQUFJO0FBQ0pJLElBQUFBLE9BQU8sRUFBUEEsT0FBTztBQUNQMkUsSUFBQUEsTUFBTSxFQUFOQSxNQUFNO0FBQ05HLElBQUFBLEtBQUssRUFBTEEsS0FBSztBQUNMcUIsSUFBQUEsVUFBVSxFQUFWQSxVQUFBQTtHQUNELENBQUE7QUFFRCxFQUFBLElBQU1DLFdBQVcsR0FBR3BCLGtCQUFrQixDQUFDeEosT0FBTyxDQUFDLENBQUE7QUFFL0MsRUFBQSxTQUFTb0UsSUFBSUEsQ0FBQ2pDLEVBQU0sRUFBRUMsS0FBUyxFQUFFO0FBQy9CbUcsSUFBQUEsT0FBTyxDQUFDbkcsS0FBSyxLQUFLdUQsU0FBUyxFQUFFLHlEQUF5RCxDQUFDLENBQUE7QUFFdkYsSUFBQSxJQUFNMUIsTUFBTSxHQUFHNUQsTUFBTSxDQUFDK0QsSUFBSSxDQUFBO0FBQzFCLElBQUEsSUFBTTVCLFFBQVEsR0FBR1AsY0FBYyxDQUFJakMsT0FBTyxDQUFDd0MsUUFBUSxFQUFFTCxFQUFFLEVBQUV3RCxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFdkVpRCxpQkFBaUIsQ0FBQ1IsYUFBYSxDQUFDNUYsUUFBUSxFQUFFeUIsTUFBTSxFQUFFaUcsbUJBQW1CLEVBQUUsVUFBQWlCLE1BQU0sRUFBSTtNQUMvRSxJQUFJLENBQUNBLE1BQU0sRUFBRTtBQUNYLFFBQUEsT0FBQTtBQUNGLE9BQUE7QUFDQSxNQUFBLElBQU03SixJQUFJLEdBQUdELFVBQVUsQ0FBQ21CLFFBQVEsQ0FBQyxDQUFBO0FBQ2pDLE1BQUEsSUFBTTRLLFdBQVcsR0FBR1QsV0FBVyxDQUFDeEMsUUFBUSxHQUFHN0ksSUFBSSxDQUFDLENBQUE7QUFDaEQ7TUFDQSxJQUFJOEssY0FBYyxDQUFDNU0sTUFBTSxDQUFDZ0QsUUFBUSxDQUFDdUosSUFBSSxDQUFDLEtBQUtxQixXQUFXLEVBQUU7QUFDeERELFFBQUFBLFVBQVUsR0FBR0MsV0FBVyxDQUFBO0FBQ3hCNU4sUUFBQUEsTUFBTSxDQUFDZ0QsUUFBUSxDQUFDaEIsSUFBSSxHQUFHNEwsV0FBVyxDQUFBO1FBRWxDUCxVQUFVLENBQUM5SSxTQUFTLENBQUMvRCxPQUFPLENBQUN3QyxRQUFRLEVBQUVBLFFBQVEsRUFBRXlCLE1BQU0sQ0FBQyxDQUFBO0FBRXhEMkcsUUFBQUEsV0FBVyxDQUFDO0FBQUUzRyxVQUFBQSxNQUFNLEVBQU5BLE1BQU07QUFBRXpCLFVBQUFBLFFBQVEsRUFBUkEsUUFBQUE7QUFBUyxTQUFDLENBQUMsQ0FBQTtBQUNuQyxPQUFDLE1BQU07UUFDTG9JLFdBQVcsQ0FBQ2pGLFNBQVMsQ0FBQyxDQUFBO0FBQ3hCLE9BQUE7QUFDRixLQUFDLENBQUMsQ0FBQTtBQUNKLEdBQUE7QUFFQSxFQUFBLFNBQVNuQixPQUFPQSxDQUFDckMsRUFBTSxFQUFFQyxLQUFTLEVBQUU7QUFDbENtRyxJQUFBQSxPQUFPLENBQUNuRyxLQUFLLEtBQUt1RCxTQUFTLEVBQUUseURBQXlELENBQUMsQ0FBQTtBQUN2RixJQUFBLElBQU0xQixNQUFNLEdBQUc1RCxNQUFNLENBQUNtRSxPQUFPLENBQUE7QUFDN0IsSUFBQSxJQUFNaEMsUUFBUSxHQUFHUCxjQUFjLENBQUlqQyxPQUFPLENBQUN3QyxRQUFRLEVBQUVMLEVBQUUsRUFBRXdELFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUV2RWlELGlCQUFpQixDQUFDUixhQUFhLENBQUM1RixRQUFRLEVBQUV5QixNQUFNLEVBQUVpRyxtQkFBbUIsRUFBRSxVQUFBaUIsTUFBTSxFQUFJO01BQy9FLElBQUksQ0FBQ0EsTUFBTSxFQUFFO0FBQ1gsUUFBQSxPQUFBO0FBQ0YsT0FBQTtBQUNBLE1BQUEsSUFBTTdKLElBQUksR0FBR0QsVUFBVSxDQUFDbUIsUUFBUSxDQUFDLENBQUE7QUFDakMsTUFBQSxJQUFNNEssV0FBVyxHQUFHVCxXQUFXLENBQUN4QyxRQUFRLEdBQUc3SSxJQUFJLENBQUMsQ0FBQTtNQUNoRCxJQUFJOEssY0FBYyxDQUFDNU0sTUFBTSxDQUFDZ0QsUUFBUSxDQUFDdUosSUFBSSxDQUFDLEtBQUtxQixXQUFXLEVBQUU7QUFDeERELFFBQUFBLFVBQVUsR0FBRzdMLElBQUksQ0FBQTtBQUNqQjlCLFFBQUFBLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ2dDLE9BQU8sQ0FBQzBILFNBQVMsQ0FBQzFNLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ3VKLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBR3FCLFdBQVcsQ0FBQyxDQUFBO0FBQzlFLE9BQUE7TUFDQVAsVUFBVSxDQUFDOUksU0FBUyxDQUFDL0QsT0FBTyxDQUFDd0MsUUFBUSxFQUFFQSxRQUFRLEVBQUV5QixNQUFNLENBQUMsQ0FBQTtBQUN4RDJHLE1BQUFBLFdBQVcsQ0FBQztBQUFFM0csUUFBQUEsTUFBTSxFQUFOQSxNQUFNO0FBQUV6QixRQUFBQSxRQUFRLEVBQVJBLFFBQUFBO0FBQVMsT0FBQyxDQUFDLENBQUE7QUFDbkMsS0FBQyxDQUFDLENBQUE7QUFDSixHQUFBO0VBRUEsU0FBUzZLLGdCQUFnQkEsR0FBRztJQUMxQixJQUFNVCxRQUFRLEdBQUdSLGNBQWMsQ0FBQzVNLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ3VKLElBQUksQ0FBQyxDQUFBO0FBQ3JELElBQUEsSUFBTXFCLFdBQVcsR0FBR1QsV0FBVyxDQUFDQyxRQUFRLENBQUMsQ0FBQTtJQUN6QyxJQUFJQSxRQUFRLEtBQUtRLFdBQVcsRUFBRTtBQUM1QjVOLE1BQUFBLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ2dDLE9BQU8sQ0FBQzBILFNBQVMsQ0FBQzFNLE1BQU0sQ0FBQ2dELFFBQVEsQ0FBQ3VKLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBR3FCLFdBQVcsQ0FBQyxDQUFBO0FBQzlFLEtBQUMsTUFBTTtBQUNMLE1BQUEsSUFBTTVLLFFBQVEsR0FBRzZILFdBQVcsRUFBRSxDQUFBO0FBQzlCLE1BQUEsSUFBTWlELFlBQVksR0FBR3ROLE9BQU8sQ0FBQ3dDLFFBQVEsQ0FBQTtNQUNyQyxJQUFJLENBQUMwSyxZQUFZLElBQUl6SyxlQUFlLENBQUNELFFBQVEsRUFBRThLLFlBQVksQ0FBQyxFQUFFO0FBQzVELFFBQUEsT0FBQTtBQUNGLE9BQUE7QUFDQSxNQUFBLElBQUlILFVBQVUsS0FBSzlMLFVBQVUsQ0FBQ21CLFFBQVEsQ0FBQyxFQUFFO0FBQ3ZDLFFBQUEsT0FBQTtBQUNGLE9BQUE7QUFDQTJLLE1BQUFBLFVBQVUsR0FBRyxJQUFJLENBQUE7TUFDakJsQyxjQUFjLENBQUN6SSxRQUFRLENBQUMsQ0FBQTtBQUMxQixLQUFBO0FBQ0YsR0FBQTtFQUVBLFNBQVN5SSxjQUFjQSxDQUFDekksUUFBcUIsRUFBRTtBQUM3QyxJQUFBLElBQUkwSyxZQUFZLEVBQUU7QUFDaEJBLE1BQUFBLFlBQVksR0FBRyxLQUFLLENBQUE7TUFDcEJ0QyxXQUFXLENBQUNqRixTQUFTLENBQUMsQ0FBQTtBQUN4QixLQUFDLE1BQU07QUFDTCxNQUFBLElBQU0xQixNQUFNLEdBQUc1RCxNQUFNLENBQUNxSyxHQUFHLENBQUE7QUFFekIsTUFBQSxJQUFNUSxRQUFRLEdBQUcsVUFBQ0MsTUFBZSxFQUFLO0FBQ3BDLFFBQUEsSUFBSUEsTUFBTSxFQUFFO0FBQ1ZQLFVBQUFBLFdBQVcsQ0FBQztBQUFFM0csWUFBQUEsTUFBTSxFQUFFQSxNQUFNO0FBQUV6QixZQUFBQSxRQUFRLEVBQUVBLFFBQUFBO0FBQVMsV0FBQyxDQUFDLENBQUE7QUFDckQsU0FBQyxNQUFNO1VBQ0w0SSxjQUFjLENBQUM1SSxRQUFRLENBQUMsQ0FBQTtBQUMxQixTQUFBO09BQ0QsQ0FBQTtNQUVEb0csaUJBQWlCLENBQUNSLGFBQWEsQ0FBQzVGLFFBQVEsRUFBRXlCLE1BQU0sRUFBRWlHLG1CQUFtQixFQUFFZ0IsUUFBUSxDQUFDLENBQUE7QUFDbEYsS0FBQTtBQUNGLEdBQUE7O0FBRUE7RUFDQSxTQUFTRSxjQUFjQSxDQUFDekgsSUFBaUIsRUFBRTtBQUN6QyxJQUFBLElBQU14QixFQUFFLEdBQUduQyxPQUFPLENBQUN3QyxRQUFRLENBQUE7SUFDM0IsSUFBTXNKLEtBQUssR0FBR2UsVUFBVSxDQUFDbkosUUFBUSxDQUFDdkIsRUFBRSxFQUFFd0IsSUFBSSxDQUFDLENBQUE7SUFDM0MsSUFBSW1JLEtBQUssS0FBSyxDQUFDLEVBQUU7TUFDZi9DLEVBQUUsQ0FBQytDLEtBQUssQ0FBQyxDQUFBO0FBQ1RvQixNQUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBQ3JCLEtBQUE7QUFDRixHQUFBO0VBRUEsSUFBSTFCLGFBQWEsR0FBRyxDQUFDLENBQUE7RUFFckIsU0FBUzNDLFdBQVdBLENBQUNpRCxLQUFhLEVBQUU7QUFDbENOLElBQUFBLGFBQWEsSUFBSU0sS0FBSyxDQUFBO0FBQ3RCLElBQUEsSUFBSU4sYUFBYSxLQUFLLENBQUMsSUFBSU0sS0FBSyxLQUFLLENBQUMsRUFBRTtNQUN0Q3RNLE1BQU0sQ0FBQ2tNLGdCQUFnQixDQUFDcEwsU0FBUyxDQUFDc0wsVUFBVSxFQUFFeUIsZ0JBQWdCLENBQUMsQ0FBQTtBQUNqRSxLQUFDLE1BQU0sSUFBSTdCLGFBQWEsS0FBSyxDQUFDLEVBQUU7TUFDOUJoTSxNQUFNLENBQUNxTSxtQkFBbUIsQ0FBQ3ZMLFNBQVMsQ0FBQ3NMLFVBQVUsRUFBRXlCLGdCQUFnQixDQUFDLENBQUE7QUFDcEUsS0FBQTtBQUNGLEdBQUE7QUFFQSxFQUFBLE9BQU9yTixPQUFPLENBQUE7QUFDaEI7O0FDaE1BLFNBQVN1TixrQkFBa0JBLENBQUlDLElBQVksRUFBRUMsWUFBZSxFQUFFO0FBQzVELEVBQUEsSUFBTUMsT0FBTyxHQUFHQyxtQkFBYSxDQUFJRixZQUFZLENBQUMsQ0FBQTtFQUM5Q0MsT0FBTyxDQUFDRSxXQUFXLEdBQUdKLElBQUksQ0FBQTtBQUMxQixFQUFBLE9BQU9FLE9BQU8sQ0FBQTtBQUNoQixDQUFBO0FBUU1HLElBQUFBLGFBQWEsR0FBR04sa0JBQWtCLENBQXFCLFFBQVEsRUFBRSxFQUFTOztBQ1RwRU8sSUFBQUEsU0FBUywwQkFBVEEsU0FBUyxFQUFBO0VBQVRBLFNBQVMsQ0FBQSxXQUFBLENBQUEsR0FBQSxXQUFBLENBQUE7RUFBVEEsU0FBUyxDQUFBLFFBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQTtFQUFUQSxTQUFTLENBQUEsT0FBQSxDQUFBLEdBQUEsT0FBQSxDQUFBO0VBQVRBLFNBQVMsQ0FBQSxVQUFBLENBQUEsR0FBQSxVQUFBLENBQUE7RUFBVEEsU0FBUyxDQUFBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtFQUFUQSxTQUFTLENBQUEsVUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0VBQVRBLFNBQVMsQ0FBQSxTQUFBLENBQUEsR0FBQSxTQUFBLENBQUE7QUFBQSxFQUFBLE9BQVRBLFNBQVMsQ0FBQTtBQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTs7QUE4Q3JCOztBQ3JEQTtBQUNBO0FBQ0E7QUFDTyxTQUFTQyxTQUFTQSxDQUFDek0sSUFBWSxFQUFVO0FBQzlDLEVBQUEsT0FBT0EsSUFBSSxDQUFDa0QsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNsQyxDQUFBO0FBRU8sU0FBU3dKLFlBQVlBLENBQUNDLE1BQWdCLEVBQUVDLE1BQWdCLEVBQVU7QUFDdkUsRUFBQSxJQUFNQyxZQUFZLEdBQUdGLE1BQU0sQ0FBQ25OLE1BQU0sQ0FBQTtBQUNsQyxFQUFBLElBQU1zTixZQUFZLEdBQUdGLE1BQU0sQ0FBQ3BOLE1BQU0sQ0FBQTtFQUNsQyxJQUFNMkQsR0FBRyxHQUFHQyxJQUFJLENBQUMySixHQUFHLENBQUNGLFlBQVksRUFBRUMsWUFBWSxDQUFDLENBQUE7RUFDaEQsS0FBSyxJQUFJeE4sQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHNkQsR0FBRyxFQUFFN0QsQ0FBQyxFQUFFLEVBQUU7SUFDNUIsSUFBTWtMLEtBQUssR0FBR29DLE1BQU0sQ0FBQ3ROLENBQUMsQ0FBQyxHQUFHcU4sTUFBTSxDQUFDck4sQ0FBQyxDQUFDLENBQUE7SUFDbkMsSUFBSWtMLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDZixNQUFBLE9BQU9BLEtBQUssQ0FBQTtBQUNkLEtBQUE7QUFDRixHQUFBO0VBQ0EsSUFBSXFDLFlBQVksS0FBS0MsWUFBWSxFQUFFO0FBQ2pDLElBQUEsT0FBTyxDQUFDLENBQUE7QUFDVixHQUFBO0FBQ0EsRUFBQSxPQUFPRCxZQUFZLEdBQUdDLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDN0MsQ0FBQTs7QUFFQTtBQUNPLFNBQVNFLFNBQVNBLENBQUNDLEdBQVcsRUFBRTtBQUNyQyxFQUFBLE9BQU9BLEdBQUcsQ0FBQy9KLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUN6RDs7QUN2QkEsSUFBTWdLLFNBQVMsR0FBRyxVQUFVLENBQUE7O0FBRTVCO0FBQ08sU0FBU0MsS0FBS0EsQ0FBQ25OLElBQVksRUFBVztFQUMzQyxJQUFNb04sTUFBZSxHQUFHLEVBQUUsQ0FBQTtFQUUxQixJQUFJLENBQUNwTixJQUFJLEVBQUU7QUFDVCxJQUFBLE9BQU9vTixNQUFNLENBQUE7QUFDZixHQUFBO0FBRUEsRUFBQSxJQUFJQyxPQUFPLEdBQUdaLFNBQVMsQ0FBQ3pNLElBQUksQ0FBQyxDQUFBO0VBQzdCLElBQUlxTixPQUFPLEtBQUssR0FBRyxJQUFJLENBQUNBLE9BQU8sQ0FBQ2pOLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUMvQyxNQUFNLElBQUlrTixLQUFLLENBQUEsNEJBQTJCLENBQUMsQ0FBQTtBQUM3QyxHQUFBO0FBRUEsRUFBQSxJQUFNQyxVQUFVLEdBQUcsWUFBTTtJQUN2QixJQUFJckIsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNiLElBQUEsT0FBTzVNLENBQUMsR0FBRytOLE9BQU8sQ0FBQzdOLE1BQU0sSUFBSTBOLFNBQVMsQ0FBQ00sSUFBSSxDQUFDSCxPQUFPLENBQUMvTixDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3ZENE0sTUFBQUEsSUFBSSxJQUFJbUIsT0FBTyxDQUFDL04sQ0FBQyxDQUFDLENBQUE7TUFDbEJtTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDYixLQUFBO0FBQ0EsSUFBQSxPQUFPdkIsSUFBSSxDQUFBO0dBQ1osQ0FBQTtBQUVELEVBQUEsSUFBTXVCLFFBQVEsR0FBRyxVQUFDL0YsSUFBWSxFQUFLO0FBQ2pDcEksSUFBQUEsQ0FBQyxJQUFJb0ksSUFBSSxDQUFBO0dBQ1YsQ0FBQTtFQUVELElBQUlwSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1QsRUFBQSxPQUFPQSxDQUFDLEdBQUcrTixPQUFPLENBQUM3TixNQUFNLEVBQUU7QUFDekIsSUFBQSxJQUFNa08sT0FBTyxHQUFHTCxPQUFPLENBQUMvTixDQUFDLENBQUMsQ0FBQTtBQUMxQixJQUFBLElBQU1xTyxRQUFRLEdBQUdOLE9BQU8sQ0FBQy9OLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUUvQixJQUFJb08sT0FBTyxLQUFLLEdBQUcsRUFBRTtNQUNuQk4sTUFBTSxDQUFDdEssSUFBSSxDQUFDO1FBQUU4SyxJQUFJLEVBQUVwQixTQUFTLENBQUNxQixTQUFTO1FBQUVwSSxLQUFLLEVBQUU0SCxPQUFPLENBQUMvTixDQUFDLENBQUE7QUFBRSxPQUFDLENBQUMsQ0FBQTtNQUM3RG1PLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNYLE1BQUEsU0FBQTtBQUNGLEtBQUE7QUFDQTtBQUNBLElBQUEsSUFBSUUsUUFBUSxLQUFLLEdBQUcsSUFBSUQsT0FBTyxLQUFLLEdBQUcsRUFBRTtNQUN2Q0QsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ1hMLE1BQU0sQ0FBQ3RLLElBQUksQ0FBQztRQUFFOEssSUFBSSxFQUFFcEIsU0FBUyxDQUFDc0IsS0FBSztRQUFFckksS0FBSyxFQUFFOEgsVUFBVSxFQUFDO0FBQUUsT0FBQyxDQUFDLENBQUE7QUFDM0QsTUFBQSxTQUFBO0FBQ0YsS0FBQTtBQUNBO0FBQ0EsSUFBQSxJQUFJLENBQUNJLFFBQVEsS0FBSyxHQUFHLElBQUlBLFFBQVEsS0FBS3RKLFNBQVMsS0FBS3FKLE9BQU8sS0FBSyxHQUFHLEVBQUU7TUFDbkVOLE1BQU0sQ0FBQ3RLLElBQUksQ0FBQztRQUFFOEssSUFBSSxFQUFFcEIsU0FBUyxDQUFDdUIsUUFBUTtRQUFFdEksS0FBSyxFQUFFNEgsT0FBTyxDQUFDL04sQ0FBQyxDQUFBO0FBQUUsT0FBQyxDQUFDLENBQUE7TUFDNURtTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDWCxNQUFBLFNBQUE7QUFDRixLQUFBO0FBQ0E7SUFDQSxJQUFJRSxRQUFRLEtBQUssR0FBRyxJQUFJVCxTQUFTLENBQUNNLElBQUksQ0FBQ0UsT0FBTyxDQUFDLEVBQUU7TUFDL0NOLE1BQU0sQ0FBQ3RLLElBQUksQ0FBQztRQUFFOEssSUFBSSxFQUFFcEIsU0FBUyxDQUFDd0IsTUFBTTtRQUFFdkksS0FBSyxFQUFFOEgsVUFBVSxFQUFDO0FBQUUsT0FBQyxDQUFDLENBQUE7QUFDNUQsTUFBQSxTQUFBO0FBQ0YsS0FBQTtJQUNBLElBQUlHLE9BQU8sS0FBSyxHQUFHLEVBQUU7TUFDbkJOLE1BQU0sQ0FBQ3RLLElBQUksQ0FBQztRQUFFOEssSUFBSSxFQUFFcEIsU0FBUyxDQUFDeUIsUUFBUTtBQUFFeEksUUFBQUEsS0FBSyxFQUFFLEdBQUE7QUFBSSxPQUFDLENBQUMsQ0FBQTtNQUNyRGdJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNYLE1BQUEsU0FBQTtBQUNGLEtBQUE7SUFDQSxJQUFJQyxPQUFPLEtBQUssR0FBRyxFQUFFO01BQ25CTixNQUFNLENBQUN0SyxJQUFJLENBQUM7UUFBRThLLElBQUksRUFBRXBCLFNBQVMsQ0FBQzBCLFFBQVE7QUFBRXpJLFFBQUFBLEtBQUssRUFBRSxHQUFBO0FBQUksT0FBQyxDQUFDLENBQUE7TUFDckRnSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDWCxNQUFBLFNBQUE7QUFDRixLQUFBO0FBQ0EsSUFBQSxJQUFJUCxTQUFTLENBQUNNLElBQUksQ0FBQ0UsT0FBTyxDQUFDLEVBQUU7TUFDM0JOLE1BQU0sQ0FBQ3RLLElBQUksQ0FBQztRQUFFOEssSUFBSSxFQUFFcEIsU0FBUyxDQUFDMkIsT0FBTztRQUFFMUksS0FBSyxFQUFFOEgsVUFBVSxFQUFDO0FBQUUsT0FBQyxDQUFDLENBQUE7QUFDN0QsTUFBQSxTQUFBO0FBQ0YsS0FBQTtBQUNBO0lBQ0FFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNiLEdBQUE7QUFFQSxFQUFBLE9BQU9MLE1BQU0sQ0FBQTtBQUNmOzs7Ozs7QUN6RUE7QUFBQSxJQUNLZ0IsVUFBVSwwQkFBVkEsVUFBVSxFQUFBO0FBQVZBLEVBQUFBLFVBQVUsQ0FBVkEsVUFBVSxDQUFBLFFBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQTtBQUFWQSxFQUFBQSxVQUFVLENBQVZBLFVBQVUsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxPQUFBLENBQUE7QUFBVkEsRUFBQUEsVUFBVSxDQUFWQSxVQUFVLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsVUFBQSxDQUFBO0FBQVZBLEVBQUFBLFVBQVUsQ0FBVkEsVUFBVSxDQUFBLGFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsYUFBQSxDQUFBO0FBQUEsRUFBQSxPQUFWQSxVQUFVLENBQUE7QUFBQSxDQUFBLENBQVZBLFVBQVUsSUFZZixFQUFBLENBQUEsQ0FBQTtBQVNBLElBQU1DLGFBQXFDLEdBQUc7QUFDNUM7QUFDQUMsRUFBQUEsYUFBYSxFQUFFLElBQUk7QUFDbkI7QUFDQUMsRUFBQUEsVUFBVSxFQUFFLEtBQUs7QUFDakI7QUFDQUMsRUFBQUEsS0FBSyxFQUFFLEtBQUE7QUFDVCxDQUFDLENBQUE7QUFDRDtBQUNBLElBQU1DLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQTtBQUM1QztBQUNBLElBQU1DLGtCQUFrQixHQUFHLE9BQU8sQ0FBQTtBQUVsQyxJQUFNQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUE7QUFJdkIsU0FBU0MsZ0JBQWdCQSxDQUFjek8sUUFBZ0IsRUFBbUQ7QUFBQSxFQUFBLElBQWpENkssTUFBb0IsR0FBQXpMLFNBQUEsQ0FBQUMsTUFBQSxHQUFBLENBQUEsSUFBQUQsU0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBOEUsU0FBQSxHQUFBOUUsU0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFHOE8sYUFBYSxDQUFBO0FBQ2xHLEVBQUEsSUFBQVEscUJBQUEsR0FJSTdELE1BQU0sQ0FIUnNELGFBQWE7QUFBYkEsSUFBQUEsYUFBYSxHQUFBTyxxQkFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFHUixhQUFhLENBQUNDLGFBQWEsR0FBQU8scUJBQUE7SUFBQUMsa0JBQUEsR0FHekM5RCxNQUFNLENBRlJ1RCxVQUFVO0FBQVZBLElBQUFBLFVBQVUsR0FBQU8sa0JBQUEsS0FBQSxLQUFBLENBQUEsR0FBR1QsYUFBYSxDQUFDRSxVQUFVLEdBQUFPLGtCQUFBO0lBQUFDLGFBQUEsR0FFbkMvRCxNQUFNLENBRFJ3RCxLQUFLO0FBQUxBLElBQUFBLEtBQUssR0FBQU8sYUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFHVixhQUFhLENBQUNHLEtBQUssR0FBQU8sYUFBQSxDQUFBO0FBRTdCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLElBQUlDLE9BQU8sR0FBRyxHQUFHLENBQUE7RUFDakIsSUFBTUMsSUFBYyxHQUFHLEVBQUUsQ0FBQTtFQUN6QixJQUFNQyxNQUFnQixHQUFHLEVBQUUsQ0FBQTtBQUUzQixFQUFBLElBQU05QixNQUFNLEdBQUdELEtBQUssQ0FBQ2hOLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLEVBQUEsSUFBTWdQLGVBQWUsR0FBRy9CLE1BQU0sQ0FBQzVOLE1BQU0sS0FBSyxDQUFDLElBQUk0TixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUNRLElBQUksS0FBS3BCLFNBQVMsQ0FBQ3VCLFFBQVEsQ0FBQTtBQUNwRixFQUFBLElBQU1xQixVQUFVLEdBQUdoQyxNQUFNLENBQUM1TixNQUFNLENBQUE7QUFDaEMsRUFBQSxJQUFNNlAsU0FBUyxHQUFHakMsTUFBTSxDQUFDZ0MsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFBO0VBRXhDLEtBQUssSUFBSUUsUUFBUSxHQUFHLENBQUMsRUFBRUEsUUFBUSxHQUFHRixVQUFVLEVBQUVFLFFBQVEsRUFBRSxFQUFFO0FBQ3hELElBQUEsSUFBTUMsS0FBSyxHQUFHbkMsTUFBTSxDQUFDa0MsUUFBUSxDQUFDLENBQUE7QUFDOUIsSUFBQSxJQUFNRSxTQUFTLEdBQUdwQyxNQUFNLENBQUNrQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDdEMsUUFBUUMsS0FBSyxDQUFDM0IsSUFBSTtNQUNoQixLQUFLcEIsU0FBUyxDQUFDcUIsU0FBUztBQUN0Qm1CLFFBQUFBLE9BQU8sSUFBSSxHQUFHLENBQUE7QUFDZCxRQUFBLE1BQUE7TUFDRixLQUFLeEMsU0FBUyxDQUFDd0IsTUFBTTtRQUNuQmdCLE9BQU8sSUFBSU8sS0FBSyxDQUFDOUosS0FBSyxDQUFDdkMsT0FBTyxDQUFDdUwsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ3REUyxRQUFBQSxNQUFNLENBQUNwTSxJQUFJLENBQUNzTCxVQUFVLENBQUNxQixNQUFNLENBQUMsQ0FBQTtBQUM5QixRQUFBLE1BQUE7TUFDRixLQUFLakQsU0FBUyxDQUFDc0IsS0FBSztRQUNsQixJQUFJNEIsV0FBVyxHQUFHLEVBQUUsQ0FBQTtRQUNwQixJQUFJRixTQUFTLElBQUlBLFNBQVMsQ0FBQzVCLElBQUksS0FBS3BCLFNBQVMsQ0FBQ3lCLFFBQVEsRUFBRTtBQUN0RDtBQUNBcUIsVUFBQUEsUUFBUSxJQUFJLENBQUMsQ0FBQTtVQUNiLE9BQU9sQyxNQUFNLENBQUNrQyxRQUFRLENBQUMsQ0FBQzFCLElBQUksS0FBS3BCLFNBQVMsQ0FBQzBCLFFBQVEsRUFBRTtBQUNuRHdCLFlBQUFBLFdBQVcsSUFBSXRDLE1BQU0sQ0FBQ2tDLFFBQVEsQ0FBQyxDQUFDN0osS0FBSyxDQUFBO0FBQ3JDNkosWUFBQUEsUUFBUSxFQUFFLENBQUE7QUFDWixXQUFBO0FBQ0YsU0FBQTtBQUNBTixRQUFBQSxPQUFPLElBQUlVLFdBQVcsR0FBQSxNQUFBLEdBQVVBLFdBQVcsR0FBQSxJQUFBLEdBQUEsR0FBQSxHQUFXaEIsa0JBQWtCLEdBQUcsR0FBQSxDQUFBO0FBQzNFTyxRQUFBQSxJQUFJLENBQUNuTSxJQUFJLENBQUN5TSxLQUFLLENBQUM5SixLQUFLLENBQUMsQ0FBQTtBQUN0QnlKLFFBQUFBLE1BQU0sQ0FBQ3BNLElBQUksQ0FBQ3NMLFVBQVUsQ0FBQ3VCLEtBQUssQ0FBQyxDQUFBO0FBQzdCLFFBQUEsTUFBQTtNQUNGLEtBQUtuRCxTQUFTLENBQUN1QixRQUFRO0FBQ3JCa0IsUUFBQUEsSUFBSSxDQUFDbk0sSUFBSSxDQUFDeU0sS0FBSyxDQUFDOUosS0FBSyxDQUFDLENBQUE7UUFDdEJ1SixPQUFPLElBQUEsTUFBQSxHQUFXTixrQkFBa0IsR0FBQSxHQUFBLElBQUlTLGVBQWUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFVVCxHQUFBQSxTQUFBQSxHQUFBQSxrQkFBa0IsR0FBTSxNQUFBLENBQUE7QUFDcEdRLFFBQUFBLE1BQU0sQ0FBQ3BNLElBQUksQ0FBQ3FNLGVBQWUsR0FBR2YsVUFBVSxDQUFDd0IsUUFBUSxHQUFHeEIsVUFBVSxDQUFDeUIsV0FBVyxDQUFDLENBQUE7QUFDM0UsUUFBQSxNQUFBO0FBQ0osS0FBQTtBQUNGLEdBQUE7RUFDQSxJQUFNQyxVQUFVLEdBQUdULFNBQVMsQ0FBQ3pCLElBQUksS0FBS3BCLFNBQVMsQ0FBQ3VCLFFBQVEsQ0FBQTtBQUV4RCxFQUFBLElBQUksQ0FBQytCLFVBQVUsSUFBSSxDQUFDdEIsS0FBSyxFQUFFO0lBQ3pCLElBQUksQ0FBQ0QsVUFBVSxFQUFFO0FBQ2ZTLE1BQUFBLE9BQU8sSUFBV2hDLE1BQUFBLEdBQUFBLFNBQVMsQ0FBQzJCLGdCQUFnQixDQUFDLEdBQVUsVUFBQSxDQUFBO0FBQ3pELEtBQUE7QUFDQSxJQUFBLElBQUlVLFNBQVMsQ0FBQ3pCLElBQUksS0FBS3BCLFNBQVMsQ0FBQ3FCLFNBQVMsRUFBRTtBQUMxQ21CLE1BQUFBLE9BQU8sSUFBV2hDLE1BQUFBLEdBQUFBLFNBQVMsQ0FBQzJCLGdCQUFnQixDQUFDLEdBQU0sTUFBQSxDQUFBO0FBQ3JELEtBQUE7QUFDRixHQUFDLE1BQU07SUFDTEssT0FBTyxJQUFJVCxVQUFVLEdBQUcsR0FBRyxTQUFPdkIsU0FBUyxDQUFDMkIsZ0JBQWdCLENBQUMsR0FBSyxLQUFBLENBQUE7QUFDcEUsR0FBQTtBQUVBLEVBQUEsSUFBTW9CLElBQUksR0FBR3pCLGFBQWEsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO0VBQ3JDLElBQU0wQixNQUFNLEdBQUcsSUFBSUMsTUFBTSxDQUFDakIsT0FBTyxFQUFFZSxJQUFJLENBQUMsQ0FBQTs7QUFFeEM7QUFDRjtBQUNBO0VBQ0UsU0FBU0csS0FBS0EsQ0FBQ2xRLElBQVksRUFBcUI7QUFDOUMsSUFBQSxJQUFNbVEsT0FBTyxHQUFHblEsSUFBSSxDQUFDb1EsS0FBSyxDQUFDSixNQUFNLENBQUMsQ0FBQTtJQUVsQyxJQUFJLENBQUNHLE9BQU8sRUFBRTtBQUNaLE1BQUEsT0FBTyxJQUFJLENBQUE7QUFDYixLQUFBO0FBQ0EsSUFBQSxJQUFNRSxXQUFXLEdBQUdGLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM5QixJQUFJRyxNQUFpQixHQUFHLEVBQUUsQ0FBQTtBQUMxQixJQUFBLElBQUlDLFVBQW9CLEdBQUdDLEtBQUssQ0FBQ0MsSUFBSSxDQUFDdkIsTUFBTSxDQUFDLENBQUE7QUFDN0MsSUFBQSxLQUFLLElBQUk1UCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc2USxPQUFPLENBQUMzUSxNQUFNLEVBQUVGLENBQUMsRUFBRSxFQUFFO0FBQ3ZDLE1BQUEsSUFBSXFRLEtBQUssR0FBR1EsT0FBTyxDQUFDN1EsQ0FBQyxDQUFDLENBQUE7QUFDdEIsTUFBQSxJQUFJSSxHQUFHLEdBQUd1UCxJQUFJLENBQUMzUCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDckIsTUFBQSxJQUFJSSxHQUFHLEtBQUssR0FBRyxJQUFJaVEsS0FBSyxFQUFFO0FBQ3hCLFFBQUEsSUFBSWxLLEtBQUssR0FBR2tLLEtBQUssQ0FBQ2UsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzVCLElBQUksQ0FBQ0YsS0FBSyxDQUFDRyxPQUFPLENBQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQy9CQSxVQUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUc3SyxLQUFLLENBQUE7QUFDckIsU0FBQyxNQUFNO0FBQUEsVUFBQSxJQUFBbUwsUUFBQSxDQUFBO0FBQ0wsVUFBQSxDQUFBQSxRQUFBLEdBQUFOLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBQ3hOLElBQUksQ0FBQWhELEtBQUEsQ0FBQThRLFFBQUEsRUFBSW5MLEtBQUssQ0FBQyxDQUFBO0FBQzVCLFNBQUE7QUFDQTtBQUNBOEssUUFBQUEsVUFBVSxDQUFDTSxNQUFNLENBQUEvUSxLQUFBLENBQWpCeVEsVUFBVSxFQUFBLENBQ1JyQixNQUFNLENBQUNwUSxPQUFPLENBQUNzUCxVQUFVLENBQUN5QixXQUFXLENBQUMsRUFDdEMsQ0FBQyxDQUFBaUIsQ0FBQUEsTUFBQSxDQUNFLElBQUlOLEtBQUssQ0FBQy9LLEtBQUssQ0FBQ2pHLE1BQU0sQ0FBQyxDQUFDdVIsSUFBSSxDQUFDM0MsVUFBVSxDQUFDd0IsUUFBUSxDQUFDLENBQ3RELENBQUMsQ0FBQTtBQUNILE9BQUMsTUFBTTtRQUNMVSxNQUFNLENBQUM1USxHQUFHLENBQUMsR0FBR2lRLEtBQUssR0FBR0EsS0FBSyxHQUFHLEVBQUUsQ0FBQTtBQUNsQyxPQUFBO0FBQ0YsS0FBQTtBQUVBLElBQUEsSUFBTXFCLE9BQU8sR0FBR2hSLElBQUksS0FBS3FRLFdBQVcsQ0FBQTtBQUNwQyxJQUFBLElBQU0vUCxHQUFHLEdBQUdOLElBQUksS0FBSyxHQUFHLElBQUlxUSxXQUFXLEtBQUssRUFBRSxHQUFHLEdBQUcsR0FBR0EsV0FBVyxDQUFBO0lBQ2xFLE9BQU87QUFBRVcsTUFBQUEsT0FBTyxFQUFFQSxPQUFPO0FBQUVoUixNQUFBQSxJQUFJLEVBQUVHLFFBQVE7QUFBRUcsTUFBQUEsR0FBRyxFQUFFQSxHQUFHO0FBQUUyUSxNQUFBQSxLQUFLLEVBQUVWLFVBQVU7QUFBRUQsTUFBQUEsTUFBTSxFQUFFQSxNQUFBQTtLQUFRLENBQUE7QUFDMUYsR0FBQTs7QUFFQTtBQUNGO0FBQ0E7RUFDRSxTQUFTWSxPQUFPQSxDQUFDWixNQUFpQixFQUFVO0lBQzFDLElBQUl0USxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQUMsSUFBQSxJQUFBcUcsU0FBQSxHQUFBQywwQkFBQSxDQUNNOEcsTUFBTSxDQUFBO01BQUE3RyxLQUFBLENBQUE7QUFBQSxJQUFBLElBQUE7TUFBMUIsS0FBQUYsU0FBQSxDQUFBRyxDQUFBLEVBQUFELEVBQUFBLENBQUFBLENBQUFBLEtBQUEsR0FBQUYsU0FBQSxDQUFBSSxDQUFBLEVBQUFDLEVBQUFBLElBQUEsR0FBNEI7QUFBQSxRQUFBLElBQWpCNkksTUFBSyxHQUFBaEosS0FBQSxDQUFBZCxLQUFBLENBQUE7UUFDZCxRQUFROEosTUFBSyxDQUFDM0IsSUFBSTtVQUNoQixLQUFLcEIsU0FBUyxDQUFDd0IsTUFBTTtZQUNuQmhPLElBQUksSUFBSXVQLE1BQUssQ0FBQzlKLEtBQUssQ0FBQTtBQUNuQixZQUFBLE1BQUE7VUFDRixLQUFLK0csU0FBUyxDQUFDc0IsS0FBSztBQUNsQixZQUFBLElBQUksQ0FBQ3dDLE1BQU0sQ0FBQ2YsTUFBSyxDQUFDOUosS0FBSyxDQUFDLEVBQUU7QUFDeEIsY0FBQSxNQUFNLElBQUk2SCxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN0QyxhQUFBO0FBQ0F0TixZQUFBQSxJQUFJLElBQUlzUSxNQUFNLENBQUNmLE1BQUssQ0FBQzlKLEtBQUssQ0FBQyxDQUFBO0FBQzNCLFlBQUEsTUFBQTtVQUNGLEtBQUsrRyxTQUFTLENBQUN1QixRQUFRO0FBQ3JCLFlBQUEsSUFBSW9ELFFBQVEsR0FBR2IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzFCLElBQUlhLFFBQVEsWUFBWVgsS0FBSyxFQUFFO0FBQzdCeFEsY0FBQUEsSUFBSSxJQUFJbVIsUUFBUSxDQUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDNUIsYUFBQyxNQUFNO0FBQ0xwUixjQUFBQSxJQUFJLElBQUltUixRQUFRLENBQUE7QUFDbEIsYUFBQTtBQUNBLFlBQUEsTUFBQTtVQUNGLEtBQUszRSxTQUFTLENBQUNxQixTQUFTO1lBQ3RCN04sSUFBSSxJQUFJdVAsTUFBSyxDQUFDOUosS0FBSyxDQUFBO0FBQ25CLFlBQUEsTUFBQTtBQUNKLFNBQUE7QUFDRixPQUFBO0FBQUMsS0FBQSxDQUFBLE9BQUFrQixHQUFBLEVBQUE7TUFBQU4sU0FBQSxDQUFBTyxDQUFBLENBQUFELEdBQUEsQ0FBQSxDQUFBO0FBQUEsS0FBQSxTQUFBO0FBQUFOLE1BQUFBLFNBQUEsQ0FBQVEsQ0FBQSxFQUFBLENBQUE7QUFBQSxLQUFBO0FBQ0QsSUFBQSxPQUFPN0csSUFBSSxDQUFBO0FBQ2IsR0FBQTtFQUVBLE9BQU87SUFDTCxJQUFJZ1EsTUFBTUEsR0FBRztBQUNYLE1BQUEsT0FBT0EsTUFBTSxDQUFBO0tBQ2Q7SUFDRCxJQUFJZixJQUFJQSxHQUFHO0FBQ1QsTUFBQSxPQUFPQSxJQUFJLENBQUE7S0FDWjtBQUNEaUMsSUFBQUEsT0FBTyxFQUFQQSxPQUFPO0FBQ1BoQixJQUFBQSxLQUFLLEVBQUxBLEtBQUFBO0dBQ0QsQ0FBQTtBQUNILENBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ08sU0FBU21CLFNBQVNBLENBQ3ZCbFIsUUFBZ0IsRUFDaEI2TyxPQUEwQixFQUMxQmhFLE1BQXFCLEVBQ0Y7QUFDbkIsRUFBQSxJQUFNc0csUUFBUSxHQUFHZCxLQUFLLENBQUNHLE9BQU8sQ0FBQzNCLE9BQU8sQ0FBQyxHQUFBLEVBQUEsQ0FBQThCLE1BQUEsQ0FBTzlCLE9BQU8sQ0FBSSxHQUFBLENBQUNBLE9BQU8sQ0FBQyxDQUFBO0VBQ2xFLElBQU11QyxjQUE0QixHQUFHLEVBQUUsQ0FBQTtBQUFDLEVBQUEsSUFBQUMsVUFBQSxHQUFBbEwsMEJBQUEsQ0FDckJnTCxRQUFRLENBQUE7SUFBQUcsTUFBQSxDQUFBO0FBQUEsRUFBQSxJQUFBO0lBQTNCLEtBQUFELFVBQUEsQ0FBQWhMLENBQUEsRUFBQWlMLEVBQUFBLENBQUFBLENBQUFBLE1BQUEsR0FBQUQsVUFBQSxDQUFBL0ssQ0FBQSxFQUFBQyxFQUFBQSxJQUFBLEdBQTZCO0FBQUEsTUFBQSxJQUFsQlAsSUFBSSxHQUFBc0wsTUFBQSxDQUFBaE0sS0FBQSxDQUFBO0FBQ2IsTUFBQSxJQUFNaU0sTUFBTSxHQUFHOUMsZ0JBQWdCLENBQUN6SSxJQUFJLEVBQUU2RSxNQUFNLENBQUMsQ0FBQTtBQUM3QyxNQUFBLElBQU0yRyxPQUFPLEdBQUdELE1BQU0sQ0FBQ3hCLEtBQUssQ0FBQy9QLFFBQVEsQ0FBQyxDQUFBO0FBQ3RDLE1BQUEsSUFBSXdSLE9BQU8sRUFBRTtBQUNYSixRQUFBQSxjQUFjLENBQUN6TyxJQUFJLENBQUM2TyxPQUFPLENBQUMsQ0FBQTtBQUM5QixPQUFBO0FBQ0YsS0FBQTtBQUFDLEdBQUEsQ0FBQSxPQUFBaEwsR0FBQSxFQUFBO0lBQUE2SyxVQUFBLENBQUE1SyxDQUFBLENBQUFELEdBQUEsQ0FBQSxDQUFBO0FBQUEsR0FBQSxTQUFBO0FBQUE2SyxJQUFBQSxVQUFBLENBQUEzSyxDQUFBLEVBQUEsQ0FBQTtBQUFBLEdBQUE7QUFDRCxFQUFBLE9BQU8sQ0FBQzBLLGNBQWMsQ0FBQy9SLE1BQU0sR0FBRyxJQUFJLEdBQUcrUixjQUFjLENBQUNLLElBQUksQ0FBQyxVQUFDQyxDQUFDLEVBQUVDLENBQUMsRUFBQTtJQUFBLE9BQUtwRixZQUFZLENBQUNtRixDQUFDLENBQUNaLEtBQUssRUFBRWEsQ0FBQyxDQUFDYixLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6RyxDQUFBO0FBRU8sU0FBU2MsWUFBWUEsQ0FBVS9SLElBQVksRUFBRXNRLE1BQWlCLEVBQUU7QUFDckUsRUFBQSxJQUFNb0IsTUFBTSxHQUFHOUMsZ0JBQWdCLENBQUM1TyxJQUFJLENBQUMsQ0FBQTtBQUNyQyxFQUFBLE9BQU8wUixNQUFNLENBQUNSLE9BQU8sQ0FBQ1osTUFBTSxDQUFDLENBQUE7QUFDL0I7O0FDbE5BLFNBQVMwQixVQUFVQSxHQUFHO0FBQ3BCLEVBQUEsT0FBT0MsZ0JBQVUsQ0FBQzFGLGFBQWEsQ0FBQyxDQUFDN04sT0FBTyxDQUFBO0FBQzFDLENBQUE7QUFHQSxTQUFTd1QsV0FBV0EsR0FBRztBQUNyQixFQUFBLE9BQU9ELGdCQUFVLENBQUMxRixhQUFhLENBQUMsQ0FBQ3JMLFFBQVEsQ0FBQTtBQUMzQyxDQUFBO0FBR0EsU0FBU2lSLFNBQVNBLEdBQUc7QUFDbkIsRUFBQSxJQUFNL0IsS0FBSyxHQUFHNkIsZ0JBQVUsQ0FBQzFGLGFBQWEsQ0FBQyxDQUFDNkQsS0FBSyxDQUFBO0FBQzdDLEVBQUEsT0FBT0EsS0FBSyxHQUFHQSxLQUFLLENBQUNFLE1BQU0sR0FBRyxFQUFFLENBQUE7QUFDbEMsQ0FBQTtBQUdBLFNBQVM4QixhQUFhQSxDQUFDcFMsSUFBYSxFQUFFO0FBQ3BDLEVBQUEsSUFBTUcsUUFBUSxHQUFHK1IsV0FBVyxFQUFFLENBQUMvUixRQUFRLENBQUE7QUFDdkMsRUFBQSxJQUFNaVEsS0FBSyxHQUFHNkIsZ0JBQVUsQ0FBQzFGLGFBQWEsQ0FBQyxDQUFDNkQsS0FBSyxDQUFBO0FBQzdDLEVBQUEsSUFBSXBRLElBQUksRUFBRTtBQUNSLElBQUEsT0FBT3FSLFNBQVMsQ0FBQ2xSLFFBQVEsRUFBRUgsSUFBSSxDQUFDLENBQUE7QUFDbEMsR0FBQTtBQUNBLEVBQUEsT0FBT29RLEtBQUssQ0FBQTtBQUNkOztBQ0hBLFNBQVNpQyxLQUFLQSxDQUEwRXpOLEtBQTBCLEVBQUU7QUFDbEgsRUFBQSxJQUFNd0gsT0FBTyxHQUFHNkYsZ0JBQVUsQ0FBQzFGLGFBQWEsQ0FBQyxDQUFBO0FBRXpDLEVBQUEsSUFBUStGLFFBQVEsR0FBcUIxTixLQUFLLENBQWxDME4sUUFBUTtJQUFFcFIsUUFBUSxHQUFXMEQsS0FBSyxDQUF4QjFELFFBQVE7SUFBRWxCLElBQUksR0FBSzRFLEtBQUssQ0FBZDVFLElBQUksQ0FBQTtBQUNoQyxFQUFBLElBQU11UyxRQUFRLEdBQXdCM04sS0FBSyxDQUFyQzJOLFFBQVE7SUFBRUMsU0FBUyxHQUFhNU4sS0FBSyxDQUEzQjROLFNBQVM7SUFBRUMsTUFBTSxHQUFLN04sS0FBSyxDQUFoQjZOLE1BQU0sQ0FBQTtBQUNqQyxFQUFBLElBQUlyQyxLQUF3QixDQUFBO0FBRTVCLEVBQUEsSUFBTXNDLGFBQWEsR0FBR3hSLFFBQVEsSUFBSWtMLE9BQU8sQ0FBQ2xMLFFBQVEsQ0FBQTtBQUNsRCxFQUFBLElBQUlvUixRQUFRLEVBQUU7QUFDWmxDLElBQUFBLEtBQUssR0FBR2tDLFFBQVEsQ0FBQTtHQUNqQixNQUFNLElBQUl0UyxJQUFJLEVBQUU7SUFDZm9RLEtBQUssR0FBR2lCLFNBQVMsQ0FBSXFCLGFBQWEsQ0FBQ3ZTLFFBQVEsRUFBRUgsSUFBSSxDQUFDLENBQUE7QUFDcEQsR0FBQyxNQUFNO0lBQ0xvUSxLQUFLLEdBQUdoRSxPQUFPLENBQUNnRSxLQUFLLENBQUE7QUFDdkIsR0FBQTtBQUNBLEVBQUEsSUFBTXVDLFFBQVEsR0FBQTFULFFBQUEsQ0FBQSxFQUFBLEVBQVFtTixPQUFPLEVBQUE7QUFBRWxMLElBQUFBLFFBQVEsRUFBRXdSLGFBQWE7QUFBRXRDLElBQUFBLEtBQUssRUFBRUEsS0FBQUE7R0FBTyxDQUFBLENBQUE7QUFFdEUsRUFBQSxJQUFJSSxLQUFLLENBQUNHLE9BQU8sQ0FBQzRCLFFBQVEsQ0FBQyxJQUFJSyxjQUFRLENBQUN6SSxLQUFLLENBQUNvSSxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDN0RBLElBQUFBLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDakIsR0FBQTs7QUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFLEVBQUEsSUFBTU0sV0FBVyxHQUFHLFlBQThCO0FBQ2hEO0lBQ0EsSUFBSUYsUUFBUSxDQUFDdkMsS0FBSyxFQUFFO0FBQ2xCLE1BQUEsSUFBSW1DLFFBQVEsRUFBRTtBQUNaLFFBQUEsSUFBSSxPQUFPQSxRQUFRLEtBQUssVUFBVSxFQUFFO1VBQ2xDLE9BQU9BLFFBQVEsQ0FBQ0ksUUFBUSxDQUFDLENBQUE7QUFDM0IsU0FBQTtBQUNBLFFBQUEsT0FBT0osUUFBUSxDQUFBO0FBQ2pCLE9BQUE7QUFFQSxNQUFBLElBQUlDLFNBQVMsRUFBRTtBQUNiLFFBQUEsT0FBT3BVLG1CQUFhLENBQUNvVSxTQUFTLEVBQUVHLFFBQVEsQ0FBQyxDQUFBO09BQzFDLE1BQU0sSUFBSUYsTUFBTSxFQUFFO1FBQ2pCLE9BQU9BLE1BQU0sQ0FBQ0UsUUFBUSxDQUFDLENBQUE7QUFDekIsT0FBQyxNQUFNO0FBQ0wsUUFBQSxPQUFPLElBQUksQ0FBQTtBQUNiLE9BQUE7QUFDRixLQUFDLE1BQU07QUFDTDtBQUNBLE1BQUEsSUFBSSxPQUFPSixRQUFRLEtBQUssVUFBVSxFQUFFO1FBQ2xDLE9BQU9BLFFBQVEsQ0FBQ0ksUUFBUSxDQUFDLENBQUE7QUFDM0IsT0FBQTtBQUNBLE1BQUEsT0FBTyxJQUFJLENBQUE7QUFDYixLQUFBO0dBQ0QsQ0FBQTtBQUVELEVBQUEsb0JBQU9HLGdCQUFBLENBQUExVSxhQUFBLENBQUNtTyxhQUFhLENBQUN3RyxRQUFRLEVBQUE7QUFBQ3ROLElBQUFBLEtBQUssRUFBRWtOLFFBQUFBO0dBQVdFLEVBQUFBLFdBQVcsRUFBMkIsQ0FBQyxDQUFBO0FBQzFGOztBQ3RFQSxTQUFTRyxNQUFNQSxDQUF3QnBPLEtBQVEsRUFBRTtBQUMvQyxFQUFBLElBQVFsRyxPQUFPLEdBQXNCa0csS0FBSyxDQUFsQ2xHLE9BQU87SUFBQXVVLGVBQUEsR0FBc0JyTyxLQUFLLENBQXpCMk4sUUFBUTtBQUFSQSxJQUFBQSxRQUFRLEdBQUFVLGVBQUEsS0FBRyxLQUFBLENBQUEsR0FBQSxJQUFJLEdBQUFBLGVBQUEsQ0FBQTtFQUNoQyxJQUFBQyxTQUFBLEdBQWdDQyxjQUFRLENBQUN2TyxLQUFLLENBQUNsRyxPQUFPLENBQUN3QyxRQUFRLENBQUM7QUFBekRBLElBQUFBLFFBQVEsR0FBQWdTLFNBQUEsQ0FBQSxDQUFBLENBQUE7QUFBRUUsSUFBQUEsV0FBVyxHQUFBRixTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDNUIsRUFBQSxJQUFNRyxlQUFlLEdBQUdDLFlBQU0sQ0FBa0IsSUFBSSxDQUFDLENBQUE7O0FBRXJEO0VBQ0EsSUFBSUMsUUFBNkIsR0FBRzdVLE9BQU8sQ0FBQ21KLE1BQU0sQ0FBQyxVQUFBbkQsR0FBRyxFQUFJO0FBQ3hEMk8sSUFBQUEsZUFBZSxDQUFDelMsT0FBTyxHQUFHOEQsR0FBRyxDQUFDeEQsUUFBUSxDQUFBO0FBQ3hDLEdBQUMsQ0FBQyxDQUFBOztBQUVGO0FBQ0FzUyxFQUFBQSxxQkFBZSxDQUFDLFlBQU07QUFDcEIsSUFBQSxJQUFJRCxRQUFRLEVBQUU7QUFDWkEsTUFBQUEsUUFBUSxFQUFFLENBQUE7QUFDWixLQUFBO0FBQ0E7QUFDQUEsSUFBQUEsUUFBUSxHQUFHN1UsT0FBTyxDQUFDbUosTUFBTSxDQUFDLFVBQUFuRCxHQUFHLEVBQUk7QUFDL0IwTyxNQUFBQSxXQUFXLENBQUMxTyxHQUFHLENBQUN4RCxRQUFRLENBQUMsQ0FBQTtBQUMzQixLQUFDLENBQUMsQ0FBQTtJQUVGLElBQUltUyxlQUFlLENBQUN6UyxPQUFPLEVBQUU7QUFDM0J3UyxNQUFBQSxXQUFXLENBQUNDLGVBQWUsQ0FBQ3pTLE9BQU8sQ0FBQyxDQUFBO0FBQ3RDLEtBQUE7QUFFQSxJQUFBLE9BQU8sWUFBTTtBQUNYLE1BQUEsSUFBSTJTLFFBQVEsRUFBRTtBQUNaQSxRQUFBQSxRQUFRLEVBQUUsQ0FBQTtBQUNWQSxRQUFBQSxRQUFRLEdBQUcsSUFBSSxDQUFBO1FBQ2ZGLGVBQWUsQ0FBQ3pTLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDaEMsT0FBQTtLQUNELENBQUE7R0FDRixFQUFFLEVBQUUsQ0FBQyxDQUFBO0VBRU4sSUFBTTZTLGdCQUFvQyxHQUFHQyxhQUFPLENBQ2xELFlBQUE7SUFBQSxPQUFPO0FBQ0xoVixNQUFBQSxPQUFPLEVBQUVBLE9BQU87QUFDaEJ3QyxNQUFBQSxRQUFRLEVBQUVBLFFBQVE7QUFDbEJrUCxNQUFBQSxLQUFLLEVBQUU7QUFBRVksUUFBQUEsT0FBTyxFQUFFOVAsUUFBUSxDQUFDZixRQUFRLEtBQUssR0FBRztRQUFFbVEsTUFBTSxFQUFFLEVBQUU7QUFBRXRRLFFBQUFBLElBQUksRUFBRSxHQUFHO0FBQUVpUixRQUFBQSxLQUFLLEVBQUUsRUFBRTtBQUFFM1EsUUFBQUEsR0FBRyxFQUFFLEdBQUE7QUFBSSxPQUFBO0tBQ3pGLENBQUE7QUFBQSxHQUFDLEVBQ0YsQ0FBQ1ksUUFBUSxDQUNYLENBQUMsQ0FBQTtBQUVELEVBQUEsb0JBQU80UixnQkFBQSxDQUFBMVUsYUFBQSxDQUFDbU8sYUFBYSxDQUFDd0csUUFBUSxFQUFBO0FBQUN0TixJQUFBQSxLQUFLLEVBQUVnTyxnQkFBaUI7QUFBQ2xCLElBQUFBLFFBQVEsRUFBRUEsUUFBQUE7QUFBUyxHQUFFLENBQUMsQ0FBQTtBQUNoRjs7QUN2RGUsU0FBU29CLDZCQUE2QkEsQ0FBQ2xVLE1BQU0sRUFBRW1VLFFBQVEsRUFBRTtBQUN0RSxFQUFBLElBQUluVSxNQUFNLElBQUksSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFBO0VBQzdCLElBQUlKLE1BQU0sR0FBRyxFQUFFLENBQUE7QUFDZixFQUFBLElBQUl3VSxVQUFVLEdBQUczVSxNQUFNLENBQUMrUCxJQUFJLENBQUN4UCxNQUFNLENBQUMsQ0FBQTtFQUNwQyxJQUFJQyxHQUFHLEVBQUVKLENBQUMsQ0FBQTtBQUNWLEVBQUEsS0FBS0EsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHdVUsVUFBVSxDQUFDclUsTUFBTSxFQUFFRixDQUFDLEVBQUUsRUFBRTtBQUN0Q0ksSUFBQUEsR0FBRyxHQUFHbVUsVUFBVSxDQUFDdlUsQ0FBQyxDQUFDLENBQUE7SUFDbkIsSUFBSXNVLFFBQVEsQ0FBQzlVLE9BQU8sQ0FBQ1ksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQUE7QUFDaENMLElBQUFBLE1BQU0sQ0FBQ0ssR0FBRyxDQUFDLEdBQUdELE1BQU0sQ0FBQ0MsR0FBRyxDQUFDLENBQUE7QUFDM0IsR0FBQTtBQUNBLEVBQUEsT0FBT0wsTUFBTSxDQUFBO0FBQ2Y7O0FDRk8sU0FBU3lVLFNBQVNBLENBQUNsUCxLQUFxQixFQUFFO0FBQy9DO0FBQ0EsRUFBQSxJQUFNbVAsU0FBUyxHQUFHVCxZQUFNLENBQXdCLElBQUksQ0FBQyxDQUFBO0FBQ3JELEVBQUEsSUFBTVUsT0FBTyxHQUFHVixZQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7QUFFN0IsRUFBQSxJQUFRVyxPQUFPLEdBQTBCclAsS0FBSyxDQUF0Q3FQLE9BQU87SUFBRUMsUUFBUSxHQUFnQnRQLEtBQUssQ0FBN0JzUCxRQUFRO0lBQUVDLFNBQVMsR0FBS3ZQLEtBQUssQ0FBbkJ1UCxTQUFTLENBQUE7QUFFcENYLEVBQUFBLHFCQUFlLENBQUMsWUFBTTtBQUNwQjtBQUNBLElBQUEsSUFBSSxDQUFDUSxPQUFPLENBQUNwVCxPQUFPLEVBQUU7TUFDcEJvVCxPQUFPLENBQUNwVCxPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ3RCLE1BQUEsSUFBSXFULE9BQU8sRUFBRTtBQUNYQSxRQUFBQSxPQUFPLEVBQUUsQ0FBQTtBQUNYLE9BQUE7QUFDRixLQUFDLE1BQU07QUFDTDtBQUNBLE1BQUEsSUFBSUMsUUFBUSxFQUFFO0FBQ1pILFFBQUFBLFNBQVMsQ0FBQ25ULE9BQU8sR0FBR3NULFFBQVEsQ0FBQ0gsU0FBUyxDQUFDblQsT0FBTyxDQUFDLEdBQUdzVCxRQUFRLEVBQUUsQ0FBQTtBQUM5RCxPQUFBO0FBQ0YsS0FBQTtJQUNBSCxTQUFTLENBQUNuVCxPQUFPLEdBQUdnRSxLQUFLLENBQUE7QUFDM0IsR0FBQyxDQUFDLENBQUE7O0FBRUY7QUFDQTRPLEVBQUFBLHFCQUFlLENBQUMsWUFBTTtBQUNwQixJQUFBLE9BQU8sWUFBTTtBQUNYLE1BQUEsSUFBSVcsU0FBUyxFQUFFO0FBQ2JBLFFBQUFBLFNBQVMsRUFBRSxDQUFBO0FBQ2IsT0FBQTtLQUNELENBQUE7R0FDRixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBRU4sRUFBQSxPQUFPLElBQUksQ0FBQTtBQUNiOzs7QUN0QkEsU0FBU0MsUUFBUUEsQ0FBMEJ4UCxLQUFRLEVBQUU7QUFDbkQsRUFBQSxJQUFRL0QsRUFBRSxHQUE2QitELEtBQUssQ0FBcEMvRCxFQUFFO0lBQUF3VCxXQUFBLEdBQTZCelAsS0FBSyxDQUFoQzlCLElBQUk7QUFBSkEsSUFBQUEsSUFBSSxHQUFBdVIsV0FBQSxLQUFHLEtBQUEsQ0FBQSxHQUFBLEtBQUssR0FBQUEsV0FBQTtJQUFFL0IsUUFBUSxHQUFLMU4sS0FBSyxDQUFsQjBOLFFBQVEsQ0FBQTtBQUVsQyxFQUFBLElBQU1sRyxPQUFPLEdBQUc2RixnQkFBVSxDQUFDMUYsYUFBYSxDQUFDLENBQUE7QUFDekMsRUFBQSxJQUFRN04sT0FBTyxHQUFLME4sT0FBTyxDQUFuQjFOLE9BQU8sQ0FBQTtBQUVmLEVBQUEsSUFBTTRWLFlBQVksR0FBRyxZQUF5QjtBQUM1QyxJQUFBLElBQUloQyxRQUFRLEVBQUU7QUFDWixNQUFBLElBQUksT0FBT3pSLEVBQUUsS0FBSyxRQUFRLEVBQUU7QUFDMUIsUUFBQSxJQUFNNlEsTUFBTSxHQUFHOUMsZ0JBQWdCLENBQUMvTixFQUFFLENBQUMsQ0FBQTtRQUNuQyxJQUFNeEIsTUFBTSxHQUFHcVMsTUFBTSxDQUFDUixPQUFPLENBQUNvQixRQUFRLENBQUNoQyxNQUFNLENBQUMsQ0FBQTtRQUM5QyxPQUFPalEsU0FBUyxDQUFDaEIsTUFBTSxDQUFDLENBQUE7QUFDMUIsT0FBQyxNQUFNO0FBQ0wsUUFBQSxJQUFNYyxRQUFRLEdBQUdVLEVBQUUsQ0FBQ1YsUUFBUSxHQUFHbUIsWUFBWSxDQUFDVCxFQUFFLENBQUNWLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtBQUM5RCxRQUFBLElBQU11UixPQUFNLEdBQUc5QyxnQkFBZ0IsQ0FBQ3pPLFFBQVEsQ0FBQyxDQUFBO1FBQ3pDLElBQU1kLE9BQU0sR0FBR3FTLE9BQU0sQ0FBQ1IsT0FBTyxDQUFDb0IsUUFBUSxDQUFDaEMsTUFBTSxDQUFDLENBQUE7UUFDOUMsT0FBQXJSLFFBQUEsS0FBWTRCLEVBQUUsRUFBQTtBQUFFVixVQUFBQSxRQUFRLEVBQUVkLE9BQUFBO0FBQU0sU0FBQSxDQUFBLENBQUE7QUFDbEMsT0FBQTtBQUNGLEtBQUE7SUFDQSxPQUFPLE9BQU93QixFQUFFLEtBQUssUUFBUSxHQUFHUixTQUFTLENBQUNRLEVBQUUsQ0FBQyxHQUFHQSxFQUFFLENBQUE7R0FDbkQsQ0FBQTtFQUVELElBQU0wVCxRQUFRLEdBQUd6UixJQUFJLEdBQUdwRSxPQUFPLENBQUNvRSxJQUFJLEdBQUdwRSxPQUFPLENBQUN3RSxPQUFPLENBQUE7QUFDdEQsRUFBQSxJQUFBc1IsYUFBQSxHQUEyQkYsWUFBWSxFQUFFO0lBQWpDeFQsS0FBSyxHQUFBMFQsYUFBQSxDQUFMMVQsS0FBSztBQUFLZCxJQUFBQSxJQUFJLEdBQUEyVCw2QkFBQSxDQUFBYSxhQUFBLEVBQUFDLFdBQUEsQ0FBQSxDQUFBO0FBRXRCLEVBQUEsSUFBTUMsV0FBVyxHQUFHLFlBQU07QUFDeEJILElBQUFBLFFBQVEsQ0FBQ3ZVLElBQUksRUFBRWMsS0FBSyxDQUFDLENBQUE7R0FDdEIsQ0FBQTtBQUVELEVBQUEsSUFBTTZULFlBQVksR0FBRyxVQUFDWixTQUEwQixFQUFLO0FBQ25EO0lBQ0EsSUFBTWEsUUFBUSxHQUFHYixTQUFTLEtBQUEsSUFBQSxJQUFUQSxTQUFTLEtBQVRBLEtBQUFBLENBQUFBLEdBQUFBLEtBQUFBLENBQUFBLEdBQUFBLFNBQVMsQ0FBRWMsSUFBZ0IsQ0FBQTtBQUM1QyxJQUFBLElBQUksQ0FBQzFULGVBQWUsQ0FBQ3lULFFBQVEsRUFBRTVVLElBQUksQ0FBQyxFQUFFO0FBQ3BDdVUsTUFBQUEsUUFBUSxDQUFDdlUsSUFBSSxFQUFFYyxLQUFLLENBQUMsQ0FBQTtBQUN2QixLQUFBO0dBQ0QsQ0FBQTtBQUVELEVBQUEsb0JBQU9nUyxnQkFBQSxDQUFBMVUsYUFBQSxDQUFDMFYsU0FBUyxFQUFBO0FBQUNHLElBQUFBLE9BQU8sRUFBRVMsV0FBWTtBQUFDUixJQUFBQSxRQUFRLEVBQUVTLFlBQWE7QUFBQ0UsSUFBQUEsSUFBSSxFQUFFN1UsSUFBQUE7QUFBSyxHQUFFLENBQUMsQ0FBQTtBQUNoRjs7QUM1Q0EsU0FBUzhVLE1BQU1BLENBQXdCbFEsS0FBUSxFQUE2QjtBQUMxRSxFQUFBLElBQU13SCxPQUFPLEdBQUc2RixnQkFBVSxDQUFDMUYsYUFBYSxDQUFDLENBQUE7RUFDekMsSUFBTXJMLFFBQVEsR0FBRzBELEtBQUssQ0FBQzFELFFBQVEsSUFBSWtMLE9BQU8sQ0FBQ2xMLFFBQVEsQ0FBQTtFQUVuRCxJQUFJNlQsT0FBa0MsR0FBRyxJQUFJLENBQUE7RUFDN0MsSUFBSTNFLEtBQXFCLEdBQUcsSUFBSSxDQUFBOztBQUVoQztFQUNBd0MsY0FBUSxDQUFDb0MsT0FBTyxDQUFDcFEsS0FBSyxDQUFDMk4sUUFBUSxFQUFFLFVBQUEwQyxJQUFJLEVBQUk7SUFDdkMsSUFBSTdFLEtBQUssS0FBSyxJQUFJLElBQUk4RSxvQkFBYyxDQUFDRCxJQUFJLENBQUMsRUFBRTtBQUMxQ0YsTUFBQUEsT0FBTyxHQUFHRSxJQUFJLENBQUE7QUFFZCxNQUFBLElBQUlFLE1BQTJCLENBQUE7QUFDL0IsTUFBQSxJQUFJQyxTQUE4QixDQUFBO0FBQ2xDLE1BQUEsSUFBSXBWLElBQW1DLENBQUE7QUFDdkMsTUFBQSxJQUFJeVEsSUFBd0IsQ0FBQTs7QUFFNUI7QUFDQSxNQUFBLElBQUl3RSxJQUFJLENBQUNySCxJQUFJLEtBQUt5RSxLQUFLLEVBQUU7QUFDdkIsUUFBQSxJQUFNek4sTUFBSyxHQUFHcVEsSUFBSSxDQUFDclEsS0FBbUIsQ0FBQTtRQUN0Q3VRLE1BQU0sR0FBR3ZRLE1BQUssQ0FBQ3VRLE1BQU0sQ0FBQTtRQUNyQkMsU0FBUyxHQUFHeFEsTUFBSyxDQUFDd1EsU0FBUyxDQUFBO1FBQzNCcFYsSUFBSSxHQUFHNEUsTUFBSyxDQUFDNUUsSUFBSSxDQUFBO0FBQ25CLE9BQUMsTUFBTSxJQUFJaVYsSUFBSSxDQUFDckgsSUFBSSxLQUFLd0csUUFBUSxFQUFFO0FBQ2pDLFFBQUEsSUFBTXhQLE9BQUssR0FBR3FRLElBQUksQ0FBQ3JRLEtBQXNCLENBQUE7UUFDekM1RSxJQUFJLEdBQUc0RSxPQUFLLENBQUM1RSxJQUFJLENBQUE7UUFDakJtVixNQUFNLEdBQUd2USxPQUFLLENBQUN1USxNQUFNLENBQUE7UUFDckIxRSxJQUFJLEdBQUc3TCxPQUFLLENBQUM2TCxJQUFJLENBQUE7QUFDbkIsT0FBQTtBQUVBLE1BQUEsSUFBTWpDLEtBQUssR0FBR3lHLElBQUksQ0FBQ3JRLEtBQUssQ0FBQzRKLEtBQUssQ0FBQTtBQUM5QixNQUFBLElBQU1uUCxNQUFNLEdBQUdXLElBQUksSUFBSXlRLElBQUksQ0FBQTs7QUFFM0I7QUFDQSxNQUFBLElBQUlwUixNQUFNLEVBQUU7UUFDVitRLEtBQUssR0FBR2lCLFNBQVMsQ0FBQ25RLFFBQVEsQ0FBQ2YsUUFBUSxFQUFFZCxNQUFNLEVBQUU7QUFDM0NrUCxVQUFBQSxVQUFVLEVBQUU0RyxNQUFNO0FBQ2xCN0csVUFBQUEsYUFBYSxFQUFFOEcsU0FBUztBQUN4QjVHLFVBQUFBLEtBQUssRUFBRUEsS0FBQUE7QUFDVCxTQUFDLENBQUMsQ0FBQTtBQUNKLE9BQUMsTUFBTTtRQUNMNEIsS0FBSyxHQUFHaEUsT0FBTyxDQUFDZ0UsS0FBSyxDQUFBO0FBQ3ZCLE9BQUE7QUFDRixLQUFBO0FBQ0YsR0FBQyxDQUFDLENBQUE7RUFFRixJQUFJQSxLQUFLLElBQUkyRSxPQUFPLEVBQUU7QUFDcEI7SUFDQSxPQUFPTSxrQkFBWSxDQUFDTixPQUFPLEVBQUU7QUFBRTdULE1BQUFBLFFBQVEsRUFBRUEsUUFBUTtBQUFFb1IsTUFBQUEsUUFBUSxFQUFFbEMsS0FBQUE7QUFBTSxLQUFDLENBQUMsQ0FBQTtBQUN2RSxHQUFBO0FBQ0EsRUFBQSxPQUFPLElBQUksQ0FBQTtBQUNiOztBQ3JEQSxTQUFTa0YsTUFBTUEsQ0FBd0IxUSxLQUFRLEVBQUU7QUFDL0MsRUFBQSxJQUFNd0gsT0FBTyxHQUFHNkYsZ0JBQVUsQ0FBQzFGLGFBQWEsQ0FBQyxDQUFBO0FBRXpDLEVBQUEsSUFBUWpPLE9BQU8sR0FBa0JzRyxLQUFLLENBQTlCdEcsT0FBTztJQUFBaVgsV0FBQSxHQUFrQjNRLEtBQUssQ0FBckI0USxJQUFJO0FBQUpBLElBQUFBLElBQUksR0FBQUQsV0FBQSxLQUFHLEtBQUEsQ0FBQSxHQUFBLElBQUksR0FBQUEsV0FBQSxDQUFBO0FBRTVCLEVBQUEsSUFBSyxPQUFPQyxJQUFJLEtBQUssVUFBVSxJQUFJQSxJQUFJLENBQUNwSixPQUFPLENBQUNsTCxRQUFRLENBQUMsS0FBSyxLQUFLLElBQUssQ0FBQ3NVLElBQUksRUFBRTtBQUM3RSxJQUFBLE9BQU8sSUFBSSxDQUFBO0FBQ2IsR0FBQTtBQUVBLEVBQUEsSUFBTWpCLFFBQVEsR0FBR25JLE9BQU8sQ0FBQzFOLE9BQU8sQ0FBQ3NKLEtBQUssQ0FBQTtFQUV0QyxJQUFJeU4sT0FBNEIsR0FBRyxJQUFJLENBQUE7QUFFdkMsRUFBQSxJQUFNZixXQUFXLEdBQUcsWUFBTTtJQUN4QmUsT0FBTyxHQUFHblgsT0FBTyxHQUFHaVcsUUFBUSxDQUFDalcsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFBO0dBQzdDLENBQUE7QUFFRCxFQUFBLElBQU1xVyxZQUFZLEdBQUcsVUFBQ1osU0FBMEIsRUFBSztBQUNuRCxJQUFBLElBQUlBLFNBQVMsSUFBSUEsU0FBUyxDQUFDYyxJQUFJLEtBQUt2VyxPQUFPLEVBQUU7QUFDM0MsTUFBQSxJQUFJbVgsT0FBTyxFQUFFO0FBQ1hBLFFBQUFBLE9BQU8sRUFBRSxDQUFBO0FBQ1gsT0FBQTtNQUNBQSxPQUFPLEdBQUduWCxPQUFPLEdBQUdpVyxRQUFRLENBQUNqVyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDOUMsS0FBQTtHQUNELENBQUE7QUFFRCxFQUFBLElBQU1vWCxhQUFhLEdBQUcsWUFBTTtBQUMxQixJQUFBLElBQUlELE9BQU8sRUFBRTtBQUNYQSxNQUFBQSxPQUFPLEVBQUUsQ0FBQTtBQUNYLEtBQUE7QUFDQUEsSUFBQUEsT0FBTyxHQUFHLElBQUksQ0FBQTtHQUNmLENBQUE7QUFFRCxFQUFBLG9CQUFPM0MsZ0JBQUEsQ0FBQTFVLGFBQUEsQ0FBQzBWLFNBQVMsRUFBQTtBQUFDRyxJQUFBQSxPQUFPLEVBQUVTLFdBQVk7QUFBQ1IsSUFBQUEsUUFBUSxFQUFFUyxZQUFhO0FBQUNSLElBQUFBLFNBQVMsRUFBRXVCLGFBQWM7QUFBQ2IsSUFBQUEsSUFBSSxFQUFFdlcsT0FBQUE7QUFBUSxHQUFFLENBQUMsQ0FBQTtBQUM3Rzs7QUMxQ0EsU0FBU3FYLFVBQVVBLENBQWdDQyxTQUFZLEVBQUU7RUFFL0QsU0FBU0MsdUJBQXVCQSxDQUFDalIsS0FBVSxFQUFFO0FBQzNDLElBQUEsSUFBQWtSLFdBQUEsR0FBcUM3RCxnQkFBVSxDQUFDMUYsYUFBYSxDQUFDO01BQXREN04sT0FBTyxHQUFBb1gsV0FBQSxDQUFQcFgsT0FBTztNQUFFd0MsUUFBUSxHQUFBNFUsV0FBQSxDQUFSNVUsUUFBUTtNQUFFa1AsS0FBSyxHQUFBMEYsV0FBQSxDQUFMMUYsS0FBSyxDQUFBO0FBQ2hDLElBQUEsSUFBTTJGLFVBQVUsR0FBRztBQUFFclgsTUFBQUEsT0FBTyxFQUFFQSxPQUFPO0FBQUV3QyxNQUFBQSxRQUFRLEVBQUVBLFFBQVE7QUFBRWtQLE1BQUFBLEtBQUssRUFBRUEsS0FBQUE7S0FBTyxDQUFBO0FBRXpFLElBQUEsb0JBQU8wQyxnQkFBQSxDQUFBMVUsYUFBQSxDQUFDd1gsU0FBUyxFQUFBM1csUUFBQSxDQUFBLEVBQUEsRUFBSzJGLEtBQUssRUFBTW1SLFVBQVUsQ0FBRyxDQUFDLENBQUE7QUFDakQsR0FBQTtBQUVBLEVBQUEsT0FBT0YsdUJBQXVCLENBQUE7QUFDaEM7O0FDSEEsU0FBU0csVUFBVUEsQ0FBcUNwUixLQUFRLEVBQUU7QUFDaEUsRUFBQSxJQUFJcVIsVUFBVSxHQUFHM0MsWUFBTSxFQUFXLENBQUE7RUFDbEMsSUFBSTJDLFVBQVUsQ0FBQ3JWLE9BQU8sS0FBSyxJQUFJLElBQUlxVixVQUFVLENBQUNyVixPQUFPLEtBQUt5RCxTQUFTLEVBQUU7QUFDbkU0UixJQUFBQSxVQUFVLENBQUNyVixPQUFPLEdBQUdtSyxpQkFBaUIsQ0FBQztNQUNyQ2xDLFFBQVEsRUFBRWpFLEtBQUssQ0FBQ2lFLFFBQVE7TUFDeEJELG1CQUFtQixFQUFFaEUsS0FBSyxDQUFDZ0UsbUJBQW1CO01BQzlDc0MsUUFBUSxFQUFFdEcsS0FBSyxDQUFDc0csUUFBQUE7QUFDbEIsS0FBQyxDQUFDLENBQUE7QUFDSixHQUFBO0FBRUEsRUFBQSxvQkFBTzRILGdCQUFBLENBQUExVSxhQUFBLENBQUM0VSxNQUFNLEVBQUE7SUFBQ3RVLE9BQU8sRUFBRXVYLFVBQVUsQ0FBQ3JWLE9BQUFBO0dBQVVnRSxFQUFBQSxLQUFLLENBQUMyTixRQUFpQixDQUFDLENBQUE7QUFDdkU7O0FDTkEsU0FBUzJELGFBQWFBLENBQXdDdFIsS0FBUSxFQUFFO0FBQ3RFO0FBQ0EsRUFBQSxJQUFJcVIsVUFBVSxHQUFHM0MsWUFBTSxFQUFXLENBQUE7RUFFbEMsSUFBSTJDLFVBQVUsQ0FBQ3JWLE9BQU8sS0FBSyxJQUFJLElBQUlxVixVQUFVLENBQUNyVixPQUFPLEtBQUt5RCxTQUFTLEVBQUU7QUFDbkU0UixJQUFBQSxVQUFVLENBQUNyVixPQUFPLEdBQUd5SCxvQkFBb0IsQ0FBQztNQUN4Q1EsUUFBUSxFQUFFakUsS0FBSyxDQUFDaUUsUUFBUTtNQUN4QkgsWUFBWSxFQUFFOUQsS0FBSyxDQUFDOEQsWUFBWTtNQUNoQ0UsbUJBQW1CLEVBQUVoRSxLQUFLLENBQUNnRSxtQkFBQUE7QUFDN0IsS0FBQyxDQUFDLENBQUE7QUFDSixHQUFBO0FBRUEsRUFBQSxvQkFBT2tLLGdCQUFBLENBQUExVSxhQUFBLENBQUM0VSxNQUFNLEVBQUE7SUFBQ3RVLE9BQU8sRUFBRXVYLFVBQVUsQ0FBQ3JWLE9BQUFBO0dBQVVnRSxFQUFBQSxLQUFLLENBQUMyTixRQUFpQixDQUFDLENBQUE7QUFDdkU7OztBQ1ZBLElBQU00RCxlQUFlLEdBQUcsVUFBQ25NLEtBQXVCLEVBQUs7QUFDbkQsRUFBQSxPQUFPQSxLQUFLLENBQUNvTSxPQUFPLElBQUlwTSxLQUFLLENBQUNxTSxNQUFNLElBQUlyTSxLQUFLLENBQUNzTSxPQUFPLElBQUl0TSxLQUFLLENBQUN1TSxRQUFRLENBQUE7QUFDekUsQ0FBQyxDQUFBO0FBRUQsSUFBTUMsV0FBVyxHQUFHLFVBQUNuWCxNQUF3QyxFQUFLO0FBQ2hFLEVBQUEsT0FBTyxDQUFDQSxNQUFNLElBQUlBLE1BQU0sS0FBSyxPQUFPLENBQUE7QUFDdEMsQ0FBQyxDQUFBO0FBR0QsU0FBU29YLElBQUlBLENBQXNCN1IsS0FBUSxFQUFFO0FBQzNDLEVBQUEsSUFBUS9ELEVBQUUsR0FBb0QrRCxLQUFLLENBQTNEL0QsRUFBRSxDQUFBO0lBQUVxQyxPQUFPLEdBQTJDMEIsS0FBSyxDQUF2RDFCLE9BQU8sQ0FBQTtJQUEyQzBCLEtBQUssQ0FBOUM0TixTQUFTLENBQUE7UUFBRWtFLE9BQU8sR0FBdUI5UixLQUFLLENBQW5DOFIsT0FBTyxDQUFBO0lBQUVyWCxNQUFNLEdBQWV1RixLQUFLLENBQTFCdkYsTUFBTSxDQUFBO0FBQUtzWCxJQUFBQSxLQUFLLEdBQUFoRCw2QkFBQSxDQUFLL08sS0FBSyxFQUFBNlAsV0FBQSxFQUFBO0FBRW5FLEVBQUEsSUFBTWpKLEdBQUcsR0FBRzVHLEtBQUssQ0FBQzRHLEdBQUcsSUFBSSxHQUFHLENBQUE7QUFFNUIsRUFBQSxJQUFNWSxPQUFPLEdBQUc2RixnQkFBVSxDQUFDMUYsYUFBYSxDQUFDLENBQUE7QUFDekMsRUFBQSxJQUFNN04sT0FBTyxHQUFHME4sT0FBTyxDQUFDMU4sT0FBTyxDQUFBO0FBRS9CLEVBQUEsSUFBSXdDLFFBQVEsR0FBRyxPQUFPTCxFQUFFLEtBQUssVUFBVSxHQUFHQSxFQUFFLENBQUN1TCxPQUFPLENBQUNsTCxRQUFRLENBQUMsR0FBR0wsRUFBRSxDQUFBO0FBRW5FLEVBQUEsSUFBSUMsS0FBVSxDQUFBO0FBQ2QsRUFBQSxJQUFJZCxJQUFtQixDQUFBO0FBQ3ZCLEVBQUEsSUFBSSxPQUFPa0IsUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUNoQ2xCLElBQUFBLElBQUksR0FBR0ssU0FBUyxDQUFDYSxRQUFRLENBQUMsQ0FBQTtBQUM1QixHQUFDLE1BQU07QUFDTCxJQUFBLElBQVFmLFFBQVEsR0FBbUJlLFFBQVEsQ0FBbkNmLFFBQVE7TUFBRUQsSUFBSSxHQUFhZ0IsUUFBUSxDQUF6QmhCLElBQUk7TUFBRUQsTUFBTSxHQUFLaUIsUUFBUSxDQUFuQmpCLE1BQU0sQ0FBQTtBQUM5QkQsSUFBQUEsSUFBSSxHQUFHO0FBQUVHLE1BQUFBLFFBQVEsRUFBUkEsUUFBUTtBQUFFRCxNQUFBQSxJQUFJLEVBQUpBLElBQUk7QUFBRUQsTUFBQUEsTUFBTSxFQUFOQSxNQUFBQTtLQUFRLENBQUE7SUFDakNhLEtBQUssR0FBR0ksUUFBUSxDQUFDSixLQUFLLENBQUE7QUFDeEIsR0FBQTtBQUNBLEVBQUEsSUFBTTJKLElBQUksR0FBRy9MLE9BQU8sQ0FBQzJLLFVBQVUsQ0FBQ3JKLElBQUksQ0FBQyxDQUFBO0FBRXJDLEVBQUEsSUFBTTRXLGNBQWMsR0FBRyxVQUFDNU0sS0FBMEMsRUFBSztJQUNyRSxJQUFJO0FBQ0YsTUFBQSxJQUFJME0sT0FBTyxFQUFFO1FBQ1hBLE9BQU8sQ0FBQzFNLEtBQUssQ0FBQyxDQUFBO0FBQ2hCLE9BQUE7S0FDRCxDQUFDLE9BQU9wRCxDQUFDLEVBQUU7TUFDVm9ELEtBQUssQ0FBQzZNLGNBQWMsRUFBRSxDQUFBO0FBQ3RCLE1BQUEsTUFBTWpRLENBQUMsQ0FBQTtBQUNULEtBQUE7SUFFQSxJQUFJLENBQUNvRCxLQUFLLENBQUM4TSxnQkFBZ0IsSUFBSTlNLEtBQUssQ0FBQytNLE1BQU0sS0FBSyxDQUFDLElBQUlQLFdBQVcsQ0FBQ25YLE1BQU0sQ0FBQyxJQUFJLENBQUM4VyxlQUFlLENBQUNuTSxLQUFLLENBQUMsRUFBRTtBQUNuRztBQUNBLE1BQUEsSUFBTWdOLFVBQVUsR0FBR2pYLFVBQVUsQ0FBQ3FNLE9BQU8sQ0FBQ2xMLFFBQVEsQ0FBQyxLQUFLbkIsVUFBVSxDQUFDQyxJQUFJLENBQUMsQ0FBQTtBQUNwRSxNQUFBLElBQU11VSxRQUFRLEdBQUdyUixPQUFPLElBQUk4VCxVQUFVLEdBQUd0WSxPQUFPLENBQUN3RSxPQUFPLEdBQUd4RSxPQUFPLENBQUNvRSxJQUFJLENBQUE7TUFDdkVrSCxLQUFLLENBQUM2TSxjQUFjLEVBQUUsQ0FBQTtBQUN0QnRDLE1BQUFBLFFBQVEsQ0FBQ3ZVLElBQUksRUFBRWMsS0FBSyxDQUFDLENBQUE7QUFDdkIsS0FBQTtHQUNELENBQUE7RUFFRCxJQUFNbVcsU0FBUyxHQUFBaFksUUFBQSxDQUFBO0FBQUt3TCxJQUFBQSxJQUFJLEVBQUVBLElBQUk7QUFBRWlNLElBQUFBLE9BQU8sRUFBRUUsY0FBQUE7QUFBYyxHQUFBLEVBQUtELEtBQUssQ0FBRSxDQUFBO0FBQ25FLEVBQUEsT0FBTzdELGdCQUFLLENBQUMxVSxhQUFhLENBQUNvTixHQUFHLEVBQUV5TCxTQUFTLENBQUMsQ0FBQTtBQUM1Qzs7O0FDbkRBLFNBQVNDLE9BQU9BLENBQXlCdFMsS0FBUSxFQUFFO0FBQ2pELEVBQUEsSUFBUS9ELEVBQUUsR0FBd0IrRCxLQUFLLENBQS9CL0QsRUFBRTtJQUFFa0YsUUFBUSxHQUFjbkIsS0FBSyxDQUEzQm1CLFFBQVE7QUFBS29SLElBQUFBLElBQUksR0FBQXhELDZCQUFBLENBQUsvTyxLQUFLLEVBQUE2UCxTQUFBLENBQUEsQ0FBQTtBQUN2QyxFQUFBLElBQU1ySSxPQUFPLEdBQUc2RixnQkFBVSxDQUFDbUYsYUFBTyxDQUFDLENBQUE7QUFFbkMsRUFBQSxJQUFNQyxVQUFVLEdBQUcsT0FBT3hXLEVBQUUsS0FBSyxVQUFVLEdBQUdBLEVBQUUsQ0FBQ3VMLE9BQU8sQ0FBQ2xMLFFBQVEsQ0FBQyxHQUFHTCxFQUFFLENBQUE7QUFFdkUsRUFBQSxJQUFBNEksSUFBQSxHQUEyQixPQUFPNE4sVUFBVSxLQUFLLFFBQVEsR0FBR2hYLFNBQVMsQ0FBQ2dYLFVBQVUsQ0FBQyxHQUFHQSxVQUFVO0lBQTVFclgsSUFBSSxHQUFBeUosSUFBQSxDQUFkdEosUUFBUSxDQUFBO0FBQ2hCO0VBQ0EsSUFBTW1YLFdBQVcsR0FBR3RYLElBQUksR0FBR2dOLFNBQVMsQ0FBQ2hOLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUMvQyxFQUFBLElBQU1vUSxLQUFLLEdBQUdrSCxXQUFXLEdBQUdqRyxTQUFTLENBQUNqRixPQUFPLENBQUNsTCxRQUFRLENBQUNmLFFBQVEsRUFBRW1YLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUVwRixFQUFBLElBQU1DLFlBQVksR0FBR25ILEtBQUssSUFBSXJLLFFBQVEsR0FBR0EsUUFBUSxDQUFDcUssS0FBSyxFQUFFaEUsT0FBTyxDQUFDbEwsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFBO0VBRWxGLElBQU1zVyxJQUFVLEdBQUcsTUFBTSxDQUFBO0VBQ3pCLElBQU1DLFVBQVUsR0FBQXhZLFFBQUEsQ0FBQTtBQUNkLElBQUEsY0FBYyxFQUFFc1ksWUFBWSxHQUFHQyxJQUFJLEdBQUcsS0FBQTtBQUFLLEdBQUEsRUFDeENMLElBQUksQ0FDUixDQUFBO0FBRUQsRUFBQSxvQkFBT3JFLGdCQUFBLENBQUExVSxhQUFBLENBQUNxWSxJQUFJLEVBQUF4WCxRQUFBLENBQUE7QUFBQzRCLElBQUFBLEVBQUUsRUFBRUEsRUFBQUE7R0FBUTRXLEVBQUFBLFVBQVUsQ0FBRyxDQUFDLENBQUE7QUFDekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
