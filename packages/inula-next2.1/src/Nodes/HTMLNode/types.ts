import { InulaBaseNode, Value, Bits } from '../../types';
import { CompNode } from '../CompNode/node';
// ---- InulaHTMLNode ----
export interface InulaHTMLNode extends HTMLElement, InulaBaseNode {
  // ---- Used for style caching
  prevStyle?: CSSStyleDeclaration;
  // ---- Used for caching
  [key: `c$${string}`]: Value[];
  // ---- Used for memorized event
  [key: `me$${string}`]: EventListener;
  // ---- Used for delegated event
  [key: `de$${string}`]: EventListener;
  // ---- Used for memorizing the owner CompNode
  __$owner?: CompNode;
}

export interface InulaHTMLTemplateNode extends InulaHTMLNode {
  nodesInserted: InulaBaseNode[];
  elementsRetrieved: (InulaHTMLNode | InulaTextNode)[];
}

export interface HTMLAttrsObject {
  [key: string]: Value;
  style?: CSSStyleDeclaration;
  dataset?: { [key: string]: string };
}

export interface InulaTextNode extends Text, InulaBaseNode {
  __$owner?: CompNode;
  dirtyBits?: Bits;
  [key: `c$${string}`]: Value[];
}
