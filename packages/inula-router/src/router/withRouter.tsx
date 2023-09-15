import Inula from '@cloudsop/horizon';
import { useContext, ComponentType } from '@cloudsop/horizon';
import RouterContext from './context';

function withRouter<C extends ComponentType>(Component: C) {

  function ComponentWithRouterProp(props: any) {
    const { history, location, match } = useContext(RouterContext);
    const routeProps = { history: history, location: location, match: match };

    return <Component {...props} {...routeProps} />;
  }

  return ComponentWithRouterProp;
}

export default withRouter;