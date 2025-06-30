import t from '@babel/types';

export function getNextJSXElment(path) {
  let nextElements = {
    ifNode: path,
    elseNodes: [],
    elseIfNodes: [],
  };

  /**
   * 当父节点有变化， 比如 <div v-if='a'/> 变成 {a &&  <div />  } 】
   * 调用path.getSibling方法时，因为其节点变了，所以会失效
   */
  if (path.parentPath.type === 'JSXExpressionContainer') {
    // 这个空逻辑很神奇,内部实现没有看于源码，猜测这个过程会重新去解析字节点，所以后面调用path.getSibling会继续生效
    path.parentPath.traverse({
      JSXElement: path_ => {
        // console.log(path_.toString());
      },
    });
  }
  for (let i = path.key + 1; ; i++) {
    const nextPath = path.getSibling(i);
    if (!nextPath.node) {
      break;
    } else if (t.isJSXElement(nextPath.node)) {
      const vIfAttr = nextPath.node.openingElement.attributes.find(attr => attr.name && attr.name.name === 'v-if');
      const vElseIfAttr = nextPath.node.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'v-else-if'
      );
      const vElseAttr = nextPath.node.openingElement.attributes.find(attr => attr.name && attr.name.name === 'v-else');

      if (vIfAttr) {
        break;
      } else if (vElseIfAttr) {
        nextElements.elseIfNodes.push(nextPath);
      } else if (vElseAttr) {
        nextElements.elseNodes.push(nextPath);
        break;
      }
    }
  }
  return nextElements;
}

export function genSFCRenderMethod(path, state, argument) {
  // computed props
  const computedProps = Object.keys(state.computeds);
  let blocks = [];

  if (computedProps.length) {
    computedProps.forEach(prop => {
      const v = state.computeds[prop];
      blocks = blocks.concat(v['_statements']);
    });
  }
  blocks = blocks.concat(t.returnStatement(argument));

  const render = t.classMethod('method', t.identifier('render'), [], t.blockStatement(blocks));

  path.node.body.push(render);
}
