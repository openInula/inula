import type Babel from '@babel/core';
import { types as t } from '@openInula/babel-api';
import { Bitmap } from '@openinula/reactivity-parser';

export interface ViewGeneratorConfig {
  importMap: Record<string, string>;
  attributeMap: Record<string, string[]>;
  alterAttributeMap: Record<string, string>;
  wrapUpdate: (node: Babel.types.Statement | Babel.types.Expression | null) => void;
  /**
   * [templateName, value]
   */
  templates: [string, t.Expression][];
  getReactBits: (depIdBitmap: Bitmap) => Bitmap;
}
