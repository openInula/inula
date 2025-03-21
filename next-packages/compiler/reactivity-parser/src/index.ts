import { type ViewUnit } from '@openinula/jsx-view-parser';
import { ReactivityParser } from './parser';
import { type ViewParticle, type ReactivityParserConfig } from './types';

/**
 * @brief Parse view units to get used properties and view particles with reactivity
 * @param viewUnits
 * @param config
 * @returns [viewParticles, usedProperties]
 */
export function parseReactivity(viewUnit: ViewUnit, config: ReactivityParserConfig): [ViewParticle, number] {
  const parser = new ReactivityParser(config);
  const particle = parser.parse(viewUnit);
  return [particle, parser.usedReactiveBits];
}

export { getDependenciesFromNode, Dependency } from './getDependencies';
export * from './types';
