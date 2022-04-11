import * as Horizon from '@cloudsop/horizon/index.ts';
import * as LogUtils from './logUtils';

export const App = (props) => {
  const Parent = props.parent;
  const Child = props.child;

  return (
    <div>
      <Parent>
        <Child />
      </Parent>
    </div>
  );
}

export const Text = (props) => {
  LogUtils.log(props.text);
  return <p id={props.id}>{props.text}</p>;
}
