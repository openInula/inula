import { InulaStore } from "../../store"
import { InulaBaseNode, Updater } from "../../types";
import { addParentElement, update } from "../utils";
import { InulaHTMLNode, InulaHTMLTemplateNode, InulaTextNode } from "./types";
import { getElementByPosition, insertNode } from "./utils";

export const createTemplate = (template: string) => {
  const templateElement = InulaStore.document.createElement('template');
  templateElement.innerHTML = template;
  return templateElement.content.children[0] as HTMLElement;
}

export const createTemplateNode = (
  template: HTMLElement, 
  getUpdater: ((node: InulaHTMLTemplateNode) => Updater<InulaHTMLTemplateNode>) | null,
  ...nodesToInsert: [number, InulaBaseNode, ...number[]][]
) => {
  const node = template.cloneNode(true) as InulaHTMLTemplateNode;

  const updater = getUpdater?.(node) ?? null;
  node.update = _update.bind(null, node, updater);
  const tasks = [];
  // ---- Insert nodes
  if (nodesToInsert.length > 0) {
    node.nodesInserted = [];
    for (let i = 0; i < nodesToInsert.length; i++) {
      const [lastPos, nodeToInsert, ...position] = nodesToInsert[i];
      const parentElement = getElementByPosition(node, ...position);
      tasks.push(() => insertNode(parentElement as InulaHTMLNode, nodeToInsert, lastPos));
      addParentElement([nodeToInsert], parentElement);
      node.nodesInserted.push(nodeToInsert);
    }
  }

  // --- append lately cause DOM should be stable to find the anchor element
  tasks.forEach(t => t());
  if (updater) {
    updater(node);
  }

  return node;
}

const _update = (node: InulaHTMLTemplateNode, updater: Updater<InulaHTMLTemplateNode> | null) => {
  if (updater) {
    for (let i = 0; i < (node.elementsRetrieved?.length ?? 0); i++) {
      const element = node.elementsRetrieved![i];
      element.dirtyBits = node.dirtyBits;
    }
    updater(node);
  }

  for (let i = 0; i < (node.nodesInserted?.length ?? 0); i++) {
    update(node.nodesInserted![i], node.dirtyBits!)
  }
}

export const templateAddNodeToUpdate = (node: InulaHTMLTemplateNode, nodeToAdd: InulaHTMLNode | InulaTextNode) => {
  if (!node.elementsRetrieved) node.elementsRetrieved = [];
  if (node.elementsRetrieved.includes(nodeToAdd)) return;
  node.elementsRetrieved.push(nodeToAdd);
  addParentElement([nodeToAdd], node);
}

export const templateGetElement = (templateNode: InulaHTMLTemplateNode, ...positions: number[]) => {
  const node = getElementByPosition(templateNode, ...positions) as InulaHTMLNode;
  templateAddNodeToUpdate(templateNode, node);
  return node;
}
