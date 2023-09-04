class CustomAbortSignal {
  private _isAborted: boolean;
  private _listeners: Set<() => void>;

  constructor() {
    this._isAborted = false;
    this._listeners = new Set();
  }

  get aborted(): boolean {
    return this._isAborted;
  }

  addEventListener(listener: () => void): void {
    this._listeners.add(listener);
  }

  removeEventListener(listener: () => void): void {
    this._listeners.delete(listener);
  }

  abort(): void {
    if (!this._isAborted) {
      this._isAborted = true;
      this._listeners.forEach(listener => listener());
    }
  }
}

export default CustomAbortSignal;
