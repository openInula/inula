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

type Listener = () => void;

interface MockStore<T = any> {
  getValue(): T;
  setValue(newValue: T): void;
  subscribe(listener: Listener): () => void;
  getListenerCount(): number;
  enableSnapshotError(): void;
  disableSnapshotError(): void;
  enableSubscribeError(): void;
  disableSubscribeError(): void;
  updateProperty<K extends keyof T>(key: K, newValue: T[K]): void;
}

export function createMockStore<T = any>(initialValue: T): MockStore<T> {
  let value = initialValue;
  const listeners = new Set<Listener>();
  let shouldThrowOnSnapshot = false;
  let shouldThrowOnSubscribe = false;
  
  const store: MockStore<T> = {
    getValue() {
      if (shouldThrowOnSnapshot) {
        throw new Error('getSnapshot error');
      }
      return value;
    },
    
    setValue(newValue: T) {
      // For objects: check reference first, then deep comparison
      // For primitives: simple comparison
      let shouldUpdate = false;
      
      if (typeof value === 'object' && value !== null && typeof newValue === 'object' && newValue !== null) {
        // For objects: update if different reference OR different content
        shouldUpdate = value !== newValue || JSON.stringify(value) !== JSON.stringify(newValue);
        if (shouldUpdate) {
          value = { ...newValue as any };
        }
      } else {
        // For primitives: simple comparison
        shouldUpdate = value !== newValue;
        if (shouldUpdate) {
          value = newValue;
        }
      }
      
      if (shouldUpdate) {
        listeners.forEach(listener => listener());
      }
    },
    
    updateProperty<K extends keyof T>(key: K, newValue: T[K]) {
      if (typeof value === 'object' && value !== null) {
        const currentValue = (value as any)[key];
        if (currentValue !== newValue) {
          value = { ...(value as any), [key]: newValue };
          listeners.forEach(listener => listener());
        }
      }
    },
    
    subscribe(listener: Listener) {
      if (shouldThrowOnSubscribe) {
        throw new Error('subscribe error');
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    
    getListenerCount() {
      return listeners.size;
    },
    
    // Test utilities
    enableSnapshotError() {
      shouldThrowOnSnapshot = true;
    },
    
    disableSnapshotError() {
      shouldThrowOnSnapshot = false;
    },
    
    enableSubscribeError() {
      shouldThrowOnSubscribe = true;
    },
    
    disableSubscribeError() {
      shouldThrowOnSubscribe = false;
    }
  };
  
  return store;
}