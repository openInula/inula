import horizonRequest from './src/horizonRequest';
import useHR from './src/core/useHR/useHR';

const {
  create,
  request,
  get,
  post,
  put,
  ['delete']: propToDelete,
  head,
  options,
  HorizonRequest,
  HrError,
  CanceledError,
  isCancel,
  CancelToken,
  all,
  Cancel,
  isHrError,
  spread,
  HrHeaders,
  // 兼容axios
  Axios,
  AxiosError,
  AxiosHeaders,
  isAxiosError,
} = horizonRequest;

export {
  create,
  request,
  get,
  post,
  put,
  propToDelete as delete,
  head,
  options,
  HorizonRequest,
  HrError,
  CanceledError,
  isCancel,
  CancelToken,
  all,
  Cancel,
  isHrError,
  spread,
  HrHeaders,
  useHR,
  // 兼容axios
  Axios,
  AxiosError,
  AxiosHeaders,
  isAxiosError,
};

export default horizonRequest;
