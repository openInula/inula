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
// const componentPartyList = {
//   reactivity: {
//     declareState: Name1,
//     updateState: Name2,
//     computedState: DoubleCount,
//   },
//   templating: {
//     minimalTemplate: HelloWord,
//     eventClick: Counter,
//     // loop
//     domInput: DomRef,
//     // conditional
//   },
//   lifecycle: {
//     onMount: PageTitle,
//     onUnmount: Time,
//   },
//   componentComposition: {
//     props: App,
//   }
// }

// const buildComponentList = () => {
//   let listHTML = '';
//   for (const [category, value] of Object.entries(componentPartyList)) {
//     listHTML += `<h1>${category}</h1>`;
//     for (const title in value) {
//       listHTML += `<h2>${title}</h2>`;
//       listHTML += `<div style='border: 1px solid #000; padding: 10px;'>`;
//       listHTML += `<div id='${category}-${title}'></div>`;
//       listHTML += `</div>`;
//     }
//   }
//   document.getElementById('app')!.innerHTML = listHTML;

//   for (const [category, value] of Object.entries(componentPartyList)) {
//     for (const [title, Comp] of Object.entries(value)) {
//       render(Comp(), document.getElementById(`${category}-${title}`)!);
//     }
//   }
// }

// buildComponentList();

render(Counter4(), document.getElementById('main')!);


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
