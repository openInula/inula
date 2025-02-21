import { render } from '../src';
import { Name as Name1 } from './reactivity/declareState';
import { Name as Name2 } from './reactivity/updateState';
import { DoubleCount } from './reactivity/computedState';
import { HelloWord } from './templating/minimalTemplate';
import { Counter } from './templating/eventClick';
import { DomRef } from './templating/domRef';
import { PageTitle } from './lifecycle/onMount';
import { Time } from './lifecycle/onUnmount';
import { App } from './component-composition/props';
import {
  compBuilder,
  createFragmentNode,
  createHTMLNode,
  createCompNode,
  createTextNode,
  setHTMLProp,
  delegateEvent,
  createExpNode,
} from '../src';
import { createConditionalNode } from '../src/Nodes/MutableNodes/conditional';

import { Counter4 } from './Test-context';
import { CondTest } from './CondTest';
import { ForTest } from './ForTest';
// import {Counter4} from './Test';

import { TemplateTest } from './TemplateTest';
import {
  compBuilder as $$compBuilder,
  createFragmentNode as $$createFragmentNode,
  createTextNode as $$createTextNode,
  createPortal as $$createPortal,
  delegateEvent as $$delegateEvent,
  createExpNode as $$createExpNode,
  createHTMLNode as $$createHTMLNode,
  createChildren as $$createChildren,
  createCompNode as $$createCompNode,
} from '@openinula/next';
function Button({ children, onClick, count }) {
  const $$self = $$compBuilder();
  $$self.addProp('children', value => (children = value), 1);
  $$self.addProp('onClick', value => (onClick = value), 2);
  $$self.addProp('count', value => (count = value), 4);
  return $$self.prepare().init(
    $$createPortal(
      {
        children: [
          $$createHTMLNode(
            'button',
            $$node => {
              $$delegateEvent($$node, 'click', () => onClick, [onClick], 2);
            },
            $$createExpNode(
              () => children,
              () => [children],
              1
            ),
            $$createExpNode(
              () => count,
              () => [count],
              4
            )
          ),
        ],
      },
      null
    )
  );
}

function App() {
  const $$self = $$compBuilder();
  let count = 2;
  function incrementCount() {
    $$self.wave((count = count + 1), 1 /*0b1*/);
  }

  return $$self.prepare().init(
    $$createHTMLNode(
      'div',
      null,
      $$createHTMLNode(
        'h1',
        null,
        $$createTextNode('count: '),
        $$createExpNode(
          () => count,
          () => [count],
          1
        )
      ),
      $$createCompNode(
        Button,
        {
          children: $$createChildren(() => [$$createTextNode('Add 1: ')], $$self),
          onClick: incrementCount,
          count: count,
        },
        $$node => {
          $$node.updateProp('count', () => count, [count], 1);
        }
      )
    )
  );
}
render(App(), document.getElementById('main')!);

// let jj = []
// function ok() {
//   for (let i = 0; i < 1000000; i++) {
//     jj.push(() => 100)
//   }
// }

// const buttonToAdd = document.createElement('button');
// buttonToAdd.textContent = 'Add';
// buttonToAdd.onclick = ok;

// document.body.appendChild(buttonToAdd);

// const buttonToRemove = document.createElement('button');
// buttonToRemove.textContent = 'Remove';
// buttonToRemove.onclick = () => {
//   jj = []
// }

// document.body.appendChild(buttonToRemove);
