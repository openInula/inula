import { InulaNodeType } from '../consts';
import type { CompNode } from '../Nodes/CompNode/node';

export type Value = any;
export type Props = Record<PropertyKey, Value>;
export type Bits = number;

export type UpdateState = (dirty: Bits) => void;
export type UpdateProp = (propName: string, newValue: Value) => void;
export type UpdateView = (dirty: Bits) => void;
export type GetViewAndUpdater = () => [InulaBaseNode, UpdateView];

export type Lifecycle = (node?: InulaBaseNode) => void;
export type ScopedLifecycle = Lifecycle[];

export type InulaBaseNode = {
  inulaType?: InulaNodeType;
  update?: Updater<any>;
  nodes?: InulaBaseNode[];
  parentEl?: HTMLElement;
};

export type Updater<T> = (node: T) => void;
export type Component<T = Props> = (props: T) => CompNode;
