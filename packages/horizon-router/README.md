# Horizon-router

Horizon-router 是Horizon生态组建的一部分，为Horizon提供前端路由的能力，是构建大型应用必要组件。

Horizon-router涵盖react-router、history、connect-react-router的功能。

## 从react-router切换

Horizon-router 在API设计上兼容react-router V5。

在切换时只需在`package.json`的dependencies中加入`horizon-router`
，并将原有的API引用从`react-router-dom`、`history`、`connected-react-router
`切换到`horizon-router`。

切换样例代码如下:

### react-router-dom

**切换前**

```typescript
import { Switch, Route } from 'react-router-dom';
```

**切换后**

```typescript
import { Switch, Route } from 'horizon-router';
```

### history

**切换前**

```typescript
import { createHashHistory, createBrowserHistory } from 'history';
```

**切换后**

```typescript
import { createHashHistory, createBrowserHistory } from 'horizon-router';
```

### connected-react-router

**切换前**

```typescript
import { ConnectedRouter, routerMiddleware, connectRouter } from 'connected-react-router';
```

**切换后**

```typescript
import { ConnectedRouter, routerMiddleware, connectRouter } from 'horizon-router';
```

## Horizon-router API列表

history 兼容API
---

- createBrowserHistory
- createHashHistory

react-router-dom 兼容API
---

- __RouterContext
- matchPath
- generatePath
- useHistory
- useLocation
- useParams
- useRouteMatch
- Route
- Router
- Switch
- Redirect
- Prompt
- withRouter
- HashRouter
- BrowserRouter
- Link
- NavLink

react-router-dom 类型兼容API
---

- RouteComponentProps
- RouteChildrenProps
- RouteProps

connected-react-router 兼容API
---

- connectRouter
- routerMiddleware
- ConnectedRouter

connected-react-router 新增API
---

- ConnectedHRouter(在HorizonX的Redux兼容模式中使用)

## 问题反馈

Horizon-router问题与bug反馈，请联系00800104 黄轩