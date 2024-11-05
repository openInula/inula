import { ComponentNode, HookNode, IRNode, LifeCycle, SubComponentNode } from '../analyze/types';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { generateUpdateState } from './updateStateGenerator';
import { getStates, wrapUpdate } from './utils';
import { generateUpdateContext, generateUpdateProp } from './updatePropGenerator';
import {
  alterAttributeMap,
  defaultAttributeMap,
  DID_MOUNT,
  DID_UNMOUNT,
  importMap,
  PROP_SUFFIX,
  WILL_MOUNT,
  WILL_UNMOUNT,
} from '../constants';
import { generateView } from '@openinula/view-generator';
import { getSubComp } from '../utils';
import { generateSelfId } from './index';
import { NodePath } from '@babel/core';

export function generateLifecycle(root: IRNode, lifecycleType: LifeCycle) {
  root.lifecycle[lifecycleType]!.forEach(node => wrapUpdate(generateSelfId(root.level), node, getStates(root)));
  return t.arrowFunctionExpression([], t.blockStatement(root.lifecycle[lifecycleType]!));
}

function genWillMountCodeBlock(root: IRNode) {
  // ---- Get update views will avoke the willMount and return the updateView function.
  let getUpdateViewsFnBody: t.Statement[] = [];
  if (root.lifecycle[WILL_MOUNT]) {
    root.lifecycle[WILL_MOUNT].forEach(node => wrapUpdate(generateSelfId(root.level), node, getStates(root)));
    getUpdateViewsFnBody = root.lifecycle[WILL_MOUNT];
  }
  return getUpdateViewsFnBody;
}

function generateUpdateViewFn(root: ComponentNode<'comp'> | SubComponentNode) {
  const getUpdateViewsFnBody = genWillMountCodeBlock(root);
  const fnBodyStmts: t.Statement[] = [...getUpdateViewsFnBody];
  if (root.children) {
    // ---- Generate view
    const subComps = getSubComp(root.variables).map((v): [string, number] => [v.name, v.usedBit]);
    const [updateViewFn, nodeInitStmt, templates, topLevelNodes] = generateView(root.children, {
      babelApi: getBabelApi(),
      importMap,
      attributeMap: defaultAttributeMap,
      alterAttributeMap,
      templateIdx: -1,
      subComps,
      genTemplateKey: (key: string) => root.fnNode.scope.generateUid(key),
      wrapUpdate: (node: t.Statement | t.Expression | null) => {
        wrapUpdate(generateSelfId(root.level), node, getStates(root));
      },
    });
    const program = root.fnNode.scope.getProgramParent().path as NodePath<t.Program>;
    for (let i = templates.length - 1; i >= 0; i--) {
      program.unshiftContainer('body', templates[i]);
    }

    if (nodeInitStmt.length) {
      fnBodyStmts.push(...nodeInitStmt);
    }
    fnBodyStmts.push(t.returnStatement(t.arrayExpression([topLevelNodes, updateViewFn])));
  }

  return fnBodyStmts.length ? t.arrowFunctionExpression([], t.blockStatement(fnBodyStmts)) : null;
}

/**
 * Generate the update hook function
 * ```js
 * updateHook: changed => {
 *   if (changed & 1) {
 *     emitUpdate(self);
 *   }
 * }
 * ```
 * @param root
 */
function generateUpdateHookFn(root: HookNode) {
  const getUpdateViewsFnBody = genWillMountCodeBlock(root);

  const fnBody: t.Statement[] = [];
  if (getUpdateViewsFnBody.length) {
    fnBody.push(...getUpdateViewsFnBody);
  }

  const children = root.children;
  if (children) {
    const paramId = t.identifier('$changed');
    const hookUpdateFn = t.functionExpression(
      null,
      [paramId],
      t.blockStatement([
        t.ifStatement(
          t.binaryExpression('&', paramId, t.numericLiteral(Number(children.depMask))),
          t.expressionStatement(t.callExpression(t.identifier(importMap.emitUpdate), [generateSelfId(root.level)]))
        ),
      ])
    );
    fnBody.push(t.returnStatement(hookUpdateFn));
  }

  return fnBody.length ? t.arrowFunctionExpression([], t.blockStatement(fnBody)) : null;
}

/**
 * @View
 * self = Inula.createComponent({
 *  willMount: () => {},
 *  baseNode: ${nodePrefix}0,
 *  getUpdateViews: () => {
 *    return [[$node0],changed => {
 *      if (changed & 1) $node1.update();
 *    }],
 *  },
 *  updateProp: (propName, newValue) => {},
 *  updateState: (changed) => {}
 * })
 */
export function generateComp(root: ComponentNode | HookNode | SubComponentNode) {
  const compInitializerNode = t.objectExpression([]);
  const addProperty = (key: string, value: t.Expression | null) => {
    if (value === null) return;
    compInitializerNode.properties.push(t.objectProperty(t.identifier(key), value));
  };

  const nodeCtor = root.type === 'hook' ? t.identifier(importMap.createHook) : t.identifier(importMap.createComponent);
  const node = t.expressionStatement(
    t.assignmentExpression('=', generateSelfId(root.level), t.callExpression(nodeCtor, [compInitializerNode]))
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
  let getUpdateViews: t.ArrowFunctionExpression | null;
  if (root.type === 'hook') {
    getUpdateViews = generateUpdateHookFn(root);
    addProperty('value', root.children ? t.arrowFunctionExpression([], root.children.value) : t.nullLiteral());
  } else {
    getUpdateViews = generateUpdateViewFn(root);
  }

  if (getUpdateViews) {
    addProperty('getUpdateViews', getUpdateViews);
  }

  return result;
}
