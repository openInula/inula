import { Bitmap, IfParticle, ViewParticle } from '@openinula/reactivity-parser';
import { types as t } from '@openInula/babel-api';
import { ViewGeneratorConfig } from './types';
import MainViewGenerator from './MainViewGenerator';
import { htmlGenerator } from './NodeGenerators/HTMLGenerator';
import { forGenerator } from './NodeGenerators/ForGenerator';
import { templateGenerator } from './NodeGenerators/TemplateGenerator';
import { compGenerator } from './NodeGenerators/CompGenerator';
import { runWithConfig } from './HelperGenerators/BaseGenerator';
import { expGenerator } from './NodeGenerators/ExpGenerator';
import { fragmentGenerator } from './NodeGenerators/FragmentGenerator';
import { textGenerator } from './NodeGenerators/TextGenerator';
import { ifGenerator } from './NodeGenerators/IfGenerator';
import { contextGenerator } from './NodeGenerators/ContextGenerator';

export type ViewContext = {
  getReactBits: (depIdBitmap: Bitmap) => Bitmap;
  importMap: Record<string, string>;
  wrapUpdate: (node: t.Statement | t.Expression | null) => void;
  next: (viewParticle: ViewParticle) => t.Expression;
  addTemplate: (templateName: string, value: t.Expression) => void;
  getNextTemplateIdx: () => number;
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
      getNextTemplateIdx: () => config.templates.length,
      next: visit,
    });
  };

  return runWithConfig(config, () => visit(viewParticle));
}

export * from './types';
