import { useState, useEffect, useRef, useContext, useReducer } from 'horizon';
import { MockContext } from './MockContext';

const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

export default function MockFunctionComponent(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [age, setAge] = useState(0);
  const domRef = useRef<HTMLDivElement>();
  const objRef = useRef({ str: 'string' });
  const context = useContext(MockContext);

  useEffect(() => { }, []);

  return (
    <div>
      age: {age}
      <button onClick={() => setAge(age + 1)} >update age</button>
      count: {props.count}
      <div ref={domRef} />
      <div>{objRef.current.str}</div>
      <div>{context.ctx}</div>
    </div>
  );
}