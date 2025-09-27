import { Card } from "../index.jsx";
import Tag from "../../tag/index.jsx";

const tabList = [
  {
    key: "tab1",
    tab: "tab1",
  },
  {
    key: "tab2",
    tab: "tab2",
  },
];

const contentList = {
  tab1: <p>content1</p>,
  tab2: <p>content2</p>,
};

const tabListNoTitle = [
  {
    key: "article",
    label: "article",
  },
  {
    key: "app",
    label: "app",
  },
  {
    key: "project",
    label: "project",
  },
];

const contentListNoTitle = {
  article: <p>article content</p>,
  app: <p>app content</p>,
  project: <p>project content</p>,
};

const CardDemo = () => {
  let activeTabKey1 = "tab1";
  let activeTabKey2 = "article";
  const onTab1Change = (key) => {
    activeTabKey1 = key;
  };

  const onTab2Change = (key) => {
    activeTabKey2 = key;
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <Tag color="geekblue" size="large">
        两种传参方式的标签卡片
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
          style={{ width: "100%" }}
          title="Card title"
          extra={<a href="#">More</a>}
          tabList={tabList}
          activeTabKey={activeTabKey1}
          onTabChange={onTab1Change}
        >
          {contentList[activeTabKey1]}
        </Card>
      </div>
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Card
          style={{ width: "100%" }}
          tabList={tabListNoTitle}
          activeTabKey={activeTabKey2}
          tabBarExtraContent={<a href="#">More</a>}
          onTabChange={onTab2Change}
          tabProps={{
            size: "middle",
          }}
        >
          {contentListNoTitle[activeTabKey2]}
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
