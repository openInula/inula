import { render } from 'horizon';
import MockClassComponent from './MockClassComponent';
import MockFunctionComponent from './MockFunctionComponent';

const root = document.createElement('div');
document.body.append(root);

function App() {
  return (
    <div>
      abc
      <MockClassComponent fruit={'apple'}/>
      <MockFunctionComponent />
    </div>
  );
}

render(<App/>, root);
