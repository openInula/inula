import parseTreeRoot from "../parser/parseVNode";

function injectHook() {
  if (window.__HORIZON_DEV_HOOK__) {
    return;
  }
  Object.defineProperty(window, '__HORIZON_DEV_HOOK__', {
    enumerable: false,
    value: {
      roots: [],
      send: function (vNode: any) {
        const result = parseTreeRoot(vNode);
        window.postMessage({
          type: 'HORIZON_DEV_TOOLS', vNode: result
        }, '*');
      },
      listen: function (id: number) {
        window.addEventListener('message', function(event) {
          // We only accept messages from ourselves
          if (event.source !== window) {
            return;
          }

          if (event.data.type && (event.data.type === 'HORIZON_DEV_TOOLS') && event.data.id === id) {
            console.log('todo');
          }
        });
      }
    },
  });
}
injectHook();
