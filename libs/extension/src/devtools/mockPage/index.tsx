import { render } from 'horizon';
import MockClassComponent from './MockClassComponent';
import MockFunctionComponent from './MockFunctionComponent';
import { MockContext } from './MockContext';

const root = document.createElement('div');
document.body.append(root);
function App() {
  return (
    <div>
      <MockContext.Provider value={{ ctx: 'I am ctx' }}>
        <MockClassComponent fruit={'apple'} />
        <MockFunctionComponent />
      </MockContext.Provider>
      abc
    </div>
  );
}

render(<App />, root);
