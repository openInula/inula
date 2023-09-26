/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * This is a renderer of React that doesn't have a render target output.
 * It is useful to demonstrate the internals of the reconciler in isolation
 * and for testing semantics of reconciliation separate from the host
 * environment.
 */

import type {VNode, NodeListType, PromiseLike} from 'inula/src/renderer/Types';
import type {Updates} from 'inula/src/renderer/UpdateHandler';
import {findDOMByClassInst} from 'inula/src/renderer/vnode/VNodeUtils';

import * as Scheduler from 'react-test-renderer/src/Scheduler_mock';
import {
  TYPE_FRAGMENT,
  TYPE_ELEMENT,
} from 'inula/src/external/JSXElementType';

import enqueueTask from 'react-test-renderer/src/enqueueTask';
import {TreeRoot, DomComponent, DomText} from 'inula/src/renderer/vnode/VNodeTags';
import IsSomeRendererActing from 'react-test-renderer/src/IsSomeRendererActing';
import {initDomProps} from "react-test-renderer/src/ReactTestHostConfig";

type Container = {
  rootID: string,
  children: Array<Instance | TextInstance>,
  pendingChildren: Array<Instance | TextInstance>,
  ...
};
type Props = {
  prop: any,
  hidden: boolean,
  children?: mixed,
  bottom?: null | number,
  left?: null | number,
  right?: null | number,
  top?: null | number,
  ...
};
type Instance = {|
  type: string,
  id: number,
  children: Array<Instance | TextInstance>,
  text: string | null,
  prop: any,
  hidden: boolean,
  context: HostContext,
|};
type TextInstance = {|
  text: string,
  id: number,
  hidden: boolean,
  context: HostContext,
|};
type HostContext = Object;

const NO_CONTEXT = {};
const UPPERCASE_CONTEXT = {};
const UPDATE_SIGNAL = {a:''};
if (isDev) {
  Object.freeze(NO_CONTEXT);
  Object.freeze(UPDATE_SIGNAL);
}

function hideProperty(inst) {
  // Hide from unit tests
  Object.defineProperty(inst, 'id', { value: inst.id, enumerable: false });
  Object.defineProperty(inst, 'text', {
    value: inst.text,
    enumerable: false,
  });
  Object.defineProperty(inst, 'context', {
    value: inst.context,
    enumerable: false,
  });
  Object.defineProperty(inst, 'cloneNode', {
    enumerable: false,
  });
  Object.defineProperty(inst, 'append', {
    enumerable: false,
  });
}

function createReactNoop(reconciler: Function, useMutation: boolean) {
  let instanceCounter = 0;
  let hostDiffCounter = 0;
  let hostUpdateCounter = 0;
  let hostCloneCounter = 0;

  function appendChildToContainerOrInstance(
    parentInstance: Container | Instance,
    child: Instance | TextInstance,
  ): void {
    const index = parentInstance.children.indexOf(child);
    if (index !== -1) {
      parentInstance.children.splice(index, 1);
    }
    parentInstance.children.push(child);
  }

  function appendChildElement(
    // isContainer: boolean,
    parentInstance: Container,
    child: Instance | TextInstance,
  ): void {
    // if (isContainer) {
      // if (typeof parentInstance.rootID !== 'string') {
      //   // Some calls to this aren't typesafe.
      //   // This helps surface mistakes in tests.
      //   throw new Error(
      //     'appendChildToContainer() first argument is not a container.',
      //   );
      // }
    //   appendChildToContainerOrInstance(parentInstance, child);
    // } else {
      // if (typeof (parentInstance: any).rootID === 'string') {
      //   // Some calls to this aren't typesafe.
      //   // This helps surface mistakes in tests.
      //   throw new Error('appendChild() first argument is not an instance.');
      // }
      appendChildToContainerOrInstance(parentInstance, child);
    // }
  }

  function insertInContainerOrInstanceBefore(
    parentInstance: Container | Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    const index = parentInstance.children.indexOf(child);
    if (index !== -1) {
      parentInstance.children.splice(index, 1);
    }
    const beforeIndex = parentInstance.children.indexOf(beforeChild);
    if (beforeIndex === -1) {
      throw new Error('This child does not exist.');
    }
    parentInstance.children.splice(beforeIndex, 0, child);
  }

  function insertDomBefore(
    // isContainer: boolean,
    parentInstance: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ) {
    // if (isContainer) {
      // if (typeof parentInstance.rootID !== 'string') {
      //   // Some calls to this aren't typesafe.
      //   // This helps surface mistakes in tests.
      //   throw new Error(
      //     'insertInContainerBefore() first argument is not a container.',
      //   );
      // }
      // insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
    // } else {
      // if (typeof (parentInstance: any).rootID === 'string') {
      //   // Some calls to this aren't typesafe.
      //   // This helps surface mistakes in tests.
      //   throw new Error('insertBefore() first argument is not an instance.');
      // }
      insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
    // }
  }

  function clearContainer(container: Container): void {
    container.children.splice(0);
  }

  function removeChildFromContainerOrInstance(
    parentInstance: Container | Instance,
    child: Instance | TextInstance,
  ): void {
    const index = parentInstance.children.indexOf(child);
    if (index === -1) {
      throw new Error('This child does not exist.');
    }
    parentInstance.children.splice(index, 1);
  }

  function removeChildDom(
    // isContainer: boolean,
    parentInstance: Container,
    child: Instance | TextInstance,
  ) {
    // if (isContainer) {
    //   if (typeof parentInstance.rootID !== 'string') {
    //     // Some calls to this aren't typesafe.
    //     // This helps surface mistakes in tests.
    //     throw new Error(
    //       'removeChildFromContainer() first argument is not a container.',
    //     );
    //   }
    //   removeChildFromContainerOrInstance(parentInstance, child);
    // } else {
    //   if (typeof (parentInstance: any).rootID === 'string') {
    //     // Some calls to this aren't typesafe.
    //     // This helps surface mistakes in tests.
    //     throw new Error('removeChild() first argument is not an instance.');
    //   }
      removeChildFromContainerOrInstance(parentInstance, child);
    // }
  }

  function cloneInstance(
    instance: Instance,
    updatePayload: null | Object,
    type: string,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: Object,
    keepChildren: boolean,
    recyclableInstance: null | Instance,
  ): Instance {
    const clone = {
      id: instance.id,
      type: type,
      children: keepChildren ? instance.children : [],
      text: isTextChild(type, newProps)
        ? computeText((newProps.children: any) + '', instance.context)
        : null,
      prop: newProps.prop,
      hidden: !!newProps.hidden,
      context: instance.context,
    };
    Object.defineProperty(clone, 'id', {
      value: clone.id,
      enumerable: false,
    });
    Object.defineProperty(clone, 'text', {
      value: clone.text,
      enumerable: false,
    });
    Object.defineProperty(clone, 'context', {
      value: clone.context,
      enumerable: false,
    });
    hostCloneCounter++;
    return clone;
  }

  function isTextChild(type: string, props: Props): boolean {
    if (type === 'errorInBeginPhase') {
      throw new Error('Error in host config.');
    }
    return (
      typeof props.children === 'string' || typeof props.children === 'number'
    );
  }

  function computeText(rawText, hostContext) {
    return hostContext === UPPERCASE_CONTEXT ? rawText.toUpperCase() : rawText;
  }

  const sharedHostConfig = {
    getNSCtx() {
      return NO_CONTEXT;
    },

    newDom(
      type: string,
      props: Props,
      rootContainerInstance: Container,
      hostContext: HostContext,
    ): Instance {
      if (type === 'errorInCompletePhase') {
        throw new Error('Error in host config.');
      }
      const inst = {
        id: instanceCounter++,
        type: type,
        children: [],
        text: isTextChild(type, props)
          ? computeText((props.children: any) + '', hostContext)
          : null,
        prop: props.prop,
        hidden: !!props.hidden,
        context: hostContext,
      };
      inst.cloneNode = function(isCloneChild) {
        const clone = {
          id: this.id,
          type: this.type,
          children: isCloneChild ? this.children : [],
          text: this.text,
          prop: this.prop,
          hidden: this.hidden,
          context: this.context,
        }
        hideProperty(clone);
      return clone;
      };
      inst.append = function(node) {
        this.children.push(node);
      }
      hideProperty(inst);
      return inst;
    },

    initDomProps(
      domElement: Instance,
      type: string,
      props: Props,
    ): boolean {
      return false;
    },

    getPropChangeList(
      instance: Instance,
      type: string,
      oldProps: Props,
      newProps: Props,
    ): null | {...} {
      if (type === 'errorInCompletePhase') {
        throw new Error('Error in host config.');
      }
      if (oldProps === null) {
        throw new Error('Should have old props');
      }
      if (newProps === null) {
        throw new Error('Should have new props');
      }
      hostDiffCounter++;
      return UPDATE_SIGNAL;
    },

    isTextChild,

    newTextDom(
      text: string,
      rootContainerInstance: Container,
      hostContext: Object,
      internalInstanceHandle: Object,
    ): TextInstance {
      if (hostContext === UPPERCASE_CONTEXT) {
        text = text.toUpperCase();
      }
      const inst = {
        text: text,
        id: instanceCounter++,
        hidden: false,
        context: hostContext,
      };
      // Hide from unit tests
      Object.defineProperty(inst, 'id', {value: inst.id, enumerable: false});
      Object.defineProperty(inst, 'context', {
        value: inst.context,
        enumerable: false,
      });
      return inst;
    },

    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,

    prepareForSubmit(): void {},

    resetAfterSubmit(): void {},

    now: Scheduler.now,

    isPrimaryRenderer: true,
    warnsIfNotActing: true,
    supportsHydration: false,

    getFundamentalComponentInstance(fundamentalInstance): Instance {
      const {impl, props, state} = fundamentalInstance;
      return impl.getInstance(null, props, state);
    },

    mountFundamentalComponent(fundamentalInstance): void {
      const {impl, instance, props, state} = fundamentalInstance;
      const onMount = impl.onUpdate;
      if (onMount !== undefined) {
        onMount(null, instance, props, state);
      }
    },

    shouldUpdateFundamentalComponent(fundamentalInstance): boolean {
      const {impl, instance, prevProps, props, state} = fundamentalInstance;
      const shouldUpdate = impl.shouldUpdate;
      if (shouldUpdate !== undefined) {
        return shouldUpdate(null, instance, prevProps, props, state);
      }
      return true;
    },

    updateFundamentalComponent(fundamentalInstance): void {
      const {impl, instance, prevProps, props, state} = fundamentalInstance;
      const onUpdate = impl.onUpdate;
      if (onUpdate !== undefined) {
        onUpdate(null, instance, prevProps, props, state);
      }
    },

    unmountFundamentalComponent(fundamentalInstance): void {
      const {impl, instance, props, state} = fundamentalInstance;
      const onUnmount = impl.onUnmount;
      if (onUnmount !== undefined) {
        onUnmount(null, instance, props, state);
      }
    },

    beforeActiveInstanceBlur() {
      // NO-OP
    },

    afterActiveInstanceBlur() {
      // NO-OP
    },

    prePortal() {
      // NO-OP
    },

    prepareScopeUpdate() {},

  };

  const hostConfig = useMutation
    ? {
        ...sharedHostConfig,

        supportsMutation: true,
        supportsPersistence: false,

        submitMount(instance: Instance, type: string, newProps: Props): void {
          // Noop
        },

        submitDomUpdate(
          tag: string,
          vNode: Object,
        ): void {
          if (tag === DomComponent) {
            // DomComponent类型
            const instance = vNode.realNode;
            const newProps = vNode.props;
            const oldProps = !vNode.isCreated ? vNode.oldProps : newProps;
            if (oldProps === null) {
              throw new Error('Should have old props');
            }
            hostUpdateCounter++;
            instance.prop = newProps.prop;
            instance.hidden = !!newProps.hidden;
            if (isTextChild(vNode.type, newProps)) {
              instance.text = computeText(
                (newProps.children: any) + '',
                instance.context,
              );
            }
          } else if (tag === DomText) {
            // DomText类型
            const instance = vNode.realNode;
            const newProps = vNode.props;
            hostUpdateCounter++;
            instance.text = computeText(newProps, instance.context);
          }
        },
        appendChildElement,
        insertDomBefore,
        removeChildDom,
        clearContainer,

        hideDom(tag: number, instance: Instance): void {
          instance.hidden = true;
        },

        unHideDom(tag: string, instance: Instance, props: Props): void {
          if (tag === DomComponent) {
            // DomComponent类型
            if (!props.hidden) {
              instance.hidden = false;
            }
          } else if (tag === DomText) {
            // DomText类型
            instance.hidden = false;
          }
        },

        clearText(instance: Instance): void {
          instance.text = null;
        },
      }
    : {
        ...sharedHostConfig,
        supportsMutation: false,
        supportsPersistence: true,

        cloneInstance,
        clearContainer,

        createContainerChildSet(
          container: Container,
        ): Array<Instance | TextInstance> {
          return [];
        },

        appendChildToContainerChildSet(
          childSet: Array<Instance | TextInstance>,
          child: Instance | TextInstance,
        ): void {
          childSet.push(child);
        },

        finalizeContainerChildren(
          container: Container,
          newChildren: Array<Instance | TextInstance>,
        ): void {
          container.pendingChildren = newChildren;
          if (
            newChildren.length === 1 &&
            newChildren[0].text === 'Error when completing root'
          ) {
            // Trigger an error for testing purposes
            throw Error('Error when completing root');
          }
        },

        replaceContainerChildren(
          container: Container,
          newChildren: Array<Instance | TextInstance>,
        ): void {
          container.children = newChildren;
        },

        cloneHiddenInstance(
          instance: Instance,
          type: string,
          props: Props,
          internalInstanceHandle: Object,
        ): Instance {
          const clone = cloneInstance(
            instance,
            null,
            type,
            props,
            props,
            internalInstanceHandle,
            true,
            null,
          );
          clone.hidden = true;
          return clone;
        },

        cloneHiddenTextInstance(
          instance: TextInstance,
          text: string,
          internalInstanceHandle: Object,
        ): TextInstance {
          const clone = {
            text: instance.text,
            id: instanceCounter++,
            hidden: true,
            context: instance.context,
          };
          // Hide from unit tests
          Object.defineProperty(clone, 'id', {
            value: clone.id,
            enumerable: false,
          });
          Object.defineProperty(clone, 'context', {
            value: clone.context,
            enumerable: false,
          });
          return clone;
        },
      };

  const NoopRenderer = reconciler(hostConfig);

  const rootContainers = new Map();
  const roots = new Map();
  const DEFAULT_ROOT_ID = '<default>';

  function childToJSX(child, text) {
    if (text !== null) {
      return text;
    }
    if (child === null) {
      return null;
    }
    if (typeof child === 'string') {
      return child;
    }
    if (Array.isArray(child)) {
      if (child.length === 0) {
        return null;
      }
      if (child.length === 1) {
        return childToJSX(child[0], null);
      }
      // $FlowFixMe
      const children = child.map(c => childToJSX(c, null));
      if (children.every(c => typeof c === 'string' || typeof c === 'number')) {
        return children.join('');
      }
      return children;
    }
    if (Array.isArray(child.children)) {
      // This is an instance.
      const instance: Instance = (child: any);
      const children = childToJSX(instance.children, instance.text);
      const props = ({prop: instance.prop}: any);
      if (instance.hidden) {
        props.hidden = true;
      }
      if (children !== null) {
        props.children = children;
      }
      return {
        vtype: TYPE_ELEMENT,
        type: instance.type,
        key: null,
        ref: null,
        props: props,
        _owner: null,
        _store: isDev ? {} : undefined,
      };
    }
    // This is a text instance
    const textInstance: TextInstance = (child: any);
    if (textInstance.hidden) {
      return '';
    }
    return textInstance.text;
  }

  function getChildren(root) {
    if (root) {
      return root.children;
    } else {
      return null;
    }
  }

  function getPendingChildren(root) {
    if (root) {
      return root.pendingChildren;
    } else {
      return null;
    }
  }

  function getChildrenAsJSX(root) {
    const children = childToJSX(getChildren(root), null);
    if (children === null) {
      return null;
    }
    if (Array.isArray(children)) {
      return {
        vtype: TYPE_ELEMENT,
        type: TYPE_FRAGMENT,
        key: null,
        ref: null,
        props: {children},
        _owner: null,
        _store: isDev ? {} : undefined,
      };
    }
    return children;
  }

  function getPendingChildrenAsJSX(root) {
    const children = childToJSX(getChildren(root), null);
    if (children === null) {
      return null;
    }
    if (Array.isArray(children)) {
      return {
        vtype: TYPE_ELEMENT,
        type: TYPE_FRAGMENT,
        key: null,
        ref: null,
        props: {children},
        _owner: null,
        _store: isDev ? {} : undefined,
      };
    }
    return children;
  }

  let idCounter = 0;

  const ReactNoop = {
    _Scheduler: Scheduler,

    getChildren(rootID: string = DEFAULT_ROOT_ID) {
      const container = rootContainers.get(rootID);
      return getChildren(container);
    },

    getPendingChildren(rootID: string = DEFAULT_ROOT_ID) {
      const container = rootContainers.get(rootID);
      return getPendingChildren(container);
    },

    getOrCreateRootContainer(rootID: string = DEFAULT_ROOT_ID) {
      let root = roots.get(rootID);
      if (!root) {
        const container = {rootID: rootID, pendingChildren: [], children: []};
        container.append = function(node) {
          this.children.push(node);
        }
        container.addEventListener = function() {};
        rootContainers.set(rootID, container);
        root = NoopRenderer.createVNode(TreeRoot, container);
        roots.set(rootID, root);
      }
      return root.realNode;
    },

    // TODO: Replace ReactNoop.render with createRoot + root.render
    createRoot() {
      const container = {
        rootID: '' + idCounter++,
        pendingChildren: [],
        children: [],
      };
      const root = NoopRenderer.createVNode(TreeRoot, container);
      return {
        _Scheduler: Scheduler,
        render(children: NodeListType) {
          NoopRenderer.startUpdate(children, root, null);
        },
        getChildren() {
          return getChildren(container);
        },
        getChildrenAsJSX() {
          return getChildrenAsJSX(container);
        },
      };
    },

    createBlockingRoot() {
      const container = {
        rootID: '' + idCounter++,
        pendingChildren: [],
        children: [],
      };
      const root = NoopRenderer.createVNode(
        TreeRoot,
        container,
      );
      return {
        _Scheduler: Scheduler,
        render(children: NodeListType) {
          NoopRenderer.startUpdate(children, root, null);
        },
        getChildren() {
          return getChildren(container);
        },
        getChildrenAsJSX() {
          return getChildrenAsJSX(container);
        },
      };
    },

    createLegacyRoot() {
      const container = {
        rootID: '' + idCounter++,
        pendingChildren: [],
        children: [],
      };
      const root = NoopRenderer.createVNode(TreeRoot, container);
      return {
        _Scheduler: Scheduler,
        render(children: NodeListType) {
          NoopRenderer.startUpdate(children, root, null);
        },
        getChildren() {
          return getChildren(container);
        },
        getChildrenAsJSX() {
          return getChildrenAsJSX(container);
        },
      };
    },

    getChildrenAsJSX(rootID: string = DEFAULT_ROOT_ID) {
      const container = rootContainers.get(rootID);
      return getChildrenAsJSX(container);
    },

    getPendingChildrenAsJSX(rootID: string = DEFAULT_ROOT_ID) {
      const container = rootContainers.get(rootID);
      return getPendingChildrenAsJSX(container);
    },

    createPortal(
      children: NodeListType,
      container: Container,
      key: ?string = null,
    ) {
      return NoopRenderer.createPortal(children, container, key);
    },

    // Shortcut for testing a single root
    render(element: React$Element<any>, callback: ?Function) {
      ReactNoop.renderToRootWithID(element, DEFAULT_ROOT_ID, callback);
    },

    renderLegacySyncRoot(element: React$Element<any>, callback: ?Function) {
      const rootID = DEFAULT_ROOT_ID;
      const container = ReactNoop.getOrCreateRootContainer(rootID);
      const root = roots.get(container.rootID);
      NoopRenderer.startUpdate(element, root, callback);
    },

    renderToRootWithID(
      element: React$Element<any>,
      rootID: string,
      callback: ?Function,
    ) {
      const container = ReactNoop.getOrCreateRootContainer(rootID);
      const root = roots.get(container.rootID);
      NoopRenderer.startUpdate(element, root, callback);
    },

    unmountRootWithID(rootID: string) {
      const root = roots.get(rootID);
      if (root) {
        NoopRenderer.startUpdate(null, root, () => {
          roots.delete(rootID);
          rootContainers.delete(rootID);
        });
      }
    },

    findInstance(
      componentOrElement: Element,
    ): null | Instance | TextInstance {
      if (componentOrElement == null) {
        return null;
      }
      // Unsound duck typing.
      const component = (componentOrElement: any);
      if (typeof component.id === 'number') {
        return component;
      }

      return findDOMByClassInst(component);
    },

    flushNextYield(): Array<mixed> {
      Scheduler.unstable_flushNumberOfYields(1);
      return Scheduler.unstable_clearYields();
    },

    flushWithHostCounters(
      fn: () => void,
    ):
      | {|
          hostDiffCounter: number,
          hostUpdateCounter: number,
        |}
      | {|
          hostDiffCounter: number,
          hostCloneCounter: number,
        |} {
      hostDiffCounter = 0;
      hostUpdateCounter = 0;
      hostCloneCounter = 0;
      try {
        Scheduler.unstable_flushAll();
        return useMutation
          ? {
              hostDiffCounter,
              hostUpdateCounter,
            }
          : {
              hostDiffCounter,
              hostCloneCounter,
            };
      } finally {
        hostDiffCounter = 0;
        hostUpdateCounter = 0;
        hostCloneCounter = 0;
      }
    },
    runWithHostCounters(
      fn: () => void,
    ):
      | {|
          hostDiffCounter: number,
          hostUpdateCounter: number,
        |}
      | {|
          hostDiffCounter: number,
          hostCloneCounter: number,
        |} {
      hostDiffCounter = 0;
      hostUpdateCounter = 0;
      hostCloneCounter = 0;
      try {
        fn();
        return useMutation
          ? {
              hostDiffCounter,
              hostUpdateCounter,
            }
          : {
              hostDiffCounter,
              hostCloneCounter,
            };
      } finally {
        hostDiffCounter = 0;
        hostUpdateCounter = 0;
        hostCloneCounter = 0;
      }
    },

    expire: Scheduler.unstable_advanceTime,

    flushExpired(): Array<mixed> {
      return Scheduler.unstable_flushExpired();
    },

    runSync: NoopRenderer.runSync,

    asyncUpdates: NoopRenderer.asyncUpdates,

    syncUpdates: NoopRenderer.syncUpdates,

    deferredUpdates: NoopRenderer.deferredUpdates,

    discreteUpdates: NoopRenderer.discreteUpdates,

    flushDiscreteUpdates: NoopRenderer.flushDiscreteUpdates,

    flushSync(fn: () => mixed) {
      fn();
    },

    flushPassiveEffects: NoopRenderer.runAsyncEffects,

    act: noopAct,

    // Logs the current state of the tree.
    dumpTree(rootID: string = DEFAULT_ROOT_ID) {
      const root = roots.get(rootID);
      const rootContainer = rootContainers.get(rootID);
      if (!root || !rootContainer) {
        // eslint-disable-next-line react-internal/no-production-logging
        console.log('Nothing rendered yet.');
        return;
      }

      const bufferedLog = [];
      function log(...args) {
        bufferedLog.push(...args, '\n');
      }

      function logHostInstances(
        children: Array<Instance | TextInstance>,
        depth,
      ) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const indent = '  '.repeat(depth);
          if (typeof child.text === 'string') {
            log(indent + '- ' + child.text);
          } else {
            // $FlowFixMe - The child should've been refined now.
            log(indent + '- ' + child.type + '#' + child.id);
            // $FlowFixMe - The child should've been refined now.
            logHostInstances(child.children, depth + 1);
          }
        }
      }
      function logContainer(container: Container, depth) {
        log('  '.repeat(depth) + '- [root#' + container.rootID + ']');
        logHostInstances(container.children, depth + 1);
      }

      function logUpdateQueue(updates: Updates, depth) {
        log('  '.repeat(depth + 1) + 'QUEUED UPDATES');

        const pendingUpdates = updates || [];
        if (pendingUpdates && pendingUpdates.length > 0) {
          pendingUpdates.forEach(update => {
            log(
              '  '.repeat(depth + 1) + '~',
              '[' + update.expirationTime + ']',
            );
          })
        }
      }

      function logFiber(fiber: VNode, depth) {
        log(
          '  '.repeat(depth) +
            '- ' +
            // need to explicitly coerce Symbol to a string
            (fiber.type ? fiber.type.name || fiber.type.toString() : '[root]'),
          '[' +
            fiber.childExpirationTime +
            (fiber.props ? '*' : '') +
            ']',
        );
        if (fiber.updates) {
          logUpdateQueue(fiber.updates, depth);
        }
        // const childInProgress = fiber.progressedChild;
        // if (childInProgress && childInProgress !== fiber.child) {
        //   log(
        //     '  '.repeat(depth + 1) + 'IN PROGRESS: ' + fiber.pendingWorkPriority,
        //   );
        //   logFiber(childInProgress, depth + 1);
        //   if (fiber.child) {
        //     log('  '.repeat(depth + 1) + 'CURRENT');
        //   }
        // } else if (fiber.child && fiber.updateQueue) {
        //   log('  '.repeat(depth + 1) + 'CHILDREN');
        // }
        // if (fiber.child) {
        //   logFiber(fiber.child, depth + 1);
        // }
        // if (fiber.sibling) {
        //   logFiber(fiber.sibling, depth);
        // }
      }

      log('HOST INSTANCES:');
      logContainer(rootContainer, 0);
      log('FIBERS:');
      logFiber(root, 0);

      // eslint-disable-next-line react-internal/no-production-logging
      console.log(...bufferedLog);
    },

    getRoot(rootID: string = DEFAULT_ROOT_ID) {
      return roots.get(rootID);
    },
  };

  // This version of `act` is only used by our tests. Unlike the public version
  // of `act`, it's designed to work identically in both production and
  // development. It may have slightly different behavior from the public
  // version, too, since our constraints in our test suite are not the same as
  // those of developers using React — we're testing React itself, as opposed to
  // building an app with React.

  const {asyncUpdates} = NoopRenderer;
  let actingUpdatesScopeDepth = 0;

  function noopAct(scope: () => PromiseLike<mixed> | void) {
    if (Scheduler.unstable_flushAllWithoutAsserting === undefined) {
      throw Error(
        'This version of `act` requires a special mock build of Scheduler.',
      );
    }
    if (setTimeout._isMockFunction !== true) {
      throw Error(
        "This version of `act` requires Jest's timer mocks " +
          '(i.e. jest.useFakeTimers).',
      );
    }

    const previousActingUpdatesScopeDepth = actingUpdatesScopeDepth;
    const previousIsSomeRendererActing = IsSomeRendererActing.current;
    IsSomeRendererActing.current = true;
    actingUpdatesScopeDepth++;

    const unwind = () => {
      actingUpdatesScopeDepth--;
      IsSomeRendererActing.current = previousIsSomeRendererActing;

      if (isDev) {
        if (actingUpdatesScopeDepth > previousActingUpdatesScopeDepth) {
          // if it's _less than_ previousActingUpdatesScopeDepth, then we can
          // assume the 'other' one has warned
          console.error(
            'You seem to have overlapping act() calls, this is not supported. ' +
              'Be sure to await previous act() calls before making a new one. ',
          );
        }
      }
    };

    // TODO: This would be way simpler if 1) we required a promise to be
    // returned and 2) we could use async/await. Since it's only our used in
    // our test suite, we should be able to.
    try {
      const thenable = asyncUpdates(scope);
      if (
        typeof thenable === 'object' &&
        thenable !== null &&
        typeof thenable.then === 'function'
      ) {
        return {
          then(resolve: () => void, reject: (error: mixed) => void) {
            thenable.then(
              () => {
                flushActWork(
                  () => {
                    unwind();
                    resolve();
                  },
                  error => {
                    unwind();
                    reject(error);
                  },
                );
              },
              error => {
                unwind();
                reject(error);
              },
            );
          },
        };
      } else {
        try {
          // TODO: Let's not support non-async scopes at all in our tests. Need to
          // migrate existing tests.
          let didFlushWork;
          do {
            didFlushWork = Scheduler.unstable_flushAllWithoutAsserting();
          } while (didFlushWork);
        } finally {
          unwind();
        }
      }
    } catch (error) {
      unwind();
      throw error;
    }
  }

  function flushActWork(resolve, reject) {
    // Flush suspended fallbacks
    // $FlowFixMe: Flow doesn't know about global Jest object
    jest.runOnlyPendingTimers();
    enqueueTask(() => {
      try {
        const didFlushWork = Scheduler.unstable_flushAllWithoutAsserting();
        if (didFlushWork) {
          flushActWork(resolve, reject);
        } else {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  return ReactNoop;
}

export default createReactNoop;
