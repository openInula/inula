import { type NodePath } from '@babel/core';
import { AnalyzeContext, Analyzer, CompOrHook, FunctionalExpression, Visitor } from './types';
import { variablesAnalyze } from './Analyzers/variablesAnalyze';
import { functionalMacroAnalyze } from './Analyzers/functionalMacroAnalyze';
import { getFnBodyPath } from '../utils';
import { viewAnalyze } from './Analyzers/viewAnalyze';
import { COMPONENT, HOOK } from '../constants';
import { types as t } from '@openinula/babel-api';
import { hookReturnAnalyze } from './Analyzers/hookAnalyze';
import { IRBuilder } from './IRBuilder';

const compBuiltinAnalyzers = [variablesAnalyze, functionalMacroAnalyze, viewAnalyze];
const hookBuiltinAnalyzers = [variablesAnalyze, functionalMacroAnalyze, hookReturnAnalyze];

function mergeVisitor(...visitors: Analyzer[]): Visitor {
  return visitors.reduce<Visitor<AnalyzeContext>>((acc, cur) => {
    return { ...acc, ...cur() };
  }, {});
}

// walk through the body a function (maybe a component or a hook)
export function analyzeUnitOfWork(name: string, fnNode: NodePath<FunctionalExpression>, context: AnalyzeContext) {
  const { builder, analyzers } = context;
  const visitor = mergeVisitor(...analyzers);

  // --- analyze the function props ---
  const params = fnNode.get('params');
  const props = params[0];
  if (props) {
    if (props.isObjectPattern()) {
      props.get('properties').forEach(prop => {
        visitor.Prop?.(prop, context);
      });
    } else {
      throw new Error(`Component ${name}: The first parameter of the function component must be an object pattern`);
    }
  }

  // --- analyze the function body ---
  const bodyStatements = getFnBodyPath(fnNode).get('body');
  for (let i = 0; i < bodyStatements.length; i++) {
    const path = bodyStatements[i];

    const type = path.node.type;

    const visit = visitor[type];
    if (visit) {
      // TODO: More type safe way to handle this
      visit(path as unknown as any, context);
    } else {
      builder.addWillMount(path.node);
    }

    if (path.isReturnStatement()) {
      visitor.ReturnStatement?.(path, context);
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

  const builder = new IRBuilder(fnName, type, path, options.htmlTags);

  analyzeUnitOfWork(fnName, path, { builder, analyzers });

  return builder.build();
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
