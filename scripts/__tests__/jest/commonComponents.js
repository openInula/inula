// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Horizon from '@cloudsop/horizon/index.ts';
import { getLogUtils } from './testUtils';

export const App = props => {
  const Parent = props.parent;
  const Child = props.child;

  return (
    <div>
      <Parent>
        <Child />
      </Parent>
    </div>
  );
};

export const Text = props => {
  const LogUtils = getLogUtils();
  LogUtils.log(props.text);
  return <p id={props.id}>{props.text}</p>;
};

export function triggerClickEvent(container, id) {
  const event = new MouseEvent('click', {
    bubbles: true,
  });
  container.querySelector(`#${id}`).dispatchEvent(event);
}
