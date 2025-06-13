beforeEach(() => {
  // 创建一个 DOM 元素作为渲染目标
  global.container = document.createElement('div');
  document.body.appendChild(global.container);
});

afterEach(() => {
  if (global.container) {
    global.container.remove();
    global.container = null;
  }
});
