import { Card, CardGrid } from "../index.jsx";
import Tag from "../../tag/index.jsx";

const CardDemo = () => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <Tag color="geekblue" size="large">
        Grid组件，网格型内嵌
      </Tag>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Card title="Card Grid" gridbox>
          <CardGrid
            style={{
              width: "25%",
              textAlign: "center",
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            hoverable={false}
            style={{
              width: "25%",
              textAlign: "center",
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: "25%",
              textAlign: "center",
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: "25%",
              textAlign: "center",
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: "25%",
              textAlign: "center",
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: "25%",
              textAlign: "center",
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: "25%",
              textAlign: "center",
            }}
          >
            Content
          </CardGrid>
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
