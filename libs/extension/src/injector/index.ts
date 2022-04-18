import parseTreeRoot, { deleteVNode } from '../parser/parseVNode';
import { packagePayload, checkData } from './../utils/transferTool';
import { oneVNodeTreeInfos, allVNodeTreesInfos, requestAllVNodeTreeInfos } from './../utils/constants';

const roots = [];

function injectHook() {
  if (window.__HORIZON_DEV_HOOK__) {
    return;
  }
  Object.defineProperty(window, '__HORIZON_DEV_HOOK__', {
    enumerable: false,
    value: {
      addIfNotInclude: function( treeRoot: any) {
        if (!roots.includes(treeRoot)) {
          roots.push(treeRoot);
        }
      },
      send: function (vNode: any) {
        const result = parseTreeRoot(vNode);
        window.postMessage(packagePayload({
          data: result,
          type: oneVNodeTreeInfos
        }), '*');
      },
      delete: function (vNode: any) {
        // 开发工具中保存了 vNode 的引用，在清理 VNode 的时候需要一并删除
        deleteVNode(vNode);
        const index = roots.indexOf(vNode);
        if (index !== -1) {
          roots.splice(index, 1);
        }
      }
    },
  });
  window.addEventListener('message', function (event) {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }
    const request = event.data;
    if (checkData(request)) {
      const { payload } = request;
      const { type, data } = payload;
      if (type === requestAllVNodeTreeInfos) {
        const result = roots.reduce((pre, current) => {
          const info = parseTreeRoot(current);
          pre.push(info);
          return pre;
        }, []);
        window.postMessage(packagePayload({
          data: result,
          type: allVNodeTreesInfos
        }), '*');
      }
    }
  });
}
injectHook();
