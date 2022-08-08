import { TYPE_COMMON_ELEMENT } from './JSXElementType';
import { getProcessingClassVNode } from '../renderer/GlobalVar';
import { Source } from '../renderer/Types';

/**
 * vtype 节点的类型，这里固定是element
 * type 保存dom节点的名称或者组件的函数地址
 * key key属性
 * ref ref属性
 * props 其他常规属性
 */
export function JSXElement(type, key, ref, vNode, props, source: Source | null) {
  return {
    // 元素标识符
    vtype: TYPE_COMMON_ELEMENT,
    _source: isDev ? source : null,

    // 属于元素的内置属性
    type: type,
    key: key,
    ref: ref,
    props: props,

    // 所属的class组件
    belongClassVNode: vNode,
  };
}

function isValidKey(key) {
  const keyArray = ['key', 'ref', '__source'];
  return !keyArray.includes(key);
}

function mergeDefault(sourceObj, defaultObj) {
  Object.keys(defaultObj).forEach(key => {
    if (sourceObj[key] === undefined) {
      sourceObj[key] = defaultObj[key];
    }
  });
}

function buildElement(isClone, type, setting, children) {
  // setting中的值优先级最高，clone情况下从 type 中取值，创建情况下直接赋值为 null
  const key = (setting && setting.key !== undefined) ? String(setting.key) : (isClone ? type.key : null);
  const ref = (setting && setting.ref !== undefined) ? setting.ref : (isClone ? type.ref : null);
  const props = isClone ? { ...type.props } : {};
  let vNode = isClone ? type.belongClassVNode : getProcessingClassVNode();

  if (setting !== null && setting !== undefined) {
    const keys = Object.keys(setting);
    const keyLength = keys.length;
    for (let i = 0; i < keyLength; i++) {
      const k = keys[i];
      if (isValidKey(k)) {
        props[k] = setting[k];
      }
    }
    if (setting.ref !== undefined && isClone) {
      vNode = getProcessingClassVNode();
    }
  }

  if (children.length) {
    props.children = children.length === 1 ? children[0] : children;
  }
  const element = isClone ? type.type : type;
  // 合并默认属性
  if (element && element.defaultProps) {
    mergeDefault(props, element.defaultProps);
  }
  let src: Source | null = null;
  if (setting?.__source) {
    src = {
      fileName: setting.__source.fileName,
      lineNumber: setting.__source.lineNumber,
    };
  }

  return JSXElement(element, key, ref, vNode, props, src);
}

// 创建Element结构体，供JSX编译时调用
export function createElement(type, setting, ...children) {
  return buildElement(false, type, setting, children);
}

export function cloneElement(element, setting, ...children) {
  return buildElement(true, element, setting, children);
}

// 检测结构体是否为合法的Element
export function isValidElement(element) {
  return !!(element && element.vtype === TYPE_COMMON_ELEMENT);
}
