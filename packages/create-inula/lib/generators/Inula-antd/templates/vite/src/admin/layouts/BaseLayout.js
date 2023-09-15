import Inula, { Fragment } from 'inulajs';
import { queryLayout } from 'utils';
import config from 'utils/config';

import PublicLayout from './PublicLayout';
import PrimaryLayout from './PrimaryLayout';
import { withRouter } from 'inula-router';
import './BaseLayout.less';

const LayoutMap = {
  primary: PrimaryLayout,
  public: PublicLayout,
};

function BaseLayout({ children, location }) {
  const Container = LayoutMap[queryLayout(config.layouts, location.pathname)];

  return (
    <Fragment>
      <Container>{children}</Container>
    </Fragment>
  );
}

export default withRouter(BaseLayout);
