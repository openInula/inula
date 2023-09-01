import HrError from '../core/HrError';
import { HrRequestConfig } from '../types/interfaces';

class CancelError extends HrError {
  constructor(message: string | undefined, config: HrRequestConfig, request?: any) {
    const errorMessage = message || 'canceled';
    super(errorMessage, (HrError as any).ERR_CANCELED, config, request);
    this.name = 'CanceledError';
  }
}

export default CancelError;
