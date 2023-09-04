import CustomAbortSignal from './CustomAbortSignal';

class CustomAbortController {
  private readonly _signal: CustomAbortSignal;

  constructor() {
    this._signal = new CustomAbortSignal();
  }

  get signal(): CustomAbortSignal {
    return this._signal;
  }

  abort(): void {
    this._signal.abort();
  }
}

export default CustomAbortController;
