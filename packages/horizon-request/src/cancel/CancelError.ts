import IrError from '../core/IrError';
import { IrRequestConfig } from '../types/interfaces';

class CancelError extends IrError {
  constructor(message: string | undefined, config: IrRequestConfig, request?: any) {
    const errorMessage = message || 'canceled';
    super(errorMessage, (IrError as any).ERR_CANCELED, config, request);
    this.name = 'CanceledError';
  }
}

export default CancelError;
