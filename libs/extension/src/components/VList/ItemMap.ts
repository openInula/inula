// 用于在滚动的过程中，对比上一次渲染的结果和本次需要渲染项
// 确保继续渲染项在新渲染数组中的位置和旧渲染数组中的位置不发生改变

export default class ItemMap<T>{
  
  // 不要用 indexOf 进行位置计算，它会遍历数组
  private lastRenderItemToIndexMap: Map<T, number>;

  constructor(){
    this.lastRenderItemToIndexMap = new Map();
  }

  public calculateReSortedItems(nextItems: T[]): (T|undefined)[] {
    if (this.lastRenderItemToIndexMap.size === 0) {
      nextItems.forEach((item, index) => {
        this.lastRenderItemToIndexMap.set(item, index);
      });
      return nextItems;
    }
    const nextRenderItems: T[] = [];
    const length = nextItems.length;
    const nextRenderItemToIndexMap = new Map<T,number>();
    const addItems = [];
    // 遍历 nextItems 找到复用 item 和 新增 item
    nextItems.forEach(item => {
      const lastIndex = this.lastRenderItemToIndexMap.get(item);
    // 处理旧 item
      if (lastIndex !== undefined) {
        // 使用上一次的位置
        nextRenderItems[lastIndex] = item;
        // 记录位置
        nextRenderItemToIndexMap.set(item, lastIndex);
      } else {
        // 记录新增的 item
        addItems.push(item);
      }
    });

    // 处理新增 item
    // 翻转数组，后面在调用pop时拿到的是最后一个，以确保顺序
    addItems.reverse();
    for(let i = 0; i < length; i++) {
      // 优先将新增 item 放置在空位置上
      if (!nextRenderItems[i]) {
        const item = addItems.pop();
        nextRenderItems[i] = item;
        nextRenderItemToIndexMap.set(item, i);
      }
    }
    // 剩余新 item 补在数组后面
    for(let i = addItems.length - 1; i >= 0; i--) {
      const item = addItems[i];
      nextRenderItemToIndexMap.set(item, nextRenderItems.length);
      nextRenderItems.push(item);
    }
    // 如果 nextRenderItems 中存在空 index， nextItems 已经耗尽，不用处理
    // 确保新旧数组中 item 的 index 值不会发生变化
    this.lastRenderItemToIndexMap = nextRenderItemToIndexMap;
    return nextRenderItems;
  }

}