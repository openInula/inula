import { runAsyncEffects } from '../../../libs/horizon/src/renderer/submit/HookEffectHandler';
import { callRenderQueueImmediate } from '../../../libs/horizon/src/renderer/taskExecutor/RenderQueue';
import { asyncUpdates } from '../../../libs/horizon/src/renderer/TreeBuilder';
 
const act = (fun) => {
  asyncUpdates(fun);
  callRenderQueueImmediate();
  runAsyncEffects();
};
 
module.exports = {
  act
};