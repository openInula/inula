import { types as t } from '@openinula/babel-api';
import { ComponentNode, ReactiveVariable } from '../analyze/types';
import { getStates, wrapUpdate } from './utils';
import { PROP_SUFFIX } from '../constants';

/**
 * @View
 * updateProp: (propName, newValue) => {
 *   if (propName === 'prop1') {
 *      xxx
 *   } else if (propName === 'prop2') {
 *      xxx
 *   }
 * }
 */
export function generateUpdateProp(root: ComponentNode) {
  const props = root.variables.filter(v => v.type === 'reactive' && v.name.endsWith(PROP_SUFFIX)) as ReactiveVariable[];

  const propNodes: [string, t.ExpressionStatement][] = props.map(prop => {
    const propName = prop.name.replace(PROP_SUFFIX, '');
    const updateNode = t.expressionStatement(
      t.assignmentExpression('=', t.identifier(prop.name), t.identifier('newValue'))
    );
    wrapUpdate(updateNode, getStates(root));
    return [propName, updateNode];
  });

  const ifNode = propNodes.reduce<t.IfStatement | null>((acc, cur) => {
    const [propName, updateNode] = cur;
    const ifNode = t.ifStatement(
      t.binaryExpression('===', t.identifier('propName'), t.stringLiteral(propName)),
      t.blockStatement([updateNode]),
      acc
    );
    return ifNode;
  }, null);

  const node = t.arrowFunctionExpression(
    [t.identifier('propName'), t.identifier('newValue')],
    t.blockStatement(ifNode ? [ifNode] : [])
  );

  return node;
}
