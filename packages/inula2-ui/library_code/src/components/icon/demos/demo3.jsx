import Icon from "../index.jsx";

function IconDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="caret-left" />
        <text>caret-left默认实体</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="caret-left" theme="filled" />
        <text>caret-left实体</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="caret-left" theme="filled" color="blue" />
        <text>caret-left实体蓝色</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="caret-left" theme="filled" color="skyblue" rotate={45} />
        <text>caret-left实体天蓝色旋转45</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="caret-left" theme="filled" color="skyblue" spin={true} />
        <text>caret-left实体天蓝色旋转</text>
      </div>
    </div>
  );
}

export default IconDemo;
