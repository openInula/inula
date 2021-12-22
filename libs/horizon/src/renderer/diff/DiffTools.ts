import type { VNode, HorizonElement } from '../Types';

// 当前vNode和element是同样的类型
// LazyComponent 会修改type的类型，所以特殊处理这种类型
export const isSameType = (vNode: VNode, ele: HorizonElement) => {
  return vNode.type === ele.type || (vNode.isLazyComponent && vNode.lazyType === ele.type);
};

export function createRef(element: HorizonElement) {
  const elementRef = element.ref;
  // 如果ref是null、function、object，直接返回
  if (elementRef === null || typeof elementRef === 'function' || typeof elementRef === 'object') {
    return elementRef;
  } else { // 包装成函数
    if (element._vNode) {
      let inst = element._vNode.realNode;

      return function(instance) {
        inst.refs[String(elementRef)] = instance;
      };
    }
  }
}

export function isTextType(newChild: any) {
  return typeof newChild === 'string' || typeof newChild === 'number';
}

export function isArrayType(newChild: any) {
  return Array.isArray(newChild);
}

export function isIteratorType(newChild: any) {
  return (typeof Symbol === 'function' && newChild[Symbol.iterator]) || newChild['@@iterator'];
}

export function getIteratorFn(maybeIterable: any): () => Iterator<any> {
  return maybeIterable[Symbol.iterator] || maybeIterable['@@iterator'];
}

export function isObjectType(newChild: any) {
  return typeof newChild === 'object' && newChild !== null;
}
