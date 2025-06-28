import { VNode } from '../Types';
import { getProcessingVNode } from '../GlobalVar';
import { findDomVNode, getTreeRootVNode } from '../vnode/VNodeUtils';
import { ClassComponent, DomComponent, DomText, FunctionComponent } from '../vnode/VNodeTags';
import { ReactiveFlags } from '../../inulax/Constants';
import { Instance } from '../../types';

const forbiddenNames: Set<string | symbol> = new Set([
  '$parent',
  '$vnode',
  '$el',
  '$props',
  '$children',
  '$root',
  '$refs',
]);

const dataReactiveKey = Symbol('_inula_dataReactive');
const propsKey = Symbol('_inula_props');
const DATA_REACTIVE = 'dataReactive';
const PROPS = 'props';

// 创建一个WeakMap来缓存VNode到Instance的映射
const instanceCache: WeakMap<VNode, Instance> = new WeakMap();

function isComponentVNode(vNode: VNode) {
  return vNode.tag === FunctionComponent || vNode.tag === ClassComponent || typeof vNode.type === 'function';
}

const DYNAMIC_COMPONENT = 'DynamicComponent';
const DIRECTIVE_COMPONENT = 'DirectiveComponent';

function createInstance(curVNode: VNode): Instance {
  // 检查缓存中是否已存在该VNode的实例
  if (instanceCache.has(curVNode)) {
    return instanceCache.get(curVNode) as Instance;
  }

  const instanceHandler = {
    get: (target, prop) => {
      switch (prop) {
        case '$parent': {
          let vNode = target.parent;

          if (!vNode) {
            return;
          }

          // 特殊处理：
          // 因为vue-to-inula工具会把<component :is="Comp"></component>编译成<DirectiveComponent componentName="Comp">，多包了一层组件
          // 因为vue-to-inula工具会把<Comp v-xxx>编译成<DirectiveComponent componentName="Comp">，多包了一层组件
          while (
            !isComponentVNode(vNode) ||
            vNode.type.name === DYNAMIC_COMPONENT ||
            vNode.type.name === DIRECTIVE_COMPONENT
          ) {
            if (!vNode.parent) {
              return;
            }
            vNode = vNode?.parent;
          }

          return createInstance(vNode);
        }
        case '$vnode': {
          return target;
        }
        case '$el': {
          const vNode = findDomVNode(target);
          if (vNode) {
            return vNode.realNode;
          }
          break;
        }
        case '$props': {
          return target.props;
        }
        case '$children': {
          const vNode = target.child;
          if (!vNode || typeof vNode !== 'object') {
            return [];
          }

          const children: Instance[] = [];

          let child = vNode.child;

          while (child) {
            if (
              child.tag === 'FunctionComponent' ||
              child.tag === 'ClassComponent' ||
              typeof child.type === 'function'
            ) {
              children.push(createInstance(child));
            }

            child = child.next;
          }

          return children;
        }
        case '$root': {
          const rootNode = getTreeRootVNode(target);

          return createInstance(rootNode.child);
        }
        case '$refs': {
          if (!target.instanceVariables) {
            target.instanceVariables = {};
          }

          if (!target.instanceVariables['$refs']) {
            target.instanceVariables['$refs'] = {};
          }

          const refs = target.instanceVariables['$refs'];

          return new Proxy(refs, {
            set(target, prop, value) {
              target[prop] = value;
              return true;
            },
            get(target, property) {
              if (target[property]) {
                const val = target[property];
                return toInstance(val);
              }
              return undefined;
            },
          });
        }
        default: {
          if (!target.instanceVariables) {
            target.instanceVariables = { [ReactiveFlags.IS_SHALLOW]: true };
          }

          // 优先访问dataReactive数据
          if (target.instanceVariables[dataReactiveKey]) {
            if (Object.prototype.hasOwnProperty.call(target.instanceVariables[dataReactiveKey], prop)) {
              return target.instanceVariables[dataReactiveKey][prop];
            }
          }

          // 优先访问props数据
          if (target.instanceVariables[propsKey]) {
            if (Object.prototype.hasOwnProperty.call(target.instanceVariables[propsKey], prop)) {
              return target.instanceVariables[propsKey][prop];
            }
          }

          if (Object.prototype.hasOwnProperty.call(target.instanceVariables, prop)) {
            return target.instanceVariables[prop];
          }

          console.error(`Instance Method/Variables ${String(prop)} not implemented.`);
          return undefined;
        }
      }
    },

    set: (target, prop, val) => {
      if (forbiddenNames.has(prop)) {
        throw Error('Assignment into forbidden value: ' + (prop as string));
      }

      if (!target.instanceVariables) {
        target.instanceVariables = { [ReactiveFlags.IS_SHALLOW]: true };
      }

      if (prop === DATA_REACTIVE) {
        target.instanceVariables[dataReactiveKey] = val;
        return true;
      }

      if (prop === PROPS) {
        target.instanceVariables[propsKey] = val;
        return true;
      }

      // 如果dataReactive中也有这个prop，优先设置到dataReactive
      if (target.instanceVariables[dataReactiveKey]) {
        if (Object.prototype.hasOwnProperty.call(target.instanceVariables[dataReactiveKey], prop)) {
          target.instanceVariables[dataReactiveKey][prop] = val;
          return true;
        }
      }

      target.instanceVariables[prop] = val;
      return true;
    },

    // 新增：处理 'in' 操作符
    has: (target, prop) => {
      if (forbiddenNames.has(prop)) {
        return true;
      }

      if (target.instanceVariables) {
        // 检查 dataReactive
        if (target.instanceVariables[dataReactiveKey] && prop in target.instanceVariables[dataReactiveKey]) {
          return true;
        }

        // 检查 props
        if (target.instanceVariables[propsKey] && prop in target.instanceVariables[propsKey]) {
          return true;
        }

        // 检查 instanceVariables
        if (prop in target.instanceVariables) {
          return true;
        }
      }

      // 检查原始对象
      return prop in target;
    },

    // 新增：处理 Object.prototype.hasOwnProperty.call
    getOwnPropertyDescriptor: (target, prop) => {
      if (forbiddenNames.has(prop)) {
        return {
          configurable: true,
          enumerable: true,
          value: undefined,
          writable: false,
        };
      }

      if (target.instanceVariables) {
        // 检查 dataReactive
        if (
          target.instanceVariables[dataReactiveKey] &&
          Object.prototype.hasOwnProperty.call(target.instanceVariables[dataReactiveKey], prop)
        ) {
          return Object.getOwnPropertyDescriptor(target.instanceVariables[dataReactiveKey], prop);
        }

        // 检查 props
        if (
          target.instanceVariables[propsKey] &&
          Object.prototype.hasOwnProperty.call(target.instanceVariables[propsKey], prop)
        ) {
          return Object.getOwnPropertyDescriptor(target.instanceVariables[propsKey], prop);
        }

        // 检查 instanceVariables
        if (Object.prototype.hasOwnProperty.call(target.instanceVariables, prop)) {
          return Object.getOwnPropertyDescriptor(target.instanceVariables, prop);
        }
      }

      // 检查原始对象
      return Object.getOwnPropertyDescriptor(target, prop);
    },
  };

  const instance = new Proxy(curVNode, instanceHandler);

  // 将新创建的实例缓存
  instanceCache.set(curVNode, instance);

  return instance;
}

export function useInstanceImpl(vNode?: VNode): Instance {
  return createInstance(vNode || (getProcessingVNode() as VNode));
}

export function toInstance(vNode: VNode) {
  if (vNode.tag && vNode.tag === FunctionComponent) {
    // 特殊处理：
    // 因为vue-to-inula工具会把<component :is="Comp"></component>编译成<DynamicComponent is="Comp">，多包了一层组件
    // 因为vue-to-inula工具会把<Comp v-xxx>编译成<DirectiveComponent componentName="Comp">，多包了一层组件
    if (
      vNode.type.__internal_comp_tag === DYNAMIC_COMPONENT ||
      vNode.type.__internal_comp_tag === DIRECTIVE_COMPONENT
    ) {
      const child = vNode.child!;
      if (child.tag === DomComponent || child.tag === DomText) {
        return child.realNode;
      } else {
        return createInstance(child);
      }
    } else {
      return createInstance(vNode);
    }
  } else {
    return vNode;
  }
}
