import {
  allDelegatedHorizonEvents,
} from '../../event/EventCollection';
import { updateCommonProp } from './UpdateCommonProp';
import { setStyles } from './StyleHandler';
import {
  listenNonDelegatedEvent
} from '../../event/EventBinding';
import { isEventProp, isNativeElement } from '../validators/ValidateProps';

function updateOneProp(dom, propName, isNativeTag, propVal?, isInit?: boolean) {
  if (propName === 'style') {
    setStyles(dom, propVal);
  } else if (propName === 'dangerouslySetInnerHTML') {
    dom.innerHTML = propVal.__html;
  } else if (propName === 'children') { // 只处理纯文本子节点，其他children在VNode树中处理
    const type = typeof propVal;
    if (type === 'string') {
      dom.textContent = propVal;
    } else if (type === 'number') {
      dom.textContent = propVal + ''; // 这种数字转字符串的方式效率最高
    }
  } else if (isEventProp(propName)) {
    // 事件监听属性处理
    if (!allDelegatedHorizonEvents.has(propName)) {
      listenNonDelegatedEvent(propName, dom, propVal);
    }
  } else {
    if (!isInit || (isInit && propVal != null)) {
      updateCommonProp(dom, propName, propVal, isNativeTag);
    }
  }
}

// 初始化DOM属性
export function setDomProps(
  tagName: string,
  dom: Element,
  props: Object,
): void {
  const isNativeTag = isNativeElement(tagName, props);
  const keysOfProps = Object.keys(props);

  for (let i = 0; i < keysOfProps.length; i++) {
    const propName = keysOfProps[i];
    const propVal = props[propName];

    updateOneProp(dom, propName, isNativeTag, propVal, true);
  }
}

// 更新 DOM 属性
export function updateDomProps(
  dom: Element,
  changeList: Array<any>,
  isNativeTag: boolean,
): void {
  for (let i = 0; i < changeList.length; i++) {
    const { propName, propVal } = changeList[i];

    updateOneProp(dom, propName, isNativeTag, propVal);
  }
}

// 找出两个 DOM 属性的差别，生成需要更新的属性集合
export function compareProps(
  oldProps: Object,
  newProps: Object,
): Array<any> {
  let updatesForStyle = {};
  const toBeDeletedProps: Array<any> = [];
  const toBeUpdatedProps: Array<any> = [];
  const keysOfOldProps = Object.keys(oldProps);
  const keysOfNewProps = Object.keys(newProps);

  // 找到旧属性中需要删除的属性
  for (let i = 0; i < keysOfOldProps.length; i++) {
    const propName = keysOfOldProps[i];
    // 新属性中包含该属性或者该属性为空值的属性不需要处理
    if (keysOfNewProps.includes(propName) || oldProps[propName] == null) {
      continue;
    }

    if (propName === 'style') {
      const oldStyle = oldProps[propName];
      const styleProps = Object.keys(oldStyle);
      for (let j = 0; j < styleProps.length; j++) {
        const styleProp = styleProps[j];
        updatesForStyle[styleProp] = '';
      }
    } else if (
      propName === 'autoFocus' ||
      propName === 'children' ||
      propName === 'dangerouslySetInnerHTML'
    ) {
      continue;
    } else if (isEventProp(propName)) {
      if (!allDelegatedHorizonEvents.has(propName)) {
        toBeDeletedProps.push({
          propName,
          propVal: null,
        });
      }
    } else {
      // 其它属性都要加入到删除队列里面，等待删除
      toBeDeletedProps.push({
        propName,
        propVal: null,
      });
    }
  }

  // 遍历新属性，获取新增和变更属性
  for (let i = 0; i < keysOfNewProps.length; i++) {
    const propName = keysOfNewProps[i];
    const newPropValue = newProps[propName];
    const oldPropValue = oldProps != null ? oldProps[propName] : null;

    if (newPropValue === oldPropValue || (newPropValue == null && oldPropValue == null)) {
      // 新旧属性值未发生变化，或者新旧属性皆为空值，不需要进行处理
      continue;
    }

    if (propName === 'style') {
      if (oldPropValue) { // 之前 style 属性有设置非空值
        // 原来有这个 style，但现在没这个 style 了
        const oldStyleProps = Object.keys(oldPropValue);
        for (let j = 0; j < oldStyleProps.length; j++) {
          const styleProp = oldStyleProps[j];
          if (!newPropValue || !Object.prototype.hasOwnProperty.call(newPropValue, styleProp)) {
            updatesForStyle[styleProp] = '';
          }
        }

        // 现在有这个 style，但是和原来不相等
        const newStyleProps = newPropValue ? Object.keys(newPropValue) : [];
        for (let j = 0; j < newStyleProps.length; j++) {
          const styleProp = newStyleProps[j];
          if (oldPropValue[styleProp] !== newPropValue[styleProp]) {
            updatesForStyle[styleProp] = newPropValue[styleProp];
          }
        }
      } else { // 之前未设置 style 属性或者设置了空值
        if (Object.keys(updatesForStyle).length === 0) {
          toBeUpdatedProps.push({
            propName,
            propVal: null,
          });
        }
        updatesForStyle = newPropValue;
      }
    } else if (propName === 'dangerouslySetInnerHTML') {
      const newHTML = newPropValue ? newPropValue.__html : undefined;
      const oldHTML = oldPropValue ? oldPropValue.__html : undefined;
      if (newHTML != null) {
        if (oldHTML !== newHTML) {
          toBeUpdatedProps.push({
            propName,
            propVal: newPropValue,
          });
        }
      }
    } else if (propName === 'children') {
      if (typeof newPropValue === 'string' || typeof newPropValue === 'number') {
        toBeUpdatedProps.push({
          propName,
          propVal: String(newPropValue),
        });
      }
    } else if (isEventProp(propName)) {
      if (!allDelegatedHorizonEvents.has(propName)) {
        toBeUpdatedProps.push({
          propName,
          propVal: newPropValue,
        });
      }
    } else {
      toBeUpdatedProps.push({
        propName,
        propVal: newPropValue,
      });
    }
  }

  // 处理style
  if (Object.keys(updatesForStyle).length > 0) {
    toBeUpdatedProps.push({
      propName: 'style',
      propVal: updatesForStyle,
    });
  }

  return [...toBeDeletedProps, ...toBeUpdatedProps];
}
