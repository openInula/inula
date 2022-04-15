import { useState, useEffect, useRef, createContext } from 'horizon';

const Ctx = createContext();

export default function MockFunctionComponent(props) {
  const [age, setAge] = useState(0);
  const domRef = useRef<HTMLDivElement>();
  const objRef = useRef({ str: 'string' });
  
  useEffect(() => { }, []);

  return (
    <div>
      age: {age}
      <button onClick={() => setAge(age + 1)} >update age</button>
      count: {props.count}
      <div ref={domRef} />
      <div>{objRef.current.str}</div>
      <Ctx.Provider value={{ctx: 'I am ctx'}}></Ctx.Provider>
    </div>
  );
}