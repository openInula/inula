import { InulaStore } from '../../store';
import { InulaBaseNode, Updater } from '../../types';
import { getCurrentCompNode } from '../CompNode/node';
import { addParentElement, InitDirtyBitsMask, update } from '../utils';
import { InulaHTMLNode, InulaHTMLTemplateNode, InulaTextNode } from './types';
import { getElementByPosition, insertNode } from './utils';

export const createTemplate = (template: string) => {
  const templateElement = InulaStore.document.createElement('template');
  templateElement.innerHTML = template;
  return templateElement.content.children[0] as HTMLElement;
};

export const createTemplateNode = (
  template: HTMLElement,
  getUpdater: ((node: InulaHTMLTemplateNode) => Updater<InulaHTMLTemplateNode>) | null,
  ...nodesToInsert: [number, InulaBaseNode, ...number[]][]
) => {
  const node = template.cloneNode(true) as InulaHTMLTemplateNode;
  node.__$owner = getCurrentCompNode();

  const updater = getUpdater?.(node) ?? null;
  node.update = _update.bind(null, node, updater);
  // ---- Insert nodes
  if (nodesToInsert.length > 0) {
    // we need to find the parent element first, cause the position would be changed after insert
    const insertOperations: Array<[InulaHTMLNode, InulaBaseNode, number]> = [];
    for (let i = 0; i < nodesToInsert.length; i++) {
      const [lastPos, nodeToInsert, ...position] = nodesToInsert[i];
      const parentElement = getElementByPosition(node, ...position);
      insertOperations.push([parentElement as InulaHTMLNode, nodeToInsert, lastPos]);
    }

    node.nodesInserted = [];
    // insert nodes
    for (let i = 0; i < insertOperations.length; i++) {
      const [parentElement, nodeToInsert, lastPos] = insertOperations[i];
      insertNode(parentElement as InulaHTMLNode, nodeToInsert, lastPos);
      addParentElement([nodeToInsert], parentElement);
      node.nodesInserted.push(nodeToInsert);
    }
  }

  // --- append lately cause DOM should be stable to find the anchor element
  if (updater) {
    updater(node);
  }

  return node;
};

const _update = (node: InulaHTMLTemplateNode, updater: Updater<InulaHTMLTemplateNode> | null) => {
  if (updater) {
    updater(node);
  }

  for (let i = 0; i < (node.nodesInserted?.length ?? 0); i++) {
    update(node.nodesInserted![i]);
  }
};

export const templateAddNodeToUpdate = (node: InulaHTMLTemplateNode, nodeToAdd: InulaHTMLNode | InulaTextNode) => {
  if (!node.elementsRetrieved) node.elementsRetrieved = [];
  if (node.elementsRetrieved.includes(nodeToAdd)) return;
  node.elementsRetrieved.push(nodeToAdd);
  addParentElement([nodeToAdd], node);
};

export const templateGetElement = (templateNode: InulaHTMLTemplateNode, ...positions: number[]) => {
  const node = getElementByPosition(templateNode, ...positions) as InulaHTMLNode;
  node.__$owner = getCurrentCompNode();
  templateAddNodeToUpdate(templateNode, node);

  return node;
};
