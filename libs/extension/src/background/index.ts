// 多个页面、tab页共享一个 background，需要建立连接池，给每个tab建立连接
const connections = {};

// panel 代码中调用 let backgroundPageConnection = chrome.runtime.connect({...}) 会触发回调函数
chrome.runtime.onConnect.addListener(function (port) {

  // The original connection event doesn't include the tab ID of the
  // DevTools page, so we need to send it explicitly.
  function extensionListener(message, sender, sendResponse) {
    // 在backgroundPageConnection创建后会发送初始化请求，这样就可以获取tabId，给连接编号
    if (message.name === 'init') {
      // 获取 panel 所在 tab 页的tabId
      connections[message.tabId] = port;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {tag: 'init horizon info'}, function(response) {
          console.log(response.farewell);
        });
      });
      return;
    }

    if (message.name === 'update') {
      return;
    }
    // other message handling
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
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.log('Tab not found in connection list.');
    }
  } else {
    console.log('sender.tab not defined.');
  }
  return true;
});
