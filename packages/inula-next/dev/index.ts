import { compBuilder, createFragmentNode, createExpNode, createHTMLNode, delegateEvent, render } from '../src';

function UserInput() {
  const self = compBuilder();
  let count = 0;

  function incrementCount() {
    self.wave((count = count + 1), 1 /*0b1*/);
  }

  return self.prepare().init(
    createFragmentNode(
      createHTMLNode(
        'h1',
        null,
        createExpNode(
          () => count,
          () => [count],
          1
        )
      ),
      createHTMLNode('button', node => {
        delegateEvent(node, 'click', incrementCount);
        node.textContent = 'Add 1';
      })
    )
  );
}

render(UserInput(), document.getElementById('main')!);
