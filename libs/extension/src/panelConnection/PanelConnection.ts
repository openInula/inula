import { packagePayload } from '../utils/transferTool';
import { DevToolPanel, InitDevToolPageConnection } from '../utils/constants';

let connection;
const callbacks = [];

export function addBackgroundMessageListener(fun: (message) => void) {
  callbacks.push(fun);
}

export function removeBackgroundMessageListener(fun: (message) => void) {
  const index = callbacks.indexOf(fun);
  if (index !== -1) {
    callbacks.splice(index, 1);
  }
}

export function initBackgroundConnection() {
  console.log(!isDev);
  if (!isDev) {
    try {
      connection = chrome.runtime.connect({ name: 'panel' });
      const notice = message => {
        callbacks.forEach(fun => {
          fun(message);
        });
      };
      // TODO: 我们需要删除 notice 吗？如果需要，在什么时候删除
      // 监听 background 消息
      connection.onMessage.addListener(notice);
      // 页面打开后发送初始化请求
      postMessageToBackground(InitDevToolPageConnection);
    } catch (e) {
      console.error('create connection failed');
      console.error(e);
    }
  }
}

let reconnectTimes = 0;
export function postMessageToBackground(type: string, data?: any) {
  try{
    const payLoad = data
      ? { type, tabId: chrome.devtools.inspectedWindow.tabId, data }
      : { type, tabId: chrome.devtools.inspectedWindow.tabId };
    connection.postMessage(packagePayload(payLoad, DevToolPanel));
  } catch(err) {
    // 可能出现 port 关闭的场景，需要重新建立连接，增加可靠性
    if (reconnectTimes === 20) {
      reconnectTimes = 0;
      console.error('reconnect failed');
      return;
    }
    console.error(err);
    reconnectTimes++;
    // 重建连接
    initBackgroundConnection();
    // 初始化成功后才会重新发送消息
    postMessageToBackground(type, data);
  }
}
