import { type types as t, type NodePath } from '@babel/core';
import { propsAnalyze } from './propsAnalyze';
import { AnalyzeContext, Analyzer, ComponentNode, CondNode, Visitor } from './types';
import { createComponentNode } from './nodeFactory';
import { propertiesAnalyze } from './propertiesAnalyze';
import { lifeCycleAnalyze } from './lifeCycleAnalyze';
import { getFnBody } from '../utils';

const builtinAnalyzers = [propsAnalyze, propertiesAnalyze, lifeCycleAnalyze];
let analyzers: Analyzer[] = builtinAnalyzers;

export function isCondNode(node: any): node is CondNode {
  return node && node.type === 'cond';
}

function mergeVisitor(...visitors: Analyzer[]): Visitor {
  return visitors.reduce<Visitor<AnalyzeContext>>((acc, cur) => {
    const visitor = cur();
    const visitorKeys = Object.keys(visitor) as (keyof Visitor)[];
    for (const key of visitorKeys) {
      if (acc[key]) {
        // if already exist, merge the visitor function
        const original = acc[key]!;
        acc[key] = (path: any, ctx) => {
          original(path, ctx);
          visitor[key]?.(path, ctx);
        };
      } else {
        // @ts-expect-error key is a valid key, no idea why it's not working
        acc[key] = visitor[key];
      }
    }
    return acc;
  }, {});
}

// walk through the function component body
export function analyzeFnComp(
  types: typeof t,
  fnNode: NodePath<t.FunctionExpression | t.ArrowFunctionExpression>,
  componentNode: ComponentNode,
  level = 0
) {
  const visitor = mergeVisitor(...analyzers);
  const context: AnalyzeContext = {
    level,
    t: types,
    current: componentNode,
    traverse: (path: NodePath<t.Statement>, ctx: AnalyzeContext) => {
      path.traverse(visitor, ctx);
    },
  };
  // --- analyze the function props ---
  const params = fnNode.get('params');
  const props = params[0];
  if (props) {
    if (props.isObjectPattern()) {
      props.get('properties').forEach(prop => {
        visitor.Prop?.(prop, context);
      });
    } else {
      throw new Error(
        `Component ${componentNode.name}: The first parameter of the function component must be an object pattern`
      );
    }
  }

  // --- analyze the function body ---
  const bodyStatements = getFnBody(fnNode).get('body');
  for (let i = 0; i < bodyStatements.length; i++) {
    const p = bodyStatements[i];

    const type = p.node.type;

    // TODO: More type safe way to handle this
    visitor[type]?.(p as unknown as any, context);

    if (p.isReturnStatement()) {
      visitor.ReturnStatement?.(p, context);
      break;
    }
  }
}
/**
 * The process of analyzing the component
 * 1. identify the component
 * 2. identify the jsx slice in the component
 * 2. identify the component's props, including children, alias, and default value
 * 3. analyze the early return of the component, build into the branch
 *
 * @param types
 * @param fnName
 * @param path
 * @param customAnalyzers
 */
export function analyze(
  types: typeof t,
  fnName: string,
  path: NodePath<t.FunctionExpression | t.ArrowFunctionExpression>,
  customAnalyzers?: Analyzer[]
) {
  if (customAnalyzers) {
    analyzers = customAnalyzers;
  }

  const root = createComponentNode(fnName, path);
  analyzeFnComp(types, path, root);

  return root;
}
