export function createHashRouter(routes) {
  const listeners = [];

  function getPath() {
    const hash = window.location.hash || '#/';
    const path = hash.startsWith('#') ? hash.slice(1) : hash;
    return path || '/';
  }

  function matchRoute(pathname) {
    return routes[pathname] || routes['/'] || null;
  }

  function notify() {
    const path = getPath();
    const component = matchRoute(path);
    listeners.forEach((fn) => fn({ path, component }));
  }

  function onChange(fn) {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  function navigate(path) {
    if (!path.startsWith('#')) {
      window.location.hash = `#${path}`;
    } else {
      window.location.hash = path;
    }
  }

  window.addEventListener('hashchange', notify);
  // 初始一次
  setTimeout(notify, 0);

  return {
    onChange,
    navigate,
    get current() {
      const path = getPath();
      return { path, component: matchRoute(path) };
    }
  };
}
