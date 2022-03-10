import SyntaxJSX from '@babel/plugin-syntax-jsx';
import * as BabelCore from '@babel/core';
import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';
import { JSXIdentifier, JSXMemberExpression, JSXNamespacedName } from '@babel/types';

function isHTMLTag(tagName: string) {
  return tagName && /^[a-z]/.test(tagName);
}

const horizonJsx = t.memberExpression(t.identifier('Horizon'), t.identifier('jsx'));

function getTagNodeName(tagNode: JSXIdentifier | JSXMemberExpression | JSXNamespacedName) {
  let tagName;
  if (t.isJSXNamespacedName(tagNode)) {
    throw 'horizon jsx doesn\'t support JSX namespace: ' + tagNode;
  } else if (t.isJSXIdentifier(tagNode)) {
    /*
        this -> thisExpression
        HTML -> stringLiteral
        Others -> Identifier
     */
    tagName = tagNode.name === 'this' ?
      t.thisExpression() : isHTMLTag(tagNode.name) ?
        t.stringLiteral(tagNode.name) :
        t.identifier(tagNode.name);
  } else if (t.isJSXMemberExpression(tagNode)) {
    tagName = t.memberExpression(
      getTagNodeName(tagNode.object),
      getTagNodeName(tagNode.property),
    );
  }
  return tagName;
}

export default ({ types }: typeof BabelCore) => {

  return {
    name: 'horizon-jsx-babel-plugin',
    inherits: SyntaxJSX,

    visitor: {
      Program(path: NodePath<t.Program>) {
        // program = path
      },

      JSXElement: {
        exit(path: NodePath<t.JSXElement>) {
          const openingElement = path.get('openingElement');
          const tagName = getTagNodeName(openingElement.node.name);
          path.replaceWith(t.callExpression(horizonJsx, [tagName]));
        },
      },
    },
  };
};

