import { render, useState } from 'horizon';
import MockClassComponent from './MockClassComponent';
import MockFunctionComponent from './MockFunctionComponent';
import { MockContext } from './MockContext';

const root = document.createElement('div');
document.body.append(root);
function App() {
  const [count, setCount] = useState(12);
  return (
    <div>
      <button onClick={() => (setCount(count + 1))} >add count</button>
      <MockContext.Provider value={{ ctx: 'I am ctx' }}>
        <MockClassComponent fruit={'apple'} />
        <MockFunctionComponent count={count}/>
      </MockContext.Provider>
      abc
    </div>
  );
}

render(<App />, root);
