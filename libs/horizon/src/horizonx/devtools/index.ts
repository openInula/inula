import { getStore, getAllStores } from '../store/StoreHandler';
import { OBSERVED_COMPONENTS } from './constants';

const sessionId = Date.now();

// this function is used to detect devtool connection
export function isPanelActive() {
  return window['__HORIZON_DEV_HOOK__'];
}

// serializes store and creates expanded object with baked-in containing current computed values
function makeStoreSnapshot({ type, data }) {
  const expanded = {};
  Object.keys(data.store.$c).forEach(key => {
    expanded[key] = data.store[key];
  });
  data.store.expanded = expanded;
  const snapshot = makeProxySnapshot({
    data,
    type,
    sessionId,
  });
  return snapshot;
}

// safely serializes variables containing values wrapped in Proxy object
function makeProxySnapshot(obj) {
  let clone;
  try {
    if (!obj) {
      return obj;
    }
    if (obj.nativeEvent) return obj.type + 'Event';
    if (typeof obj === 'function') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      clone = [];
      obj.forEach(item => clone.push(makeProxySnapshot(item)));
      return clone;
    } else if (typeof obj === 'object') {
      clone = {};
      Object.entries(obj).forEach(([id, value]) => (clone[id] = makeProxySnapshot(value)));
      return clone;
    }
    return obj;
  } catch (err) {
    throw console.log('cannot serialize object. ' + err);
  }
}

export const devtools = {
  // returns vNode id from horizon devtools
  getVNodeId: vNode => {
    if (!isPanelActive() || !window['__HORIZON_DEV_HOOK__'].getVnodeId) return;
    window['__HORIZON_DEV_HOOK__'].send(); // update list first
    return window['__HORIZON_DEV_HOOK__'].getVnodeId(vNode);
  },
  // sends horizonx devtool message to extension
  emit: (type, data) => {
    if (!isPanelActive()) return;
    window.postMessage({
      type: 'HORIZON_DEV_TOOLS',
      payload: makeStoreSnapshot({ type, data }),
      from: 'dev tool hook',
    });
  },
};

// collects components that are dependant on horizonx store and their ids
function getAffectedComponents() {
  const allStores = getAllStores();
  const keys = Object.keys(allStores);
  let res = {};
  keys.forEach(key => {
    const subRes = new Set();
    const process = Array.from(allStores[key].$config.state._horizonObserver.keyVNodes.values());
    while (process.length) {
      let pivot = process.shift();
      if (pivot?.tag) subRes.add(pivot);
      if (pivot?.toString() === '[object Set]') Array.from(pivot).forEach(item => process.push(item));
    }
    res[key] = Array.from(subRes).map(vnode => {
      return {
        name: vnode?.type
          .toString()
          .replace(/\{.*\}/, '{...}')
          .replace('function ', ''),
        nodeId: window.__HORIZON_DEV_HOOK__.getVnodeId(vnode),
      };
    });
  });

  return res;
}

// listens to messages from background
window.addEventListener('message', messageEvent => {
  if (messageEvent?.data?.payload?.type === 'horizonx request observed components') {
    // get observed components
    setTimeout(() => {
      window.postMessage({
        type: 'HORIZON_DEV_TOOLS',
        payload: { type: OBSERVED_COMPONENTS, data: getAffectedComponents() },
        from: 'dev tool hook',
      });
    }, 100);
  }

  // executes store action
  if (messageEvent.data?.payload?.type === 'horizonx executue action') {
    const data = messageEvent.data.payload.data;
    const store = getStore(data.storeId);
    if (!store?.[data.action]) return;

    const action = store[data.action];
    const params = data.params;
    action(...params);
  }
});
