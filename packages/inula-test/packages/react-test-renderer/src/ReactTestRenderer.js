/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {VNode, PromiseLike} from 'inula/src/renderer/Types';
import type {Instance, TextInstance} from './ReactTestHostConfig';

import * as Scheduler from 'react-test-renderer/src/Scheduler_mock';
import {
  getFirstCustomDom,
  createVNode,
  startUpdate,
  asyncUpdates,
} from 'inula/src/renderer/Renderer';
import {act} from './ReactFiberAct';
import {getSiblingVNode} from 'inula/src/renderer/vnode/VNodeUtils';
import {
  Fragment,
  FunctionComponent,
  ClassComponent,
  DomComponent,
  DomPortal,
  DomText,
  TreeRoot,
  ContextConsumer,
  ContextProvider,
  ForwardRef,
  Profiler,
  MemoComponent,
  IncompleteClassComponent,
} from 'inula/src/renderer/vnode/VNodeTags';
import enqueueTask from 'react-test-renderer/src/enqueueTask';

import {throwIfTrue} from 'inula/src/renderer/utils/throwIfTrue';

import IsSomeRendererActing from 'react-test-renderer/src/IsSomeRendererActing';

type TestRendererOptions = {
  createNodeMock: (element: React$Element<any>) => any,
  unstable_isConcurrent: boolean,
  ...
};

type ReactTestRendererJSON = {|
  type: string,
  props: {[propName: string]: any, ...},
  children: null | Array<ReactTestRendererNode>,
  vtype?: Symbol, // Optional because we add it with defineProperty().
|};
type ReactTestRendererNode = ReactTestRendererJSON | string;

type FindOptions = $Shape<{
  // performs a "greedy" search: if a matching node is found, will continue
  // to search within the matching node's children. (default: true)
  deep: boolean,
  ...
}>;

export type Predicate = (node: ReactTestInstance) => ?boolean;

const defaultTestOptions = {
  createNodeMock: function() {
    return null;
  },
};

function toJSON(inst: Instance | TextInstance): ReactTestRendererNode | null {
  if (inst.isHidden) {
    // Omit timed out children from output entirely. This seems like the least
    // surprising behavior. We could perhaps add a separate API that includes
    // them, if it turns out people need it.
    return null;
  }
  switch (inst.tag) {
    case 'TEXT':
      return inst.text;
    case 'INSTANCE': {
      /* eslint-disable no-unused-vars */
      // We don't include the `children` prop in JSON.
      // Instead, we will include the actual rendered children.
      const {children, ...props} = inst.props;
      /* eslint-enable */
      let renderedChildren = null;
      if (inst.children && inst.children.length) {
        for (let i = 0; i < inst.children.length; i++) {
          const renderedChild = toJSON(inst.children[i]);
          if (renderedChild !== null) {
            if (renderedChildren === null) {
              renderedChildren = [renderedChild];
            } else {
              renderedChildren.push(renderedChild);
            }
          }
        }
      }
      const json: ReactTestRendererJSON = {
        type: inst.type,
        props: props,
        children: renderedChildren,
      };
      Object.defineProperty(json, 'vtype', {
        value: Symbol.for('react.test.json'),
      });
      return json;
    }
    default:
      throw new Error(`Unexpected node type in toJSON: ${inst.tag}`);
  }
}

function childrenToTree(node) {
  if (!node) {
    return null;
  }
  const children = nodeAndSiblingsArray(node);
  if (children.length === 0) {
    return null;
  } else if (children.length === 1) {
    return toTree(children[0]);
  }
  return flatten(children.map(toTree));
}

function nodeAndSiblingsArray(nodeWithSibling) {
  const array = [];
  let node = nodeWithSibling;
  while (node != null) {
    array.push(node);
    node = node.next;
  }
  return array;
}

function flatten(arr) {
  const result = [];
  const stack = [{i: 0, array: arr}];
  while (stack.length) {
    const n = stack.pop();
    while (n.i < n.array.length) {
      const el = n.array[n.i];
      n.i += 1;
      if (Array.isArray(el)) {
        stack.push(n);
        stack.push({i: 0, array: el});
        break;
      }
      result.push(el);
    }
  }
  return result;
}

function toTree(node: ?VNode) {
  if (node == null) {
    return null;
  }
  switch (node.tag) {
    case TreeRoot:
      return childrenToTree(node.child);
    case DomPortal:
      return childrenToTree(node.child);
    case ClassComponent:
      return {
        nodeType: 'component',
        type: node.type,
        // props: {...node.oldProps},
        props: {...node.props},
        instance: node.realNode,
        rendered: childrenToTree(node.child),
      };
    case FunctionComponent:
      return {
        nodeType: 'component',
        type: node.type,
        props: {...node.props},
        instance: null,
        rendered: childrenToTree(node.child),
      };
    case DomComponent: {
      return {
        nodeType: 'host',
        type: node.type,
        props: {...node.props},
        instance: null, // TODO: use createNodeMock here somehow?
        rendered: flatten(nodeAndSiblingsArray(node.child).map(toTree)),
      };
    }
    case DomText:
      return node.realNode.text;
    case Fragment:
    case ContextProvider:
    case ContextConsumer:
    case Profiler:
    case ForwardRef:
    case MemoComponent:
    case IncompleteClassComponent:
    default:
      throwIfTrue(
        true,
        'toTree() does not yet know how to handle nodes with tag=%s',
        node.tag,
      );
  }
}

const validWrapperTypes = new Set([
  FunctionComponent,
  ClassComponent,
  DomComponent,
  ForwardRef,
  MemoComponent,
  // Normally skipped, but used when there's more than one root child.
  TreeRoot,
]);

function getChildren(parent: VNode) {
  const children = [];
  const startingNode = parent;
  let node: VNode = startingNode;
  if (node.child === null) {
    return children;
  }
  node.child.parent = node;
  node = node.child;
  outer: while (true) {
    let descend = false;
    if (validWrapperTypes.has(node.tag)) {
      children.push(wrapFiber(node));
    } else if (node.tag === DomText) {
      children.push('' + node.props);
    } else {
      descend = true;
    }
    if (descend && node.child !== null) {
      node.child.parent = node;
      node = node.child;
      continue;
    }
    while (node.next === null) {
      if (node.parent === startingNode) {
        break outer;
      }
      node = (node.parent: any);
    }
    (node.next: any).parent = node.parent;
    node = (node.next: any);
  }
  return children;
}

class ReactTestInstance {
  _fiber: VNode;

  _currentFiber(): VNode {
    // Throws if this component has been unmounted.
    const fiber = this._fiber;
    throwIfTrue(
      fiber === null,
      "Can't read from currently-mounting component. This error is likely " +
        'caused by a bug in React. Please file an issue.',
    );
    return fiber;

    return this._fiber
  }

  constructor(fiber: VNode) {
    throwIfTrue(
      !validWrapperTypes.has(fiber.tag),
      'Unexpected object passed to ReactTestInstance constructor (tag: %s). ' +
        'This is probably a bug in React.',
      fiber.tag,
    );
    this._fiber = fiber;
  }

  get type() {
    return this._fiber.type;
  }

  get props(): Object {
    return this._currentFiber().props;
  }

  get parent(): ?ReactTestInstance {
    let parent = this._fiber.parent;
    while (parent !== null) {
      if (validWrapperTypes.has(parent.tag)) {
        if (parent.tag === TreeRoot) {
          // Special case: we only "materialize" instances for roots
          // if they have more than a single child. So we'll check that now.
          if (getChildren(parent).length < 2) {
            return null;
          }
        }
        return wrapFiber(parent);
      }
      parent = parent.parent;
    }
    return null;
  }

  get children(): Array<ReactTestInstance | string> {
    return getChildren(this._currentFiber());
  }

  // Custom search functions
  find(predicate: Predicate): ReactTestInstance {
    return expectOne(
      this.findAll(predicate, {deep: false}),
      `matching custom predicate: ${predicate.toString()}`,
    );
  }

  findByType(type: any): ReactTestInstance {
    return expectOne(
      this.findAllByType(type, {deep: false}),
      `with node type: "Unknown"`,
    );
  }

  findByProps(props: Object): ReactTestInstance {
    return expectOne(
      this.findAllByProps(props, {deep: false}),
      `with props: ${JSON.stringify(props)}`,
    );
  }

  findAll(
    predicate: Predicate,
    options: ?FindOptions = null,
  ): Array<ReactTestInstance> {
    return findAll(this, predicate, options);
  }

  findAllByType(
    type: any,
    options: ?FindOptions = null,
  ): Array<ReactTestInstance> {
    return findAll(this, node => node.type === type, options);
  }

  findAllByProps(
    props: Object,
    options: ?FindOptions = null,
  ): Array<ReactTestInstance> {
    return findAll(
      this,
      node => node.props && propsMatch(node.props, props),
      options,
    );
  }
}

function findAll(
  root: ReactTestInstance,
  predicate: Predicate,
  options: ?FindOptions,
): Array<ReactTestInstance> {
  const deep = options ? options.deep : true;
  const results = [];

  if (predicate(root)) {
    results.push(root);
    if (!deep) {
      return results;
    }
  }

  root.children.forEach(child => {
    if (typeof child === 'string') {
      return;
    }
    results.push(...findAll(child, predicate, options));
  });

  return results;
}

function expectOne(
  all: Array<ReactTestInstance>,
  message: string,
): ReactTestInstance {
  if (all.length === 1) {
    return all[0];
  }

  const prefix =
    all.length === 0
      ? 'No instances found '
      : `Expected 1 but found ${all.length} instances `;

  throw new Error(prefix + message);
}

function propsMatch(props: Object, filter: Object): boolean {
  for (const key in filter) {
    if (props[key] !== filter[key]) {
      return false;
    }
  }
  return true;
}

function create(element: React$Element<any>, options: TestRendererOptions) {
  let createNodeMock = defaultTestOptions.createNodeMock;
  if (typeof options === 'object' && options !== null) {
    if (typeof options.createNodeMock === 'function') {
      createNodeMock = options.createNodeMock;
    }
  }
  let container = {
    children: [],
    createNodeMock,
    tag: 'CONTAINER',
  };
  let root: VNode | null = createVNode(TreeRoot, container);
  throwIfTrue(root == null, 'something went wrong');
  startUpdate(element, root, null);

  const entry = {
    _Scheduler: Scheduler,

    root: undefined, // makes flow happy
    // we define a 'getter' for 'root' below using 'Object.defineProperty'
    toJSON(): Array<ReactTestRendererNode> | ReactTestRendererNode | null {
      if (root == null || container == null) {
        return null;
      }
      if (container.children.length === 0) {
        return null;
      }
      if (container.children.length === 1) {
        return toJSON(container.children[0]);
      }
      if (
        container.children.length === 2 &&
        container.children[0].isHidden === true &&
        container.children[1].isHidden === false
      ) {
        // Omit timed out children from output entirely, including the fact that we
        // temporarily wrap fallback and timed out children in an array.
        return toJSON(container.children[1]);
      }
      let renderedChildren = null;
      if (container.children && container.children.length) {
        for (let i = 0; i < container.children.length; i++) {
          const renderedChild = toJSON(container.children[i]);
          if (renderedChild !== null) {
            if (renderedChildren === null) {
              renderedChildren = [renderedChild];
            } else {
              renderedChildren.push(renderedChild);
            }
          }
        }
      }
      return renderedChildren;
    },
    toTree() {
      if (root == null) {
        return null;
      }
      return toTree(root);
    },
    update(newElement: React$Element<any>) {
      if (root == null) {
        return;
      }
      startUpdate(newElement, root, null);
    },
    unmount() {
      if (root == null) {
        return;
      }
      startUpdate(null, root, null);
      container = null;
      root = null;
    },
    getInstance() {
      if (root == null) {
        return null;
      }
      return getFirstCustomDom(root);
    },

    unstable_flushSync<T>(fn: () => T): T {
      return fn();
    },
  };

  Object.defineProperty(
    entry,
    'root',
    ({
      configurable: true,
      enumerable: true,
      get: function() {
        if (root === null) {
          throw new Error("Can't access .root on unmounted test renderer");
        }
        const children = getChildren(root);
        if (children.length === 0) {
          throw new Error("Can't access .root on unmounted test renderer");
        } else if (children.length === 1) {
          // Normally, we skip the root and just give you the child.
          return children[0];
        } else {
          // However, we give you the root if there's more than one root child.
          // We could make this the behavior for all cases but it would be a breaking change.
          return wrapFiber(root);
        }
      },
    }: Object),
  );

  return entry;
}

const fiberToWrapper = new WeakMap();
function wrapFiber(fiber: VNode): ReactTestInstance {
  let wrapper = fiberToWrapper.get(fiber);
  if (wrapper === undefined && fiber.twins !== null) {
    wrapper = fiberToWrapper.get(fiber.twins);
  }
  if (wrapper === undefined) {
    wrapper = new ReactTestInstance(fiber);
    fiberToWrapper.set(fiber, wrapper);
  }
  return wrapper;
}

let actingUpdatesScopeDepth = 0;

// This version of `act` is only used by our tests. Unlike the public version
// of `act`, it's designed to work identically in both production and
// development. It may have slightly different behavior from the public
// version, too, since our constraints in our test suite are not the same as
// those of developers using React — we're testing React itself, as opposed to
// building an app with React.
// TODO: Migrate our tests to use ReactNoop. Although we would need to figure
// out a solution for Relay, which has some Concurrent Mode tests.
function unstable_concurrentAct(scope: () => PromiseLike<mixed> | void) {
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

export {
  Scheduler as _Scheduler,
  create,
  /* eslint-disable-next-line camelcase */
  asyncUpdates as unstable_batchedUpdates,
  act,
  unstable_concurrentAct,
};
