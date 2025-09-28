import { Card, CardMeta } from "../index.jsx";
import Icon from "../../icon/index.jsx";
import Tag from "../../tag/index.jsx";

const actions = [
  <Icon value="wand-magic-sparkles" />,
  <Icon value="gear" />,
  <Icon value="ellipsis" />,
];

const CardDemo = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        gap: 24,
      }}
    >
      <Tag color="geekblue" size="large">
        Meta组件，快速定义内容
      </Tag>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Card
          cover={
            <img
              alt="example"
              src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            />
          }
          actions={actions}
        >
          <CardMeta
            avatar={
              <img src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
            }
            title="Card title"
            description="This is the description"
          />
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
