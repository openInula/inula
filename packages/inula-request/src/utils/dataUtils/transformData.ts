import IrHeaders from '../../core/IrHeaders';
import defaultConfig from '../../config/defaultConfig';
import { IrRequestConfig, IrResponse } from '../../types/interfaces';

function transformData(inputConfig: IrRequestConfig, func: Function, response?: IrResponse) {
  const config = inputConfig || defaultConfig;
  const context = response || config;
  const headers = IrHeaders.from(context.headers);

  const transformedData = func.call(config, context.data, headers.normalize(), response ? response.status : undefined);
  headers.normalize();

  return transformedData;
}

export default transformData;
