import type Babel from '@babel/core';
import { types as t } from '@openInula/babel-api';
import { Bitmap } from '@openinula/reactivity-parser';

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
  /**
   * [templateName, value]
   */
  templates: [string, t.Expression][];
  getReactBits: (depIdBitmap: Bitmap) => Bitmap | null;
}
