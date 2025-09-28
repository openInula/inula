import type { NodePath } from '@babel/core';
import { types as t } from '@openinula/babel-api';
import { AnalyzeContext, Visitor } from '../types';
import { DestructuringPayload, parseDestructuring } from '../parseDestructuring';
import { CompilerError } from '@openinula/error-handler';

export function compPropsAnalyze(): Visitor {
  return {
    Props: (path: NodePath<t.RestElement | t.Identifier | t.Pattern>[], { builder }: AnalyzeContext) => {
      const props = path[0];
      const reducer = (payload: DestructuringPayload) => {
        if (payload.type === 'rest') {
          builder.addRestProps(payload.name);
        } else if (payload.type === 'single') {
          builder.addSingleProp(payload.name, payload.value);
        } else if (payload.type === 'props') {
          builder.addProps(payload.name, payload.node);
        }
      };
      parseDestructuring(props, reducer);
    },
  };
}

export function hookPropsAnalyze(): Visitor {
  return {
    Props: (path: NodePath<t.RestElement | t.Identifier | t.Pattern>[], { builder }: AnalyzeContext) => {
      path.forEach((prop, idx) => {
        if (prop.isIdentifier()) {
          builder.addSingleProp(idx, prop);
        } else if (prop.isRestElement()) {
          const arg = prop.get('argument');
          if (!Array.isArray(arg) && arg.isIdentifier()) {
            builder.addRestProps(arg.node.name);
            return;
          }
          throw new CompilerError('Unsupported rest element type in hook props destructuring', prop.node.loc);
        } else {
          builder.addSingleProp(idx, prop);
        }
      });
    },
  };
}
