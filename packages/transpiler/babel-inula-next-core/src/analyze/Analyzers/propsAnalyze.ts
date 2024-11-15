import type { NodePath } from '@babel/core';
import { types as t } from '@openinula/babel-api';
import { AnalyzeContext, Visitor } from '../types';

export function propsAnalyze(ast: NodePath<t.Identifier | t.RestElement | t.Pattern>): Visitor {
  return {
    Prop: (path: NodePath<t.RestElement | t.ObjectProperty>, { builder }: AnalyzeContext) => {
      if (path.isRestElement()) {
        const propName = path.get('argument');
        const propValue = path.get('value');
        state.props.push({
          name: propName.get('name'),
          value: propValue,
          type: propValue.get('type'),
        });
      } else if (path.isIdentifier()) {
        state.props.push({
          name: path.get('name'),
          value: path,
          type: path.get('type'),
        });
      }
    },
    Props: (path: NodePath<t.Identifier>, state: AnalyzeContext) => {},
  };
}
