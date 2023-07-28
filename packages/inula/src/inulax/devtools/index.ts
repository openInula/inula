import { isDomVNode } from '../../renderer/vnode/VNodeUtils';
import { isMap, isSet, isWeakMap, isWeakSet } from '../CommonUtils';
import { getStore, getAllStores } from '../store/StoreHandler';
import { OBSERVED_COMPONENTS } from './constants';

const sessionId = Date.now();

// this function is used to detect devtool connection
export function isPanelActive() {
  return window['__INULA_DEV_HOOK__'];
}

// safely serializes variables containing values wrapped in Proxy object
function getType(value) {
  if (!value) return 'nullish';
  if (value.nativeEvent) return 'event';
  if (typeof value === 'function') return 'function';
  if (value.constructor?.name === 'VNode') return 'vnode';
  if (isWeakMap(value)) return 'weakMap';
  if (isWeakSet(value)) return 'weakSet';
  if (isMap(value)) return 'map';
  if (isSet(value)) return 'set';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'primitive';
}

function makeProxySnapshot(obj, visited: any[] = []) {
  const type = getType(obj);
  let clone;

  try {
    //NULLISH VALUE
    if (type === 'nullish') {
      return obj;
    }
    //EVENT
    if (type === 'event') return obj.type + 'Event';
    // FUNCTION
    if (type === 'function') {
      return obj.toString();
    }
    // VNODE
    if (type === 'vnode') {
      return {
        _type: 'VNode',
        id: window['__INULA_DEV_HOOK__'].getVnodeId(obj),
        tag: obj.tag,
      };
    }
    // WEAK MAP
    if (type === 'weakMap') {
      return {
        _type: 'WeakMap',
      };
    }
    // WEAK SET
    if (type === 'weakSet') {
      return {
        _type: 'WeakSet',
      };
    }
    // MAP
    if (type === 'map') {
      return {
        _type: 'Map',
        entries: Array.from(obj.entries()).map(([key, value]) => ({
          key: makeProxySnapshot(key),
          value: makeProxySnapshot(value),
        })),
      };
    }
    // SET
    if (type === 'set') {
      return {
        _type: 'Set',
        values: Array.from(obj).map(value => makeProxySnapshot(value)),
      };
    }
    // ARRAY
    if (type === 'array') {
      if (visited.some(item => item === obj)) return `<Cyclic ${obj.toString()}>`;
      clone = [];
      obj.forEach(item => clone.push(makeProxySnapshot(item, visited.concat([obj]))));
      return clone;
    }
    // OBJECT
    if (type === 'object') {
      if (visited.some(item => item === obj)) return `<Cyclic ${obj.toString()}>`;
      clone = {};
      Object.entries(obj).forEach(([id, value]) => (clone[id] = makeProxySnapshot(value, visited.concat([obj]))));
      return clone;
    }
    // PRIMITIVE
    return obj;
  } catch (err) {
    console.error('cannot serialize object. ', { err, obj, type });
  }
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

export const devtools = {
  // returns vNode id from inula devtools
  getVNodeId: vNode => {
    if (!isPanelActive()) {
      return null;
    }
    window['__INULA_DEV_HOOK__'].send(); // update list first
    return window['__INULA_DEV_HOOK__'].getVnodeId(vNode);
  },
  // sends inulax devtool message to extension
  emit: (type, data) => {
    if (!isPanelActive()) {
      return;
    }
    window.postMessage({
      type: 'INULA_DEV_TOOLS',
      payload: makeStoreSnapshot({ type, data }),
      from: 'dev tool hook',
    }, '');
  },
};

// collects components that are dependant on inulax store and their ids
function getAffectedComponents() {
  const allStores = getAllStores();
  const keys = Object.keys(allStores);
  const res = {};
  keys.forEach(key => {
    if (!allStores[key].$config.state._inulaObserver.keyVNodes) {
      res[key] = [];
      return;
    }
    const subRes = new Set();
    const process = Array.from(allStores[key].$config.state._inulaObserver.keyVNodes.values());
    while (process.length) {
      const pivot = process.shift() as { tag: 'string' };
      if (pivot.tag) subRes.add(pivot);
      if (pivot.toString() === '[object Set]') Array.from(pivot).forEach(item => process.push(item));
    }
    res[key] = Array.from(subRes).map(vNode => {
      return {
        name: vNode?.type
          .toString()
          .replace(/\{.*\}/, '{...}')
          .replace('function ', ''),
        nodeId: window.__INULA_DEV_HOOK__.getVnodeId(vNode),
      };
    });
  });

  return res;
}

// listens to messages from background
window.addEventListener('message', (messageEvent?) => {
  if (messageEvent?.data?.payload?.type === 'inulax request observed components') {
    // get observed components
    setTimeout(() => {
      window.postMessage({
        type: 'INULA_DEV_TOOLS',
        payload: { type: OBSERVED_COMPONENTS, data: getAffectedComponents() },
        from: 'dev tool hook',
      }, '');
    }, 100);
  }

  // executes store action
  if (messageEvent.data?.payload?.type === 'inulax executue action') {
    const data = messageEvent.data.payload.data;
    const store = getStore(data.storeId);
    if (!store?.[data.action]) return;

    const action = store[data.action];
    const params = data.params;
    action(...params);
  }

  // queues store action
  if (messageEvent?.data?.payload?.type === 'inulax queue action') {
    const data = messageEvent.data.payload.data;
    const store = getStore(data.storeId);
    if (!store?.[data.action]) return;

    const action = store.$queue[data.action];
    const params = data.params;
    action(...params);
  }

  // queues change store state
  if (messageEvent?.data?.payload?.type === 'inulax change state') {
    const data = messageEvent.data.payload;
    const store = getStore(data.storeId);
    if (!store) return;
    let parent = store.$s;
    if (data.operation === 'edit') {
      try {
        const path = messageEvent.data.payload.path;

        while (path.length > 1) {
          parent = parent[path.pop()];
        }

        parent[path[0]] = messageEvent.data.payload.value;
      } catch (err) {
        console.error(err);
      }
    }

    // need to implement add and delete element
  }
});
