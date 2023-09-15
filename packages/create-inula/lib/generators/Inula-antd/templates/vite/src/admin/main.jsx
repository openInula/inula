import Inula from 'inulajs';
import { BrowserRouter } from 'inula-router';
import config from './utils/config';
import 'antd/dist/antd.css';

import Layout from './layouts';

document.title = config.siteName;

Inula.render(
  <BrowserRouter>
    <Layout></Layout>
  </BrowserRouter>,
  document.getElementsByTagName('body')[0]
);
