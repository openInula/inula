import { IfParticle, ViewParticle } from '@openinula/reactivity-parser';
import { types as t } from '@openInula/babel-api';
import { ViewGeneratorConfig } from './src/types';
import MainViewGenerator from './src/MainViewGenerator';
import { htmlGenerator } from './src/NodeGenerators/HTMLGenerator';

export type ViewContext = {
  t: typeof t;
};

export type ViewGenerator = {
  [key in ViewParticle['type']]: (
    viewParticle: Extract<ViewParticle, { type: key }>,
    ctx: ViewContext
  ) => t.Statement[];
};
const generators = [htmlGenerator];
export function generateView(
  viewParticles: ViewParticle[],
  config: ViewGeneratorConfig
): [t.ArrowFunctionExpression | null, t.Statement[], t.Statement[], t.ArrayExpression] {
  const viewGenerator: ViewGenerator = mergeViewGenerators(config.viewGenerators);
  return new MainViewGenerator(config).generate(viewParticles);
}
