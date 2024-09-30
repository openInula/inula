import { type ViewParticle } from '@openinula/reactivity-parser';
import { type ViewGeneratorConfig } from './types';
import MainViewGenerator from './MainViewGenerator';
import type { types as t } from '@babel/core';

export function generateView(
  viewParticles: ViewParticle[],
  config: ViewGeneratorConfig
): [t.ArrowFunctionExpression | null, t.Statement[], t.Statement[], t.ArrayExpression] {
  return new MainViewGenerator(config).generate(viewParticles);
}

export * from './types';
