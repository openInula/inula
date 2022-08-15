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
