import { injectCode } from '../utils/injectUtils';

// 页面的window对象不能直接通过 contentScript 代码修改，只能通过添加 js 代码往页面 window 注入hook
injectCode(chrome.runtime.getURL('/injector.js'));

// 监听来自页面的信息
window.addEventListener('message', event => {
  // 只监听来自本页面的消息
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === 'HORIZON_DEV_TOOLS')) {
    console.log('Content script received: ' + JSON.stringify(event.data.vNode));
    // 传递给background
    chrome.runtime.sendMessage(event.data.vNode, function (response) {
      console.log(response);
    });
  }
}, false);



// 监听来自background的消息
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension');
    if (request.tag === 'init horizon info') {
      // 传递消息给页面
      console.log('start pass info to webpage');
      window.postMessage({type: 'HORIZON_DEV_TOOLS', id: 1}, '*');
    }
  }
);
