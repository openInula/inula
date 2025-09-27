import Icon from "../index.jsx";

function IconDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="chevron-down" />
        <text>下箭头默认实体</text>
      </div>
      {/* <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="chevron-down" theme="outline" />
        <text>下箭头线条</text>
      </div> */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="chevron-down" theme="filled" />
        <text>下箭头实体</text>
      </div>
      {/* <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="chevron-down" theme="twoTone" />
        <text>下箭头双色</text>
      </div> */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="chevron-down" theme="filled" size={32} />
        <text>下箭头实体32px</text>
      </div>
    </div>
  );
}

export default IconDemo;
