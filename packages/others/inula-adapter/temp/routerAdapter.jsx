import LazyComponent from './LazyComponent';
import { computed } from './vue-horizon';

const EXACT = 'exact';
const DYNAMIC = 'dynamic';

export let useRouter = () => {
  throw Error('no router found');
};

export let useRoute = () => {
  throw Error('no router found');
};

function parseRouteDescriptor(route) {
  const parts = route.split('/');

  return parts
    .filter(part => part.length)
    .map(part => {
      const result = {};
      result.raw = part;
      if (part.startsWith(':')) {
        const lastChar = part[part.length - 1];
        result.type = DYNAMIC;
        if (lastChar === '?') {
          result.optional = true;
          part = part.substring(0, part.length - 1);
        }
        if (lastChar === '*') {
          result.optional = true;
          result.repeat = true;
          part = part.substring(0, part.length - 1);
        }
        if (lastChar === '+') {
          result.repeat = true;
          part = part.substring(0, part.length - 1);
        }

        result.match = part.match(/\((.*)\)$/)?.[1] || '.*';

        result.name = part.match(/^:?(\w*)/)?.[1];
      } else {
        result.type = EXACT;
        if (part[part.length - 1] === '?') {
          result.optional = true;
          part = part.substring(0, part.length - 1);
        }
        result.match = part;
      }
      return result;
    });
}

function parseRoute(route) {
  const rawRoute = route;
  const queryRegex = /(?:\?|&)([^=^&]+)(=([^&]+))?/g;
  const hash = route.match(/#(.+)/)?.[1] || '';
  route = route.replace('#' + hash, '');

  const queryParams = {};
  let queryMatch;
  while ((queryMatch = queryRegex.exec(route))) {
    value = queryMatch[3];
    queryParams[queryMatch[1]] = value === undefined ? true : value;
  }

  const parts = route
    .replace(/\?.*/g, '')
    .split('/')
    .filter(part => part.length);
  return { queryParams, hash, parts, route: rawRoute, path: route };
}

function matchRoute(route, descriptor) {
  const parsedRoute = parseRoute(route);
  let routeIndex = 0;
  let descriptorIndex = 0;
  let finished = false;
  let params = {};
  while (!finished) {
    const dPart = descriptor[descriptorIndex];
    const pPart = parsedRoute.parts[routeIndex];

    if (!dPart) {
      if (pPart) {
        return null;
      }
      finished = true;
      continue;
    }
    if (!pPart) {
      if (dPart.optional) {
        if (dPart.repeat) {
          params[dPart.name] = [];
        }
        descriptorIndex++;
        continue;
      } else {
        return null;
      }
    }

    if (dPart.type === EXACT) {
      if (dPart.match !== pPart) {
        if (dPart.optional) {
          descriptorIndex++;
          continue;
        } else return null;
      }
    } else {
      if (dPart.repeat) {
        const arr = [];
        if (dPart.match && !pPart.match(new RegExp(dPart.match))) {
          if (dPart.optional) {
            descriptorIndex++;
            params[dPart.name] = [];
            continue;
          }
          return null;
        }
        let currentPpart = parsedRoute.parts[routeIndex];
        const regexp = dPart.match && new RegExp(dPart.match);
        while (currentPpart) {
          if (regexp && currentPpart.match(regexp)) {
            arr.push(currentPpart);
            routeIndex++;
            currentPpart = parsedRoute.parts[routeIndex];
          } else if (regexp) {
            currentPpart = null;
          } else {
            arr.push(currentPpart);
            routeIndex++;
            currentPpart = parsedRoute.parts[routeIndex];
          }
        }
        params[dPart.name] = arr.map(item => decodeURIComponent(item));
        descriptorIndex++;
        continue;
      }

      if (dPart.match && !pPart.match(new RegExp(dPart.match))) {
        if (dPart.optional) {
          descriptorIndex++;
          continue;
        }
        return null;
      }
      params[dPart.name] = decodeURIComponent(pPart);
    }
    descriptorIndex++;
    routeIndex++;
  }
  if (descriptor[descriptorIndex] && !descriptor[descriptorIndex].optional) {
    return null;
  }
  return {
    query: parsedRoute.queryParams,
    hash: parsedRoute.hash,
    route: parsedRoute.route,
    params,
  };
}
//   {
//     path: "/user/:id",
//     children: [
//       {
//         path: "/settings",
//         name: "user-settings",
//         component: ($route) =>
//           `Displaying settings for User no.${$route.params.id}`,
//       },
//       {
//         path: "",
//         name: "user-home",
//         component: ($route) => `User no.${$route.params.id}`,
//       },
//       {
//         path: "/posts",
//         name: "user-posts",
//         component: ($route) =>
//           `Displaying posts by User no.${$route.params.id}`,
//       },
//     ],
//   },
//   {
//     path: "",
//     name: "home",
//     component: ($route) => "Displaying home",
//   },
//   {
//     path: "/posts",
//     name: "posts",
//     component: ($route) => "Displaying posts",
//     children: [
//       {
//         path: "/:postId(\\d+)",
//         name: "post",
//         component: ($route) => `Displaing post no.${$route.params.postId}`,
//         children: [
//           {
//             path: "edit",
//             name: "post-edit",
//             component: ($route) => `Editing post no.${$route.params.postId}`,
//           },
//         ],
//       },
//       {
//         path: "new",
//         name: "post-add",
//         component: () => "Adding new post",
//       },
//     ],
//   },
//   {
//     path: "/:dirpath(.*)*",
//     component: ($route) =>
//       `error resolving path at /${$route.params.dirpath.join("/")}`,
//   },
// ];

export function createMemoryHistory() {
  let history = ['/'];
  let pointer = 0;

  function push(path, flags = {}) {
    const { replace } = flags;
    if (replace && history.length) {
      history[pointer] = path;
      history.length = pointer + 1;
    } else if (typeof path === 'string') {
      history.length = pointer + 1;
      history[pointer + 1] = path;
      pointer++;
      history.length = pointer + 1;
    }
  }

  function replace(path, flags = {}) {
    flags.replace = true;
    push(path, flags);
  }

  function go(steps) {
    if (steps > 0) {
      let i = 0;
      while (i < steps) {
        if (pointer + 1 < history.length) {
          pointer++;
        }
        i++;
      }
    } else if (steps < 0) {
      let i = 0;
      while (i > steps) {
        if (pointer > 0) {
          pointer--;
        }
        i--;
      }
    }
  }

  function get() {
    return history[pointer];
  }

  return {
    push,
    replace,
    go,
    get,
    addListener: () => {},
  };
}

export function createWebHashHistory() {
  const listeners = [];
  window.addEventListener('popstate', event => {
    listeners.forEach(listener => listener(window.location.hash.substring(1)));
  });

  function push(path, flags = {}) {
    if (flags.replace) {
      window.history.replaceState(null, null, `#${path}`);
      window.location.hash = path;
    } else {
      window.history.pushState(null, null, `#${path}`);
      window.location.hash = path;
    }
  }

  function replace(path, flags = {}) {
    window.history.replaceState(null, null, `#${path}`);
    window.location.hash = path;
  }

  function go(steps) {
    window.history.go(steps);
  }

  function get() {
    return window.location.hash.substring(1);
  }

  function addListener(listener) {
    listeners.push(listener);
  }

  return {
    push,
    replace,
    go,
    get,
    addListener,
  };
}

export function createWebHistory() {
  const host = `${window.location.protocol}//${window.location.host}`;
  const listeners = [];
  window.addEventListener('popstate', event => {
    event.preventDefault();
    listeners.forEach(listener => listener(window.location.pathname));
  });

  function push(path, flags = {}) {
    if (flags.replace) {
      window.history.replaceState(null, null, path);
    } else {
      window.history.pushState(null, null, path);
    }
  }

  function replace(path, flags = {}) {
    window.history.replaceState(null, null, path);
  }

  function go(steps) {
    window.history.go(steps);
  }

  function get() {
    return window.location.href.replace(host, '');
  }

  function addListener(listener) {
    listeners.push(listener);
  }

  return {
    push,
    replace,
    go,
    get,
    addListener,
  };
}

export function createRouter({ routes, history }) {
  let counter = 0;
  const directRoutes = {};
  let DepthContext;

  function Redirect({ fallback, from, to, ...props }) {
    if (match(history.get()) === match(from) && history.get() !== to) {
      setTimeout(() => {
        // rendered.current = false;
        history.replace(to);
        triggerListeners();
      }, 1);
      return null;
    }

    const child = <LazyComponent loadingComponent={fallback}>Loading...</LazyComponent>;

    return child;
  }

  function processRoutes(routes, base = '/') {
    routes.forEach(route => {
      const absolutePath = base + '/' + route.path;
      const name = route.name || `_unnamedRoute${counter++}`;
      if (route.component) {
        directRoutes[name] = {
          ...route,
          component: Array.isArray(route.component)
            ? route.component
            : [
                function LazyWrapper() {
                  return <LazyComponent loadingComponent={route.component}>Loading...</LazyComponent>;
                },
              ],
          path: absolutePath.replaceAll(/\/+/g, '/'),
          descriptor: parseRouteDescriptor(absolutePath),
          meta: route.meta,
        };
      }
      if (route.children) {
        processChildRoutes(route.children, [directRoutes[name]], base);
      }
      if (route.redirect) {
        directRoutes[name] = {
          ...route,
          component: [
            function RedirectWrapper() {
              return <Redirect from={route.path} to={route.redirect} fallback={route.component} />;
            },
          ],
          path: absolutePath.replaceAll(/\/+/g, '/'),
          descriptor: parseRouteDescriptor(absolutePath),
          meta: route.meta,
        };
      }
    });
  }

  function processChildRoutes(routes, parents, base) {
    processRoutes(
      routes.map(route => {
        const processed = { ...route };
        const lastParent = parents[parents.length - 1];
        if (!route.path.startsWith(lastParent.path)) {
          processed.path = /*lastParent +*/ route.path;
        }
        if (route.redirect) {
          processed.component = (lastParent.component || []).concat([
            function RedirectWrapperChild() {
              return <Redirect from={route.path} to={route.redirect} fallback={route.component} />;
            },
          ]);
        } else if (route.component) {
          processed.component = (lastParent.component || []).concat([
            function LazyWrapperChild() {
              return <LazyComponent loadingComponent={route.component}>Loading...</LazyComponent>;
            },
          ]);
        }

        return processed;
      })
    );
  }

  processRoutes(routes);

  function match(path = '') {
    let matched;
    Object.entries(directRoutes)
      .filter(([name, route]) => {
        const match = matchRoute(path, route.descriptor);
        if (match) {
          matched = name;
        }
        return match;
      })
      .sort((a, b) => {
        return b[1].descriptor.length - a[1].descriptor.length;
      })[0];
    return matched;
  }

  function resolve({ path, query, params, hash, name }) {
    let descriptor;
    if (path) {
      descriptor = parseRouteDescriptor(path);
    } else if (name) {
      descriptor = directRoutes[name].descriptor;
    }
    let result = '';
    descriptor.forEach(part => {
      if (part.type === EXACT) {
        result += '/' + part.match;
      } else if (part.type === DYNAMIC) {
        result += '/' + params[part.name];
      }
    });
    if (query) {
      result +=
        '?' +
        Object.entries(query)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
    }
    if (hash) {
      result += `#${hash}`;
    }
    return result;
  }

  function push(path, flags) {
    if (typeof path === 'string') {
      history.push(path, flags);
    } else {
      history.push(resolve(path), flags);
    }
    triggerListeners();
  }

  function replace(path, flags) {
    history.push(path, flags);
    triggerListeners();
  }

  function go(steps) {
    history.go(steps);
    triggerListeners();
  }

  function get() {
    return {
      view: match(history.get()),
      route: parseRoute(history.get()),
      descriptor: directRoutes[match(history.get())].descriptor,
      match: matchRoute(history.get(), directRoutes[match(history.get())].descriptor),
      component: [directRoutes[match(history.get())].component],
    };
  }

  let listenerId = 0;
  const listeners = new Map();

  const hookListeners = new Set();

  function addHookListener(guard) {
    hookListeners.add(guard);
    return () => {
      hookListeners.delete(guard);
    };
  }

  const afterEachListeners = new Set();

  const beforeEachListeners = new Set();

  const beforeResolveListeners = new Set();

  const errorListeners = new Set();

  function triggerListeners() {
    listeners.forEach(listener => listener());

    Array.from(hookListeners.values()).forEach(listener => listener());
  }

  history.addListener(triggerListeners);

  useRoute = () => {
    const current = get();
    const routeName = match(history.get());

    const [b, r] = window.horizon.useState(false);
    window.horizon.useEffect(() => {
      return addHookListener(() => {
        r(!b);
      });
    });

    return {
      fullPath: window.location.href,
      hash: window.location.hash,
      matched: current,
      name: routeName,
      params: current.match.params,
      path: window.location.pathname,
      query: current.match.query,
    };
  };

  useRouter = () => ({
    get currentRoute() {
      return computed(() => {
        return get().route;
      });
    },
    listening: true, // TODO: implement
    get options() {
      throw Error('not implemented'); // TODO: implement
    },
    addRoute(parentName, route) {
      throw Error('not implemented'); // TODO: implement
    },
    afterEach(guard) {
      afterEachListeners.add(guard);
      return () => {
        afterEachListeners.delete(guard);
      };
    },
    back() {
      go(-1);
    },
    beforeEach(guard) {
      beforeEachListeners.add(guard);
      return () => {
        beforeEachListeners.delete(guard);
      };
    },
    beforeResolve(guard) {
      beforeResolveListeners.add(guard);
      return () => {
        beforeResolveListeners.delete(guard);
      };
    },
    forward() {
      go(1);
    },
    getRoutes() {
      return directRoutes;
    },
    go,
    hasRoute(name) {
      return !!routes[name];
    },
    isReady() {
      return true; // NOTE: without server side rendering router is always ready
    },
    onError(guard) {
      errorListeners.add(guard);
      return () => {
        errorListeners.delete(guard);
      };
    },
    push,
    removeRoute(name) {
      delete directRoutes[name];
    },
    replace(to) {
      replace(to);
    },
    resolve,
    match,
  });

  function RouterLink({ replace, to, children }) {
    return (
      <a
        style={{
          cursor: 'pointer',
        }}
        onClick={() => {
          push(to, { replace });
        }}
      >
        {children}
      </a>
    );
  }

  function RouterView(props) {
    console.log('router view', { props });
    if (!DepthContext) {
      DepthContext = window.horizon.createContext(0);
    }

    let depth = window.horizon.useContext(DepthContext);
    const [boo, re] = window.horizon.useState(true);
    window.horizon.useEffect(() => {
      const id = listenerId++;
      listeners.set(id, () => {
        re(!boo);
      });

      return () => {
        listeners.delete(id);
      };
    });

    const result = directRoutes[match(history.get())];

    const View = () => {
      console.log('View', { result });
      return window.horizon.createElement(
        result.component[depth],
        result.props ? { ...result.route } : { $route: result.route }
      );
    };

    const finalView = (
      <DepthContext.Provider value={depth + 1}>
        <View />
      </DepthContext.Provider>
    );

    return finalView;
  }

  return { RouterLink, RouterView };
}
