import { createElement } from '../../../../libs/horizon/src/external/JSXElement';
import { createDomTextVNode } from '../../../../libs/horizon/src/renderer/vnode/VNodeCreator';
import { createStore } from '../../../../libs/horizon/src/horizonx/adapters/redux';
import { connect } from '../../../../libs/horizon/src/horizonx/adapters/reduxReact';

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
