import { useInjection } from './vue-horizon';
let counter = 0;

export function useLocalStore({ name, data, methods, computed, created, inject }) {
  const newStore = window.horizon.useRef(true);
  inject?.forEach(key => {
    computed[key] = () => {
      useInjection(key);
    };
  });
  const store = window.horizon.useRef(
    window.horizon.createStore({
      id: `${name || 'unknown'}-${Date.now()}-${counter++}`,
      state: (typeof data === 'function' ? data() : data) || {},
      actions: {
        ...Object.fromEntries(
          Object.entries(methods || {}).map(([key, method]) => {
            return [
              key,
              function (state, ...args) {
                return method.bind(this)(...args);
              },
            ];
          })
        ),
        _setValue: function (state, key, value) {
          state[key.replace(/^this\./, '')] = value;
        },
      },
      computed: computed || {},
    })
  );

  if (newStore.current) {
    requestAnimationFrame(() => {
      if (created) {
        created.bind(store.current())();
      }
    });
  }

  newStore.current = false;
  const currentStore = store.current();

  const mix = {
    ...currentStore,
    ...currentStore.$s,
    ...Object.fromEntries(
      Object.entries(currentStore.$a).map(([key, action]) => {
        return [
          key,
          (...args) => {
            return action.bind(currentStore)(...args);
          },
        ];
      })
    ),
  };

  Object.entries(currentStore.$c).forEach(([key, computed]) => {
    const getter = (none, ...args) => {
      return computed.bind(currentStore)(...args);
    };

    Object.defineProperty(mix, key, {
      get: getter,
      enumerable: true,
    });
  });

  return mix;
}
