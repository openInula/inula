import { injectCode } from '../utils/injectUtils';
import { checkMessage } from '../utils/transferTool';
import { DevToolContentScript, DevToolHook, DevToolBackground } from './../utils/constants';
import { changeSource } from './../utils/transferTool';

// 页面的window对象不能直接通过 contentScript 代码修改，只能通过添加 js 代码往页面 window 注入hook
injectCode(chrome.runtime.getURL('/injector.js'));

// 监听来自页面的信息
window.addEventListener('message', event => {
  // 只监听来自本页面的消息
  if (event.source !== window) {
    return;
  }

  const data = event.data;
  if (checkMessage(data, DevToolHook)) {
    changeSource(data, DevToolContentScript);
    // 传递给background
    chrome.runtime.sendMessage(data);
  }
}, false);



// 监听来自background的消息
chrome.runtime.onMessage.addListener(
  function (message, sender) {
    // 该方法可以监听页面 contentScript 和插件的消息
    // 没有 tab 信息说明消息来自插件
    if (!sender.tab && checkMessage(message, DevToolBackground)) {
      changeSource(message, DevToolContentScript);
      // 传递消息给页面
      window.postMessage(message, '*');
    }
  }
);
