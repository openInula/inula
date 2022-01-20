import {throwIfTrue} from '../renderer/utils/throwIfTrue';
import {TYPE_ELEMENT, TYPE_PORTAL} from '../renderer/utils/elementType';

import {isValidElement, HorizonElement} from './HorizonElement';

// 生成key
function getItemKey(item: any, index: number): string {
  if (typeof item === 'object' && item !== null && item.key != null) {
    return '.$' + item.key;
  }
  // 使用36进制减少生成字符串的长度以节省空间
  return '.' + index.toString(36);
}

function mapChildrenToArray(
  children: any,
  arr: Array<any>,
  prefix: string,
  callback?: Function,
): number | void {
  const type = typeof children;
  switch (type) {
    // 继承原有规格，undefined和boolean类型按照null处理
    case 'undefined':
    case 'boolean':
      callMapFun(null, arr, prefix, callback);
      return;
    case 'number':
    case 'string':
      callMapFun(children, arr, prefix, callback);
      return;
    case 'object':
      if (children === null) {
        callMapFun(null, arr, prefix, callback);
        return;
      }
      const vtype = children.vtype;
      if (vtype === TYPE_ELEMENT || vtype === TYPE_PORTAL) {
        callMapFun(children, arr, prefix, callback) ;
        return;
      }
      if (Array.isArray(children)) {
        processArrayChildren(children, arr, prefix, callback);
        return;
      }
      throw new Error(
        'Object is invalid as a Horizon child. '
      );
    default:
  }
}

function processArrayChildren(
  children: any,
  arr: Array<any>,
  prefix: string,
  callback: Function,
) {
  for (let i = 0; i < children.length; i++) {
    const childItem = children[i];
    const nextPrefix = prefix + getItemKey(childItem, i);
    mapChildrenToArray(
      childItem,
      arr,
      nextPrefix,
      callback,
    );
  }
}

function callMapFun(
  children: any,
  arr: Array<any>,
  prefix: string,
  callback: Function,
) {
  let mappedChild = callback(children);
  if (Array.isArray(mappedChild)) {
    // 维持原有规格，如果callback返回结果是数组，处理函数修改为返回数组item
    processArrayChildren(mappedChild, arr, prefix + '/', subChild => subChild);
  } else if (mappedChild !== null && mappedChild !== undefined) {
    // 给一个key值，确保返回的对象一定带有key
    if (isValidElement(mappedChild)) {
      const childKey = prefix === '' ? getItemKey(children, 0) : '';
      const mappedKey = getItemKey(mappedChild, 0);
      const newKey = prefix + childKey + (mappedChild.key && mappedKey !== getItemKey(children, 0)
        ? '.$' + mappedChild.key
        : '');
      // 返回一个修改key的children
      mappedChild = HorizonElement(
        mappedChild.type,
        newKey,
        mappedChild.ref,
        mappedChild._vNode,
        mappedChild.props,
      );
    }
    arr.push(mappedChild);
  }
}

// 在 children 里的每个直接子节点上调用一个函数，并将 this 设置为 thisArg
function mapChildren(
  children: any,
  func: Function,
  context?: any,
): Array<any> {
  if (children === null || children === undefined) {
    return children;
  }
  let count = 0;
  const result = [];
  mapChildrenToArray(children, result, '', (child) => {
    return func.call(context, child, count++);
  });
  return result;
}

const Children = {
  forEach: (children, func, context?: any) => {
    // 不返回数组即可
    mapChildren(children, func, context);
  },
  map: mapChildren,
  // 并非所有元素都会计数,只计数调用callMapFun函数次数
  count: (children) => {
    let n = 0;
    mapChildren(children, () => {
      n++;
    });
    return n;
  },
  only: (children) => {
    throwIfTrue(
      !isValidElement(children),
      'Horizon.Children.only function received invalid element.'
    );
    return children;
  },
  toArray: (children) => {
    const result = [];
    mapChildrenToArray(children, result, '', child => child);
    return result;
  },
}

export {
  Children
};
