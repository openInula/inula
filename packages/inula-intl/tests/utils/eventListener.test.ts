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
import EventEmitter from '../../src/utils/eventListener';

describe('eventEmitter', () => {
  it('should call registered event listeners on emit', async () => {
    const firstListener = jest.fn();
    const secondListener = jest.fn(() => 'return value is ignored');

    const emitter = new EventEmitter();
    emitter.on('test', firstListener);
    emitter.on('test', secondListener);

    emitter.emit('test', 42);

    expect(firstListener).toBeCalledWith(42);
    expect(secondListener).toBeCalledWith(42);
  });

  it('should allow unsubscribing from events', () => {
    const listener = jest.fn();
    const emitter = new EventEmitter();

    const unsubscribe = emitter.on('test', listener);
    emitter.emit('test', 42);
    expect(listener).toBeCalledWith(42);

    listener.mockReset();
    unsubscribe();
    emitter.emit('test', 42);
    expect(listener).not.toBeCalled();
  });

  it("should do nothing when even doesn't exist", () => {
    const unknown = jest.fn();

    const emitter = new EventEmitter();
    // this should not throw
    emitter.emit('test', 42);
    // this should not throw
    emitter.removeListener('test', unknown);

    emitter.on('test', jest.fn());
    // this should not throw
    emitter.removeListener('test', unknown);
  });
});
