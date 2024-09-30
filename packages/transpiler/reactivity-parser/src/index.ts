import { type ViewUnit } from '@openinula/jsx-view-parser';
import { ReactivityParser } from './parser';
import { type ViewParticle, type ReactivityParserConfig } from './types';

/**
 * @brief Parse view units to get used properties and view particles with reactivity
 * @param viewUnits
 * @param config
 * @returns [viewParticles, usedProperties]
 */
export function parseReactivity(viewUnits: ViewUnit[], config: ReactivityParserConfig): [ViewParticle[], number] {
  // ---- ReactivityParser only accepts one view unit at a time,
  //      so we loop through the view units and get all the used properties
  let usedBit = 0;
  const particles = viewUnits.map(viewUnit => {
    const parser = new ReactivityParser(config);
    const particle = parser.parse(viewUnit);
    usedBit |= parser.usedBit;
    return particle;
  });
  return [particles, usedBit];
}

export { getDependenciesFromNode } from './getDependencies';
export * from './types';
