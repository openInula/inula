const devTools = 'HORIZON_DEV_TOOLS';

interface payLoadType {
  type: string,
  data?: any,
}

export function packagePayload(payload: payLoadType) {
  return {
    type: devTools,
    payload,
  };
}

export function checkData(data: any) {
  if (data?.type === devTools) {
    return true;
  }
  return false;
}

