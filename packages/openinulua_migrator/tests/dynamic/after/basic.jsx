function Hello() { return <div>Hello</div>; }
function World() { return <div>World</div>; }

function App({ condition }) {
  return <Dynamic component={condition ? Hello : World} />;
}


