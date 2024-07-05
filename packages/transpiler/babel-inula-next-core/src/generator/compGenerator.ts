import { ComponentNode, HookNode, IRNode, LifeCycle } from '../analyze/types';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { generateUpdateState } from './updateStateGenerator';
import { getStates, wrapUpdate } from './utils';
import { generateUpdateContext, generateUpdateProp } from './updatePropGenerator';
import {
  alterAttributeMap,
  defaultAttributeMap,
  DID_MOUNT,
  DID_UNMOUNT,
  WILL_MOUNT,
  WILL_UNMOUNT,
  importMap,
  PROP_SUFFIX,
} from '../constants';
import { generateView } from '@openinula/view-generator';

export function generateLifecycle(root: IRNode, lifecycleType: LifeCycle) {
  root.lifecycle[lifecycleType]!.forEach(node => wrapUpdate(node, getStates(root)));
  return t.arrowFunctionExpression([], t.blockStatement(root.lifecycle[lifecycleType]!));
}

function genWillMountCodeBlock(root: IRNode) {
  // ---- Get update views will avoke the willMount and return the updateView function.
  let getUpdateViewsFnBody: t.Statement[] = [];
  if (root.lifecycle[WILL_MOUNT]) {
    root.lifecycle[WILL_MOUNT].forEach(node => wrapUpdate(node, getStates(root)));
    getUpdateViewsFnBody = root.lifecycle[WILL_MOUNT];
  }
  return getUpdateViewsFnBody;
}

function generateUpdateViewFn(root: ComponentNode<'comp'>) {
  const [updateViewFn, declarations, topLevelNodes] = generateView(root.children, {
    babelApi: getBabelApi(),
    importMap,
    attributeMap: defaultAttributeMap,
    alterAttributeMap,
    templateIdx: -1,
  });
  const getUpdateViewsFnBody = genWillMountCodeBlock(root);
  if (declarations.length) {
    getUpdateViewsFnBody.push(...declarations);
  }
  return getUpdateViewsFnBody.length || topLevelNodes.elements.length
    ? t.arrowFunctionExpression(
        [],
        t.blockStatement([...getUpdateViewsFnBody, t.returnStatement(t.arrayExpression([topLevelNodes, updateViewFn]))])
      )
    : null;
}

function generateUpdateHookFn(root: HookNode) {
  const getUpdateViewsFnBody = genWillMountCodeBlock(root);
  const children = root.children!;
  const paramId = t.identifier('$changed');
  const hookUpdateFn = t.functionExpression(
    null,
    [paramId],
    t.blockStatement([
      t.ifStatement(
        t.binaryExpression('&', paramId, t.numericLiteral(Number(children.depMask))),
        t.expressionStatement(
          t.callExpression(t.memberExpression(t.identifier('self'), t.identifier('emitUpdate')), [])
        )
      ),
    ])
  );
  return getUpdateViewsFnBody.length || hookUpdateFn
    ? t.arrowFunctionExpression(
        [],
        t.blockStatement([
          ...getUpdateViewsFnBody,
          // hookUpdateFn ? t.returnStatement(hookUpdateFn) : null,
        ])
      )
    : null;
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
export function generateComp(root: ComponentNode | HookNode) {
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

  const result: t.Statement[] = [node];

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
  const updatePropsFn = generateUpdateProp(root, PROP_SUFFIX);
  if (updatePropsFn) {
    addProperty('updateProp', updatePropsFn);
  }

  // ---- Update context
  const updateContextFn = generateUpdateContext(root);
  if (updateContextFn) {
    addProperty('updateContext', updateContextFn);
  }

  // ---- Update views
  if (root.children) {
    let getUpdateViews: t.ArrowFunctionExpression | null;
    if (root.type === 'hook') {
      getUpdateViews = generateUpdateHookFn(root);
    } else {
      getUpdateViews = generateUpdateViewFn(root);
    }

    if (getUpdateViews) {
      addProperty('getUpdateViews', getUpdateViews);
    }
  }

  return result;
}
