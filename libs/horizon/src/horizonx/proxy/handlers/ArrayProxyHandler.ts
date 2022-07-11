import { getObserver } from '../ProxyHandler';
import { isSame, isValidIntegerKey } from '../../CommonUtils';
import { get as objectGet } from './ObjectProxyHandler';

export function createArrayProxy(rawObj: any[]): any[] {
  const handle = {
    get,
    set,
  };

  return new Proxy(rawObj, handle);
}

function get(rawObj: any[], key: string, receiver: any) {
  if (isValidIntegerKey(key) || key === 'length') {
    return objectGet(rawObj, key, receiver);
  }
  return Reflect.get(rawObj, key, receiver);
}

function set(rawObj: any[], key: string, value: any, receiver: any) {
  const oldValue = rawObj[key];
  const oldLength = rawObj.length;
  const newValue = value;

  const ret = Reflect.set(rawObj, key, newValue, receiver);

  const newLength = rawObj.length;
  const tracker = getObserver(rawObj);

  if (!isSame(newValue, oldValue)) {
    tracker.setProp(key);
  }

  if (oldLength !== newLength) {
    tracker.setProp('length');
  }

  return ret;
}
