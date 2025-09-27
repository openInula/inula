import Tabs from "../index.jsx";
import Icon from "../../icon/index.jsx";
import Button from "../../button/index.jsx";

const LeftExtraContent = <Button type="primary">leftextra</Button>;
const RightExtraContent = <Button type="primary">rightextra</Button>;

const TabsDemo = () => {
  let tabBarExtraContent = { left: LeftExtraContent, right: RightExtraContent };
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
      icon: <Icon value="home" />,
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    { key: "3", label: "Tab 3", children: "Content of Tab Pane 3" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs
          items={items}
          tabBarExtraContent={tabBarExtraContent}
        />
      </div>
    </div>
  );
};

export default TabsDemo;