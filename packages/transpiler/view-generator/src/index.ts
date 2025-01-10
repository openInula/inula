import { Bitmap, IfParticle, ViewParticle } from '@openinula/reactivity-parser';
import { types as t } from '@openinula/babel-api';
import { ViewGeneratorConfig } from './types';
import { htmlGenerator } from './NodeGenerators/HTMLGenerator';
import { forGenerator } from './NodeGenerators/ForGenerator';
import { templateGenerator } from './NodeGenerators/TemplateGenerator';
import { compGenerator } from './NodeGenerators/CompGenerator';
import { prefixMap, runWithConfig } from './utils/config';
import { expGenerator } from './NodeGenerators/ExpGenerator';
import { fragmentGenerator } from './NodeGenerators/FragmentGenerator';
import { textGenerator } from './NodeGenerators/TextGenerator';
import { ifGenerator } from './NodeGenerators/IfGenerator';
import { contextGenerator } from './NodeGenerators/ContextGenerator';
import { suspenseGenerator } from './NodeGenerators/SuspenseGenerator';
export type ViewContext = {
  getReactBits: (depIdBitmap: Bitmap) => Bitmap;
  importMap: Record<string, string>;
  wrapUpdate: (node: t.Statement | t.Expression | null) => void;
  next: (viewParticle: ViewParticle) => t.Expression;
  addTemplate: (templateName: string, value: t.Expression) => void;
  genTemplateKey: () => string;
};

export type ViewGenerator = {
  [key in ViewParticle['type']]?: (
    viewParticle: Extract<ViewParticle, { type: key }>,
    ctx: ViewContext
  ) => t.Expression;
};
const generators = [
  htmlGenerator,
  textGenerator,
  ifGenerator,
  forGenerator,
  templateGenerator,
  compGenerator,
  expGenerator,
  fragmentGenerator,
  contextGenerator,
  suspenseGenerator,
];

function mergeViewGenerators(generators: ViewGenerator[]) {
  return generators.reduce((acc, generator) => ({ ...acc, ...generator }), {});
}
export function generateView(viewParticle: ViewParticle, config: ViewGeneratorConfig) {
  const viewGenerator: ViewGenerator = mergeViewGenerators(generators);
  const visit = (viewParticle: ViewParticle) => {
    const generator = viewGenerator[viewParticle.type];
    if (!generator) {
      throw new Error(`No generator for view particle type: ${viewParticle.type}`);
    }
    return generator(viewParticle as any, {
      wrapUpdate: config.wrapUpdate,
      getReactBits: config.getReactBits,
      importMap: config.importMap,
      addTemplate: (templateName: string, value: t.Expression) => {
        config.templates.push([templateName, value]);
      },
      genTemplateKey: () => config.genTemplateKey(prefixMap.template),
      next: visit,
    });
  };

  return runWithConfig(config, () => visit(viewParticle));
}

export * from './types';
