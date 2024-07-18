import type Babel from '@babel/core';

export type SnippetPropMap = Record<string, string[]>;

export interface ViewGeneratorConfig {
  babelApi: typeof Babel;
  importMap: Record<string, string>;
  templateIdx: number;
  attributeMap: Record<string, string[]>;
  alterAttributeMap: Record<string, string>;
  /**
   * The subComponent in comp, [name, usedBit]
   */
  subComps: Array<[string, number]>;
}
