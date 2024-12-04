import { InulaStore } from "../../store";
import { Bits, Updater, Value } from "../../types";
import { InulaTextNode } from "./types";
import { shouldUpdate } from "./utils";

export const createTextNode = (text: string, update: Updater<InulaTextNode>) => {
  const node = InulaStore.document.createTextNode(text) as InulaTextNode;
  node.update = update;

  return node;
}

/**
 * @brief Set the text content of the node
 * @param node
 * @param text
 */
const _setText = (node: Text, text: string) => {
  node.textContent = text;
}


export const setText = (node: InulaTextNode, text: string, dependencies: Value[], reactBits: Bits) => {
  if (!shouldUpdate(node, 'text', dependencies, reactBits)) return;
  _setText(node, text);
}
