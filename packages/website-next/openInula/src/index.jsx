import { BrowserRouter, Route, Switch } from 'inula-router';

import HomePage from "./components/HomePage";
import PlaygroundPage from "./components/PlaygroundPage";
import Inula from "openinula";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/playground" component={PlaygroundPage} />
        {/* 可以在这里添加更多路由 */}
      </Switch>
    </BrowserRouter>
  );
}

Inula.render(<App />, document.getElementById('root'));
