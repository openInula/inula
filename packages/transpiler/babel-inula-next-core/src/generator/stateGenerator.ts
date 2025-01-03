import { S } from 'vitest/dist/reporters-yx5ZTtEV';
import { DerivedSource } from '../analyze/types';
import { Generator, GeneratorContext } from './index';
import { types as t } from '@openinula/babel-api';
import { Dependency } from '@openinula/reactivity-parser';

export function stateGenerator(): Generator {
  return {
    state(stmt) {
      return t.variableDeclaration('let', [stmt.node]);
    },
    /*
     * Derived includes two part:
     * - variable declarement
     * - upate call expression
     * e.g.
     * let double: any;
     * self.deriveState(() => double = count * 2, () => [count], 0b0010);
     *
     * self.useHook(Hook(), (val) => self.wave((double = val), waveBits), (hook) => {
     *   hook.updateProp('count', 100);
     *   hook.updateProp('count', () => count, [count], reactBits);
     * })
     */
    derived(stmt, ctx) {
      const { selfId, getReactBits, getWaveBitsById } = ctx;

      const derivedDeclaration = t.variableDeclaration(
        'let',
        stmt.ids.map(id => t.variableDeclarator(t.identifier(id)))
      );

      let updateCall: t.Statement;
      if (stmt.source === DerivedSource.HOOK) {
        const value = t.identifier('$$value');
        updateCall = t.expressionStatement(
          t.callExpression(t.memberExpression(selfId, t.identifier('useHook')), [
            stmt.value,
            // update function
            t.arrowFunctionExpression(
              [value],
              t.callExpression(t.memberExpression(selfId, t.identifier('wave')), [
                t.parenthesizedExpression(t.assignmentExpression('=', stmt.lVal, value)),
                t.numericLiteral(getWaveBitsById(stmt.reactiveId)),
              ])
            ),
            // updater
            getHookUpdater(stmt.value, stmt.hookArgDependencies, ctx),
          ])
        );
      } else {
        updateCall = t.expressionStatement(
          t.callExpression(t.memberExpression(selfId, t.identifier('deriveState')), [
            // update function
            t.arrowFunctionExpression(
              [],
              t.parenthesizedExpression(t.assignmentExpression('=', stmt.lVal, stmt.value))
            ),
            // dependencies node
            t.arrowFunctionExpression([], stmt.dependency.dependenciesNode),
            // wave bits
            t.numericLiteral(getReactBits(stmt.dependency.depIdBitmap)),
          ])
        );
      }
      return [derivedDeclaration, updateCall];
    },
  };
}

/**
 * @example
 * (hook) => {
 *   hook.updateProp(0, () => child.name, [child?.name], 1);
 * }
 *
 * @param value
 * @param argDependencies
 * @param ctx
 * @returns
 */
function getHookUpdater(value: t.CallExpression, argDependencies: Array<Dependency | null>, ctx: GeneratorContext) {
  const hook = t.identifier('hook');

  const args = value.arguments;

  const updatePropsStmts: t.Statement[] = [];
  args.forEach((arg, idx) => {
    const dependency = argDependencies[idx];
    if (dependency) {
      let key: t.Expression = t.numericLiteral(idx);
      if (t.isRestElement(arg)) {
        key = t.stringLiteral('rest');
      }
      let value: t.Expression;
      if (t.isSpreadElement(arg)) {
        value = arg.argument;
      } else if (t.isExpression(arg)) {
        value = arg;
      } else {
        throw new Error('Invalid argument for hook function');
      }

      updatePropsStmts.push(
        t.expressionStatement(
          t.callExpression(t.memberExpression(hook, t.identifier('updateProp')), [
            key,
            t.arrowFunctionExpression([], t.isSpreadElement(arg) ? t.identifier('$$value') : arg),
            dependency.dependenciesNode,
            t.numericLiteral(ctx.getReactBits(dependency.depIdBitmap)),
          ])
        )
      );
    }
  });

  return t.arrowFunctionExpression([hook], t.blockStatement(updatePropsStmts));
}
