import Inula, { Fragment } from 'inulajs';
import { Menu, Layout, Avatar, Popover, List } from 'antd';
import { Ellipsis } from 'components';
import { RightOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Trans } from 'utils/intl';
import { getLocale, setLocale } from 'utils';
import moment from 'moment';
import classnames from 'classnames';
import config from 'config';
import styles from './Header.less';

const { SubMenu } = Menu;

function Header({
  onSignOut,
  fixed,
  avatar,
  username,
  collapsed,
  notifications,
  onCollapseChange,
  onAllNotificationsRead,
}) {
  const handleClickMenu = e => {
    e.key === 'SignOut' && onSignOut();
  };

  const rightContent = [
    <Menu key="user" mode="horizontal" onClick={handleClickMenu}>
      <SubMenu
        title={
          <Fragment>
            <span style={{ color: '#999', marginRight: 4 }}>
              <Trans>Hi,</Trans>
            </span>
            <span>{username}</span>
            <Avatar style={{ marginLeft: 8 }} src={avatar} />
          </Fragment>
        }
      ></SubMenu>
    </Menu>,
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
        <SubMenu title={<Avatar size="small" src={currentLanguage.flag} />}>
          {languages.map(item => (
            <Menu.Item key={item.key}>
              <Avatar size="small" style={{ marginRight: 8 }} src={item.flag} />
              {item.title}
            </Menu.Item>
          ))}
        </SubMenu>
      </Menu>
    );
  }

  rightContent.unshift(
    <Popover
      placement="bottomRight"
      trigger="click"
      key="notifications"
      overlayClassName={styles.notificationPopover}
      getPopupContainer={() => document.querySelector('#primaryLayout')}
      content={
        <div className={styles.notification}>
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            locale={{
              emptyText: <Trans>You have viewed all notifications.</Trans>,
            }}
            renderItem={item => (
              <List.Item className={styles.notificationItem}>
                <List.Item.Meta
                  title={
                    <Ellipsis tooltip lines={1}>
                      {item.title}
                    </Ellipsis>
                  }
                  description={moment(item.date).fromNow()}
                />
                <RightOutlined style={{ fontSize: 10, color: '#ccc' }} />
              </List.Item>
            )}
          />
          {notifications.length ? (
            <div onClick={onAllNotificationsRead} className={styles.clearButton}>
              <Trans>Clear notifications</Trans>
            </div>
          ) : null}
        </div>
      }
    ></Popover>
  );

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
