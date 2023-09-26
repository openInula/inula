/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import {DomComponent, DomText} from 'inula/src/renderer/vnode/VNodeTags';

export type Type = string;
export type Props = Object;
export type Container = {|
  children: Array<Instance | TextInstance>,
  createNodeMock: Function,
  tag: 'CONTAINER',
|};
export type Instance = {|
  type: string,
  props: Object,
  isHidden: boolean,
  children: Array<Instance | TextInstance>,
  internalInstanceHandle: Object,
  rootContainerInstance: Container,
  tag: 'INSTANCE',
|};
export type TextInstance = {|
  text: string,
  isHidden: boolean,
  tag: 'TEXT',
|};
export type HydratableInstance = Instance | TextInstance;
export type PublicInstance = Instance | TextInstance;
export type HostContext = Object;
export type UpdatePayload = Object;
export type NoTimeout = -1;

export type RendererInspectionConfig = $ReadOnly<{||}>;

const NO_CONTEXT = {};
const UPDATE_SIGNAL = {};
const nodeToInstanceMap = new WeakMap();

if (isDev) {
  Object.freeze(NO_CONTEXT);
  Object.freeze(UPDATE_SIGNAL);
}

export function appendChildElement(
  // isContainer: boolean,
  parentInstance: Instance | Container,
  child: Instance | TextInstance,
) {
  if (isDev) {
    if (!Array.isArray(parentInstance.children)) {
      console.error(
        'An invalid container has been provided. ' +
        'This may indicate that another renderer is being used in addition to the test renderer. ' +
        '(For example, ReactDOM.createPortal inside of a ReactTestRenderer tree.) ' +
        'This is not supported.',
      );
    }
  }
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }
  parentInstance.children.push(child);
}

export function insertDomBefore(
  // isContainer: boolean,
  parentInstance: Instance | Container,
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance,
) {
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }
  const beforeIndex = parentInstance.children.indexOf(beforeChild);
  parentInstance.children.splice(beforeIndex, 0, child);
}

export function insertBefore(
  parentInstance: Instance | Container,
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance,
): void {
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }
  const beforeIndex = parentInstance.children.indexOf(beforeChild);
  parentInstance.children.splice(beforeIndex, 0, child);
}

export function removeChildDom(
  // isContainer: boolean,
  parentInstance: Instance | Container,
  child: Instance | TextInstance,
) {
  const index = parentInstance.children.indexOf(child);
  parentInstance.children.splice(index, 1);
}

export function clearContainer(container: Container): void {
  container.children.splice(0);
}

export function getNSCtx(
  rootContainerInstance: Container,
  parentHostContext: HostContext,
  type: string,
) {
  return NO_CONTEXT;
}

export function prepareForSubmit(): void {
}

export function resetAfterSubmit(): void {
  // noop
}

export function newDom(
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: Object,
  internalInstanceHandle: Object,
): Instance {
  return {
    type:type,
    props,
    isHidden: false,
    children: [],
    internalInstanceHandle,
    rootContainerInstance,
    tag: 'INSTANCE',
  };
}

export function initDomProps(
  testElement: Instance,
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: Object,
): boolean {
  return false;
}

export function getPropChangeList(
  testElement: Instance,
  type: string,
  oldProps: Props,
  newProps: Props,
  rootContainerInstance: Container,
  hostContext: Object,
): null | {...} {
  return UPDATE_SIGNAL;
}

export function isTextChild(type: string, props: Props): boolean {
  return false;
}

export function newTextDom(
  text: string,
  rootContainerInstance: Container,
  hostContext: Object,
  internalInstanceHandle: Object,
): TextInstance {
  return {
    text,
    isHidden: false,
    tag: 'TEXT',
  };
}

export const isPrimaryRenderer = false;
export const warnsIfNotActing = true;

export const scheduleTimeout = setTimeout;
export const cancelTimeout = clearTimeout;
export const noTimeout = -1;

// -------------------
//     Mutation
// -------------------

export function submitDomUpdate(
  tag: string,
  vNode: Object,
): void {
  if (tag === DomComponent) {
    const newProps = vNode.props;
    const instance = vNode.realNode;
    instance.type = vNode.type;
    instance.props = newProps;
  } else if (tag === DomText) {
    const instance = vNode.realNode;
    instance.text = vNode.props;
  }
}

export function submitMount(
  instance: Instance,
  type: string,
  newProps: Props,
  internalInstanceHandle: Object,
): void {
  // noop
}

export function clearText(testElement: Instance): void {
  // noop
}

export function hideDom(tag: number, instance: Instance) : void {
  instance.isHidden = true;
}

export function unHideDom(tag: number, instance: Instance, props: Props) :void {
  instance.isHidden = false;
}

export function beforeActiveInstanceBlur() {
  // noop
}

export function afterActiveInstanceBlur() {
  // noop
}

export function prePortal(portalInstance: Instance): void {
  // noop
}
