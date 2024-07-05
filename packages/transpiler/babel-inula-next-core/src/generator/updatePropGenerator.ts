import { types as t } from '@openinula/babel-api';
import { ComponentNode, IRNode, ReactiveVariable } from '../analyze/types';
import { getStates, wrapUpdate } from './utils';
import { PROP_SUFFIX, SPECIFIC_CTX_SUFFIX, WHOLE_CTX_SUFFIX } from '../constants';

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
export function generateUpdateProp(root: IRNode, suffix: string) {
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
 *  Aggregate the context variable of the same context into a map
 *  Key is context name
 *  Value is the context variable arrays
 * @param contextVars
 */
function getContextMap(contextVars: ReactiveVariable[]) {
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
  return contextMap;
}

/**
 *  Generate context update methods
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
export function generateUpdateContext(root: IRNode) {
  const contextVars = root.variables.filter(
    v => v.type === 'reactive' && (v.name.endsWith(SPECIFIC_CTX_SUFFIX) || v.name.endsWith(WHOLE_CTX_SUFFIX))
  ) as ReactiveVariable[];

  if (!contextVars.length) {
    return null;
  }

  const contextMap = getContextMap(contextVars);

  // The parameters of updateContext
  const contextParamId = t.identifier('ctx');
  const keyParamId = t.identifier('key');
  const valParamId = t.identifier('value');

  // The if statements for context to update.
  const contextUpdateStmts: t.IfStatement[] = [];
  contextMap.forEach((vars, contextName) => {
    const specificKeyedCtxVars = vars.filter(v => v.name.endsWith(SPECIFIC_CTX_SUFFIX));
    const wholeCtxVar = vars.find(v => v.name.endsWith(WHOLE_CTX_SUFFIX));

    const updateStmts: t.Statement[] = specificKeyedCtxVars.map(v => {
      const keyName = v.name.replace(SPECIFIC_CTX_SUFFIX, '');
      const updateAssign = t.expressionStatement(t.assignmentExpression('=', t.identifier(v.name), valParamId));
      wrapUpdate(updateAssign, getStates(root));

      // Gen code like: if (key === 'level') { level_$c$_ = value }
      return t.ifStatement(
        t.binaryExpression('===', keyParamId, t.stringLiteral(keyName)),
        t.blockStatement([updateAssign])
      );
    });

    if (wholeCtxVar) {
      const updateWholeContextAssignment = t.expressionStatement(
        t.assignmentExpression('=', t.identifier(wholeCtxVar.name), valParamId)
      );
      wrapUpdate(updateWholeContextAssignment, getStates(root));
      updateStmts.push(updateWholeContextAssignment);
    }

    contextUpdateStmts.push(
      t.ifStatement(t.binaryExpression('===', contextParamId, t.identifier(contextName)), t.blockStatement(updateStmts))
    );
  });

  return t.arrowFunctionExpression([contextParamId, keyParamId, valParamId], t.blockStatement(contextUpdateStmts));
}
