/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { createElement } from '../../../src/external/JSXElement';
import { createDomTextVNode } from '../../../src/renderer/vnode/VNodeCreator';
import { createStore } from '../../../src/inulax/adapters/redux';
import { connect } from '../../../src/inulax/adapters/reduxReact';

createStore((state: number = 0, action): number => {
  if (action.type === 'add') return state + 1;
  return 0;
});

type WrappedButtonProps = { add: () => void; count: number; text: string };

function Button(props: WrappedButtonProps) {
  const { add, count, text } = props;
  return createElement(
    'button',
    {
      onClick: add,
    },
    createDomTextVNode(text),
    createDomTextVNode(': '),
    createDomTextVNode(count)
  );
}

const connector = connect(
  state => ({ count: state }),
  dispatch => ({
    add: (): void => {
      dispatch({ type: 'add' });
    },
  }),
  (stateProps, dispatchProps, ownProps: { text: string }) => ({
    add: dispatchProps.add,
    count: stateProps.count,
    text: ownProps.text,
  })
);

const ConnectedButton = connector(Button);

function App() {
  return createElement('div', {}, createElement(ConnectedButton, { text: 'click' }));
}

export default App;
