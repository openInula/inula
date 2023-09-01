import HorizonRequest from '../../core/HorizonRequest';
import utils from '../commonUtils/utils';

function extendInstance(context: HorizonRequest): (...arg: any) => any {
  const instance = utils.bind(HorizonRequest.prototype.request, context);
  utils.extendObject(instance, HorizonRequest.prototype, context, { includeAll: true });
  utils.extendObject(instance, context, null, { includeAll: true });
  return instance;
}

export default extendInstance;
