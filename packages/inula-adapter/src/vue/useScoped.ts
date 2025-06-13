import { vueReactive, useEffect, useLayoutEffect, useRef, useCallback } from '@cloudsop/horizon';
import type { VNode, Instance } from '@cloudsop/horizon';
import { styles } from './helper';
import { shallowCompare } from './compare';

const { useInstance } = vueReactive;

/**
 * 从当前节点开始，沿着节点树往下找第一个tag === 'DomComponent'的vNode，
 * 中途一旦遇到某个节点的next不为空，则返回null
 * 
 * 例如 中途遇到如下节点，则返回null
 *    <>
        <Child>
          child
        </Child>
        <div>
          child2
        </div>
      </>
 * 例如 最底层节点内容如下，也返回null
 *    <>
        <div>
          grandchild
        </div>
        <div>
          grandchild2
        </div>
      </>
  * 例如 找到最底层节点内容如下，返回xxxx对应的vNode
  *    <>
        <div id={'xxxx'}>
          grandchild
          <div>
          grandchild2
          </div>
        </div>
      </>
 * @param vNode - 虚拟节点
 * @returns 找到的第一个没有兄弟节点的DomComponent，如果找到最底层或者中途遇到有兄弟节点的vNode，则返回null
 */
function getFirstSingleDomVnode(vnode: VNode): VNode | null {
  let node = vnode;
  while (node.child) {
    // 遇到了有兄弟节点的child，则返回null
    if (node.child.next) {
      return null;
    }

    // 找到了DomComponent，则把它返回
    if (node.child.tag === 'DomComponent') {
      return node.child;
    }
    node = node.child;
  }
  return null;
}

/**
 * 判断是否应该跳过为元素设置class、style、hash、id属性
 *
 * 通过调用getFirstSingleDomVnode，找最底层的vNode，如果能找不到或者中途遇到next不为空的节点，
 * 则getFirstSingleDomVnode结果为null，
 * 则说明当前节点props中的属性不应该在下层dom上生效
 *
 * @param vNode - 虚拟节点
 * @returns 如果应该跳过则返回 true，否则返回 false
 */
function shouldSkipSetAttrToEl(vNode: VNode): boolean {
  return getFirstSingleDomVnode(vNode) === null;
}

function useScoped(): void {
  const instance: Instance = useInstance();
  const preClass = useRef<string | undefined>(instance.$props.className);

  // 这里是为了监听最底层vDomNode自身的style发生变化时，执行style的合并逻辑
  // 场景举例：vDomNode为：<div style={{width: width + 'px'}} />，其中width是组件状态且会更新
  const vDomNode = getFirstSingleDomVnode(instance?.$vnode);

  // 由于vDomNode的style，每次在组件刷新时，都会创建新对象，所以useEffect监听函数每次都会刷新，
  // 这里通过ref保持上次刷新后的style，然后手动比较style是否变化，再决定是否走更新逻辑
  const preNodeStyle = useRef(null);

  // 处理 className
  useEffect(() => {
    if (shouldSkipSetAttrToEl(instance.$vnode)) {
      return;
    }

    const el = instance.$el as HTMLElement;
    const currentClassName = instance.$props.className || '';

    // 确保元素有初始的 className
    if (!el.className) {
      el.className = '';
    }

    // 如果存在之前的类名，则替换
    if (preClass.current && el.className.includes(preClass.current)) {
      el.className = el.className.replace(preClass.current, currentClassName).trim();
    } else if (currentClassName) {
      // 如果有新的类名要添加，且没有找到之前的类名，则追加
      el.className = el.className ? `${el.className} ${currentClassName}`.trim() : currentClassName;
    }

    // 更新引用的类名
    preClass.current = currentClassName;
  }, [instance.$props.className]);

  // 处理 id
  useEffect(() => {
    if (shouldSkipSetAttrToEl(instance.$vnode)) {
      return;
    }

    const el = instance.$el as HTMLElement;
    // 父组件传了id属性会强制赋给子组件第一个子节点DOM
    if (instance.$props.id) {
      el.id = instance.$props.id;
    }
  }, [instance.$props.id]);

  // 合并生成style，并应用到el上
  // 对于Parent=>Child=>GrandChild组合关系，优先级始终保持Parent>Child>GrandChid
  // 所以，这里从vDomNode开始找，找到路径上的Parent，Child，GrandChid对应vNode，并取出props中的style进行合并
  const mergeStyle = useCallback(() => {
    const el = instance.$el as HTMLElement;
    const currentVDomNode = getFirstSingleDomVnode(instance?.$vnode);
    if (currentVDomNode) {
      // currentVDomNode优先级最低，先入队
      const treePath = [currentVDomNode];

      // 从currentVDomNode开始往上找，直到找到有兄弟节点的vNode或者DomComponent类型的vNode
      let parentVNode = currentVDomNode.parent;
      while (parentVNode && !parentVNode.next && parentVNode.tag !== 'DomComponent') {
        treePath.push(parentVNode);
        parentVNode = parentVNode.parent;
      }
      // 退出循环的parentVNode，其有兄弟节点，但其自身style是需要合并的
      // 这里不需要合并DomComponent类型的vNode
      if (parentVNode && parentVNode.tag !== 'DomComponent' && parentVNode.props?.style) {
        treePath.push(parentVNode);
      }

      // 取出路径上的style列表
      const styleList = treePath.map((node: VNode) => node.props?.style || {});
      const styleToApply = styles(...styleList);

      // 应用style到el上
      Object.entries(styleToApply).forEach(([key, value]) => {
        if (!key) return;
        el.style[key.trim()] = typeof value === 'string' ? value.trim() : value;
      });
    }
  }, []);

  // 处理 props的style
  useEffect(() => {
    if (shouldSkipSetAttrToEl(instance.$vnode)) {
      return;
    }
    mergeStyle();
  }, [instance.$props.style]);

  // 处理 vNode的style
  // 1、useEffect执行时，vDomNode的style。已经在el生效渲染成功，再执行刷新后，dom元素样式前后不一致，会抖动
  //    所以这里用useLayoutEffect，在渲染之前，就把el的style刷新成合并后的style
  // 2、由于vDomNode的style，每次在组件刷新时，都会创建新对象，所以useEffect监听函数每次都会刷新，
  //    这里通过ref保持上次刷新后的style，然后手动比较style是否变化，再决定是否走更新逻辑
  useLayoutEffect(() => {
    if (shouldSkipSetAttrToEl(instance.$vnode) || shallowCompare(preNodeStyle.current, vDomNode?.props.style)) {
      return;
    }
    preNodeStyle.current = vDomNode?.props.style;
    mergeStyle();
  }, [vDomNode?.props.style]);

  // 处理 data-v-hash
  useEffect(() => {
    if (shouldSkipSetAttrToEl(instance.$vnode)) {
      return;
    }

    const el = instance.$el as HTMLElement;
    const hashKeyLength = 15;
    const key = Object.keys(instance.$props).find(key => key.startsWith('data-v-') && key.length === hashKeyLength);

    if (key) {
      el.setAttribute(key, instance.$props[key]);
    }
  }, []);
}

export default useScoped;
