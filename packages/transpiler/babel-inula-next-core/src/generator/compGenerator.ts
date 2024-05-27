import { ComponentNode, LifeCycle } from '../analyze/types';
import { types as t } from '@openinula/babel-api';
import { generateUpdateState } from './updateStateGenerator';
import { getStates, wrapUpdate } from './utils';
import { generateUpdateProp } from './updatePropGenerator';


function generateLifecycle(root: ComponentNode, lifecycleType: LifeCycle) {
  root.lifecycle[lifecycleType]!.forEach(node => wrapUpdate(node, getStates(root)));
  return t.arrowFunctionExpression(
    [],
    t.blockStatement(root.lifecycle[lifecycleType]!)
  );
}

/** 
 * @View
 * self = Inula.createComponent({
 *  willMount: () => {},
 *  baseNode: ${nodePrefix}0,
 *  updateView: changed => {},
 *  updateProp: (propName, newValue) => {},
 *  updateState: (changed) => {}
 * })
*/
export function generateComp(root: ComponentNode) {
  const compInitializerNode = t.objectExpression([]);
  const addProperty = (key: string, value: t.Expression) => {
    compInitializerNode.properties.push(
      t.objectProperty(t.identifier(key), value)
    );
  };
  const node = t.expressionStatement(t.assignmentExpression(
    '=',
    t.identifier('self'),
    t.callExpression(
      t.memberExpression(t.identifier('Inula'), t.identifier('createComponent')),
      [compInitializerNode]
    )
  ));

  // ---- Lifecycle
  if (root.lifecycle.willMount?.length) {
    addProperty('willMount', generateLifecycle(root, 'willMount'));
  }

  if (root.lifecycle.onMount?.length) {
    addProperty('didMount', generateLifecycle(root, 'onMount'));
  }

  if (root.lifecycle.willUnmount?.length) {
    addProperty('willUnmount', generateLifecycle(root, 'willUnmount'));
  }

  if (root.lifecycle.onUnmount?.length) {
    addProperty('onUnmount', generateLifecycle(root, 'onUnmount'));
  }


  // ---- Update state
  addProperty('updateState', generateUpdateState(root));
  

  // ---- Update props
  addProperty('updateProp', generateUpdateProp(root));

  return node;
}