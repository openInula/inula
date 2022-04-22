
import { Hook, Reducer, Ref } from './../../../horizon/src/renderer/hooks/HookType';

// 展示值为 string 的可编辑类型
type editableStringType = 'string' | 'number' | 'undefined' | 'null';
// 展示值为 string 的不可编辑类型
type unEditableStringType = 'function' | 'symbol' | 'object' | 'map' | 'set' | 'array'
  | 'dom' // 值为 dom 元素的 ref 类型
  | 'ref'; // 值为其他数据的 ref 类型

type showAsStringType = editableStringType | unEditableStringType;


export type IAttr = {
  name: string;
  indentation: number;
  hIndex?: number; // 用于记录 hook 的 hIndex 值
} & ({
  type: showAsStringType;
  value: string;
} | {
  type: 'boolean';
  value: boolean;
})

type showType = showAsStringType | 'boolean';

const parseSubAttr = (
  attr: any,
  parentIndentation: number,
  attrName: string,
  result: IAttr[],
  hIndex?: number) => {
  const attrType = typeof attr;
  let value: any;
  let showType: showType;
  let addSubState;
  if (attrType === 'boolean' ||
    attrType === 'number' ||
    attrType === 'string' ||
    attrType === 'undefined') {
    value = attr;
    showType = attrType;
  } else if (attrType === 'function') {
    const funName = attr.name;
    value = `f() ${funName}{}`;
  } else if (attrType === 'symbol') {
    value = attr.description;
  } else if (attrType === 'object') {
    if (attr === null) {
      showType = 'null';
    } else if (attr instanceof Map) {
      showType = 'map';
      const size = attr.size;
      value = `Map(${size})`;
      addSubState = () => {
        attr.forEach((value, key) => {
          parseSubAttr(value, parentIndentation + 2, key, result);
        });
      };
    } else if (attr instanceof Set) {
      showType = 'set';
      const size = attr.size;
      value = `Set(${size})`;
      addSubState = () => {
        let i = 0;
        attr.forEach((value) => {
          parseSubAttr(value, parentIndentation + 2, String(i), result);
        });
        i++;
      };
    } else if (Array.isArray(attr)) {
      showType = 'array';
      value = `Array(${attr.length})`;
      addSubState = () => {
        attr.forEach((value, index) => {
          parseSubAttr(value, parentIndentation + 2, String(index), result);
        });
      };
    } else if (attr instanceof Element) {
      showType = 'dom';
      value = attr.tagName;
    } else {
      showType = attrType;
      value = '{...}';
      addSubState = () => {
        Object.keys(attr).forEach((key) => {
          parseSubAttr(attr[key], parentIndentation + 2, key, result);
        });
      };
    }
  }
  const item: IAttr = {
    name: attrName,
    type: showType,
    value,
    indentation: parentIndentation + 1,
  };
  if (hIndex) {
    item.hIndex = hIndex;
  }
  result.push(item);
  if (addSubState) {
    addSubState();
  }
};

// 将属性的值解析成固定格式，props 和 类组件的 state 必须是一个对象
export function parseAttr(rootAttr: any) {
  const result: IAttr[] = [];
  const indentation = 0;
  if (typeof rootAttr === 'object' && rootAttr !== null)
  Object.keys(rootAttr).forEach(key => {
    parseSubAttr(rootAttr[key], indentation, key, result);
  });
  return result;
}

export function parseHooks(hooks: Hook<any, any>[]) {
  const result: IAttr[] = [];
  const indentation = 0;
  hooks.forEach(hook => {
    const { hIndex, state ,type } = hook;
    if (type === 'useState') {
      parseSubAttr((state as Reducer<any, any>).stateValue, indentation, 'state', result, hIndex);
    } else if (type === 'useRef') {
      parseSubAttr((state as Ref<any>).current, indentation, 'ref', result, hIndex);
    } else if (type === 'useReducer') {
      parseSubAttr((state as Reducer<any, any>).stateValue, indentation, 'reducer', result, hIndex);
    }
  });
  return result;
}
