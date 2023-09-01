import * as React from 'react';
import { useContext } from 'react';
import RouterContext from './context';

function withRouter<C extends React.ComponentType>(Component: C) {

  function ComponentWithRouterProp(props: any) {
    const { history, location, match } = useContext(RouterContext);
    const routeProps = { history: history, location: location, match: match };

    return <Component {...props} {...routeProps} />;
  }

  return ComponentWithRouterProp;
}

export default withRouter;