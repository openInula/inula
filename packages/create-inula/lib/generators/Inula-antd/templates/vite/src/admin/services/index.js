import request from 'utils/request';
import config from 'utils/config';

import api from './api';

const gen = params => {
  let url = config.apiPrefix + params;
  let method = 'GET';

  const paramsArray = params.split(' ');
  if (paramsArray.length === 2) {
    method = paramsArray[0];
    url = config.apiPrefix + paramsArray[1];
  }

  return function (data) {
    return request({
      url,
      data,
      method,
    });
  };
};

const APIFunction = {};
for (const key in api) {
  APIFunction[key] = gen(api[key]);
}

APIFunction.queryWeather = params => {
  params.key = 'i7sau1babuzwhycn';
  return request({
    url: `${config.apiPrefix}/weather/now.json`,
    data: params,
  });
};

export default APIFunction;
