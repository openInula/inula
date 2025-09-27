import Icon from "../index.jsx";

function IconDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="apple" theme="brand" />
        <text>苹果品牌图标</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="apple" theme="brand" size={32} />
        <text>苹果品牌图标32px</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="apple" theme="brand" color="#40E0D0" />
        <text>苹果品牌图标绿色</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="apple" theme="brand" color="green" rotate={120} />
        <text>苹果品牌图标绿色旋转120度</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="apple" theme="brand" color="green" spin={true} />
        <text>苹果品牌图标绿色旋转</text>
      </div>
    </div>
  );
}

export default IconDemo;
