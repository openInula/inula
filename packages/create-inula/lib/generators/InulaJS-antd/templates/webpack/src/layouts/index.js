import Inula, { Suspense } from 'inulajs';
import { ConfigProvider } from 'antd';
import { IntlProvider } from 'react-intl';
import { getLocale } from '../utils';
import BaseLayout from './BaseLayout';
import { Route, withRouter } from 'react-router-dom';
import { getRoutes } from '../pages/routes';
import { getLangResource } from '../utils/intl';

function Layout() {
  let language = getLocale();

  let langResource = getLangResource(language);

  const routes = getRoutes();

  return (
    <ConfigProvider locale={langResource[language]}>
      <IntlProvider messages={langResource[language]} locale={language}>
        <BaseLayout>
          <Suspense fallback={''}>
            <Route path={routes[0].path} component={routes[0].component}>
              {routes[0].childRoutes.map(item => {
                return <Route path={item.path} component={item.component} />;
              })}
            </Route>
          </Suspense>
        </BaseLayout>
      </IntlProvider>
    </ConfigProvider>
  );
}

export default withRouter(Layout);
