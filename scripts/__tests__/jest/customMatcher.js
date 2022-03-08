import { runAsyncEffects } from '../../../libs/horizon/src/renderer/submit/HookEffectHandler';
import { callRenderQueueImmediate } from '../../../libs/horizon/src/renderer/taskExecutor/RenderQueue';

function runAssertion(fn) {
  try {
    fn();
  } catch (error) {
    return {
      pass: false,
      message: () => error.message,
    };
  }
  return { pass: true };
}

function toMatchValue(LogUtils, expectedValues) {
  return runAssertion(() => {
    const actualValues = LogUtils.getAndClear();
    expect(actualValues).toEqual(expectedValues);
  });
}

const act = (fun) => {
  fun();
  callRenderQueueImmediate();
  runAsyncEffects();
}

module.exports = {
  toMatchValue,
  act
};
