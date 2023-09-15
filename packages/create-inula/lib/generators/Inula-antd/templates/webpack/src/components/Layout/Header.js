import Inula from 'inulajs';
import { Menu, Layout } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Trans } from 'utils/intl';
import { getLocale, setLocale } from 'utils';
import classnames from 'classnames';
import config from 'config';
import styles from './Header.less';

const { SubMenu } = Menu;

function Header({
  fixed,
  username,
  collapsed,
  notifications,
  onCollapseChange,
  onAllNotificationsRead,
}) {

  const rightContent = [
    <div style={{ position: 'fixed', right: '100px' }}>
      <span style={{ color: '#999', marginRight: 4 }}>
        <Trans>Hi,</Trans>
      </span>
      <span>{username}</span>
    </div>
  ];

  if (config.i18n) {
    const { languages } = config.i18n;
    const language = getLocale();
    const currentLanguage = languages.find(item => item.key === language);

    rightContent.unshift(
      <Menu
        key="language"
        selectedKeys={[currentLanguage.key]}
        onClick={data => {
          setLocale(data.key);
        }}
        mode="horizontal"
      >
        <SubMenu title={currentLanguage.title}>
          {languages.map(item => (
            <Menu.Item key={item.key}>
              {item.title}
            </Menu.Item>
          ))}
        </SubMenu>
      </Menu>
    );
  }

  return (
    <Layout.Header
      className={classnames(styles.header, {
        [styles.fixed]: fixed,
        [styles.collapsed]: collapsed,
      })}
      id="layoutHeader"
    >
      <div className={styles.button} onClick={onCollapseChange.bind(this, !collapsed)}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <div className={styles.rightContainer}>{rightContent}</div>
    </Layout.Header>
  );
}

export default Header;
