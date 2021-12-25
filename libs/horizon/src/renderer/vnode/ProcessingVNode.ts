import type {VNode} from '../Types';

// 当前所有者是应拥有当前正在构建的任何组件的组件。
const ProcessingVNode: { val: VNode | null } = {
  val: null,
};

export default ProcessingVNode;
