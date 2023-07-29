import Inula from 'inulajs';
import { BrowserRouter } from 'react-router-dom';

import 'antd/dist/antd.css';

import Layout from './layouts';

Inula.render(
  <BrowserRouter>
    <Layout></Layout>
  </BrowserRouter>,
  document.getElementsByTagName('body')[0]
);
