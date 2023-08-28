import Inula, { useState, Fragment } from 'inulajs';
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { NavLink } from 'react-router-dom';
import { pathToRegexp } from 'path-to-regexp';
import { arrayToTree, queryAncestors } from '../../utils';
import iconMap from '../../utils/iconMap';
import store from 'store';
import { getStore } from '../../models/app-model';
import { withRouter } from 'react-router-dom';

const { SubMenu } = Menu;

function SiderMenu({ theme, menus, history, isMobile, onCollapseChange }) {
  const st = getStore();

  const [openKeys, setOpenKeys] = useState(store.get('openKeys') || []);

  const onOpenChange = openKeys => {
    const rootSubmenuKeys = menus.filter(_ => !_.menuParentId).map(_ => _.id);

    const latestOpenKey = openKeys.find(key => openKeys.indexOf(key) === -1);

    let newOpenKeys = openKeys;
    if (rootSubmenuKeys.indexOf(latestOpenKey) !== -1) {
      newOpenKeys = latestOpenKey ? [latestOpenKey] : [];
    }

    setOpenKeys(newOpenKeys);

    store.set('openKeys', newOpenKeys);
  };

  const generateMenus = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <SubMenu
            key={item.id}
            title={
              <Fragment>
                {item.icon && iconMap[item.icon]}
                <span>{item.name}</span>
              </Fragment>
            }
          >
            {generateMenus(item.children)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={item.id}>
          <NavLink to={item.route || '#'}>
            {item.icon && iconMap[item.icon]}
            <span>{item.name}</span>
          </NavLink>
        </Menu.Item>
      );
    });
  };

  // Generating tree-structured data for menu content.
  const menuTree = arrayToTree(menus, 'id', 'menuParentId');

  // Find a menu that matches the pathname.
  const currentMenu = menus.find(_ => _.route && pathToRegexp(_.route).exec(history.location.pathname));

  // Find the key that should be selected according to the current menu.
  const selectedKeys = currentMenu ? queryAncestors(menus, currentMenu, 'menuParentId').map(_ => _.id) : [];

  const menuProps = st.collapsed
    ? {}
    : {
        openKeys: openKeys,
      };

  return (
    <Menu
      mode="inline"
      theme={theme}
      onOpenChange={onOpenChange}
      selectedKeys={selectedKeys}
      onClick={
        isMobile
          ? () => {
              onCollapseChange(true);
            }
          : undefined
      }
      {...menuProps}
    >
      {generateMenus(menuTree)}
    </Menu>
  );
}

export default withRouter(SiderMenu);
