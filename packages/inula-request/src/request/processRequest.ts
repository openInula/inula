import CancelError from '../cancel/CancelError';
import { IrRequestConfig, IrResponse } from '../types/interfaces';
import IrHeaders from '../core/IrHeaders';
import transformData from '../utils/dataUtils/transformData';
import { fetchRequest } from './fetchRequest';
import transformRequest from '../dataTransformers/transformRequest';
import transformResponse from '../dataTransformers/transformResponse';
import checkCancel from '../cancel/checkCancel';
import { ieFetchRequest } from './ieFetchRequest';
import utils from '../utils/commonUtils/utils';

export default function processRequest(config: IrRequestConfig): Promise<IrResponse> {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new CancelError(undefined, config);
  }

  // 拦截可能会传入普通对象
  config.headers = IrHeaders.from(config.headers as Record<string, any>);

  // 转换请求数据
  if (config.data) {
    config.data = transformData(config, transformRequest);
  }

  return (utils.isIE() ? ieFetchRequest : fetchRequest)(config)
    .then(response => {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      // 转换响应数据
      response.data = transformData(config, transformResponse, response);

      return response;
    })
    .catch(error => {
      if (!checkCancel(error)) {
        if (config.cancelToken) {
          config.cancelToken.throwIfRequested();
        }

        // 转换响应数据
        if (error && error.response) {
          error.response.data = transformData(config, transformResponse, error.response);
        }
      }

      return Promise.reject(error);
    });
}
