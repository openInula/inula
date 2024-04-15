import { View, render } from '@openinula/next';

function MyComp() {
  let count = 0;
  const db = count * 2;

  return (
    <>
      <h1 className="123">Hello dlight fn comp</h1>
      <section>
        count: {count}, double is: {db}
        <button onClick={() => (count += 1)}>Add</button>
      </section>
    </>
  );
}
render(MyComp, 'main');
