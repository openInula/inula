import Cancel from './Cancel';
import { CancelFunction, CancelExecutor } from '../types/types';
import { CancelToken as CancelTokenInstance } from '../types/interfaces';

class CancelToken implements CancelTokenInstance {
  // 表示取消操作的状态，当取消操作被触发时，Promise将被解析为一个Cancel对象
  promise: Promise<Cancel>;
  reason?: Cancel;
  // 取消函数，用于触发取消操作
  _cancel?: CancelFunction;

  constructor(executor: CancelExecutor) {
    // promise对象在取消操作触发时将被解析
    this.promise = new Promise<Cancel>(resolve => {
      this._cancel = (message?: string) => {
        if (this.reason) {
          return;
        }

        this.reason = new Cancel(message, true);
        resolve(this.reason);
      };
    });

    executor(this._cancel!);
  }

  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }

  // 创建一个 CancelToken 实例和关联的取消函数
  static source() {
    let cancel!: CancelFunction;
    const token = new CancelToken(cancelFunc => {
      cancel = cancelFunc;
    });

    return {
      token,
      cancel,
    };
  }
}

export default CancelToken;
