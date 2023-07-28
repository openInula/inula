import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { queryLayout } from 'utils';
import config from 'utils/config';

import PublicLayout from './PublicLayout';
import PrimaryLayout from './PrimaryLayout';
import { withRouter } from 'react-router-dom';
import './BaseLayout.less';

const LayoutMap = {
  primary: PrimaryLayout,
  public: PublicLayout,
};

function BaseLayout({ children, location }) {
  const Container = LayoutMap[queryLayout(config.layouts, location.pathname)];

  return (
    <Fragment>
      <Helmet>
        <title>{config.siteName}</title>
      </Helmet>
      <Container>{children}</Container>
    </Fragment>
  );
}

export default withRouter(BaseLayout);
