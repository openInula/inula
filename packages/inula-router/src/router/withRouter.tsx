import Inula from '@cloudsop/horizon';
import { useContext, ComponentType } from '@cloudsop/horizon';
import RouterContext from './context';

function withRouter<C extends ComponentType>(Component: C) {
  return function (props: any) {
    const { wrappedComponentRef, ...rest } = props;
    const context = useContext(RouterContext);

    return <Component {...rest} {...context} ref={wrappedComponentRef} />;
  };
}

export default withRouter;
