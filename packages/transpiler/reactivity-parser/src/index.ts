import { type ViewUnit } from '@openinula/jsx-view-parser';
import { ReactivityParser } from './parser';
import { type ViewParticle, type ReactivityParserConfig } from './types';

/**
 * @brief Parse view units to get used properties and view particles with reactivity
 * @param viewUnits
 * @param config
 * @returns [viewParticles, usedProperties]
 */
export function parseReactivity(
  viewUnits: ViewUnit[],
  config: ReactivityParserConfig
): [ViewParticle[], Set<string>, number] {
  // ---- ReactivityParser only accepts one view unit at a time,
  //      so we loop through the view units and get all the used properties
  const usedProperties = new Set<string>();
  let usedBit = 0;
  const dlParticles = viewUnits.map(viewUnit => {
    const parser = new ReactivityParser(config);
    const dlParticle = parser.parse(viewUnit);
    parser.usedProperties.forEach(usedProperties.add.bind(usedProperties));
    usedBit |= parser.usedBit;
    return dlParticle;
  });
  return [dlParticles, usedProperties, usedBit];
}

export type * from './types';
