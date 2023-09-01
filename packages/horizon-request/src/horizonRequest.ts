import HorizonRequest from './core/HorizonRequest';
import utils from './utils/commonUtils/utils';
import { CancelTokenStatic, HrInterface, HrRequestConfig } from './types/interfaces';
import defaultConfig from './config/defaultConfig';
import fetchLike from './request/ieCompatibility/fetchLike';
import CancelToken from './cancel/CancelToken';
import checkCancel from './cancel/checkCancel';
import HrError, { isHrError } from './core/HrError';
import buildInstance from './utils/instanceUtils/buildInstance';
import HrHeaders from './core/HrHeaders';
import CancelError from './cancel/CancelError';
import 'core-js/stable';

// 使用默认配置创建 hr 对象实例
const horizonRequest = buildInstance(defaultConfig as HrRequestConfig);

// 提供 Hr 类继承
horizonRequest.HorizonRequest = HorizonRequest as unknown as HrInterface;

// 创建 hr 实例的工厂函数
horizonRequest.create = HorizonRequest.create;

// 提供取消请求令牌
horizonRequest.CancelToken = CancelToken as CancelTokenStatic;

horizonRequest.isCancel = checkCancel;

horizonRequest.Cancel = CancelError;

horizonRequest.all = utils.all;

horizonRequest.spread = utils.spread;

horizonRequest.default = horizonRequest;

horizonRequest.CanceledError = CancelError;

horizonRequest.HrError = HrError;

horizonRequest.isHrError = isHrError;

horizonRequest.HrHeaders = HrHeaders;

horizonRequest.defaults = defaultConfig as HrRequestConfig;

/*--------------------------------兼容axios-----------------------------------*/

horizonRequest.Axios = HorizonRequest;

horizonRequest.AxiosError = HrError;

horizonRequest.isAxiosError = isHrError;

horizonRequest.AxiosHeaders = HrHeaders;

export default horizonRequest;

// 兼容 IE 浏览器 fetch
if (utils.isIE()) {
  (window as any).fetch = fetchLike;
}
