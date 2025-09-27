import { Card } from "../index.jsx";
import Icon from "../../icon/index.jsx";
import Tag from "../../tag/index.jsx";

const actions = [
  <Icon value="wand-magic-sparkles" />,
  <Icon value="gear" />,
  <Icon value="ellipsis" />,
];

const CardDemo = () => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <Tag color="geekblue" size="large">
        完整Card布局
      </Tag>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Card
          title="Default size card"
          extra={<div>More</div>}
          cover={
            <img
              alt="example"
              src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            />
          }
          actions={actions}
        >
          <div style={{ width: "100%" }}>Card content</div>
          <span>Card content</span>
          <span>Card content</span>
        </Card>
      </div>
      <Tag color="geekblue" size="large">
        不同大小、边框、hover动效的Card
      </Tag>
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Card title="不带边框的Card" variant="borderless">
          <div style={{ width: "100%" }}>默认型号，无hover动效</div>
        </Card>
        <Card title="带边框的Card" size="small" hoverable>
          <div style={{ width: "100%" }}>小号，有hover动效</div>
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
