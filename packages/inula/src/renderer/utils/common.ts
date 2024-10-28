import { InulaReconciler } from '..';
import { ElementType } from '../Types';
import { Props } from './InternalKeys';

// button、input、select、textarea、如果有 autoFocus 属性需要focus
export function shouldAutoFocus(tagName: string, props: Props): boolean {
  const { button, input, select, textarea } = InulaReconciler.hostConfig.elementConfig;
  const types = [button.nodeName, input.nodeName, select.nodeName, textarea.nodeName];

  return types.includes(tagName) ? Boolean(props.autoFocus) : false;
}

export function isNotNull(object: any): boolean {
  return object !== null && object !== undefined;
}
export function getTag(element: ElementType) {
  return element?.nodeName?.toLowerCase();
}

export function isInputElement(element: ElementType): boolean {
  return getTag(element) === InulaReconciler.hostConfig.elementConfig.input.nodeName;
}
export function isElement(element: ElementType) {
  return element.nodeType === InulaReconciler.hostConfig.elementConfig.common.nodeType;
}

export function isText(element: ElementType) {
  return element.nodeType === InulaReconciler.hostConfig.elementConfig.text.nodeType;
}

export function isDocument(dom: ElementType) {
  return dom.nodeType === 9;
}
