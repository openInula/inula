import { ViewParticle } from '@openinula/reactivity-parser';
import { ComponentNode, Prop, Variable } from '../analyzer/types';
import { type types as t, type NodePath } from '@babel/core';
import { types } from '../babelTypes';

type Visitor = {
  [Type in (ViewParticle | ComponentNode)['type']]: (
    node: Extract<ViewParticle | ComponentNode, { type: Type }>,
    ctx: any
  ) => void;
};

interface GeneratorContext {
  classBodyNode: t.ClassBody;
  currentComp: ComponentNode;
}

export function generateFnComp(compNode: ComponentNode) {
  const context = {
    classBodyNode: types.classBody([]),
    currentComp: compNode,
  };
  compNode.props.forEach(prop => {
    resolvePropDecorator(context, prop, 'Prop');
  });
}

function reverseDependencyMap(dependencyMap: Record<string, Set<string>>) {
  const reversedMap: Record<string, Set<string>> = {};
  Object.entries(dependencyMap).forEach(([key, deps]) => {
    deps.forEach(dep => {
      if (!reversedMap[dep]) reversedMap[dep] = new Set();
      reversedMap[dep].add(key);
    });
  });

  return reversedMap;
}

/**
 * @brief Decorator resolver: Prop/Env
 * Add:
 * $p/e$${key}
 * @param ctx
 * @param prop
 * @param decoratorName
 */
function resolvePropDecorator(ctx: GeneratorContext, prop: Prop, decoratorName: 'Prop' | 'Env' = 'Prop') {
  if (!ctx.classBodyNode) return;
  const key = prop.name;
  ctx.classBodyNode.body.push(types.classProperty(types.identifier(key), prop.default));

  // Add tag to let the runtime know this property is a prop or env
  const tag = decoratorName.toLowerCase() === 'prop' ? 'p' : 'e';
  const derivedStatusKey = types.classProperty(types.identifier(`$${tag}$${key}`));
  ctx.classBodyNode.body.push(derivedStatusKey);
}

/**
 * @brief Decorator resolver: State
 * Add:
 *  $$${key} = ${depIdx}
 *  $sub$${key} = [${reversedDeps}]
 * @param ctx
 * @param varable
 * @param idx
 * @param reverseDeps
 */
function resolveStateDecorator(
  ctx: GeneratorContext,
  varable: Variable,
  idx: number,
  reverseDeps: Set<string> | undefined
) {
  if (!ctx.classBodyNode) return;
  if (!types.isIdentifier(node.key)) return;
  const key = node.key.name;
  const idx = ctx.currentComp.variables.indexOf(node);

  const idxNode = !ctx.dLightModel
    ? [types.classProperty(types.identifier(`$$${key}`), types.numericLiteral(1 << idx))]
    : [];

  const depsNode = reverseDeps
    ? [
        types.classProperty(
          types.identifier(`$s$${key}`),
          types.arrayExpression([...reverseDeps].map(d => types.stringLiteral(d)))
        ),
      ]
    : [];

  ctx.classBodyNode.body.splice(propertyIdx + 1, 0, ...idxNode, ...depsNode);
}
