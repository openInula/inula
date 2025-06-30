import { flattenArray } from './utils';

export function Menu(props) {
  if (props['active-text-color']) props.activeTextColor = props['active-text-color'];
  if (props['background-color']) props.backgroundColor = props['background-color'];
  if (props['default-active']) props.defaultActive = props['default-active'];
  if (props['text-color']) props.textColor = props['text-color'];
  const processedChildren = flattenArray(
    props.children.filter(item => item.vtype === 12).map(item => item.props.children())
  ).map(child => {
    const newChild = window.horizon.cloneElement(child, {
      router: props.router,
      activeTextColor: props.activeTextColor,
      backgroundColor: props.backgroundColor,
      defaultActive: props.defaultActive,
      textColor: props.textColor,
      onSelect: props.onSelect,
    });
    return newChild;
  });

  return (
    <ul
      style={{
        padding: 0,
      }}
      className={props.class}
    >
      {processedChildren}
    </ul>
  );
}

export function MenuItem({ index, id, router, activeTextColor, backgroundColor, textColor, onSelect, defaultActive }) {
  const routes = router.getRoutes();
  const route = router.match(index);
  const foundRoute = routes[route];
  const currentRoute = router.match(router?.currentRoute?.value?.path);

  const active = route === currentRoute;

  return (
    <li
      style={{
        width: '100%',
      }}
      id={id}
    >
      <button
        style={{
          width: '100%',
          backgroundColor: active ? '#0077ff' : backgroundColor,
          color: 'white',
          textAlign: 'left',
          padding: '0 20px',
          border: '0',
          borderRadius: '2px',
          padding: '5px',
          margin: '5px 0',
        }}
        className={'action'}
        onClick={() => {
          onSelect(index);
        }}
      >
        {foundRoute?.meta?.title || '<no title>'}
      </button>
    </li>
  );
}

export function SubMenu({ children, router, activeTextColor, backgroundColor, textColor, onSelect, defaultActive }) {
  const makeTitle = children.find(child => child.vtype === 12 && child.props.name === 'title')?.props?.children;
  const menuItems = children.filter(child => child !== makeTitle);
  const [collapsed, setCollapsed] = window.horizon.useState(true);
  return [
    <div>
      <button
        style={{
          width: '100%',
          backgroundColor: backgroundColor,
          color: 'white',
          textAlign: 'left',
          padding: '0 20px',
          border: '0',
          borderRadius: '2px',
          padding: '5px',
          margin: '5px 0',
        }}
        className={'action'}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '▶ ' : '▼ '}
        {makeTitle()}
      </button>
    </div>,
    collapsed
      ? null
      : children
          .filter(child => child !== makeTitle)
          .map(child =>
            window.horizon.cloneElement(child, {
              router,
              activeTextColor,
              backgroundColor,
              textColor,
              onSelect,
              defaultActive,
            })
          ),
  ];
}

export function MenuItemGroup({
  children,
  router,
  activeTextColor,
  backgroundColor,
  textColor,
  onSelect,
  defaultActive,
}) {
  return (
    <Menu
      router={router}
      activeTextColor={activeTextColor}
      backgroundColor={backgroundColor}
      textColor={textColor}
      onSelect={onSelect}
      defaultActive={defaultActive}
    >
      {children.map((item, index) => {
        return (
          <template key={'menuItem' + index}>
            <MenuItem index={item.props.key}>{item}</MenuItem>
          </template>
        );
      })}
    </Menu>
  );
}
