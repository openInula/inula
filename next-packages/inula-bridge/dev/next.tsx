'use next';

import { LegacyInput } from './index';

export function UserInput({ count, setCount }) {
  let double = count * 2;

  function incrementCount() {
    setCount(count + 1);
  }

  return (
    <>
      <h1>double: {double}</h1>
      <button onClick={incrementCount}>Add 2</button>
      <LegacyInput count={count} setCount={setCount} />
    </>
  );
}
