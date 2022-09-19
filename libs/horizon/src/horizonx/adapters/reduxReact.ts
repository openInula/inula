// @ts-ignore
import { useState, useContext, useEffect, useRef } from '../../renderer/hooks/HookExternal';
import { createContext } from '../../renderer/components/context/CreateContext';
import { createElement } from '../../external/JSXElement';
import { BoundActionCreator } from './redux';
import { ReduxAction } from './redux';
import { ReduxStoreHandler } from '../store/StoreHandler';
import { VNode } from '../../renderer/Types';

const DefaultContext = createContext(null);
type Context = typeof DefaultContext;

export function Provider({
  store,
  context = DefaultContext,
  children,
}: {
  store: ReduxStoreHandler;
  context: Context;
  children?: any[];
}) {
  const Context = context; // NOTE: bind redux API to horizon API requires this renaming;
  return createElement(Context.Provider, { value: store }, children);
}

export function createStoreHook(context: Context): () => ReduxStoreHandler {
  return () => {
    return useContext(context) as unknown as ReduxStoreHandler;
  };
}

export function createSelectorHook(context: Context): (selector?: (any) => any) => any {
  const store = createStoreHook(context)() as unknown as ReduxStoreHandler;
  return function (selector = state => state) {
    const [b, fr] = useState(false);

    useEffect(() => {
      const unsubscribe = store.subscribe(() => fr(!b));
      return () => {
        unsubscribe();
      };
    });

    return selector(store.getState());
  };
}

export function createDispatchHook(context: Context): () => BoundActionCreator {
  const store = createStoreHook(context)() as unknown as ReduxStoreHandler;
  return function () {
    return action => {
      store.dispatch(action);
    };
  }.bind(store);
}

export const useSelector = selector => {
  return createSelectorHook(DefaultContext)(selector);
};

export const useDispatch = () => {
  return createDispatchHook(DefaultContext)();
};

export const useStore = () => {
  return createStoreHook(DefaultContext)();
};

// function shallowCompare(a,b){
//     return Object.keys(a).length === Object.keys(b).length &&
//     Object.keys(a).every(key => a[key] === b[key]);
// }

//TODO: implement options
// context?: Object,
// areStatesEqual?: Function, :)
// areOwnPropsEqual?: Function,
// areStatePropsEqual?: Function,
// areMergedPropsEqual?: Function,
// forwardRef?: boolean,
// const defaultOptions = {
//     areStatesEqual: shallowCompare,
//     areOwnPropsEqual: shallowCompare,
//     areStatePropsEqual: shallowCompare,
//     areMergedPropsEqual: shallowCompare
// };

type MapStateToPropsP<StateProps, OwnProps> = (state: any, ownProps: OwnProps) => StateProps;
type MapDispatchToPropsP<DispatchProps, OwnProps> =
  | { [key: string]: (...args: any[]) => ReduxAction }
  | ((dispatch: (action: ReduxAction) => any, ownProps: OwnProps) => DispatchProps);
type MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps> = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps
) => MergedProps;

type WrappedComponent<OwnProps> = (props: OwnProps) => ReturnType<typeof createElement>;
type OriginalComponent<MergedProps> = (props: MergedProps) => ReturnType<typeof createElement>;
type Connector<OwnProps, MergedProps> = (Component: OriginalComponent<MergedProps>) => WrappedComponent<OwnProps>;

export function connect<StateProps, DispatchProps, OwnProps, MergedProps>(
  mapStateToProps: MapStateToPropsP<StateProps, OwnProps> = () => ({} as StateProps),
  mapDispatchToProps: MapDispatchToPropsP<DispatchProps, OwnProps> = () => ({} as DispatchProps),
  mergeProps: MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps> = (
    stateProps,
    dispatchProps,
    ownProps
  ): MergedProps => ({ ...stateProps, ...dispatchProps, ...ownProps } as MergedProps),
  options?: {
    areStatesEqual?: (oldState: any, newState: any) => boolean;
    context?: Context;
  }
): Connector<OwnProps, MergedProps> {
  if (!options) {
    options = {};
  }

  //this component should bear the type returned from mapping functions
  return (Component: OriginalComponent<MergedProps>): WrappedComponent<OwnProps> => {
    const useStore = createStoreHook(options?.context || DefaultContext);

    //this component should mimic original type of component used
    const Wrapper: WrappedComponent<OwnProps> = (props: OwnProps) => {
      const [f, forceReload] = useState(true);

      const store = useStore();

      useEffect(() => {
        const unsubscribe = store.subscribe(() => forceReload(!f));
        return () => {
          unsubscribe();
        };
      });

      const previous = useRef({
        state: {},
        mappedState: {},
      }) as {
        current: {
          state: { [key: string]: any };
          mappedState: StateProps;
        };
      };

      let mappedState: StateProps;
      if (options?.areStatesEqual) {
        if (options.areStatesEqual(previous.current.state, store.getState())) {
          mappedState = previous.current.mappedState as StateProps;
        } else {
          mappedState = mapStateToProps ? mapStateToProps(store.getState(), props) : ({} as StateProps);
          previous.current.mappedState = mappedState;
        }
      } else {
        mappedState = mapStateToProps ? mapStateToProps(store.getState(), props) : ({} as StateProps);
        previous.current.mappedState = mappedState;
      }
      let mappedDispatch: DispatchProps = {} as DispatchProps;
      if (mapDispatchToProps) {
        if (typeof mapDispatchToProps === 'object') {
          Object.entries(mapDispatchToProps).forEach(([key, value]) => {
            mappedDispatch[key] = (...args: ReduxAction[]) => {
              store.dispatch(value(...args));
            };
          });
        } else {
          mappedDispatch = mapDispatchToProps(store.dispatch, props);
        }
      }
      const mergedProps = (
        mergeProps ||
        ((state, dispatch, originalProps) => {
          return { ...state, ...dispatch, ...originalProps };
        })
      )(mappedState, mappedDispatch, props);

      previous.current.state = store.getState();

      const node = createElement(Component, mergedProps);
      return node;
    };

    return Wrapper;
  };
}
