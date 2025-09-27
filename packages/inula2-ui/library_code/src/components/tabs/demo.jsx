import demo1 from "./demos/demo1.jsx";
import demo2 from "./demos/demo2.jsx";
import demo3 from "./demos/demo3.jsx";
import demo4 from "./demos/demo4.jsx";
import demo5 from "./demos/demo5.jsx";
import demo6 from "./demos/demo6.jsx";
import demo7 from "./demos/demo7.jsx";
import demo8 from "./demos/demo8.jsx";
import demo9 from "./demos/demo9.jsx";
import demo10 from "./demos/demo10.jsx";
import demo11 from "./demos/demo11.jsx";

const TabsDemo = () => {
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
        <h2>禁用</h2>
        <div>禁用第二项</div>
      </div>
      <div>
        <demo2 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>居中</h2>
        <div>标签居中显示</div>
      </div>
      <div>
        <demo3 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>图标</h2>
        <div>带有图标的标签</div>
      </div>
      <div>
        <demo4 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>指示条</h2>
        <div>设置 indicator 属性，自定义指示条宽度和对齐方式。</div>
      </div>
      <div>
        <demo5 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>位置</h2>
        <div>有四个位置，tabPosition="left|right|top|bottom"。</div>
      </div>
      <div>
        <demo6 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>大小</h2>
        <div>有三种大小，size="small|middle|large"。</div>
      </div>
      <div>
        <demo7 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>新增和关闭标签</h2>
        <div>只有卡片样式的页签支持新增和关闭选项。使用 closable={false} 禁止关闭。</div>
      </div>
      <div>
        <demo8 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>自定义增加标签</h2>
        <div>自定义新增标签。</div>
      </div>
      <div>
        <demo9 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>标签额外内容</h2>
        <div>标签额外内容。</div>
      </div>
      <div>
        <demo10 />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2>标签滚动</h2>
        <div>标签过多时，可滚动。</div>
      </div>
      <div>
        <demo11 />
      </div>

    </div>
  );
};

export default TabsDemo;