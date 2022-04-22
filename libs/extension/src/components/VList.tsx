// TODO:当前的 item 渲染效果较差，每次滚动所有项在数组中的位置都会发生变更。
// 建议修改成选项增加减少时，未变更项在原数组中位置不变更

import { useState, useRef, useEffect } from 'horizon';
import styles from './VList.less';

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
  visibleItems: T[],
  skipItemCountBeforeScrollItem: number,
};

export function VList<T extends { id: number | string }>(props: IProps<T>) {
  const {
    data,
    height,
    children,
    itemHeight,
    scrollToItem,
    filter,
    onRendered,
  } = props;
  const [scrollTop, setScrollTop] = useState(data.indexOf(scrollToItem) * itemHeight);
  const renderInfoRef: { current: renderInfoType<T> } = useRef({ visibleItems: [], skipItemCountBeforeScrollItem: 0 });
  const containerRef = useRef<HTMLDivElement>();
  useEffect(() => {
    onRendered(renderInfoRef.current);
  });

  useEffect(() => {
    if (scrollToItem) {
      const renderInfo = renderInfoRef.current;
      // 在滚动区域，不滚动
      if (!renderInfo.visibleItems.includes(scrollToItem)) {
        const index = data.indexOf(scrollToItem);
        // top值计算需要减掉filter条件判定不显示项
        const totalCount = index - renderInfoRef.current.skipItemCountBeforeScrollItem;
        // 显示在页面中间
        const top = totalCount * itemHeight - height / 2;
        containerRef.current.scrollTo({ top: top });
      }
    }
  }, [scrollToItem]);

  const handleScroll = (event: any) => {
    const scrollTop = event.target.scrollTop;
    setScrollTop(scrollTop);
  };
  const showList: any[] = [];
  let totalHeight = 0;
  // 顶部冗余
  const startShowTopValue = Math.max(scrollTop - itemHeight * 4, 0);
  // 底部冗余
  const showNum = Math.floor(height / itemHeight) + 4;
  // 如果最后一个显示不全，不统计在显示 ids 内
  const maxTop = scrollTop + height - itemHeight;
  // 清空记录的上次渲染的数据
  renderInfoRef.current.visibleItems.length = 0;
  const scrollItemIndex = data.indexOf(scrollToItem);
  renderInfoRef.current.skipItemCountBeforeScrollItem = 0;
  data.forEach((item, i) => {
    if (filter && !filter(item)) {
      if (scrollItemIndex > i) {
        renderInfoRef.current.skipItemCountBeforeScrollItem++;
      }
      return;
    }
    if (totalHeight >= startShowTopValue && showList.length <= showNum) {
      showList.push(
        <div
          key={String(item.id)}
          className={styles.item}
          style={{ transform: `translateY(${totalHeight}px)` }} >
          {children(i, item)}
        </div>
      );
      if (totalHeight >= scrollTop && totalHeight < maxTop) {
        renderInfoRef.current.visibleItems.push(item);
      }
    }
    totalHeight += itemHeight;
  });

  return (
    <div ref={containerRef} className={styles.container} onScroll={handleScroll}>
      {showList}
      <div style={{ marginTop: totalHeight }} />
    </div>
  );
}
