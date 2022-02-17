/**
 * 虚拟DOM结构体
 */
import {TreeRoot} from './VNodeTags';
import type {VNodeTag} from './VNodeTags';
import type {RefType, ContextType} from '../Types';
import type {Hook} from '../hooks/HookType';

export class VNode {
  tag: VNodeTag;
  key: string | null; // 唯一标识符
  type: any = null;
  realNode: any = null; // 如果是类，则存放实例；如果是div这种，则存放真实DOM；

  // 关系结构
  parent: VNode | null = null; // 父节点
  child: VNode | null = null; // 子节点
  next: VNode | null = null; // 兄弟节点
  cIndex: number = 0; // 节点在children数组中的位置
  eIndex: number = 0; // HorizonElement在jsx中的位置，例如：jsx中的null不会生成vNode，所以eIndex和cIndex不一致

  ref: RefType | ((handle: any) => void) | null = null; // 包裹一个函数，submit阶段使用，比如将外部useRef生成的对象赋值到ref上
  props: any; // 传给组件的props的值，类组件包含defaultProps，Lazy组件不包含
  oldProps: any = null;

  suspensePromises: any = null; // suspense组件的promise列表
  changeList: any = null; // DOM的变更列表
  effectList: any[] | null = null; // useEffect 的更新数组
  updates: any[] | null = null; // TreeRoot和ClassComponent使用的更新数组
  stateCallbacks: any[] | null = null; // 存放存在setState的第二个参数和HorizonDOM.render的第三个参数所在的node数组
  isForceUpdate: boolean = false; // 是否使用强制更新

  state: any = null; // ClassComponent和TreeRoot的状态
  hooks: Array<Hook<any, any>> | null = null; // 保存hook
  suspenseChildStatus: string = ''; // Suspense的Children是否显示
  depContexts: Array<ContextType<any>> | null = null; // FunctionComponent和ClassComponent对context的依赖列表
  isDepContextChange: boolean = false; // context是否变更
  dirtyNodes: Array<VNode> | null = null; // 需要改动的节点数组
  shouldUpdate: boolean = false;
  childShouldUpdate: boolean = false;
  outerDom: any;
  task: any;

  // 使用这个变量来记录修改前的值，用于恢复。
  contexts = {};
  // 因为LazyComponent会修改tag和type属性，为了能识别，增加一个属性
  isLazyComponent: boolean = false;

  // 因为LazyComponent会修改type属性，为了在diff中判断是否可以复用，需要增加一个lazyType
  lazyType: any = null;
  flags: {
    Addition?: boolean;
    Update?: boolean;
    Deletion?: boolean;
    ResetText?: boolean;
    Callback?: boolean;
    DidCapture?: boolean;
    Ref?: boolean;
    Snapshot?: boolean;
    Interrupted?: boolean;
    ShouldCapture?: boolean;
    ForceUpdate?: boolean;
    Clear?: boolean;
  } = {};
  clearChild: VNode | null = null;
  // one tree相关属性
  isCreated: boolean = true;
  oldHooks: Array<Hook<any, any>> | null = null; // 保存上一次执行的hook
  oldState: any = null;
  oldRef: RefType | ((handle: any) => void) | null = null;
  suspenseChildThrow = false;
  oldSuspenseChildStatus: string = ''; // 上一次Suspense的Children是否显示
  oldChild: VNode | null = null;
  suspenseDidCapture: boolean = false; // suspense是否捕获了异常
  promiseResolve: boolean = false; // suspense的promise是否resolve

  path: string = ''; // 保存从根到本节点的路径
  toUpdateNodes: Set<VNode> | null = null; // 保存要更新的节点

  belongClassVNode: VNode | null = null; // 记录JSXElement所属class vNode，处理ref的时候使用

  constructor(tag: VNodeTag, props: any, key: null | string, outerDom) {
    this.tag = tag; // 对应组件的类型，比如ClassComponent等
    this.key = key;

    this.props = props;

    // 根节点
    if (tag === TreeRoot) {
      this.outerDom = outerDom;
      this.task = null;
      this.toUpdateNodes = new Set<VNode>();
    }
  }

  setContext(contextName, value) {
    this.contexts[contextName] = value;
  }
  getContext(contextName) {
    return this.contexts[contextName];
  }
}
