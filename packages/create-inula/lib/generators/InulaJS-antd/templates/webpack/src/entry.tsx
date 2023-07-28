import inula from 'inula';
import { BrowserRouter } from 'react-router-dom';

import 'antd/dist/antd.css';

import Layout from './layouts';

inula.render(
  <BrowserRouter>
    <Layout></Layout>
  </BrowserRouter>,
  document.getElementsByTagName('body')[0]
);
