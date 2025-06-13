import CustomHeaders from './CustomHeaders';

class CustomResponse {
  private readonly _body: string;
  private readonly _status: number;
  private readonly _headers: Headers;

  constructor(body: string, init?: { status: number; headers?: Record<string, string> }) {
    this._body = body;
    this._status = init?.status || 200;
    this._headers = new CustomHeaders(init?.headers) as any;
  }

  get status() {
    return this._status;
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  get headers() {
    return this._headers;
  }

  text(): Promise<string> {
    return Promise.resolve(this._body);
  }

  json(): Promise<any> {
    return Promise.resolve(JSON.parse(this._body));
  }
}

export default CustomResponse;