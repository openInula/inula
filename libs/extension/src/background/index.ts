import { checkMessage, packagePayload, changeSource } from '../utils/transferTool';
import { RequestAllVNodeTreeInfos, InitDevToolPageConnection, DevToolBackground } from '../utils/constants';
import { DevToolPanel, DevToolContentScript } from '../utils/constants';

// 多个页面、tab页共享一个 background，需要建立连接池，给每个tab建立连接
const connections = {};

// panel 代码中调用 let backgroundPageConnection = chrome.runtime.connect({...}) 会触发回调函数
chrome.runtime.onConnect.addListener(function (port) {
  function extensionListener(message) {
    const isHorizonMessage = checkMessage(message, DevToolPanel);
    if (isHorizonMessage) {
      const { payload } = message;
      // tabId 值指当前浏览器分配给 web_page 的 id 值。是panel页面查询得到，指定向该页面发送消息
      const { type, data, tabId } = payload;
      let passMessage;
      if (type === InitDevToolPageConnection) {
        // 记录 panel 所在 tab 页的tabId，如果已经记录了，覆盖原有port，因为原有port可能关闭了
        // 可能这次是 panel 发起的重新建立请求
        connections[tabId] = port;
        passMessage = packagePayload({ type: RequestAllVNodeTreeInfos }, DevToolBackground);
      } else {
        passMessage = packagePayload({type, data}, DevToolBackground);
      }
      chrome.tabs.sendMessage(tabId, passMessage);
    }
  }
  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener);

    const tabs = Object.keys(connections);
    for (let i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

// 监听来自 content script 的消息，并将消息发送给对应的 devTools page，也就是 panel
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    const tabId = sender.tab.id;
    // 和 InitDevToolPageConnection 时得到的 tabId 值一致时，向指定的 panel 页面 port 发送消息
    if (tabId in connections && checkMessage(message, DevToolContentScript)) {
      changeSource(message, DevToolBackground);
      connections[tabId].postMessage(message);
    } else {
      // TODO: 如果查询失败，发送 chrome message，请求 panel 主动建立连接
      console.log('Tab not found in connection list.');
    }
  } else {
    console.log('sender.tab not defined.');
  }
  // 需要返回消息告知完成通知，否则会出现报错 message port closed before a response was received
  sendResponse({status: 'ok'});
});
