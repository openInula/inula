const devTools = 'HORIZON_DEV_TOOLS';

interface payLoadType {
  type: string,
  data?: any,
}

interface message {
  type: typeof devTools,
  payload: payLoadType,
  from: string,
}

export function packagePayload(payload: payLoadType, from: string): message {
  return {
    type: devTools,
    payload,
    from,
  };
}

export function checkMessage(data: any, from: string) {
  if (data?.type === devTools && data?.from === from) {
    return true;
  }
  return false;
}

export function changeSource(message: message, from: string) {
  message.from = from;
}

