# InulaJS-router 路由组件

## Inula-router 组件式API

### BrowserRouter

**功能介绍**
使用BrowserRouter组件包裹整个应用，它提供一个history对象来管理浏览器的历史记录，BrowserRouter使用HTML5的history API来实现路由。

**接口定义**

```tsx
type BrowserRouterProps = {
  basename: string;
  getUserConfirmation: (message: string, callBack: (isJump: boolean) => void) => void;
  children?: InualNode;
  forceRefresh: boolean;
};
```

- `basename`：一个字符串，用于指定路由的根路径。如`/app`，这样所有的网页都会以`/app`开头，比如`/app/home`、`/app/user`等。
- `getUserConfirmation`：一个函数，作用是自定义用户在导航到新的历史记录条目时的确认提示。它接受两个参数：message 和 callback。message 是一个字符串，表示要显示给用户的提示信息。callback 是一个函数，它接受一个布尔值作为参数，表示用户是否确认导航。默认使用函数`callBack(window.confirm(message))`。
- `forceRefresh`：是否再路由跳转后强制页面刷新。

> 说明：
> BrowserRouter支持在`history.push`，`history.replace`方法中传递state，state 是一个任意对象，它可以存储一些数据，并通过浏览器API`history.state`或[`useLocation`](#useLocation)访问该对象。

**示例**

```tsx
import { BrowserRouter, Link, Route, Switch } from 'inula-router';

function App() {
  return (
    <BrowserRouter>
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>
      <Switch>
        <Route path='/' component={() => <h2>Home page</h2>} />
        <Route path='/about' component={() => <h2>About Page</h2>} />
      </Switch>
    </BrowserRouter>
  );
}
```

### HashRouter

**功能介绍**
使用HashRouter组件包裹整个应用，它提供一个history对象来管理浏览器的历史记录，HashRouter使用URL的hash值来实现路由，会在URL中显示#符号。

**接口定义**

```tsx
type HashRouterProps = {
  basename: string;
  getUserConfirmation: (message: string, callBack: (isJump: boolean) => void) => void;
  children?: InualNode;
  hashType: urlHashType;
};
```

- `basename`：一个字符串，用于指定路由的根路径。如`/app`，这样所有的网页都会以`/app`开头，比如`/app/home`、`/app/user`等。
- `getUserConfirmation`：一个函数，作用是自定义用户在导航到新的历史记录条目时的确认提示。它接受两个参数：message 和 callback。message 是一个字符串，表示要显示给用户的提示信息。callback 是一个函数，它接受一个布尔值作为参数，表示用户是否确认导航。默认使用函数`callBack(window.confirm(message))`。
- `hashType`：`window.location.hash` 使用的编码类型。可用值为“slash“和”noslash”，默认为“slash”。
    - `slash`：创建如#/api/web的hash值。
    - `noslash`：创建如#api/web的hash值。

> 说明：
> HashRouter使用URL的hash来表示路由，不使用history API，因此不支持在`history.push`，`history.replace`中传递state。

**示例**

```tsx
import { HashRouter, Link, Route, Switch } from 'inula-router';

function App() {
  return (
    <HashRouter>
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>
      <Switch>
        <Route path='/' component={() => <h2>Home page</h2>} />
        <Route path='/about' component={() => <h2>About Page</h2>} />
      </Switch>
    </HashRouter>
  );
}
```

### Switch

**功能介绍**

Switch 用于包裹多个 Route 或 Redirect ，并根据当前的 URL 匹配第一个合适的组件进行渲染。

**接口定义**

```tsx
type SwitchProps = {
  location?: Location;
  children?: Inula.InualNode;
};
```

- `location`：指定匹配子元素时的位置(默认为浏览器当前的URL)。

> 说明：
> 所有的Route组件和Redirect组件都应该被Switch组件包裹，Switch会遍历所有的子元素，第一个匹配成功的Route组件会被渲染，其他的会被忽略。

**示例**

```tsx
import { BrowserRouter, Link, Route, Switch } from 'inula-router';

// 定义一些页面组件
const Home = () => <h1>Home Page</h1>;
const About = () => <h1>About Page</h1>;
const Contact = () => <h1>Contact Page</h1>;
const NotFound = () => <h1>404 Not Found</h1>;

// 定义一个 App 组件，使用 BrowserRouter 和 Switch 来创建路由
const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
        <Link to='/contact'>Contact</Link>
        {/* 使用 Switch 来渲染匹配到的第一个子路由 */}
        <Switch>
          {/* 使用 exact 属性来确保只有当 URL 完全匹配时才渲染组件 */}
          <Route exact path='/' component={Home} />
          <Route path='/about' component={About} />
          <Route path='/contact' component={Contact} />
          {/* 使用 * 来匹配上述以外的 URL，渲染 NotFound 组件 */}
          <Route path='*' component={NotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};
```

### Route

**功能介绍**

Route 是一个定义了路径和组件的映射关系的组件，其基本功能是当路径与当前URL匹配时呈现对应组件。

**接口定义**

```tsx
type RouteProps<P extends Record<string, any> = {}, Path extends string = string> = {
  location?: Location;
  component?: Inula.ComponentType<RouteComponentProps<P>> | Inula.ComponentType<any> | undefined;
  children?: ((props: RouteChildrenProps<P>) => Inula.InulaNode) | Inual.InulaNode;
  render?: (props: RouteComponentProps<P>) => Inula.InulaNode;
  path?: Path | Path[];
  exact?: boolean;
  sensitive?: boolean;
  strict?: boolean;
};
```

- `location`：指定匹配子元素时的位置(默认为浏览器当前的URL)。
- `render`，`component`，`children` 是渲染组件的三种方式，这三种方式互斥，只会执行其中一个，优先级是`children` > `component` > `render`。
- `path`：定义该组件对应的URL。
- `exact`：仅当path与浏览器URL完全匹配时才匹配到该路由。
- `sensitive`：在路由匹配时是否忽略大小写。
- `strict`：路由匹配时是否忽略URL尾部的“/”。

> 说明：
> 当使用`component`传递组件渲染UI时，router将会用createElement来将给定的组件创建一个新的element，会执行组件对应的生命周期函数，而`render`和`children`这两种方式不会。

**示例**

```tsx
import { BrowserRouter, Link, Route, Switch } from 'inula-router';

const Home = () => <h1>Home Page</h1>;
const About = () => <h1>About Page</h1>;
const Contact = () => <h1>Contact Page</h1>;

const App = () => {
  return (
    <BrowserRouter>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
        <Link to='/contact'>Contact</Link>
        <Switch>
            {/* 使用 Route 渲染匹配到路径的对应组件 */}
            {/* 使用 exact 属性来确保只有当 URL 完全匹配时才渲染组件 */}
            <Route exact path='/' component={Home} />
            {/* 使用 render 属性来直接渲染一个内联函数返回的组件 */}
            <Route path='/about' render={() => <About />} />
            {/* 使用 children 属性来渲染一个无论是否匹配都会显示的组件 */}
            <Route path='/contact' children={<Contact />} />
        </Switch>
    </BrowserRouter>
  );
};
```

### Link

**功能介绍**

Link是一个可以生成超链接的组件，可以在不刷新页面的情况下跳转到其他路由。

**接口定义**

```tsx
type LinkProps = {
  component?: Inula.ComponentType<any>;
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  replace?: boolean;
  tag?: string;
} & Inula.AnchorHTMLAttributes<HTMLAnchorElement>;
```

- `to`：将一条记录加入到历史栈中来导航到一个新的 URL，可以为字符串、Location对象或函数。
- `replace`：单击链接将替换而不是加入一个新的历史记录。
- `component`：自定义导航组件。
- `tag`：生成Link使用的HTML标签，默认为`<a>`。

**示例**

```tsx
import { HashRouter, Link, Route, Switch } from 'inula-router';

function App() {
  return (
    <HashRouter>
      {/* 使用 Link 跳转到对应的路径，Link组件只能在Router下使用 */}
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>
      <Switch>
        <Route path='/' component={() => <h2>Home page</h2>} />
        <Route path='/about' component={() => <h2>About Page</h2>} />
      </Switch>
    </HashRouter>
  );
}
```

### NavLink

**功能介绍**

与Link组件相同，可以在不刷新页面的情况下跳转到其他路由。当呈现的组件与当前URL匹配时，NavLink会为元素添加对应的样式。

**接口定义**

```tsx
type NavLinkProps = {
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  isActive?: (match: Matched | null, location: Location) => boolean;
} & LinkProps;
```

- `isActive`：指定一个函数，以确定该链接是否处于激活状态，当处于激活状态`<NavLink>`标签的`aria-current`属性为`page`。

**示例**

```tsx
import { HashRouter, Link, Route, Switch } from 'inula-router';

function App() {
  return (
    <HashRouter>
      {/* 使用 NavLink 跳转到对应的路径，NavLink组件只能在Router下使用 */}
      <NavLink to='/' isActive={true}>Home</NavLink>
      <NavLink to='/about'>About</NavLink>
      <Switch>
        <Route path='/' component={() => <h2>Home page</h2>} />
        <Route path='/about' component={() => <h2>About Page</h2>} />
      </Switch>
    </HashRouter>
  );
}
```

### Redirect

**功能介绍**

Redirect是一个可以执行重定向操作的组件，它可以在路由匹配时跳转到另一个路由。

**接口定义**

```tsx
type RedirectProps = {
  to: string | Partial<Location>;
  push?: boolean;
  path?: string;
  from?: string;
  exact?: boolean;
  strict?: boolean;
};
```

- `to`：重定向跳转到的位置。
- `push`：重定向是否替换而不是加入一个新的历史记录。
- `path`、`from`：用来指定重定向的目标路径，当URL为path或from的地址时，触发重定向。
- `exact`：仅当path与浏览器URL完全匹配时才匹配到该路由。
- `strict`：路由匹配时是否忽略URL尾部的“/”。

> 说明：
> `path`和`from`两个属性都可以用来指定重定向的目标路径，若两者同时设置，`path`的优先级高于`from`。

**示例**

```tsx
import { HashRouter, Link, Route, Switch, Redirect } from 'inula-router';

function App() {
  return (
    <HashRouter>
      {/* 使用 Link 跳转到对应的路径，Link组件只能在Router下使用 */}
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>
      <Switch>
        <Route path='/' component={() => <h2>Home page</h2>} />
        <Route path='/about' component={() => <h2>About Page</h2>} />

        {/* 当URL匹配不到时，使用Redirect组件跳转到Home页面 */}
        <Redirect path='*' to='/'/>
      </Switch>
    </HashRouter>
  );
}
```

### Prompt

**功能介绍**

Prompt组件用于在用户离开页面时，弹出提示确认用户是否执行跳转行为，提示的回调函数返回布尔值，如果为true，则离开页面，如果为false，则停留在该页。

**接口定义**

```tsx
type PromptProps = {
  message?: string | ((location: Partial<Location>, action: Action) => string | boolean);
  when?: boolean | ((location: Partial<Location>) => boolean);
};

enum Action {
  pop = 'POP',
  push = 'PUSH',
  replace = 'REPLACE',
}

type Location = {
  pathname: string;
  search: string;
  hash: string;
  state?: object;
};
```

- `message`：当用户尝试离开时提示用户的消息。将通过用户尝试导航到的下一个位置时。返回一个字符串以向用户显示提示，或返回 true 以允许用户跳转。
- `when`：指定在对应条件下渲染`Prompt`以阻止用户跳转页面。

**示例**

在该实例中，当用户在`Input`中输入字符后再跳转到其他页面时，`Prompt`组件会阻止路由跳转并询问用户是否执行跳转。

```tsx
import { useState } from 'openinula';
import { BrowserRouter, Link, Switch, Route, Prompt } from 'inula-router';

function PromptDemo() {
  return (
    <BrowserRouter>
      <Link to='/'>Form</Link>
      <Link to='/page'>Other Page</Link>

      <Switch>
        <Route path='/' exact children={<InputForm />} />
        <Route path='/page' children={<h3>Other Page</h3>} />
      </Switch>
    </BrowserRouter>
  );
}

function InputForm() {
  let [isBlocking, setIsBlocking] = useState(false);

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        setIsBlocking(false);
      }}
    >
      <Prompt
        when={isBlocking}
        message={location =>
          `你是否确认前往 ${location.pathname}`
        }
      />

      <input
        onChange={event => {
          setIsBlocking(event.target.value.length > 0);
        }}
      />
    </form>
  );
}
```

## Inula-router 函数式API

### useHistory

**功能介绍**

`useHistory`是一个函数，调用`useHistory`返回`Inula-router`中的`history`对象。

**定义**

```tsx
function useHistory(): History
```

* History对象具有的属性：
    - `length`: 历史记录栈的长度。
    - `action`: 当前导航的动作类型，可以是PUSH、REPLACE或POP。
    - `location`: 当前的位置对象，包含pathname、search、hash和state等属性。
* history具有的方法：
    - `push(path,state)`: 用于向历史记录栈中添加一个新的位置，并导航到该位置。
    - `replace(path,state)`: 用于替换历史记录栈中的当前位置，并导航到新的位置。
    - `go(n)`: 用于在历史记录栈中向前或向后跳转指定的步数。
    - `goBack()`: 用于回退到历史记录栈中的上一个位置，等价于go(-1)。
    - `goForward()`: 用于前进到历史记录栈中的下一个位置，等价于go(1)。
    - `block()`: 用于阻止导航，并在导航发生时执行一个回调函数。
    - `listen()`: 用于注册一个监听器，当历史记录发生变化时执行。

**示例**

```tsx
import { useHistory } from 'inula-router';

function HomeButton() {
  let history = useHistory();

  function handleClick() {
    history.push('/home');
  }

  return (
    <button type='button' onClick={handleClick}>
      Go home
    </button>
  );
}
```

### useLocation

**功能介绍**
`useLocation`是一个函数，调用`useLocation`返回一个Location对象，包含当前 URL 信息，如路径名、查询字符串、哈希。当浏览器的URL发生变化，`useLocation`就会随之变化。

**定义**

```tsx
function useLocation(): Location;

// Location对象结构
type Location = {
  pathname: string; // URL路径名
  search: string; // URL查询字符串
  hash: string; // URL哈希值
  state: Object; // 额外状态数据
};
```

**示例**

```tsx
import { useLocation } from 'inula-router';

function App() {
  {/* 使用useLocation获取当前位置 */}
  let location = useLocation();

  useEffect(() => {
    console.log('location change to ', location);
  }, [location]);
}
```

### useParams

**功能介绍**

`useParams`是一个函数，调用`useParams`返回一个包含当前URL下路由参数的对象，比如 /user/:id 中的 id 。

**定义**

```tsx
function useParams(): Params | {};

type Params = { [K in keyof P]?: P[K] };
```

**示例**

```tsx
import { HashRouter, Switch, Route, useParams } from 'inula-router';

const User = () => {
  // 使用 useParams 获取URL中对应的参数
  const { userid } = useParams();

  return <div>{userid} profile page</div>;
};

function App() {
  return (
    <HashRouter>
      <Switch>
        <Route path="/user/:userid" component={<User/>}/>
      </Switch>
    </HashRouter>
  );
}
```

### useRouteMatch

**功能介绍**
`useRouteMatch`返回一个包含当前路由的匹配信息的match对象，可以在无需`<Route>`的情况下访问匹配数据，`useRouteMatch`对于那些非路由但自身状态与当前路径相关的组件非常有用。

**定义**

```tsx
function useRouteMatch<P>(path?: string): Matched<P> | null

// match对象结构
type Matched = {
  score: number[]; // 匹配到该URL的匹配分数
  params: Object; // 从URL中解析出来的与path对应的参数
  path: string; // 匹配使用的URL模板
  url: string; // 匹配到的URL部分
  isExact: boolean; // 是否完全匹配URL
};
```

**示例**

- 不使用`useRouteMatch`

```tsx
import { BrowserRouter, Switch, Route } from 'inula-router';

// Header组件只会在匹配`/detail/:id`时出现
const Header = () => {
  return (
    <Route
      path="/detail/:id"
      strict
      sensitive
      render={({ match }) => {
        return match && <div>Header</div>
      }}
    />
  )
}
function App() {
  return (
    <BrowserRouter>
      <Header/>
      <Switch>
        <Route exact path="/" render={()=><div>Home</div>}/>
        <Route exact path="/detail/:id" render={()=><div>Detail</div>}/> 
      </Switch>
    </BrowserRouter>
  );
}
```

- 使用`useRouteMatch`

```tsx
import { BrowserRouter, Switch, Route } from 'inula-router';

// Header组件只会在匹配`/detail/:id`时出现
const Header = () => {
  // 只有当前路径匹配`/detail/:id`时，match不为null
  const match = useRouteMatch('/detail/:id')
  return (
    match && <div>Header</div>
  )
}
function App() {
  return (
    <BrowserRouter>
      <Header/>
      <Switch>
        <Route exact path="/" render={()=><div>Home</div>}/>
        <Route exact path="/detail/:id" render={()=><div>Detail</div>}/> 
      </Switch>
    </BrowserRouter>
  );
}
```

### withRouter

**功能介绍**

`withRouter`是一个高阶函数组件，可以将inula-router的history，location，match三个对象注入到任何自定义组件中的props中。

* history
    - `length`: 历史记录栈的长度。
    - `action`: 当前导航的动作类型，可以是PUSH、REPLACE或POP。
    - `location`: 当前的位置对象，包含pathname、search、hash和state等属性。
    - `push(path,state)`: 用于向历史记录栈中添加一个新的位置，并导航到该位置。
    - `replace(path,state)`: 用于替换历史记录栈中的当前位置，并导航到新的位置。
    - `go(n)`: 用于在历史记录栈中向前或向后跳转指定的步数。
    - `goBack()`: 用于回退到历史记录栈中的上一个位置，等价于go(-1)。
    - `goForward()`: 用于前进到历史记录栈中的下一个位置，等价于go(1)。
    - `block()`: 用于阻止导航，并在导航发生时执行一个回调函数。
    - `listen()`: 用于注册一个监听器，当历史记录发生变化时执行。
* location
    - `pathname`: URL路径名。
    - `search`: URL查询字符串。
    - `hash`: URL哈希值。
    - `state`: 额外状态数据。
* match
    - `score`: 匹配到该URL的匹配分数。
    - `params`: 从URL中解析出来的与path对应的参数.
    - `path`: 匹配使用的URL模板。
    - `url`: 匹配到的URL部分。
    - `isExact`: 是否完全匹配URL。

**示例**

```tsx
import { withRouter } from 'inula-router'

class DemoComponent extends Inula.Component<any, any> {
  // 可以在这里使用this.props.history、this.props.location、this.props.match等属性

  toHome = () => {
    this.props.history.push('/home'); // 通过history对象push方法返回首页
  };

  render() {
    return (
      <button onClick={this.toHome}>Back Home</button>
    );
  }
}

export default withRouter(MyComponent) // 使用withRouter包裹组件
```
