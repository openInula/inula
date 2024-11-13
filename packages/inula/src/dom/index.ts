import { ElementType, HostConfigType } from '../renderer/Types';
import {
  createElement as createDom,
  clearText,
  appendChildElement,
  removeChildElement,
  insertElementBefore,
  hideElement,
  unHideElement,
  isTextChild,
  handleControledElements,
  createText,
  prepareForSubmit,
  resetAfterSubmit,
} from './DOMOperator';
import { setStyles } from './DOMPropertiesHandler/StyleHandler';
import { updateCommonProp } from './DOMPropertiesHandler/UpdateCommonProp';
import { updateValue } from './valueHandler';
import { getPropsWithoutValue } from './valueHandler';
import { watchValueChange } from './valueHandler/ValueChangeHandler';
import { setInitValue } from './valueHandler';
import { InulaDom } from './utils/Interface';
import { updateInputHandlerIfChanged } from './valueHandler/ValueChangeHandler';

export const defaultHostConfig: Partial<HostConfigType> = {
  elementConfig: {
    common: document.createElement('div'),
    text: document.createTextNode(''),
    input: document.createElement('input'),
    button: document.createElement('button'),
    select: document.createElement('select'),
    textarea: document.createElement('textarea'),
    document: document,
  },
  addEventListener(element, eventName, handler, isCapture) {
    element.addEventListener(eventName, handler, isCapture);
  },
  removeEventListener(element, eventName, handler) {
    element.removeEventListener(eventName, handler);
  },
  createElement(tagName, props, parentNamespace, rootElement) {
    return createDom(tagName, props, parentNamespace, rootElement as Element);
  },
  createText(text) {
    return createText(text) as ElementType;
  },
  getProps(type, element, props) {
    return getPropsWithoutValue(type, element as Element, props);
  },
  handleControledInputElements(target, type, props) {
    return handleControledElements(target as Element, type, props);
  },
  isTextChild(type, props) {
    return isTextChild(type, props);
  },
  setProps(element, propName, propVal, isNativeTag, isInit) {
    if (propName === 'style') {
      setStyles(element, propVal);
    } else if (propName === 'children') {
      // 只处理纯文本子节点，其他children在VNode树中处理
      const type = typeof propVal;
      if (type === 'string' || type === 'number') {
        element.textContent = propVal;
      }
    } else if (propName === 'dangerouslySetInnerHTML') {
      element.innerHTML = propVal.__html;
    } else if (!isInit || (propVal !== null && propVal !== undefined)) {
      updateCommonProp(element as Element, propName, propVal, isNativeTag);
    }
  },
  updateInputValue(type, element, props) {
    updateValue(type, element as Element, props);
  },
  onSubmit(tag, type, element, newProps) {
    if (tag === 'Component') {
      if (
        type === 'input' &&
        newProps.type === 'radio' &&
        newProps.name !== null &&
        newProps.name !== undefined &&
        newProps.checked !== null &&
        newProps.checked !== undefined
      ) {
        updateCommonProp(element as Element, 'checked', newProps.checked, true);
      }
    } else {
      if (element != null) {
        // text类型
        element.textContent = newProps;
      }
    }
  },
  shouldTriggerChangeEvent(targetElement, elementTag, evtName) {
    const { type } = targetElement;
    if (elementTag === 'select' || (elementTag === 'input' && type === 'file')) {
      return evtName === 'change';
    } else if (elementTag === 'input' && (type === 'checkbox' || type === 'radio')) {
      if (evtName === 'click') {
        return updateInputHandlerIfChanged(targetElement);
      }
    } else if (targetElement.nodeType === this.elementConfig?.input.nodeType) {
      if (evtName === 'input' || evtName === 'change') {
        return updateInputHandlerIfChanged(targetElement);
      }
    }
    return false;
  },
  hideElement(tag, element) {
    hideElement(tag, element);
  },
  unHideElement(tag, element, props) {
    unHideElement(tag, element, props);
  },
  clearText(element) {
    clearText(element as Element);
  },
  appendChildElement(parent, child) {
    appendChildElement(parent as Element, child as Element | Text);
  },
  insertElementBefore(parent, child, beforeChild) {
    insertElementBefore(parent as Element, child as Element | Text, beforeChild as Element | Text);
  },
  removeChildElement(parent, child) {
    removeChildElement(parent as Element, child as Element | Text);
  },
  prepareForSubmit() {
    prepareForSubmit();
  },
  resetAfterSubmit() {
    resetAfterSubmit();
  },
  onPropInit(element, tagName, rawProps) {
    if (tagName === this.elementConfig?.input.nodeName || tagName === this.elementConfig?.textarea.nodeName) {
      // 增加监听value和checked的set、get方法
      watchValueChange(element);
    }

    // 设置dom.value值，触发受控组件的set方法
    setInitValue(tagName, element as InulaDom, rawProps);
  },
};
