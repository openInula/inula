import { watch } from "@openinula/next";
import "./index.css";

const VirtualList = ({
  height = 400, //虚拟列表容器高度
  itemHeight = 30, //节点高度
  items = [], //数据源数组
  renderItem, //渲染节点的函数
  buffer = 5, //缓冲区节点个数
  className = "",
  style = {},
}) => {
  let containerRef;
  let scrollTop = 0;
  let visibleItems = [];

  // 计算可见区域内的项目
  const calculateVisibleItems = () => {
    if (!containerRef) return;
    console.log(containerRef, containerRef.scrollTop);

    const currentScrollTop = containerRef.scrollTop;
    scrollTop = currentScrollTop;

    // 计算可见区域的起始和结束索引
    const startIndex = Math.max(
      0,
      Math.floor(currentScrollTop / itemHeight) - buffer
    );
    const visibleCount = Math.ceil(height / itemHeight) + 2 * buffer;
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount);

    // 更新可见项目
    const newVisibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      newVisibleItems.push({
        index: i,
        item: items[i],
        style: {
          position: "absolute",
          top: `${i * itemHeight}px`,
          height: `${itemHeight}px`,
          width: "100%",
        },
      });
    }

    visibleItems = newVisibleItems;
  };

  // 监听滚动事件
  watch(() => {
    if (containerRef) {
      calculateVisibleItems();

      const handleScroll = () => {
        requestAnimationFrame(calculateVisibleItems);
      };

      containerRef.addEventListener("scroll", handleScroll);
      return () => containerRef.removeEventListener("scroll", handleScroll);
    }
  });

  // // 当items变化时重新计算
  watch(() => {
    calculateVisibleItems();
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      style={{ height, overflow: "auto", position: "relative", ...style }}
    >
      <div
        className="virtual-list-content"
        style={{
          height: `${items.length * itemHeight}px`,
          position: "relative",
        }}
      >
        {visibleItems.map(({ index, item, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;
