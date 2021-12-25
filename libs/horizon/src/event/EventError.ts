// 处理事件的错误
let hasError = false;
let caughtError = null;

// 执行事件监听器，并且捕捉第一个错误，事件执行完成后抛出第一个错误
export function runListenerAndCatchFirstError(listener, event) {
  try {
    listener(event);
  } catch (error) {
    if (!hasError) {
      hasError = true;
      caughtError = error;
    }
  }
}

export function throwCaughtEventError() {
  if (hasError) {
    const err = caughtError;
    caughtError = null;
    hasError = false;
    throw err;
  }
}
