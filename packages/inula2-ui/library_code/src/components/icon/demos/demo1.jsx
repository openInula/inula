import Icon from "../index.jsx";

function IconDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="user" />
        <text>user默认实体</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="user" theme="filled" />
        <text>user实体</text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Icon value="user" theme="filled" color="blue"/>
        <text>user实体蓝色</text>
      </div>
    </div>
  );
}

export default IconDemo;
