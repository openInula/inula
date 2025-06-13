import React from 'react';
import {
  History,
  Link,
  Location,
  Prompt,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  withRouter,
} from '../index';

export let historyHook: History;
export let locationHook: Location;
const About = () => <div>You are on the about page</div>;
const Home = () => <div>You are home</div>;
const User = () => <div>You are at User Index</div>;
const Profile = () => {
  const params = useParams();
  return <div>Param is {(params as any).id}</div>;
};

function WithRouterTest(props) {
  return <h1>withRoute Test, pathname--{props.location.pathname}</h1>;
}

export const LocationDisplay = () => {
  locationHook = useLocation();
  historyHook = useHistory();
  return <div>current Location: {locationHook.pathname}</div>;
};

export const Test_Demo = () => {
  const comp = withRouter(WithRouterTest);

  return (
    <div>
      <Link to='/'>Home</Link>

      <Link to='/about'>About</Link>

      <Link to='/user'>User</Link>

      <Switch>
        <Redirect to='/redirect' from='/test2' />

        <Route exact path='/' component={Home} />

        <Route path='/about' component={About} />

        <Route path='/user' component={User} />

        <Route path='/testr' component={comp} />

        <Route path='/profile/:id' component={Profile} />

        <Route component={() => <div>No match</div>} />
      </Switch>
      <LocationDisplay />
    </div>
  );
};

export const Test_Demo2 = () => {
  return (
    <div>
      <Link to='/'>Home</Link>

      <Link to='/about'>About</Link>

      <Link to='/user'>User</Link>

      <Prompt
        when={true}
        message={(location, _) => {
          // location.pathname为about时拦截跳转
          return location.pathname !== '/about';
        }}
      />

      <Switch>
        <Route exact path='/' component={Home} />

        <Route path='/about' component={About} />

        <Route path='/user' component={User} />
      </Switch>
    </div>
  );
};

// 初始渲染直接重定向
export const Test_Demo3 = () => {
  return (
    <div>
      <Switch>
        <Route path='/about' component={About} />
        <Route path='/user' component={User} />
        <Redirect to='/user' path='/' />
      </Switch>
    </div>
  );
};

// <Redirect/>支持path设置通配符*
export const Test_Demo4 = () => {
  return (
    <div>
      <Switch>
        <Route path='/about' component={About} />
        <Route path='/user' component={User} />
        <Redirect to='/user' path='*' />
      </Switch>
    </div>
  );
};
