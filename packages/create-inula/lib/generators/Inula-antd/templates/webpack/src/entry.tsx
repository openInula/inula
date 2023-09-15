import Inula from '@cloudsop/horizon';
import { BrowserRouter } from 'react-router-dom';
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
