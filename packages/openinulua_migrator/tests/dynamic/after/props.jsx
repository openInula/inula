function Hello({ name }) { return <div>Hello {name}</div>; }

function App() {
  return <Dynamic component={Hello} name="Inula" />;
}


