(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@cloudsop/horizon'), require('react-redux'), require('@cloudsop/horizon/jsx-runtime')) :
  typeof define === 'function' && define.amd ? define(['exports', '@cloudsop/horizon', 'react-redux', '@cloudsop/horizon/jsx-runtime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.HorizonRouter = {}, global.Inula, global.reactRedux, global.jsxRuntime));
})(this, (function (exports, Inula, reactRedux, jsxRuntime) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Inula__default = /*#__PURE__*/_interopDefaultLegacy(Inula);

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
    ActionName["LOCATION_CHANGE"] = "$inula-router/LOCATION_CHANGE";
    ActionName["CALL_HISTORY_METHOD"] = "$inula-router/CALL_HISTORY_METHOD";
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
  var updateLocation = function (method) {
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return {
        type: ActionName.CALL_HISTORY_METHOD,
        payload: {
          method: method,
          args: args
        }
      };
    };
  };
  var push = updateLocation('push');
  var replace = updateLocation('replace');
  var go = updateLocation('go');

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
  var PopDirection = /*#__PURE__*/function (PopDirection) {
    PopDirection["back"] = "back";
    PopDirection["forward"] = "forward";
    PopDirection["unknown"] = "";
    return PopDirection;
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
    var pathname = url || '/';
    var parsedPath = {
      search: '',
      hash: ''
    };
    var hashIdx = url.indexOf('#');
    if (hashIdx > -1) {
      var hash = url.substring(hashIdx);
      parsedPath.hash = hash === '#' ? '' : hash;
      pathname = pathname.substring(0, hashIdx);
    }
    var searchIdx = url.indexOf('?');
    if (searchIdx > -1) {
      var search = url.substring(searchIdx);
      parsedPath.search = search === '?' ? '' : search;
      pathname = pathname.substring(0, searchIdx);
    }
    parsedPath.pathname = pathname;
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
      location.pathname = pathname ? pathname : '/';
    } else if (!location.pathname.startsWith('/')) {
      location.pathname = parseRelativePath(location.pathname, pathname);
    }
    if (location.search && location.search[0] !== '?') {
      location.search = '?' + location.search;
    }
    if (location.hash && location.hash[0] !== '#') {
      location.hash = '#' + location.hash;
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
    function getDelta(to, from) {
      var toIdx = visitedRecord.lastIndexOf(fn(to));
      if (toIdx === -1) {
        toIdx = 0;
      }
      var fromIdx = visitedRecord.lastIndexOf(fn(from));
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
  function parseRelativePath(to, from) {
    if (to.startsWith('/')) {
      return to;
    }
    var fromParts = from.split('/');
    var toParts = to.split('/');
    var lastToPart = toParts[toParts.length - 1];
    if (lastToPart === '..' || lastToPart === '.') {
      toParts.push('');
    }
    var index = fromParts.length - 1;
    var toIndex = 0;
    var urlPart;
    while (toIndex < toParts.length) {
      urlPart = toParts[toIndex];
      if (urlPart === '.') {
        continue;
      }
      if (urlPart === '..') {
        if (index > 1) {
          index--;
        }
        toIndex++;
      } else {
        break;
      }
    }
    return fromParts.slice(0, index).join('/') + '/' + toParts.slice(toIndex).join('/');
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }

  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : String(i);
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
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

  var TransitionManager = /*#__PURE__*/function () {
    function TransitionManager() {
      _classCallCheck(this, TransitionManager);
      this.prompt = void 0;
      this.prompt = null;
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

  function _createForOfIteratorHelper$1(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray$1(r)) || e && r && "number" == typeof r.length) { t && (r = t); var n = 0, F = function () {}; return { s: F, n: function () { return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] }; }, e: function (r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function () { t = t.call(r); }, n: function () { var r = t.next(); return a = r.done, r; }, e: function (r) { u = !0, o = r; }, f: function () { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
  function _unsupportedIterableToArray$1(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray$1(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0; } }
  function _arrayLikeToArray$1(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
  // 抽取BrowserHistory和HashHistory中相同的方法
  function getBaseHistory() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'browser';
    var transitionManager = arguments.length > 1 ? arguments[1] : undefined;
    var popActionListener = arguments.length > 2 ? arguments[2] : undefined;
    var listenerCount = 0;
    var supportPopState = isSupportsPopState();
    var listeners = [];
    var unListeners = [];
    var browserHistory = window.history;

    // 标记是否暂停触发type为pop类型的listener
    var pauseTrigger = false;
    function go(step) {
      var triggerListener = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (triggerListener) {
        pauseTrigger = true;
      }
      browserHistory.go(step);
    }
    function setupListener(count) {
      if (count === null) {
        listenerCount = 0;
      } else {
        listenerCount += count;
      }
      if (listenerCount === 1 && count === 1) {
        if (type === 'browser' && supportPopState) {
          addEventListener(EventType.PopState, popActionListener);
        } else {
          addEventListener(EventType.HashChange, popActionListener);
        }
      } else if (listenerCount === 0) {
        if (type === 'browser' && supportPopState) {
          removeEventListener(EventType.PopState, popActionListener);
        } else {
          removeEventListener(EventType.HashChange, popActionListener);
        }
      }
    }
    function addListener(listener) {
      var isActive = true;
      var wrapper = function (args) {
        if (isActive) {
          if (listener.type === 'common' && 'action' in args) {
            listener.listener(args);
          } else if (listener.type === 'pop' && 'to' in args) {
            listener.listener(args.to, args.from, args.information);
          }
        }
      };
      var trigger = {
        type: listener.type,
        trigger: wrapper
      };
      listeners.push(trigger);
      setupListener(1);
      var cancelListener = function () {
        isActive = false;
        setupListener(-1);
        listeners = listeners.filter(function (listener) {
          return listener !== trigger;
        });
      };
      unListeners.push(cancelListener);
      return cancelListener;
    }
    function destroy() {
      var _iterator = _createForOfIteratorHelper$1(unListeners),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var unListen = _step.value;
          unListen();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      unListeners.length = 0;
      setupListener(null);
    }
    var isBlocked = false;
    function block() {
      var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var unblock = transitionManager.setPrompt(prompt);
      if (!isBlocked) {
        setupListener(1);
        isBlocked = true;
      }
      return function () {
        if (isBlocked) {
          isBlocked = false;
          setupListener(-1);
        }
        unblock();
      };
    }
    function getUpdateStateFunc(historyProps) {
      return function (nextState) {
        var originPath = createPath(historyProps.location);
        if (nextState) {
          _extends(historyProps, nextState);
        }
        var delta = browserHistory.length - historyProps.length;
        historyProps.length = browserHistory.length;
        // 避免location引用相同时setState不触发
        var location = _extends({}, historyProps.location);
        var commonArgs = {
          location: location,
          action: historyProps.action
        };
        var popArgs = {
          to: createPath(location),
          from: originPath,
          information: {
            delta: delta,
            direction: delta > 0 ? PopDirection.forward : PopDirection.back,
            type: Action.pop
          }
        };
        for (var i = 0; i < listeners.length && !pauseTrigger; i++) {
          var listener = listeners[i];
          if (listener.type === 'common') {
            listener.trigger(commonArgs);
          } else if (listener.type === 'pop' && historyProps.action === Action.pop) {
            // vue history listener only trigger when action is pop
            listener.trigger(popArgs);
          }
        }
        pauseTrigger = false;
      };
    }
    return {
      go: go,
      addListener: addListener,
      block: block,
      destroy: destroy,
      getUpdateStateFunc: getUpdateStateFunc
    };
  }

  /**
   * @internal
   * @desc this override signature only for internal usage
   */

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
    var _getBaseHistory = getBaseHistory('browser', transitionManager, handlePop),
      go = _getBaseHistory.go,
      addListener = _getBaseHistory.addListener,
      block = _getBaseHistory.block,
      destroy = _getBaseHistory.destroy,
      getUpdateStateFunc = _getBaseHistory.getUpdateStateFunc;
    var listen = function (listener) {
      var trigger = {
        type: 'common',
        listener: listener
      };
      return addListener(trigger);
    };
    var history = {
      action: Action.pop,
      length: browserHistory.length,
      location: initLocation,
      go: go,
      goBack: function () {
        return go(-1);
      },
      goForward: function () {
        return go(-1);
      },
      listen: listen,
      addListener: addListener,
      block: block,
      push: push,
      replace: replace,
      destroy: destroy,
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
    var isEventPopState = function (event) {
      return event.type === EventType.PopState;
    };
    function handlePop(event) {
      var historyState = isSupportPopState && isEventPopState(event) ? event.state : getHistoryState();
      var handler = options.locationHandler ? options.locationHandler : getLocation;
      handlePopState(handler(historyState));
    }

    // 取消页面跳转并恢复到跳转前的页面
    function revertPopState(from, to) {
      var delta = recordOperator.getDelta(to, from);
      if (delta !== 0) {
        go(delta);
        forceJump = true;
      }
    }
    function createHref(path) {
      return (options.baseHandler ? options.baseHandler() : basename) + createPath(path);
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
    var startLocation = getHashContent(window.location.href);
    var encodedLocation = pathEncoder(startLocation);
    // 初始化hash格式不合法时会重定向
    if (startLocation !== encodedLocation) {
      window.location.replace(stripHash(window.location.href) + '#' + encodedLocation);
    }
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
    var listen = function (listener) {
      var trigger = {
        type: 'common',
        listener: listener
      };
      return addListener(trigger);
    };
    var _getBaseHistory = getBaseHistory('hash', transitionManager, handleHashChange),
      go = _getBaseHistory.go,
      addListener = _getBaseHistory.addListener,
      block = _getBaseHistory.block,
      destroy = _getBaseHistory.destroy,
      getUpdateStateFunc = _getBaseHistory.getUpdateStateFunc;
    var history = {
      action: Action.pop,
      length: browserHistory.length,
      location: initLocation,
      go: go,
      goBack: function () {
        return go(-1);
      },
      goForward: function () {
        return go(1);
      },
      push: push,
      replace: replace,
      listen: listen,
      addListener: addListener,
      block: block,
      destroy: destroy,
      createHref: createHref
    };
    var updateState = getUpdateStateFunc(history);
    function push(to, state) {
      warning(state !== undefined, 'Hash history does not support state, it will be ignored');
      var action = Action.push;
      var location = createLocation(history.location, to, state, '');
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
      var location = createLocation(history.location, to, state, '');
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
    function revertPopState(from) {
      var to = history.location;
      var delta = memRecords.getDelta(to, from);
      if (delta !== 0) {
        go(delta);
        forceNextPop = true;
      }
    }
    return history;
  }

  function createNamedContext(name, defaultValue) {
    var context = Inula.createContext(defaultValue);
    context.displayName = name;
    return context;
  }
  var RouterContext = createNamedContext('Router', {});

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

  var validChar = /[^/:()*?$^+]/;

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
      if (['*', '?', '$', '^', '+'].includes(curChar)) {
        tokens.push({
          type: TokenType.Pattern,
          value: curChar
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

  function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var n = 0, F = function () {}; return { s: F, n: function () { return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] }; }, e: function (r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function () { t = t.call(r); }, n: function () { var r = t.next(); return a = r.done, r; }, e: function (r) { u = !0, o = r; }, f: function () { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
  function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
  function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }

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
    caseSensitive: false,
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

  /**
   * URL匹配整体流程
   * 1.词法解析，将URL模板解析为Token
   * 2.使用Token生成正则表达式
   * 3.利用正则表达式解析URL中参数或填充URL模板
   */

  function createPathParser(pathname) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOption;
    var _option$caseSensitive = option.caseSensitive,
      caseSensitive = _option$caseSensitive === void 0 ? defaultOption.caseSensitive : _option$caseSensitive,
      _option$strictMode = option.strictMode,
      strictMode = _option$strictMode === void 0 ? defaultOption.strictMode : _option$strictMode,
      _option$exact = option.exact,
      exact = _option$exact === void 0 ? defaultOption.exact : _option$exact;
    var pattern = '^';
    var keys = [];
    var scores = [];
    var tokens = lexer(pathname);
    var onlyHasWildCard = tokens.length === 1 && tokens[0].type === TokenType.WildCard;
    var tokenCount = tokens.length;
    var lastToken = tokens[tokenCount - 1];
    var asteriskCount = 0;

    /**
     * 用于支持URL中的可选参数/:parma?
     * @description 向前扫描到下一个分隔符/，检查其中是否有?
     * @param currentIdx
     */
    var lookToNextDelimiter = function (currentIdx) {
      var hasOptionalParam = false;
      while (currentIdx < tokens.length && tokens[currentIdx].type !== TokenType.Delimiter) {
        if (tokens[currentIdx].value === '?' || tokens[currentIdx].value === '*') {
          hasOptionalParam = true;
        }
        currentIdx++;
      }
      return hasOptionalParam;
    };
    for (var tokenIdx = 0; tokenIdx < tokenCount; tokenIdx++) {
      var token = tokens[tokenIdx];
      var nextToken = tokens[tokenIdx + 1];
      switch (token.type) {
        case TokenType.Delimiter:
          {
            // 该分隔符后有可选参数则该分割符在匹配时是可选的
            var hasOptional = lookToNextDelimiter(tokenIdx + 1);
            // 该分隔符为最后一个且strictMode===false时，该分割符在匹配时是可选的
            var isSlashOptional = nextToken === undefined && !strictMode;
            pattern += "/" + (hasOptional || isSlashOptional ? '?' : '');
            break;
          }
        case TokenType.Static:
          pattern += token.value.replace(REGEX_CHARS_RE, '\\$&');
          if (nextToken && nextToken.type === TokenType.Pattern) {
            pattern += "(." + nextToken.value + ")";
            keys.push(String(asteriskCount));
            asteriskCount++;
          }
          scores.push(MatchScore.static);
          break;
        case TokenType.Param:
          {
            // 动态参数支持形如/:param、/:param*、/:param?、/:param(\\d+)的形式
            var paramRegexp = '';
            if (nextToken) {
              switch (nextToken.type) {
                case TokenType.LBracket:
                  // 跳过当前Token和左括号
                  tokenIdx += 2;
                  while (tokens[tokenIdx].type !== TokenType.RBracket) {
                    paramRegexp += tokens[tokenIdx].value;
                    tokenIdx++;
                  }
                  paramRegexp = "(" + paramRegexp + ")";
                  break;
                case TokenType.Pattern:
                  tokenIdx++;
                  paramRegexp += "(" + (nextToken.value === '*' ? '.*' : BASE_PARAM_PATTERN) + ")" + nextToken.value;
                  break;
              }
            }
            pattern += paramRegexp ? "(?:" + paramRegexp + ")" : "(" + BASE_PARAM_PATTERN + ")";
            keys.push(token.value);
            scores.push(MatchScore.param);
            break;
          }
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
          params[key] = param ? param : undefined;
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
              {
                var wildCard = params['*'];
                if (wildCard instanceof Array) {
                  path += wildCard.join('/');
                } else {
                  path += wildCard;
                }
                break;
              }
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
      regexp: regexp,
      keys: keys,
      score: scores,
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
    return Inula.useContext(RouterContext).history;
  }
  function useLocation() {
    return Inula.useContext(RouterContext).location;
  }
  function useParams() {
    var match = Inula.useContext(RouterContext).match;
    return match ? match.params : {};
  }
  function useRouteMatch(path) {
    var pathname = useLocation().pathname;
    var match = Inula.useContext(RouterContext).match;
    if (path) {
      return matchPath(pathname, path);
    }
    return match;
  }

  function Route(props) {
    var context = Inula.useContext(RouterContext);
    var computed = props.computed,
      location = props.location,
      path = props.path,
      component = props.component,
      render = props.render,
      strict = props.strict,
      sensitive = props.sensitive,
      exact = props.exact;
    var children = props.children;
    var match;
    var routeLocation = location || context.location;
    if (computed) {
      match = computed;
    } else if (path) {
      match = matchPath(routeLocation.pathname, path, {
        strictMode: strict,
        caseSensitive: sensitive,
        exact: exact
      });
    } else {
      match = context.match;
    }
    var newProps = _extends({}, context, {
      location: routeLocation,
      match: match
    });
    if (Array.isArray(children) && Inula.Children.count(children) === 0) {
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
          return Inula.createElement(component, newProps);
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
    return jsxRuntime.jsx(RouterContext.Provider, {
      value: newProps,
      children: getChildren()
    });
  }

  function Router(props) {
    var history = props.history,
      _props$children = props.children,
      children = _props$children === void 0 ? null : _props$children;
    var _useState = Inula.useState(props.history.location),
      location = _useState[0],
      setLocation = _useState[1];
    var pendingLocation = Inula.useRef(null);
    var unListen = Inula.useRef(null);
    var isMount = Inula.useRef(false);

    // 在Router加载时就监听history地址变化，以保证在始渲染时重定向能正确触发
    if (unListen.current === null) unListen.current = history.listen(function (arg) {
      pendingLocation.current = arg.location;
    });

    // 模拟componentDidMount和componentWillUnmount
    Inula.useLayoutEffect(function () {
      isMount.current = true;
      if (unListen.current) {
        unListen.current();
      }
      // 监听history中的位置变化
      unListen.current = history.listen(function (arg) {
        if (isMount.current) {
          setLocation(arg.location);
        }
      });
      if (pendingLocation.current) {
        setLocation(pendingLocation.current);
      }
      return function () {
        if (unListen.current) {
          isMount.current = false;
          unListen.current();
          unListen.current = null;
          pendingLocation.current = null;
        }
      };
    }, []);
    var initContextValue = Inula.useMemo(function () {
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
    return jsxRuntime.jsx(RouterContext.Provider, {
      value: initContextValue,
      children: children
    });
  }

  function Switch(props) {
    var context = Inula.useContext(RouterContext);
    var location = props.location || context.location;
    var element = null;
    var match = null;

    // 使用forEach不会给React.ReactNode增加key属性,防止重新渲染
    Inula.Children.forEach(props.children, function (node) {
      if (match === null && Inula.isValidElement(node)) {
        element = node;
        var elementProps = node.props;
        var target = elementProps.path || elementProps.from;

        // 更新匹配状态，一旦匹配到停止遍历
        if (target) {
          match = matchPath(location.pathname, target, {
            strictMode: elementProps.strict,
            caseSensitive: elementProps.sensitive,
            exact: elementProps.exact
          });
        } else {
          match = context.match;
        }
      }
    });
    if (match && element) {
      // 使用cloneElement复制已有组件并更新其Props
      return Inula.cloneElement(element, {
        location: location,
        computed: match
      });
    }
    return null;
  }

  function LifeCycle(props) {
    // 使用ref保存上一次的props，防止重新渲染
    var prevProps = Inula.useRef(null);
    var isMount = Inula.useRef(false);
    var onMount = props.onMount,
      onUpdate = props.onUpdate,
      onUnmount = props.onUnmount;
    Inula.useLayoutEffect(function () {
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
    Inula.useLayoutEffect(function () {
      return function () {
        if (onUnmount) {
          onUnmount();
        }
      };
    }, []);
    return null;
  }

  var _excluded$4 = ["state"];
  function Redirect(props) {
    var to = props.to,
      _props$push = props.push,
      push = _props$push === void 0 ? false : _props$push,
      computed = props.computed;
    var context = Inula.useContext(RouterContext);
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
      path = _objectWithoutPropertiesLoose(_calcLocation, _excluded$4);
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
    return jsxRuntime.jsx(LifeCycle, {
      onMount: onMountFunc,
      onUpdate: onUpdateFunc,
      data: path
    });
  }

  function Prompt(props) {
    var context = Inula.useContext(RouterContext);
    var message = props.message,
      _props$when = props.when,
      when = _props$when === void 0 ? true : _props$when;
    if (typeof when === 'function' && when(context.location) === false || !when) {
      return null;
    }
    var navigate = context.history.block;
    var release = Inula.useRef(null);
    var onMountFunc = function () {
      release.current = message ? navigate(message) : null;
    };
    var onUpdateFunc = function (prevProps) {
      if (prevProps && prevProps.data !== message) {
        if (release.current) {
          release.current();
        }
        release.current = message ? navigate(message) : null;
      }
    };
    var onUnmountFunc = function () {
      if (release.current) {
        release.current();
      }
      release.current = null;
    };
    return jsxRuntime.jsx(LifeCycle, {
      onMount: onMountFunc,
      onUpdate: onUpdateFunc,
      onUnmount: onUnmountFunc,
      data: message
    });
  }

  var _excluded$3 = ["wrappedComponentRef"];
  function withRouter(Component) {
    return function (props) {
      var wrappedComponentRef = props.wrappedComponentRef,
        rest = _objectWithoutPropertiesLoose(props, _excluded$3);
      var context = Inula.useContext(RouterContext);
      return jsxRuntime.jsx(Component, _extends({}, rest, context, {
        ref: wrappedComponentRef
      }));
    };
  }

  function HashRouter(props) {
    var historyRef = Inula.useRef();
    if (historyRef.current === null || historyRef.current === undefined) {
      historyRef.current = createHashHistory({
        basename: props.basename,
        getUserConfirmation: props.getUserConfirmation,
        hashType: props.hashType
      });
    }
    return jsxRuntime.jsx(Router, {
      history: historyRef.current,
      children: props.children
    });
  }

  function BrowserRouter(props) {
    // 使用Ref持有History对象，防止重复渲染
    var historyRef = Inula.useRef();
    if (historyRef.current === null || historyRef.current === undefined) {
      historyRef.current = createBrowserHistory({
        basename: props.basename,
        forceRefresh: props.forceRefresh,
        getUserConfirmation: props.getUserConfirmation
      });
    }
    return jsxRuntime.jsx(Router, {
      history: historyRef.current,
      children: props.children
    });
  }

  var _excluded$2 = ["to", "replace", "component", "onClick", "target"];
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
      other = _objectWithoutPropertiesLoose(props, _excluded$2);
    var tag = props.tag || 'a';
    var context = Inula.useContext(RouterContext);
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
    return Inula__default["default"].createElement(tag, linkProps);
  }

  var _excluded$1 = ["to", "isActive", "exact", "strict", "sensitive", "className", "activeClassName"];
  function NavLink(props) {
    var to = props.to,
      isActive = props.isActive,
      exact = props.exact,
      strict = props.strict,
      sensitive = props.sensitive,
      className = props.className,
      activeClassName = props.activeClassName,
      rest = _objectWithoutPropertiesLoose(props, _excluded$1);
    var context = Inula.useContext(RouterContext);
    var toLocation = typeof to === 'function' ? to(context.location) : to;
    var _ref = typeof toLocation === 'string' ? parsePath(toLocation) : toLocation,
      pathname = _ref.pathname;
    var match = pathname ? matchPath(context.location.pathname, pathname, {
      exact: exact,
      strictMode: strict,
      caseSensitive: sensitive
    }) : null;
    var isLinkActive = !!(isActive ? isActive(match, context.location) : match);
    var classNames = typeof className === 'function' ? className(isLinkActive) : className;
    if (isLinkActive) {
      classNames = [activeClassName, classNames].filter(Boolean).join(' ');
    }
    var page = 'page';
    var otherProps = _extends({
      className: classNames,
      'aria-current': isLinkActive ? page : undefined
    }, rest);
    return jsxRuntime.jsx(Link, _extends({
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

  var _excluded = ["store"];
  var hConnect = Inula.reduxAdapter.connect;
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
    var unsubscribe = Inula.useRef(store.subscribe(function () {
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
    }));
    var handleLocationChange = function (args) {
      var isFirstRendering = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var location = args.location,
        action = args.action;
      onLocationChanged(location, action, isFirstRendering);
    };

    // 监听history更新
    var unListen = Inula.useRef(history.listen(handleLocationChange));
    Inula.useLayoutEffect(function () {
      return function () {
        unListen.current && unListen.current();
        unsubscribe.current && unsubscribe.current();
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
      return jsxRuntime.jsx(jsxRuntime.Fragment, {
        children: children
      });
    }
    var childrenNode;
    if (typeof children === 'function') {
      childrenNode = children();
    } else {
      childrenNode = children;
    }
    return jsxRuntime.jsx(Router, {
      history: history,
      children: childrenNode
    });
  }
  function getConnectedRouter(type) {
    var mapDispatchToProps = function (dispatch) {
      return {
        onLocationChanged: function (location, action, isFirstRendering) {
          return dispatch(onLocationChanged(location, action, isFirstRendering));
        }
      };
    };
    var ConnectedRouter = Inula__default["default"].memo(ConnectedRouterWithoutMemo);
    var ConnectedRouterWithContext = function (props) {
      var Context = props.context || reactRedux.ReactReduxContext;
      return jsxRuntime.jsx(Context.Consumer, {
        children: function (_ref) {
          var store = _ref.store;
          return jsxRuntime.jsx(ConnectedRouter, _extends({
            store: store,
            storeType: type
          }, props));
        }
      });
    };
    var ConnectedHRouterWithContext = function (props) {
      var store = props.store,
        rest = _objectWithoutPropertiesLoose(props, _excluded);
      return jsxRuntime.jsx(ConnectedRouter, _extends({
        store: store,
        storeType: type
      }, rest));
    };

    // 针对不同的Store类型，使用对应的connect函数
    if (type === 'InulaXCompat') {
      return hConnect(null, mapDispatchToProps)(ConnectedHRouterWithContext);
    }
    if (type === 'Redux') {
      return reactRedux.connect(null, mapDispatchToProps)(ConnectedRouterWithContext);
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
  var ConnectedHRouter = getConnectedRouter('InulaXCompat');

  exports.BrowserRouter = BrowserRouter;
  exports.ConnectedHRouter = ConnectedHRouter;
  exports.ConnectedRouter = ConnectedRouter;
  exports.HashRouter = HashRouter;
  exports.Link = Link;
  exports.NavLink = NavLink;
  exports.Prompt = Prompt;
  exports.Redirect = Redirect;
  exports.Route = Route;
  exports.Router = Router;
  exports.Switch = Switch;
  exports.__RouterContext = RouterContext;
  exports.connectRouter = connectRouter;
  exports.createBrowserHistory = createBrowserHistory;
  exports.createHashHistory = createHashHistory;
  exports.generatePath = generatePath;
  exports.go = go;
  exports.matchPath = matchPath;
  exports.push = push;
  exports.replace = replace;
  exports.routerMiddleware = routerMiddleware;
  exports.useHistory = useHistory;
  exports.useLocation = useLocation;
  exports.useParams = useParams;
  exports.useRouteMatch = useRouteMatch;
  exports.withRouter = withRouter;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=connectRouter.js.map
