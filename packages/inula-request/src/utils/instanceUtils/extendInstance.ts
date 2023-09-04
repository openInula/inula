import InulaRequest from '../../core/InulaRequest';
import utils from '../commonUtils/utils';

function extendInstance(context: InulaRequest): (...arg: any) => any {
  const instance = utils.bind(InulaRequest.prototype.request, context);
  utils.extendObject(instance, InulaRequest.prototype, context, { includeAll: true });
  utils.extendObject(instance, context, null, { includeAll: true });
  return instance;
}

export default extendInstance;
