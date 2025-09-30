function App() {
  let level = 1;
  let path = '/home';
  return (
    <UserContext level={level} path={path}>
      <Child />
    </UserContext>
  );
}

function Child() {
  const { level, path } = useContext(UserContext);
  return <div>{level} - {path}</div>;
}


