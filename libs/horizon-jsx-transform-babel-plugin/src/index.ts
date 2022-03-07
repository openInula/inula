import SyntaxJSX from '@babel/plugin-syntax-jsx';
import * as BabelCore from '@babel/core';
import * as t from '@babel/types';
import {NodePath} from '@babel/traverse';

export default ({types}: typeof BabelCore) => {
  return {
    name: 'horizon-jsx-babel-plugin',
    inherits: SyntaxJSX,

    visitor: {
      Program(path: NodePath<t.Program>) {
        // program = path
      },

      JSXElement: {
        exit(path) {

        },
      },

    }
  };
};

