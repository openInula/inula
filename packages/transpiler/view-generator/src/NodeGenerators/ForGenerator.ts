import BaseGenerator, { importMap } from '../HelperGenerators/BaseGenerator';
import { type ForParticle, type ViewParticle } from '@openinula/reactivity-parser';
import { typeNode } from '../shard';
import { InulaNodeType } from '@openinula/next-shared';
import { ViewContext, ViewGenerator } from '../../index';
import { types as t } from '@openinula/babel-api';

/**
 * @example
 * ```jsx
 *    createForNode(
 *      () => data,
 *      () => data.map(({id}) => id),
 *      (node, updateItemFuncArr, item, key, idx) => {
 *        updateItemFuncArr[idx] = (newItem, newIdx) => {
 *          item = newItem
 *          idx = newIdx
 *        }
 *        return [${children}]
 *      },
 *        0b0001
 *    )
 * ```
 */
export const forGenerator: ViewGenerator = {
  for: ({ item, index: indexParam, array, key, children }: ForParticle, ctx: ViewContext) => {
    if (t.isMemberExpression(item)) {
      throw new Error('ForGenerator: item cannot be a member expression');
    }
    const index = indexParam ?? t.identifier('idx');
    return t.callExpression(t.identifier(importMap.createForNode), [
      // Array
      t.arrowFunctionExpression([], array.value),
      // Key
      t.arrowFunctionExpression(
        [],
        t.callExpression(t.memberExpression(array.value, t.identifier('map')), [t.arrowFunctionExpression([item], key)])
      ),
      // Update func
      t.arrowFunctionExpression(
        [
          t.identifier('node'), // TODO
          t.identifier('updateItemFuncArr'),
          item,
          t.identifier('key'),
          index,
        ],
        t.blockStatement([
          t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(t.identifier('updateItemFuncArr'), index),
              t.arrowFunctionExpression(
                [t.identifier('newItem'), t.identifier('newIdx')],
                t.blockStatement([
                  t.expressionStatement(t.assignmentExpression('=', item, t.identifier('newItem'))),
                  t.expressionStatement(t.assignmentExpression('=', index, t.identifier('newIdx'))),
                ])
              )
            )
          ),
          t.returnStatement(t.arrayExpression(children.map(child => ctx.next(child)))),
        ])
      ),
    ]);
  },
};
