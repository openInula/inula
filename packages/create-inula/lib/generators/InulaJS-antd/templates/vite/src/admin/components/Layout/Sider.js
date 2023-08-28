import Inula from 'inulajs';
import { Switch, Layout } from 'antd';
import { t } from 'utils/intl';
import { Trans } from 'utils/intl';
import { BulbOutlined } from '@ant-design/icons';
import ScrollBar from '../ScrollBar';
import config from 'utils/config';
import SiderMenu from './SiderMenu';
import styles from './Sider.module.less';

function Sider({ menus, theme, isMobile, collapsed, onThemeChange, onCollapseChange }) {
  return (
    <Layout.Sider
      width={256}
      theme={theme}
      breakpoint="lg"
      trigger={null}
      collapsible
      collapsed={collapsed}
      onBreakpoint={!isMobile && onCollapseChange}
      className={styles.sider}
    >
      <div className={styles.brand}>
        <div className={styles.logo}>
          <img alt="logo" src={config.logoPath} />
          {!collapsed && <h1>{config.siteName}</h1>}
        </div>
      </div>

      <div className={styles.menuContainer}>
        <ScrollBar
          options={{
            // Disabled horizontal scrolling, https://github.com/utatti/perfect-scrollbar#options
            suppressScrollX: true,
          }}
        >
          <SiderMenu
            menus={menus}
            theme={theme}
            isMobile={isMobile}
            collapsed={collapsed}
            onCollapseChange={onCollapseChange}
          />
        </ScrollBar>
      </div>
      {!collapsed && (
        <div className={styles.switchTheme}>
          <span className={theme === 'dark' ? styles.darkTheme : ''}>
            <BulbOutlined />
            <Trans>Switch Theme</Trans>
          </span>
          <Switch
            onChange={onThemeChange.bind(this, theme === 'dark' ? 'light' : 'dark')}
            defaultChecked={theme === 'dark'}
            checkedChildren={t`Dark`}
            unCheckedChildren={t`Light`}
          />
        </div>
      )}
    </Layout.Sider>
  );
}

export default Sider;
