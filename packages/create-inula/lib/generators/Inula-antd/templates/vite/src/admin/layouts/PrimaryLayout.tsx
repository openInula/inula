import Inula, { useEffect, Fragment } from '@cloudsop/horizon';
import PropTypes from 'prop-types';
import { MyLayout, GlobalFooter } from '../components';
import { BackTop, Layout, Drawer } from 'antd';

import { pathToRegexp } from 'path-to-regexp';
import { getLocale } from '../utils';
import config from '../utils/config';
import Error from '../pages/404';
import styles from './PrimaryLayout.module.less';
import store from 'store';
import { getStore } from '../models/app-model';
import { withRouter } from 'react-router-dom';

const { Content } = Layout;
const { Header, Bread, Sider } = MyLayout;

function PrimaryLayout({ children, location, history }) {
  const st = getStore();

  useEffect(() => {
    st.query(history);
  }, []);

  const onCollapseChange = collapsed => {
    st.handleCollapseChange(collapsed);
  };

  const theme = st.theme;
  const collapsed = st.collapsed;
  const notifications = st.notifications;
  const user = store.get('user') || {};
  const permissions = st.permissions;
  const routeList = st.routeList || [];

  const lang = getLocale();

  const newRouteList =
    lang !== 'en'
      ? routeList.map(item => {
          const { name, ...other } = item;
          return {
            ...other,
            name: (item[lang] || {}).name || name,
          };
        })
      : routeList;

  // Find a route that matches the pathname.
  const currentRoute = newRouteList.find(_ => _.route && pathToRegexp(`${_.route}`).exec(location.pathname));

  // Query whether you have permission to enter this page
  const hasPermission = currentRoute ? permissions.visit.includes(currentRoute.id) : false;

  // MenuParentId is equal to -1 is not a available menu.
  const menus = newRouteList.filter(_ => _.menuParentId !== '-1');

  const headerProps = {
    menus,
    collapsed,
    notifications,
    onCollapseChange,
    avatar: user.avatar,
    username: user.username,
    fixed: config.fixedHeader,
    onAllNotificationsRead: () => {
      st.allNotificationsRead();
    },
  };

  const siderProps = {
    theme,
    menus,
    collapsed,
    onCollapseChange,
    onThemeChange: theme => {
      st.handleThemeChange(theme);
    },
  };

  return (
    <Fragment>
      <Layout>
        <Sider {...siderProps} />

        <div className={styles.container} style={{ paddingTop: config.fixedHeader ? 72 : 0 }} id="primaryLayout">
          <Header {...headerProps} />
          <Content className={styles.content}>
            <Bread routeList={newRouteList} />
            {hasPermission ? children : <Error />}
          </Content>
          <BackTop className={styles.backTop} target={() => document.querySelector('#primaryLayout')} />
          <GlobalFooter className={styles.footer} copyright={config.copyright} />
        </div>
      </Layout>
    </Fragment>
  );
}

export default withRouter(PrimaryLayout);
