export function nextTick(callback) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      callback();
      resolve();
    }, 0);
  });
}

export function onMounted(callback) {
  window.horizon.useEffect(() => {
    callback();
  });
}

export function onBeforeUnmount(callback) {
  window.horizon.useEffect(() => {
    return () => {
      callback();
    };
  });
}

export function onUnmounted(callback) {
  window.horizon.useEffect(() => {
    return () => {
      callback();
    };
  });
}

export function toRef(val) {
  if (typeof val === 'function') {
    return computed(val);
  }

  if (val.toRef) {
    return val;
  }

  return ref(val);
}

export function unref(val) {
  if (val.isRef) {
    return val.value;
  }

  return val;
}

export function toRefs(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, toRef(value)]));
}

export function ref(initialValue) {
  let [b, r] = window.horizon.useState(false);

  let state = window.horizon.useRef(initialValue);
  let listeners = new Set();

  return new Proxy(
    { value: initialValue },
    {
      get: (target, name) => {
        if (name === 'value' || name === 'current') {
          return state.current;
        }
        if (name === Symbol.toPrimitive) {
          return () => state.current;
        }
        if (name === 'isRef') return true;
        if (name === 'watch')
          return cb => {
            listeners.add(cb);
          };
        if (name === 'raw') return initialValue;
      },
      set: (target, name, value) => {
        if (name === 'value') {
          if (state.current === value) return true;
          state.current = value;
          r(!b);
          Array.from(listeners.values()).forEach(listener => {
            listener(value);
          });
          return true;
        } else if (name === 'current') {
          if (state.current === value) return true;
          state.current = value;
          return true;
        }
      },
    }
  );
}

export function reactive(initialValue) {
  let [b, r] = window.horizon.useState(false);
  const data = window.horizon.useRef(initialValue);
  const listeners = new Set();

  return new Proxy(initialValue, {
    set: (target, name, value) => {
      r(!b);
      Array.from(listeners).forEach(listener => listener(value, data.current[name]));
      data.current[name] = value;
      return true;
    },
    get: (target, name) => {
      if (name === 'isRef') return true;
      if (name === 'watch')
        return listener => {
          listeners.add(listener);
        };
      return data.current[name];
    },
  });
}

export function computed(foo) {
  if (typeof foo === 'object') return writtableComputed(foo);
  let listeners = new Set();
  let previousValue = foo();
  return new Proxy(
    {},
    {
      get: (target, name) => {
        if (name === 'value') {
          const newValue = foo();
          if (JSON.stringify(newValue) !== JSON.stringify(previousValue)) {
            previousValue = newValue;
            Array.from(listeners.values()).forEach(listener => {
              listener(newValue);
            });
          }
          return previousValue;
        }
        if (name === 'isComputed') return true;
        if (name === 'raw') return () => foo;
        if (name === 'watch')
          return cb => {
            listeners.add(cb);
          };
      },
    }
  );
}

function writtableComputed(methods) {
  let listeners = new Set();
  return new Proxy(
    {},
    {
      get: (target, name) => {
        if (name === 'value') return methods.get();
        if (name === 'isComputed') return true;
        if (name === 'raw') return () => foo;
        if (name === 'watch')
          return cb => {
            listeners.add(cb);
          };
      },
      set: (target, name, value) => {
        methods.set(value);
        Array.from(listeners.values()).forEach(listener => {
          listener(value);
        });
        return true;
      },
    }
  );
}

const globals = new Map();

export function provide(key, value) {
  globals.set(key, value);
}

export function inject(key) {
  return globals.get(key);
}

export const useInjection = inject;

export function Teleport({ to, children }) {
  const container = window.horizon.useState(() => {
    document.createElement('div');
  });

  window.horizon.useEffect(() => {
    to.appendChild(container);

    return () => {
      to.removeChild(container);
    };
  }, [to, container]);

  return window.horizon.createPortal(children, container);
}

export function defineProps(props) {
  console.log('define props', props);
}

export function getCurrentInstance() {
  return window.horizon.getProcessingVNode();
}

export function toRaw(maybeRef) {
  if (maybeRef.isRef || maybeRef.isComputed) return maybeRef.raw;
  else return maybeRef;
}

export function watch(data, cb, options) {
  if (data.isRef || data.isComputed) {
    data.watch(cb);
  } else if (typeof data === 'function') {
    watch(computed(data), cb, options);
  } else {
    throw Error('Watch method not implemented');
  }
}

export function useWindowSize(options = {}) {
  const {
    initialWidth = Number.POSITIVE_INFINITY,
    initialHeight = Number.POSITIVE_INFINITY,
    listenOrientation = true,
    includeScrollbar = true,
  } = options;

  const width = ref(initialWidth);
  const height = ref(initialHeight);

  function update() {
    if (window) {
      if (includeScrollbar) {
        width.value = window.innerWidth;
        height.value = window.innerHeight;
      } else {
        width.value = window.document.documentElement.clientWidth;
        height.value = window.document.documentElement.clientHeight;
      }
    }
  }

  update();

  window.horizon.useEffect(() => {
    window.addEventListener('resize', update);
    if (listenOrientation) window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      if (listenOrientation) window.removeEventListener('orientationchange', update);
    };
  });

  return { width: width.value, height: height.value };
}

export function defineComponent(data) {
  console.log('define component', data);
  return {
    data() {
      return {};
    },
  };
}

export function defineEmits(props, emitKeys) {
  const listeners = {};

  const eventprops = Object.entries(props)
    .filter(([propname, listener]) => propname.startsWith('on'))
    .map(([propname, listener]) => [propname.substring(2).toLowerCase(), listener]);

  emitKeys.forEach(eventName => {
    const key = eventName.toLowerCase();
    listeners[key] = eventprops.find(evt => evt[0] === key)?.[1] || (() => {});
  });

  return (event, ...data) => {
    if (listeners[event.toLowerCase()]) {
      listeners[event.toLowerCase()](...data);
    }
  };
}

export function defineExpose(props, expose) {
  props.expose = expose;
}

export function createVNode(component, props) {
  return window.horizon.createElement(component, props, props.children);
}

export function render(vnode, target) {
  window.horizon.render(vnode, target);
}
