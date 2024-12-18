import type { NodePath } from '@babel/core';
import { types as t } from '@openinula/babel-api';
import { AnalyzeContext, Visitor } from '../types';
import { DestructuringPayload, parseDestructuring } from '../parseDestructuring';

export function propsAnalyze(): Visitor {
  return {
    Props: (path: NodePath<t.RestElement | t.Identifier | t.Pattern>, { builder }: AnalyzeContext) => {
      const reducer = (payload: DestructuringPayload) => {
        if (payload.type === 'rest') {
          builder.addRestProps(payload.name);
        } else if (payload.type === 'single') {
          builder.addSingleProp(payload.name, payload.value, payload.node);
        } else if (payload.type === 'props') {
          builder.addProps(payload.name, payload.node);
        }
      };
      parseDestructuring(path, reducer);
    },
  };
}
