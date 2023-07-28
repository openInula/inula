import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import 'antd/dist/antd.css';

import Layout from './layouts';

ReactDom.render(
  <BrowserRouter>
    <Layout></Layout>
  </BrowserRouter>,
  document.getElementsByTagName('body')[0]
);
