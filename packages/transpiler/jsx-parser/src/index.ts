import { ViewParser } from './parser';
import type { ViewUnit, ViewParserConfig, AllowedJSXNode } from './types';

/**
 * @brief Generate view units from a babel ast
 * @param node
 * @param config
 * @returns ViewUnit[]
 */
export function parseView(node: AllowedJSXNode, config: ViewParserConfig): ViewUnit[] {
  return new ViewParser(config).parse(node);
}

export * from './types';
