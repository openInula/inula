import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import '@cloudsop/eview-ui/style/aui2.less';
import Home from './Home';
import LayoutDemo from './LayoutDemo';
import FormDemo from './FormDemo';
import WizardsDemo from './WizardsDemo';
import TableDemo from './TableDemo';
import TreeDemo from './TreeDemo';
import PanelDemo from './PanelDemo';

function App() {
  return (
    <>
      <Router>
        <Route path="/">
          <Home />
        </Route>
        <Route path="/layout">
          <LayoutDemo />
        </Route>
        <Route path="/form">
          <FormDemo />
        </Route>
        <Route path="/wizards">
          <WizardsDemo />
        </Route>
        <Route path="/table">
          <TableDemo />
        </Route>
        <Route path="/tree">
          <TreeDemo />
        </Route>
        <Route path="/panel">
          <PanelDemo />
        </Route>
      </Router>
    </>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
