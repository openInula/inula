const sessionId = Date.now();

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
  emit: (type, data) => {
    console.log('store snapshot:', makeStoreSnapshot({ type, data }));
    window.postMessage({
      type: 'HORIZON_DEV_TOOLS',
      payload: makeStoreSnapshot({ type, data }),
      from: 'dev tool hook',
    });
  },
};
