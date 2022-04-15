
function ifNullThrows(v) {
  if (v === null) {
    throw new Error('received a null');
  }
  return v;
}

// 用于向页面注入脚本
export function injectCode(src) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = function () {
    // 加载完毕后需要移除
    script.remove();
  };

  ifNullThrows(document.head || document.documentElement).appendChild(script);
}
