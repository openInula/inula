class ResourceManager {
  private resources: Map<string, any[]> = new Map();
  private eventListeners: { [key: string]: EventListener } = {};

  constructor() {
    // 创建大量事件监听器但没有清理机制
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('click', this.handleClick);

    // 启动定时器但没有清理
    setInterval(this.collectData, 1000);
  }

  private handleResize = () => {
    // 每次窗口大小变化时，都添加新数据到资源中但从不清理
    const newData = new Array(10000).fill(0).map(() => ({
      id: Math.random().toString(),
      value: new Array(1000).fill('large string data'),
    }));

    this.resources.set(`resize_${Date.now()}`, newData);
    console.log('Added new resize data');
  };

  private handleClick = (event: MouseEvent) => {
    // 为每个点击创建一个新闭包，捕获点击事件但从不释放
    const clickData = { x: event.clientX, y: event.clientY, timestamp: Date.now() };

    const element = document.getElementById('tracking-area');
    if (element) {
      // 创建新的事件监听器但从不移除旧的
      const listener = () => {
        console.log('Processing click data:', clickData);
      };

      element.addEventListener('mouseover', listener);
      this.eventListeners[`click_${Date.now()}`] = listener;
    }
  };

  private collectData = () => {
    // 定期收集数据但从不清理
    const largeData = new Array(5000).fill(0).map(() => new Uint8Array(1024));
    this.resources.set(`data_${Date.now()}`, largeData);
  };

  // 缺少析构函数或清理方法来移除事件监听器和释放资源
}

// 创建实例但从不销毁
let manager: ResourceManager | null = new ResourceManager();

// 模拟单页应用路由变化，但没有清理旧的资源管理器
function navigateToNewPage() {
  // 创建新的管理器，但没有清理旧的
  manager = new ResourceManager(); // 旧的manager实例仍然存在，但已经无法访问
}
