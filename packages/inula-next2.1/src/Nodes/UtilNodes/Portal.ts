import { InulaNodeType } from '../../consts';
import { InulaStore } from '../../store';
import { InulaBaseNode } from '../../types';
import { InulaHTMLNode } from '../HTMLNode';
import { appendNodes, addParentElement, update } from '../utils';

export interface PortalNode extends InulaBaseNode {
  inulaType: InulaNodeType.Portal;
  nodes: InulaBaseNode[];
  target: InulaHTMLNode;
}

function updatePortal(node: PortalNode) {
  for (let i = 0; i < node.nodes.length; i++) {
    update(node.nodes[i]);
  }
}

export function createPortal(props: { target?: HTMLElement }, ...children: InulaBaseNode[]): PortalNode {
  const target = props.target ?? InulaStore.document.body;
  appendNodes(children, target);
  addParentElement(children, target);

  return { inulaType: InulaNodeType.Portal, target: target as InulaHTMLNode, nodes: children, update: updatePortal };
}

export function Portal(props: { target?: HTMLElement; children: InulaBaseNode[] }) {
  throw new Error('Portal should be compiled to a createPortal');
}
