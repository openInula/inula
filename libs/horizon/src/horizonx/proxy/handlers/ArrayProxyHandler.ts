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
  if (key === 'watch'){
    const observer = getObserver(rawObj);

    return (prop:any, handler:(key:string, oldValue:any, newValue:any)=>void)=>{
      if(!observer.watchers[prop]){
        observer.watchers[prop]=[] as ((key:string, oldValue:any, newValue:any)=>void)[];
      }
      observer.watchers[prop].push(handler);
      return ()=>{
        observer.watchers[prop]=observer.watchers[prop].filter(cb=>cb!==handler);
      }
    }
  }

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
  const observer = getObserver(rawObj);

  if (!isSame(newValue, oldValue)) {
    if(observer.watchers?.[key]){
      observer.watchers[key].forEach(cb => {
        cb(key, oldValue, newValue);
      });
    }

    observer.setProp(key);
  }

  if (oldLength !== newLength) {
    observer.setProp('length');
  }

  return ret;
}
