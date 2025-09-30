function Hello({ name }) { return <div>Hello {name}</div>; }

function App() {
  const Comp = Hello;
  return <Comp name="React" />;
}


