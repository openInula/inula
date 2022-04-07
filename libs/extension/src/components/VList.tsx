
import { useState, useRef, useEffect } from 'horizon';
import styles from './VList.less';

interface IProps<T extends { id: string }> {
  data: T[],
  width: number, // 暂时未用到，当需要支持横向滚动时使用
  height: number, // VList 的高度
  children: any, // horizon 组件，组件类型是 T
  itemHeight: number,
  scrollIndex?: number,
  onRendered:(renderInfo: renderInfoType) => void;
  filter?(data: T): boolean, // false 表示该行不显示
}

const defaultRenderInfo = {
  visibleItems: ([] as string[])
};

export type renderInfoType = typeof defaultRenderInfo;

export function VList<T extends { id: string }>(props: IProps<T>) {
  const {
    data,
    height,
    children,
    itemHeight,
    scrollIndex = 0,
    filter,
    onRendered,
  } = props;
  const [scrollTop, setScrollTop] = useState(scrollIndex * itemHeight);
  const renderInfo = useRef({visibleItems: []});
  useEffect(() => {
    onRendered(renderInfo.current);
  });

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
  renderInfo.current.visibleItems.length = 0;
  data.forEach((item, i) => {
    if (filter && !filter(item)) {
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
        renderInfo.current.visibleItems.push(item);
      }
    }
    totalHeight += itemHeight;
  });

  return (
    <div className={styles.container} onScroll={handleScroll}>
      {showList}
      <div style={{ marginTop: totalHeight }} />
    </div>
  );
}
