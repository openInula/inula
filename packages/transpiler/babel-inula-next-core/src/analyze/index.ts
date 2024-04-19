import { NodePath } from '@babel/core';
import { jsxSlicesAnalyze } from './jsxSliceAnalyze';
import { earlyReturnAnalyze } from './earlyReturnAnalyze';
import { AnalyzeContext, Analyzer, ComponentNode, CondNode, Visitor } from './types';
import { createComponentNode } from './nodeFactory';
import { propertiesAnalyze } from './propertiesAnalyze';
import { isValidComponent } from './utils';
import * as t from '@babel/types';
import { getFnBody } from '../utils';
const builtinAnalyzers = [jsxSlicesAnalyze, earlyReturnAnalyze, propertiesAnalyze];
let analyzers: Analyzer[] = builtinAnalyzers;

export function isCondNode(node: any): node is CondNode {
  return node && node.type === 'cond';
}

function mergeVisitor(...visitors: Analyzer[]): Visitor {
  return visitors.reduce((acc, cur) => {
    return {
      ...acc,
      ...cur(),
    };
  }, {});
}

// walk through the function component body
export function iterateFCBody(bodyStatements: NodePath<t.Statement>[], componentNode: ComponentNode, level = 0) {
  const visitor = mergeVisitor(...analyzers);
  const visit = (p: NodePath<t.Statement>, ctx: AnalyzeContext) => {
    const type = p.node.type;

    // TODO: More type safe way to handle this
    visitor[type]?.(p as unknown as any, ctx);
  };
  for (let i = 0; i < bodyStatements.length; i++) {
    const p = bodyStatements[i];
    let skipRest = false;
    const context: AnalyzeContext = {
      level,
      index: i,
      currentComponent: componentNode,
      restStmt: bodyStatements.slice(i + 1),
      skipRest() {
        skipRest = true;
      },
      traverse: (path: NodePath<t.Statement>, ctx: AnalyzeContext) => {
        // @ts-expect-error TODO: fix visitor type incompatibility
        path.traverse(visitor, ctx);
      },
    };

    visit(p, context);

    if (p.isReturnStatement()) {
      visitor.ReturnStatement?.(p, context);
      break;
    }

    if (skipRest) {
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
 * @param path
 * @param customAnalyzers
 */
export function analyze(
  fnName: string,
  path: NodePath<t.FunctionExpression | t.ArrowFunctionExpression>,
  customAnalyzers?: Analyzer[]
) {
  if (customAnalyzers) {
    analyzers = customAnalyzers;
  }

  const root = createComponentNode(fnName, getFnBody(path));

  return root;
}
