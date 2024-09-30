import type Babel from '@babel/core';

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
  genTemplateKey: (key: string) => string;
  wrapUpdate: (node: Babel.types.Statement | Babel.types.Expression | null) => void;
}
