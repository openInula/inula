import { createContext, useContext, useState } from 'react';

export const UserContext = createContext({ level: 0, path: '' });

function App() {
  const [level] = useState(1);
  const [path] = useState('/home');
  const value = { level, path };
  return (
    <UserContext.Provider value={value}>
      <Child />
    </UserContext.Provider>
  );
}

function Child() {
  const { level, path } = useContext(UserContext);
  return <div>{level} - {path}</div>;
}


