import HrHeaders from '../../core/HrHeaders';
import defaultConfig from '../../config/defaultConfig';
import { HrRequestConfig, HrResponse } from '../../types/interfaces';

function transformData(inputConfig: HrRequestConfig, func: Function, response?: HrResponse) {
  const config = inputConfig || defaultConfig;
  const context = response || config;
  const headers = HrHeaders.from(context.headers);

  const transformedData = func.call(config, context.data, headers.normalize(), response ? response.status : undefined);
  headers.normalize();

  return transformedData;
}

export default transformData;
