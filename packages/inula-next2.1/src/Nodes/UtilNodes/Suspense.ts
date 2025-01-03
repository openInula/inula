import { InulaBaseNode } from '../../types';
import { update } from '../utils';
import { Context, createContext, createContextNode, ContextNode } from './context';

let suspenseContext: Context | null = null;
function getSuspenseContext() {
  if (!suspenseContext) {
    suspenseContext = createContext();
  }
  return suspenseContext;
}

class Suspense {
  private provider: ContextNode;
  private didSuspend = false;
  private nodes: InulaBaseNode[] = [];
  constructor(private context: Context) {
    this.provider = createContextNode(context);
  }
  with(children: InulaBaseNode[]) {
    return this.provider.with(...children);
  }
  update(children: InulaBaseNode[]) {
    for (let i = 0; i < (this.nodes?.length ?? 0); i++) {
      update(this.nodes![i]);
    }
    this.provider.update(children);
  }
}

export function createSuspense(...children: InulaBaseNode[]) {
  const context = getSuspenseContext();
  const Proiver = createContextNode(context);
  return {
    with: (...children: InulaBaseNode[]) => {},
  };
}

export function lazy(fn: () => im) {
  return createSuspense(fn());
}
