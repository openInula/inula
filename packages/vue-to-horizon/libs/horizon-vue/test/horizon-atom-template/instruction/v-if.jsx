import React from '@cloudsop/horizon';
import { useReactiveProps, reactive, useInstance } from 'adapters/vueAdapter';
function App(rawProps) {
  const instance = useInstance();
  const props = useReactiveProps(rawProps);
  const dataReactive = reactive({
    currentPageIndex: 1,
  });
  // 专门用于其它组件通过refs获得dataReactive的数据，如：instance.$refs[refId].xxx，如果没有该场景可删除。
  instance.dataReactive = dataReactive;
  return <>{!!(dataReactive.currentPageIndex === 6) && <div>test v-if</div>}</>;
}
export default App;
