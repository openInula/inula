function Hello() { return <div>Hello</div>; }
function World() { return <div>World</div>; }

function App({ condition }) {
  const Comp = condition ? Hello : World;
  return <Comp />;
}


