// 内部只记录滚动位置状态值
// data 数组更新后不修改滚动位置，
// 只有修改scrollToItem才会修改滚动位置

import { useState, useRef, useEffect, useMemo } from 'horizon';
import styles from './VList.less';
import ItemMap from './ItemMap';

interface IProps<T extends { id: number | string }> {
  data: T[],
  width: number, // 暂时未用到，当需要支持横向滚动时使用
  height: number, // VList 的高度
  children: any, // horizon 组件，组件类型是 T
  itemHeight: number,
  scrollToItem?: T, // 滚动到指定项位置，如果该项在可见区域内，不滚动，如果不在，则滚动到中间位置
  onRendered: (renderInfo: renderInfoType<T>) => void;
  filter?(data: T): boolean, // false 表示该行不显示
}

export type renderInfoType<T> = {
  visibleItems: T[];
};

function parseTranslate<T>(data: T[], itemHeight: number) {
  const map = new Map<T, number>();
  data.forEach((item, index) => {
    map.set(item, index * itemHeight);
  });
  return map;
}

export function VList<T extends { id: number | string }>(props: IProps<T>) {
  const {
    data,
    height,
    children,
    itemHeight,
    scrollToItem,
    onRendered,
  } = props;
  const [scrollTop, setScrollTop] = useState(Math.max(data.indexOf(scrollToItem), 0) * itemHeight);
  const renderInfoRef: { current: renderInfoType<T> } = useRef({
    visibleItems: [],
  });
  // 每个 item 的 translateY 值固定不变
  const itemToTranslateYMap = useMemo(() => parseTranslate(data, itemHeight), [data]);
  const itemIndexMap = useMemo(() => new ItemMap<T>(), []);
  const containerRef = useRef<HTMLDivElement>();
  useEffect(() => {
    onRendered(renderInfoRef.current);
  });

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

  // 滚动事件会频繁触发，通过框架提供的代理会有大量计算寻找 dom 元素。
  // 直接绑定到原生事件上减少计算量
  useEffect(() => {
    const handleScroll = (event: any) => {
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
  const maxIndex = data.length; // slice 截取渲染 item 数组时最大位置不能超过自身长度
  // 第一个可见 item index
  const firstInViewItemIndex = Math.floor(scrollTop / itemHeight);
  // 可见区域前最多冗余 4 个 item
  const startRenderIndex = Math.max(firstInViewItemIndex - 4, 0); // index 不能小于0
  // 最多可见数量
  const maxInViewCount = Math.floor(height / itemHeight);
  // 最后可见item index
  const lastInViewIndex = Math.min(firstInViewItemIndex + maxInViewCount, maxIndex);
  // 记录可见 items
  renderInfoRef.current.visibleItems = data.slice(firstInViewItemIndex, lastInViewIndex);
  // 可见区域后冗余 4 个 item
  const lastRenderIndex = Math.min(lastInViewIndex + 4, maxIndex);
  // 需要渲染的 items
  const renderItems = data.slice(startRenderIndex, lastRenderIndex);
  // 给 items 重新排序，确保未移出渲染数组的 item 在新的渲染数组中位置不变
  // 这样在diff算法比较后，这部分的 dom 不会发生更新
  const nextRenderList = itemIndexMap.calculateReSortedItems(renderItems);
  const list = nextRenderList.map((item, i) => {
    if (!item) {
      return null;
    }
    return (
      <div
        key={String(i)} // 固定 key 值，这样就只会更新 translateY 的值
        className={styles.item}
        style={{ transform: `translateY(${itemToTranslateYMap.get(item)}px)` }} >
        {children(item)}
      </div>
    );
  });

  return (
    <div ref={containerRef} className={styles.container}>
      {list}
      <div style={{ marginTop: totalHeight }} />
    </div>
  );
}
