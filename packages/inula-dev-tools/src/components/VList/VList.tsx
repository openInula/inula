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

/**
 * 内部只记录滚动位置状态值
 * data 数组更新后不修改滚动位置，只有修改 scrollToItem 才会修改滚动位置
 */
import { useState, useRef, useEffect, useMemo } from 'openinula';
import styles from './VList.less';
import ItemMap from './ItemMap';
import { debounceFunc } from '../../utils/publicUtil';

interface IProps<T extends { id: number | string }> {
  data: T[];
  maxDeep: number;
  width: number; // 暂时未用到，当需要支持横向滚动时使用
  height: number; // VList 的高度
  children?: any; // inula 组件
  itemHeight: number;
  scrollToItem?: T; // 滚动到指定项位置，如果该项在可见区域内，不滚动，如果补在，则滚动到中间位置
  onRendered: (renderInfo: RenderInfoType<T>) => void;
  filter?: (data: T) => boolean; // false 表示该行不显示
}

export type RenderInfoType<T> = {
  visibleItems: T[];
}

function parseTranslate<T>(data: T[], itemHeight: number) {
  const map = new Map<T, number>();
  data.forEach((item, index) => {
    map.set(item, index * itemHeight);
  })
  return map;
}

export function VList<T extends { id: number | string }>(props: IProps<T>) {
  const { data, maxDeep, height, width, children, itemHeight, scrollToItem, onRendered } = props;
  const [scrollTop, setScrollTop] = useState(Math.max(data.indexOf(scrollToItem), 0) * itemHeight);
  const renderInfoRef: { current: RenderInfoType<T> } = useRef({
    visibleItems: [],
  });
  const [indentationLength, setIndentationLength] = useState(0);

  // 每个 item 的 translateY 值固定不变
  const itemToTranslateYMap = useMemo(() => parseTranslate(data, itemHeight), [data]);
  const itemIndexMap = useMemo(() => new ItemMap<T>(), []);
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    onRendered(renderInfoRef.current);
  });

  useEffect(() => {
    debounceFunc(() => setIndentationLength(Math.min(12, Math.round(width / (2 * maxDeep)))));
  }, [width]);

  useEffect(() => {
    if (scrollToItem) {
      const renderInfo = renderInfoRef.current;
      // 在显示区域，不滚动
      if (!renderInfo.visibleItems.includes(scrollToItem)) {
        const index = data.indexOf(scrollToItem);
        // 显示在页面中间
        const top = Math.max(index * itemHeight - height / 2, 0);
        containerRef.current.scrollTo({ top: top });
      }
    }
  }, [scrollToItem]);

  // 滚动事件会频繁触发，通过框架提供的代理会有大量计算寻找 dom 元素，直接绑定到原生事件上减少计算量
  useEffect(() => {
    const handleScroll = event => {
      const scrollTop = event.target.scrollTop;
      setScrollTop(scrollTop);
    };
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const totalHeight = itemHeight * data.length;
  const maxIndex = data.length; // slice 截取渲染 item 数组时最大位置不能超过自然长度
  // 第一个可见 item index
  const firstInViewItemIndex = Math.floor(scrollTop / itemHeight);
  // 可见区域前最多冗余 4 个 item
  const startRenderIndex = Math.max(firstInViewItemIndex - 4, 0); // index 不能小于 0
  // 最多可见数量
  const maxInViewCount = Math.floor(height / itemHeight);
  // 最后可见 item index
  const lastInViewIndex = Math.min(firstInViewItemIndex + maxInViewCount, maxIndex);
  // 记录可见 items
  renderInfoRef.current.visibleItems = data.slice(firstInViewItemIndex, lastInViewIndex);
  // 可见区域后冗余 4 个 item
  const lastRenderIndex = Math.min(lastInViewIndex + 4, maxIndex);
  // 需要渲染的 item
  const renderItems = data.slice(startRenderIndex, lastRenderIndex);
  // 给 items 重新排序，确保未移出渲染数组的 item 在新的渲染数组中位置不变，这样在 diff 算法比较后，这部分的 dom 不会发生更新
  const nextRenderList = itemIndexMap.calculateReSortedItems(renderItems);
  const list = nextRenderList.map((item, index) => {
    if (!item) {
      return null;
    }
    return (
      <div
        key={String(i)} // 固定 key 值，这样就只会更新 translateY 的值
        className={styles.item}
        style={{ transform: `translateY(${itemToTranslateYMap.get(item)}px)` }}
      >
        {children(item,indentationLength)}
      </div>
    );
  });

  return (
    <div ref={containerRef} className={styles.container}>
      {list}
      <div style={{ marginTop: totalHeight }}></div>
    </div>
  );
}
