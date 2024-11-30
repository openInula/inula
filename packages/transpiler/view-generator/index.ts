import { Bitmap, IfParticle, ViewParticle } from '@openinula/reactivity-parser';
import { types as t } from '@openInula/babel-api';
import { ViewGeneratorConfig } from './src/types';
import MainViewGenerator from './src/MainViewGenerator';
import { htmlGenerator } from './src/NodeGenerators/HTMLGenerator';

export type ViewContext = {
  getReactBits: (depIdBitmap: Bitmap) => Bitmap;
  importMap: Record<string, string>;
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
const generators = [htmlGenerator];

function mergeViewGenerators(generators: ViewGenerator[]) {
  return generators.reduce((acc, generator) => ({ ...acc, ...generator }), {});
}
export function generateView(viewParticle: ViewParticle, config: ViewGeneratorConfig) {
  const viewGenerator: ViewGenerator = mergeViewGenerators(generators);
  const generator = viewGenerator[viewParticle.type];
  if (!generator) throw new Error(`No generator for view particle type: ${viewParticle.type}`);

  return generator(viewParticle, {
    getReactBits: config.getReactBits,
    importMap: config.importMap,
    addTemplate: (templateName: string, value: t.Expression) => {
      config.templates.push([templateName, value]);
    },
    getNextTemplateIdx: () => config.templates.length,
    next: (viewParticle: ViewParticle) => {
      return generateView(viewParticle, config);
    },
  });
}
