import { CompNode } from './Nodes/CompNode/node';
import { InulaHTMLNode } from './Nodes/HTMLNode/types';
import { insertNode } from './Nodes/HTMLNode';
import { runDidMount } from './lifecycle';
import { init } from './Nodes';

/**
 * @brief Render the component node to the container
 * @param compNode
 * @param container
 */
export const render = (compNode: CompNode, container: HTMLElement) => {
  if (container == null) {
    throw new Error('Render target is empty. Please provide a valid DOM element.');
  }
  container.innerHTML = '';
  insertNode(container as InulaHTMLNode, compNode, 0);
  runDidMount();
};
