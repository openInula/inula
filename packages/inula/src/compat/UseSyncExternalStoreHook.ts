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

import { isSame } from '../renderer/utils/compare';
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo
} from '../renderer/hooks/HookExternal';

type StoreChangeListener = () => void;
type Unsubscribe = () => void;
type Store<T> = { value: T; getSnapshot: () => T }

export function useSyncExternalStore<T>(
  subscribe: (onStoreChange: StoreChangeListener) => Unsubscribe,
  getSnapshot: () => T,
): T {
  // 获取当前Store快照
  const value = getSnapshot();

  // 用于强制重新渲染和存储store引用，非普通state
  // 需要强制更新时调用 `forceUpdate({inst})`，由于是新的对象引入，会导致组件强制更新
  const [{ store }, forceUpdate] = useState<{ store: Store<T> }>({
    store: {
      value,
      getSnapshot
    }
  });

  function reRenderIfStoreChange() {
    if (didSnapshotChange(store)) {
      forceUpdate({ store });
    }
  }

  // 必须在 layout 阶段（绘制前）同步完成，以便后续的访问到正确的value。
  useLayoutEffect(() => {
    // 同步更新 快照值和 getSnapshot 函数引用，确保它们始终是最新的。
    // subscribe 更新，代表数据源变化，也需要更新
    store.value = value;
    store.getSnapshot = getSnapshot;

    reRenderIfStoreChange();
  }, [subscribe, value, getSnapshot]);


  useEffect(() => {
    // useLayoutEffect和useEffect存在时机，store可能会变化
    reRenderIfStoreChange();

    // 开始订阅，返回值以在卸载组件是取消订阅
    return subscribe(reRenderIfStoreChange);
  }, [subscribe]);


  return value;
}

/**
 * 检查快照是否发生变化
 * @param store Store实例
 * @returns 返回Store状态是否发生变化
 */
function didSnapshotChange<T>(store: Store<T>) {
  const latestGetSnapshot = store.getSnapshot;
  const prevValue = store.value;
  try {
    const nextValue = latestGetSnapshot();
    return !isSame(prevValue, nextValue);
  } catch (error) {
    return true;
  }
}

// 用于追踪已渲染快照的实例类型
type SelectionInstance<Selection> =
  | { hasValue: true; value: Selection }
  | { hasValue: false; value: null };

// 确保返回的类型既是原始类型 T，又确实是个函数
function isFunction<T>(value: T): value is T & ((...args: any[]) => any) {
  return typeof value === 'function';
}

// 与useSyncExternalStore相同，但支持选择器和相等性判断参数
export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: StoreChangeListener) => Unsubscribe,
  getSnapshot: () => Snapshot,
  getServerSnapshot: void | null | (() => Snapshot),
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
  // 用于缓存已渲染的store快照值
  const instRef = useRef<SelectionInstance<Selection>>({
    hasValue: false,
    value: null
  });

  // 创建带选择器的快照获取函数
  const snapshotWithSelector = useMemo(() => {
    // 使用闭包变量追踪缓存状态，在 getSnapshot / selector / isEqual 不变时
    let initialized = false;
    let cachedSnapshot: Snapshot;
    let cachedSelection: Selection;

    const memoizedSelectorFn = (snapshot: Snapshot) => {
      // 首次调用时的处理
      if (!initialized) {
        initialized = true;
        cachedSnapshot = snapshot;
        const selection = selector(snapshot);

        // 尝试复用当前渲染值
        if (isFunction(isEqual) && instRef.current.hasValue) {
          const current = instRef.current.value;
          if (isEqual(current, selection)) {
            cachedSelection = current;
            return current;
          }
        }

        cachedSelection = selection;
        return selection;
      }

      // 尝试复用之前的结果
      const previousSnapshot = cachedSnapshot;
      const previousSelection = cachedSelection;

      // 快照未变化时直接返回之前的选择结果
      if (isSame(previousSnapshot, snapshot)) {
        return previousSelection;
      }

      // 快照已变化，需要计算新的选择结果
      const newSelection = selector(snapshot);

      // 使用自定义相等判断函数检查数据是否真正发生变化
      if (isFunction(isEqual) && isEqual(previousSelection, newSelection)) {
        // 虽然选择结果相等，但仍需更新快照避免保留旧引用
        cachedSnapshot = snapshot;
        return previousSelection;
      }

      // 更新缓存并返回新结果
      cachedSnapshot = snapshot;
      cachedSelection = newSelection;
      return newSelection;
    };

    return () => memoizedSelectorFn(getSnapshot());
  }, [getSnapshot, selector, isEqual]);

  const selectedValue = useSyncExternalStore(subscribe, snapshotWithSelector);

  // 更新实例状态
  useEffect(() => {
    instRef.current.hasValue = true;
    instRef.current.value = selectedValue;
  }, [selectedValue]);

  return selectedValue;
}