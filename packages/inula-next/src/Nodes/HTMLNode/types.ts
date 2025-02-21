import { InulaBaseNode, Value, Bits } from "../../types";

// ---- InulaHTMLNode ----
export interface InulaHTMLNode extends HTMLElement, InulaBaseNode {
  dirtyBits?: Bits;
  // ---- Used for style caching
  prevStyle?: CSSStyleDeclaration;
  // ---- Used for caching
  [key: `c$${string}`]: Value[];
  // ---- Used for memorized event
  [key: `me$${string}`]: EventListener;
  // ---- Used for delegated event
  [key: `de$${string}`]: EventListener;
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
  dirtyBits?: Bits;
  [key: `c$${string}`]: Value[];
}
