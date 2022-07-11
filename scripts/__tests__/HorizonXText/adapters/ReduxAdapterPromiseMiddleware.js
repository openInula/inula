export const ActionType = {
  Pending: 'PENDING',
  Fulfilled: 'FULFILLED',
  Rejected: 'REJECTED',
};

export const promise = store => next => action => {
  //let result = next(action);
  store._horizonXstore.$queue.dispatch(action);
  return result;
};

export function createPromise(config = {}) {
  const defaultTypes = [ActionType.Pending, ActionType.Fulfilled, ActionType.Rejected];
  const PROMISE_TYPE_SUFFIXES = config.promiseTypeSuffixes || defaultTypes;
  const PROMISE_TYPE_DELIMITER = config.promiseTypeDelimiter || '_';

  return store => {
    const { dispatch } = store;

    return next => action => {
      /**
       * Instantiate variables to hold:
       * (1) the promise
       * (2) the data for optimistic updates
       */
      let promise;
      let data;

      /**
       * There are multiple ways to dispatch a promise. The first step is to
       * determine if the promise is defined:
       * (a) explicitly (action.payload.promise is the promise)
       * (b) implicitly (action.payload is the promise)
       * (c) as an async function (returns a promise when called)
       *
       * If the promise is not defined in one of these three ways, we don't do
       * anything and move on to the next middleware in the middleware chain.
       */

      // Step 1a: Is there a payload?
      if (action.payload) {
        const PAYLOAD = action.payload;

        // Step 1.1: Is the promise implicitly defined?
        if (isPromise(PAYLOAD)) {
          promise = PAYLOAD;
        }

        // Step 1.2: Is the promise explicitly defined?
        else if (isPromise(PAYLOAD.promise)) {
          promise = PAYLOAD.promise;
          data = PAYLOAD.data;
        }

        // Step 1.3: Is the promise returned by an async function?
        else if (typeof PAYLOAD === 'function' || typeof PAYLOAD.promise === 'function') {
          promise = PAYLOAD.promise ? PAYLOAD.promise() : PAYLOAD();
          data = PAYLOAD.promise ? PAYLOAD.data : undefined;

          // Step 1.3.1: Is the return of action.payload a promise?
          if (!isPromise(promise)) {
            // If not, move on to the next middleware.
            return next({
              ...action,
              payload: promise,
            });
          }
        }

        // Step 1.4: If there's no promise, move on to the next middleware.
        else {
          return next(action);
        }

        // Step 1b: If there's no payload, move on to the next middleware.
      } else {
        return next(action);
      }

      /**
       * Instantiate and define constants for:
       * (1) the action type
       * (2) the action meta
       */
      const TYPE = action.type;
      const META = action.meta;

      /**
       * Instantiate and define constants for the action type suffixes.
       * These are appended to the end of the action type.
       */
      const [PENDING, FULFILLED, REJECTED] = PROMISE_TYPE_SUFFIXES;
    };
  };
}
