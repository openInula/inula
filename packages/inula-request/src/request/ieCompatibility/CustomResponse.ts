/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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