import { ComponentNode, LifeCycle } from '../analyze/types';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { generateUpdateState } from './updateStateGenerator';
import { getStates, wrapUpdate } from './utils';
import { generateUpdateProp } from './updatePropGenerator';
import {
  alterAttributeMap,
  defaultAttributeMap,
  DID_MOUNT,
  DID_UNMOUNT,
  WILL_MOUNT,
  WILL_UNMOUNT,
  importMap,
} from '../constants';
import { generateView } from '@openinula/view-generator';

export function generateLifecycle(root: ComponentNode, lifecycleType: LifeCycle) {
  root.lifecycle[lifecycleType]!.forEach(node => wrapUpdate(node, getStates(root)));
  return t.arrowFunctionExpression([], t.blockStatement(root.lifecycle[lifecycleType]!));
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
  const addProperty = (key: string, value: t.Expression | null) => {
    if (value === null) return;
    compInitializerNode.properties.push(t.objectProperty(t.identifier(key), value));
  };
  const node = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.identifier('self'),
      t.callExpression(t.identifier(importMap.createComponent), [compInitializerNode])
    )
  );

  let result: t.Statement[] = [node];

  // ---- Lifecycle
  // WILL_MOUNT add to function body directly, because it should be executed immediately
  const lifecycleNames = [DID_MOUNT, WILL_UNMOUNT, DID_UNMOUNT] as const;
  lifecycleNames.forEach((lifecycleType: LifeCycle) => {
    if (root.lifecycle[lifecycleType]?.length) {
      addProperty(lifecycleType, generateLifecycle(root, lifecycleType));
    }
  });

  // ---- Update state
  addProperty('updateState', generateUpdateState(root));

  // ---- Update props
  addProperty('updateProp', generateUpdateProp(root));

  // ---- Update views
  if (root.children) {
    const [updateViewFn, declarations, topLevelNodes] = generateView(root.children, {
      babelApi: getBabelApi(),
      importMap,
      attributeMap: defaultAttributeMap,
      alterAttributeMap,
      templateIdx: -1,
    });

    // ---- Get update views will avoke the willMount and return the updateView function.
    let getUpdateViewsFnBody: t.Statement[] = [];
    if (root.lifecycle[WILL_MOUNT]) {
      root.lifecycle[WILL_MOUNT].forEach(node => wrapUpdate(node, getStates(root)));
      getUpdateViewsFnBody = root.lifecycle[WILL_MOUNT];
    }
    const getUpdateViews =
      getUpdateViewsFnBody.length || updateViewFn
        ? t.arrowFunctionExpression(
            [],
            t.blockStatement([
              ...getUpdateViewsFnBody,
              t.returnStatement(t.arrayExpression([topLevelNodes, updateViewFn])),
            ])
          )
        : null;

    addProperty('getUpdateViews', getUpdateViews);
    // ---- Add view static declarations
    result = [...declarations, ...result];
  }

  return result;
}
