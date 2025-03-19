import { getTypeName, InulaNodeType } from '@openinula/next-shared';
import { types as t } from '@openinula/babel-api';

export function typeNode(type: InulaNodeType) {
  const node = t.numericLiteral(type);
  t.addComment(node, 'trailing', getTypeName(type), false);
  return node;
}

export function generateNodeName(nodeIdx: number, tag: string): string {
  return `${tag}${nodeIdx}`;
}
