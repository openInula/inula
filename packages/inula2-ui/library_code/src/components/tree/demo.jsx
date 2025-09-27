import demo1 from "./demos/demo1.jsx";
import demo2 from "./demos/demo2.jsx";
import demo3 from "./demos/demo3.jsx";
import demo4 from "./demos/demo4.jsx";
import demo5 from "./demos/demo5.jsx";

const TreeDemo = () => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>基本</h2>
        <div>默认选中第一项</div>
      </div>
      <div>
        <demo1 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>受控示例</h2>
        <div>受控树组件示例</div>
      </div>
      <div>
        <demo2 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>自定义图标、连接线</h2>
        <div>可以自定义文字前的图标以及展开折叠图标，展示连接线</div>
      </div>
      <div>
        <demo3 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>异步加载数据</h2>
        <div>
          异步加载数据，需设置loadData属性，返回Promise对象，返回值为树节点数据
        </div>
      </div>
      <div>
        <demo4 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>虚拟列表</h2>
        <div>支持虚拟滚动，需设置高度</div>
      </div>
      <div>
        <demo5 />
      </div>
    </div>
  );
};

export default TreeDemo;
