/**
 * @jest-environment node
 */

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

import processDownloadProgress from '../../../src/request/processDownloadProgress';
import { fetchRequest } from '../../../src/request/fetchRequest';
import { ReadableStream as WebReadableStream } from 'stream/web';

describe('processDownloadProgress', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    globalThis.ReadableStream = WebReadableStream as typeof ReadableStream;
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should forward source stream errors to the progress stream reader', async () => {
    const sourceError = new Error('source stream failed');
    const sourceStream = new ReadableStream({
      start(controller) {
        controller.error(sourceError);
      },
    });
    const response = {
      headers: {
        get: () => '1',
      },
    } as unknown as Response;
    const progressStream = processDownloadProgress(sourceStream, response, jest.fn())!;
    const reader = progressStream.getReader();

    const result = await Promise.race([
      reader.read().catch(error => error),
      new Promise(resolve => setTimeout(() => resolve('timeout'), 20)),
    ]);

    expect(result).toBe(sourceError);
  });

  it('should return null when response body stream is null', () => {
    const response = {
      headers: {
        get: () => null,
      },
    } as unknown as Response;

    expect(processDownloadProgress(null, response, jest.fn())).toBeNull();
  });

  it('should pass chunks through and report accumulated download progress', async () => {
    const onProgress = jest.fn();
    const sourceStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([3]));
        controller.close();
      },
    });
    const response = {
      headers: {
        get: () => '3',
      },
    } as unknown as Response;
    const progressStream = processDownloadProgress(sourceStream, response, onProgress)!;

    const data = new Uint8Array(await new Response(progressStream).arrayBuffer());

    expect(Array.from(data)).toEqual([1, 2, 3]);
    expect(onProgress).toHaveBeenNthCalledWith(1, { loaded: 2, total: 3 });
    expect(onProgress).toHaveBeenNthCalledWith(2, { loaded: 3, total: 3 });
  });

  it('should reject response parsing when an aborted source stream errors', async () => {
    const controller = new AbortController();
    const abortError = new DOMException('request aborted', 'AbortError');
    const sourceStream = new ReadableStream({
      start(streamController) {
        controller.signal.addEventListener('abort', () => {
          streamController.error(abortError);
        });
      },
    });
    const response = {
      headers: {
        get: () => null,
      },
    } as unknown as Response;
    const progressStream = processDownloadProgress(sourceStream, response, jest.fn())!;
    const parseMethod = new Response(progressStream).text();

    controller.abort();

    await expect(parseMethod).rejects.toBe(abortError);
  });

  it('should reject with CancelError when fetch body aborts while reporting download progress', async () => {
    const controller = new AbortController();

    globalThis.fetch = jest.fn((_url, options: RequestInit) => {
      const body = new ReadableStream({
        start(streamController) {
          options.signal!.addEventListener('abort', () => {
            streamController.error(new DOMException('request aborted', 'AbortError'));
          });
        },
      });

      return Promise.resolve(new Response(body, { status: 200, statusText: 'OK' }));
    }) as unknown as typeof fetch;

    const request = fetchRequest({
      url: '/abort',
      method: 'GET',
      responseType: 'text',
      signal: controller.signal,
      onDownloadProgress: jest.fn(),
      validateStatus: (status: number) => status >= 200 && status < 300,
    });

    // 为了让 fetchRequest 内部的 .then(response => {...}) 先跑完
    // 把 progress stream 接进 parseMethod，再 abort
    await Promise.resolve();
    controller.abort();

    await expect(request).rejects.toMatchObject({
      name: 'CanceledError',
      message: 'request canceled',
    });
  });
});
