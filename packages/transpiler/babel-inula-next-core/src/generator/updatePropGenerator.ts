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
export function generateUpdateProp(root: ComponentNode, suffix: string) {
  const props = root.variables.filter(v => v.type === 'reactive' && v.name.endsWith(suffix)) as ReactiveVariable[];
  if (!props.length) {
    return null;
  }
  const propNodes: [string, t.ExpressionStatement][] = props.map(prop => {
    const propName = prop.name.replace(suffix, '');
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

/**
 *  Transfrom context
 *  ```js
 *  function App() {
 *    let level_$c$_ = useContext(UserContext, 'level')
 *    let path_$c$_ = useContext(UserContext, 'path')
 *    let user_$ctx$_ = useContext(UserContext)
 *  }
 *  // turn into
 *  function App() {
 *    self = {
 *      updateContext: (ctx, key, value) => {
 *        if (ctx === UserContext) {
 *          if (key === 'level') {
 *            level_$c$_ = value;
 *          }
 *          if (key === 'path') {
 *            path_$c$_ = value;
 *          }
 *          user_$ctx$_ = value;
 *        }
 *      }
 *    }
 *  }
 * @param root
 * @param suffix
 */
export function generateUpdateContext(root: ComponentNode) {
  const contextVars = root.variables.filter(
    v => v.type === 'reactive' && (v.name.endsWith('_$c$_') || v.name.endsWith('_$ctx$_'))
  ) as ReactiveVariable[];

  if (!contextVars.length) {
    return null;
  }

  const contextMap = new Map<string, ReactiveVariable[]>();

  contextVars.forEach(v => {
    const useContextCallExpression = v.value;
    if (!t.isCallExpression(useContextCallExpression)) {
      throw new Error('Context value error, should be useContext()');
    }
    const contextId = useContextCallExpression.arguments[0];
    if (!t.isIdentifier(contextId)) {
      throw new Error('The first argument of UseContext should be an identifier');
    }
    const contextName = contextId.name;
    if (!contextMap.has(contextName)) {
      contextMap.set(contextName, []);
    }
    contextMap.get(contextName)!.push(v);
  });

  const contextCases: t.IfStatement[] = [];

  contextMap.forEach((vars, contextName) => {
    const specificKeys = vars.filter(v => v.name.endsWith('_$c$_'));
    const wholeContext = vars.find(v => v.name.endsWith('_$ctx$_'));

    const keyUpdates: t.Statement[] = specificKeys.map(v => {
      const keyName = v.name.replace('_$c$_', '');
      const updateAssign = t.expressionStatement(
        t.assignmentExpression('=', t.identifier(v.name), t.identifier('value'))
      );
      wrapUpdate(updateAssign, getStates(root));

      return t.ifStatement(
        t.binaryExpression('===', t.identifier('key'), t.stringLiteral(keyName)),
        t.blockStatement([updateAssign])
      );
    });

    if (wholeContext) {
      const updateAssign = t.expressionStatement(
        t.assignmentExpression('=', t.identifier(wholeContext.name), t.identifier('value'))
      );
      wrapUpdate(updateAssign, getStates(root));
      keyUpdates.push(updateAssign);
    }

    contextCases.push(
      t.ifStatement(
        t.binaryExpression('===', t.identifier('ctx'), t.identifier(contextName)),
        t.blockStatement(keyUpdates)
      )
    );
  });

  return t.arrowFunctionExpression(
    [t.identifier('ctx'), t.identifier('key'), t.identifier('value')],
    t.blockStatement(contextCases)
  );
}
