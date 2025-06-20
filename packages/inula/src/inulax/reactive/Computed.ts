/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { ContextType, DirtyLevels, RContext } from './RContext';
import { Observer, ObserverType } from '../proxy/Observer';
import { isSame } from '../CommonUtils';
import { useRef } from '../../renderer/hooks/HookExternal';

export type ComputedGetter<T> = () => T;
export type ComputedSetter<T> = (value: T) => void;
export type ComputedOptions<T> = {
  get: ComputedGetter<T>;
  set?: ComputedSetter<T>;
  triggerAnyway?: boolean;
};

export function computed<T>(options: ComputedOptions<T>): ComputedImpl<T>;
export function computed<T>(getter: ComputedGetter<T>, options?: { triggerAnyway?: boolean }): ComputedImpl<T>;
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | ComputedOptions<T>,
  options?: { triggerAnyway?: boolean }
): ComputedImpl<T> {
  if (typeof getterOrOptions === 'function') {
    const computedInst = new ComputedImpl({
      get: getterOrOptions,
      triggerAnyway: options?.triggerAnyway,
    });
    return computedInst;
  } else {
    return new ComputedImpl(getterOrOptions);
  }
}

export function useComputed<T>(options: ComputedOptions<T>): ComputedImpl<T>;
export function useComputed<T>(getter: ComputedGetter<T>, options?: { triggerAnyway?: boolean }): ComputedImpl<T>;
export function useComputed<T>(
  getterOrOptions: ComputedGetter<T> | ComputedOptions<T>,
  options?: { triggerAnyway?: boolean }
): ComputedImpl<T> {
  const objRef = useRef<null | ComputedImpl<T>>(null);
  if (objRef.current === null) {
    if (typeof getterOrOptions === 'function') {
      objRef.current = new ComputedImpl({
        get: getterOrOptions,
        triggerAnyway: options?.triggerAnyway,
      });
    } else {
      objRef.current = new ComputedImpl(getterOrOptions);
    }
  }

  return objRef.current;
}

export class ComputedImpl<T = any> {
  private _value: T;
  private readonly getter: ComputedGetter<T>;
  private readonly setter?: ComputedSetter<T>;
  private readonly rContext: RContext;

  private readonly observer: Observer = new Observer(ObserverType.COMPUTED, this);
  readonly _isRef = true;
  readonly _isReadonly: boolean;

  constructor(options: ComputedOptions<T>) {
    this.getter = options.get;
    this.setter = options.set;
    this.rContext = new RContext(this.updateValue.bind(this), ContextType.COMPUTED, this.trigger.bind(this));
    this._isReadonly = !this.setter;

    // 设置dirty
    this.rContext.setDirty(true);
  }

  get value() {
    if (this.rContext.isDirty()) {
      this.rContext.run();
    }

    this.observer.useProp('value');

    return this._value;
  }

  set value(newValue: T) {
    if (this.setter) {
      this.setter(newValue);
    } else {
      console.warn('Write operation failed: computed value is readonly');
    }
  }

  private updateValue() {
    const oldValue = this._value;
    this._value = this.getter();

    if (!isSame(oldValue, this._value)) {
      this.observer.setProp(
        'value',
        {
          mutation: true,
          from: oldValue,
          to: this._value,
        },
        undefined,
        undefined,
        DirtyLevels.Dirty
      );
    }
  }

  private trigger() {
    this.observer.setProp(
      'value',
      {
        mutation: true,
        from: this._value,
        to: this._value,
      },
      undefined,
      undefined,
      this.rContext._dirtyLevel === DirtyLevels.MaybeDirty_ComputedSideEffect
        ? DirtyLevels.MaybeDirty_ComputedSideEffect
        : DirtyLevels.MaybeDirty
    );
  }

  stop() {
    this.rContext.stop();
  }
}

export function triggerComputed(computed: ComputedImpl<any>) {
  return computed.value;
}
