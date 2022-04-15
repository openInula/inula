import { IAttr } from "../components/ComponentInfo";

// 将状态的值解析成固定格式
export function parseAttr(rootAttr: any) {
  const result: IAttr[] = [];
  const indentation = 0;
  const parseSubAttr = (attr: any, parentIndentation: number, attrName: string) => {
    const stateType = typeof attr;
    let value: any;
    let showType;
    let addSubState;
    if (stateType === 'boolean' ||
      stateType === 'number' ||
      stateType === 'string' ||
      stateType === 'undefined') {
      value = attr;
      showType = stateType;
    } else if (stateType === 'function') {
      const funName = attr.name;
      value = `f() ${funName}{}`;
    } else if (stateType === 'symbol') {
      value = attr.description;
    } else if (stateType === 'object') {
      if (attr === null) {
        showType = 'null';
      } else if (attr instanceof Map) {
        showType = 'map';
        const size = attr.size;
        value = `Map(${size})`;
        addSubState = () => {
          attr.forEach((value, key) => {
            parseSubAttr(value, parentIndentation + 2, key);
          });
        };
      } else if (attr instanceof Set) {
        showType = 'set';
        const size = attr.size;
        value = `Set(${size})`;
        addSubState = () => {
          let i = 0;
          attr.forEach((value) => {
            parseSubAttr(value, parentIndentation + 2, String(i));
          });
          i++;
        };
      } else if (Array.isArray(attr)) {
        showType = 'array';
        value = `Array(${attr.length})`;
        addSubState = () => {
          attr.forEach((value, index) => {
            parseSubAttr(value, parentIndentation + 2, String(index));
          });
        };
      } else {
        showType = stateType;
        value = '{...}';
        addSubState = () => {
          Object.keys(attr).forEach((key) => {
            parseSubAttr(attr[key], parentIndentation + 2, key);
          });
        };
      }
    }

    result.push({
      name: attrName,
      type: showType,
      value,
      indentation: parentIndentation + 1,
    });
    if (addSubState) {
      addSubState();
    }
  };
  Object.keys(rootAttr).forEach(key => {
    parseSubAttr(rootAttr[key], indentation, key);
  });
  return result;
}
