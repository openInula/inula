import * as inula from 'openinula';
import { UserInput } from './next';
import { Button } from './next/Button';

export function LegacyInput({ count, setCount }) {
  return <input value={count} />;
}

function App() {
  const [count, setCount] = inula.useState(0);
  const [show, setShow] = inula.useState(true);

  return (
    <div>
      <h1>Hello Inula! Single: {count}</h1>
      <Button onClick={() => setShow(!show)}>Toggle</Button>
      {show && <UserInput count={count} setCount={setCount} />}
    </div>
  );
}

inula.render(inula.createElement(App), document.body);
