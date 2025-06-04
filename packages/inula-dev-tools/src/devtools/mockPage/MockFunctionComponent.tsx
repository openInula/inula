/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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

import { useState, useEffect, useRef, useContext, useReducer } from 'openinula';
import { MockContext } from './MockContext';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

export default function MockFunctionComponent(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [age, setAge] = useState(0);
  const [name, setName] = useState({ test: 1 });
  const domRef = useRef<HTMLDivElement>();
  const objRef = useRef({ str: 'string' });
  const context = useContext(MockContext);

  useEffect(() => {}, []);

  return (
    <div>
      age: {age}
      name: {name.test}
      <button onClick={() => setAge(age + 1)}>update age</button>
      count: {props.count}
      <div ref={domRef} />
      <div>{objRef.current.str}</div>
      <div>{context.ctx}</div>
    </div>
  );
}
