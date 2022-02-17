/**
 * 虚拟DOM结构体
 */
import { TreeRoot, FunctionComponent, ClassComponent, DomPortal, DomText, ContextConsumer, ForwardRef, SuspenseComponent, LazyComponent, ClsOrFunComponent, DomComponent, Fragment, ContextProvider, Profiler, MemoComponent, IncompleteClassComponent } from './VNodeTags';
import type { VNodeTag } from './VNodeTags';
import type { RefType, ContextType } from '../Types';
import type { Hook } from '../hooks/HookType';
import { InitFlag } from './VNodeFlags';

export class VNode {
  tag: VNodeTag;
  key: string | null; // 唯一标识符
  props: any; // 传给组件的props的值，类组件包含defaultProps，Lazy组件不包含
  type: any = null;
  realNode: any; // 如果是类，则存放实例；如果是div这种，则存放真实DOM；

  // 关系结构
  parent: VNode | null = null; // 父节点
  child: VNode | null = null; // 子节点
  next: VNode | null = null; // 兄弟节点
  cIndex: number = 0; // 节点在children数组中的位置
  eIndex: number = 0; // HorizonElement在jsx中的位置，例如：jsx中的null不会生成vNode，所以eIndex和cIndex不一致

  ref: RefType | ((handle: any) => void) | null = null; // 包裹一个函数，submit阶段使用，比如将外部useRef生成的对象赋值到ref上
  oldProps: any = null;

  suspensePromises: any; // suspense组件的promise列表
  changeList: any; // DOM的变更列表
  effectList: any[] | null; // useEffect 的更新数组
  updates: any[] | null; // TreeRoot和ClassComponent使用的更新数组
  stateCallbacks: any[] | null; // 存放存在setState的第二个参数和HorizonDOM.render的第三个参数所在的node数组
  isForceUpdate: boolean; // 是否使用强制更新

  state: any; // ClassComponent和TreeRoot的状态
  hooks: Array<Hook<any, any>> | null; // 保存hook
  suspenseChildStatus: string = ''; // Suspense的Children是否显示
  depContexts: Array<ContextType<any>> | null; // FunctionComponent和ClassComponent对context的依赖列表
  isDepContextChange: boolean; // context是否变更
  dirtyNodes: Array<VNode> | null = null; // 需要改动的节点数组
  shouldUpdate: boolean = false;
  childShouldUpdate: boolean = false;
  outerDom: any;
  task: any;

  // 使用这个变量来记录修改前的值，用于恢复。
  contexts: any;
  // 因为LazyComponent会修改tag和type属性，为了能识别，增加一个属性
  isLazyComponent: boolean;

  // 因为LazyComponent会修改type属性，为了在diff中判断是否可以复用，需要增加一个lazyType
  lazyType: any;
  flags = InitFlag;
  clearChild: VNode | null;
  // one tree相关属性
  isCreated: boolean = true;
  oldHooks: Array<Hook<any, any>> | null; // 保存上一次执行的hook
  oldState: any;
  oldRef: RefType | ((handle: any) => void) | null = null;
  suspenseChildThrow: boolean;
  oldSuspenseChildStatus: string; // 上一次Suspense的Children是否显示
  oldChild: VNode | null = null;
  suspenseDidCapture: boolean; // suspense是否捕获了异常
  promiseResolve: boolean; // suspense的promise是否resolve

  path: string = ''; // 保存从根到本节点的路径
  toUpdateNodes: Set<VNode> | null; // 保存要更新的节点

  belongClassVNode: VNode | null = null; // 记录JSXElement所属class vNode，处理ref的时候使用

  constructor(tag: VNodeTag, props: any, key: null | string, outerDom) {
    this.tag = tag; // 对应组件的类型，比如ClassComponent等
    this.key = key;

    this.props = props;

    switch (tag) {
      case TreeRoot:
        this.outerDom = outerDom;
        this.task = null;
        this.toUpdateNodes = new Set<VNode>();
        this.realNode = null;
        this.updates = null;
        this.stateCallbacks = null;
        this.state = null;
        this.oldState = null;
        this.contexts = null;
        break;
      case FunctionComponent:
        this.effectList = null;
        this.hooks = null;
        this.depContexts = null;
        this.isDepContextChange = false;
        this.oldHooks = null;
        break;
      case ClassComponent:
        this.realNode = null;
        this.updates = null;
        this.stateCallbacks = null;
        this.isForceUpdate = false;
        this.state = null;
        this.depContexts = null;
        this.isDepContextChange = false;
        this.oldState = null;
        this.contexts = null;
        break;
      case ClsOrFunComponent:
        this.realNode = null;
        this.contexts = null;
        break;
      case DomPortal:
        this.realNode = null;
        this.contexts = null;
        break;
      case DomComponent:
        this.realNode = null;
        this.changeList = null;
        this.contexts = null;
        break;
      case DomText:
        this.realNode = null;
        break;
      case SuspenseComponent:
        this.realNode = null;
        this.suspensePromises = null;
        this.suspenseChildThrow = false;
        this.suspenseDidCapture = false;
        this.promiseResolve = false;
        this.oldSuspenseChildStatus = '';
        break;
      case ContextProvider:
        this.contexts = null;
        break;
      case MemoComponent:
        this.effectList = null;
        break;
      case LazyComponent:
        this.realNode = null;
        this.stateCallbacks = null;
        this.isLazyComponent = true;
        break;
      case Fragment:
        break;
      case ContextConsumer:
        break;
      case ForwardRef:
        break;
      case Profiler:
        break;
      case IncompleteClassComponent:
        break;
    }
  }
}
