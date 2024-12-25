import { types as t } from '@openinula/babel-api';
import { Bitmap } from '@openinula/reactivity-parser';

export interface ViewGeneratorConfig {
  importMap: Record<string, string>;
  attributeMap: Record<string, string[]>;
  alterAttributeMap: Record<string, string>;
  wrapUpdate: (node: t.Statement | t.Expression | null) => void;
  /**
   * [templateName, value]
   */
  templates: [string, t.Expression][];
  getReactBits: (depIdBitmap: Bitmap) => Bitmap;
  genTemplateKey: (name: string) => string;
}
