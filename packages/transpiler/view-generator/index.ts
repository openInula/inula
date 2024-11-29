import { Bitmap, IfParticle, ViewParticle } from '@openinula/reactivity-parser';
import { types as t } from '@openInula/babel-api';
import { ViewGeneratorConfig } from './src/types';
import MainViewGenerator from './src/MainViewGenerator';
import { htmlGenerator } from './src/NodeGenerators/HTMLGenerator';

export type ViewContext = {
  t: typeof t;
  getReactBits: (depIdBitmap: Bitmap) => Bitmap;
  importMap: Record<string, string>;
};

export type ViewGenerator = {
  [key in ViewParticle['type']]: (
    viewParticle: Extract<ViewParticle, { type: key }>,
    ctx: ViewContext
  ) => t.Statement[];
};
const generators = [htmlGenerator];

function mergeViewGenerators(generators: ViewGenerator[]) {
  return generators.reduce((acc, generator) => ({ ...acc, ...generator }), {});
}
export function generateView(
  viewParticles: ViewParticle[],
  config: ViewGeneratorConfig
): [t.ArrowFunctionExpression | null, t.Statement[], t.Statement[], t.ArrayExpression] {
  const viewGenerator: ViewGenerator = mergeViewGenerators(generators);
  return new MainViewGenerator(config).generate(viewParticles);
}
