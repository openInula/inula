import { type NodePath } from '@babel/core';
import { AnalyzeContext, Analyzer, ComponentNode, CompOrHook, HookNode, Visitor } from './types';
import { addLifecycle, createIRNode } from './nodeFactory';
import { variablesAnalyze } from './Analyzers/variablesAnalyze';
import { functionalMacroAnalyze } from './Analyzers/functionalMacroAnalyze';
import { getFnBodyPath } from '../utils';
import { viewAnalyze } from './Analyzers/viewAnalyze';
import { COMPONENT, HOOK, WILL_MOUNT } from '../constants';
import { types as t } from '@openinula/babel-api';
import { pruneUnusedState } from './pruneUnusedState';
import { hookReturnAnalyze } from './Analyzers/hookAnalyze';

const compBuiltinAnalyzers = [variablesAnalyze, functionalMacroAnalyze, viewAnalyze];
const hookBuiltinAnalyzers = [variablesAnalyze, functionalMacroAnalyze, hookReturnAnalyze];

function mergeVisitor(...visitors: Analyzer[]): Visitor {
  return visitors.reduce<Visitor<AnalyzeContext>>((acc, cur) => {
    return { ...acc, ...cur() };
  }, {});
}

// walk through the function component body
export function analyzeFnComp(
  fnNode: NodePath<t.FunctionExpression | t.ArrowFunctionExpression>,
  componentNode: ComponentNode | HookNode,
  { htmlTags, analyzers }: { analyzers: Analyzer[]; htmlTags: string[] },
  level = 0
) {
  const visitor = mergeVisitor(...analyzers);
  const context: AnalyzeContext = {
    level,
    current: componentNode,
    htmlTags,
    analyzers,
    collectUnhandledNodeToLifecycle: addLifecycle.bind(null, WILL_MOUNT),
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
  const bodyStatements = getFnBodyPath(fnNode).get('body');
  for (let i = 0; i < bodyStatements.length; i++) {
    const p = bodyStatements[i];

    const type = p.node.type;

    const visit = visitor[type];
    if (visit) {
      // TODO: More type safe way to handle this
      visit(p as unknown as any, context);
    } else {
      context.collectUnhandledNodeToLifecycle(componentNode, p.node);
    }

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
 * @param type
 * @param fnName
 * @param path
 * @param options
 */
export function analyze(
  type: CompOrHook,
  fnName: string,
  path: NodePath<t.FunctionExpression | t.ArrowFunctionExpression>,
  options: { customAnalyzers?: Analyzer[]; htmlTags: string[] }
) {
  const analyzers = options?.customAnalyzers ? options.customAnalyzers : getBuiltinAnalyzers(type);

  const root = createIRNode(fnName, type, path);
  analyzeFnComp(path, root, { analyzers, htmlTags: options.htmlTags });

  pruneUnusedState(root);

  return root;
}

function getBuiltinAnalyzers(type: CompOrHook) {
  if (type === COMPONENT) {
    return compBuiltinAnalyzers;
  }
  if (type === HOOK) {
    return hookBuiltinAnalyzers;
  }
  throw new Error('Unsupported type to analyze');
}
