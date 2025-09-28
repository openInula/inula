import Button from "../../button/index.jsx";
import Tabs from "../index.jsx";

const TabsDemo = () => {
  let items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "Tab 3",
      children: "Content of Tab Pane 3",
      closable: false,
    },
  ];
  let MyActiveKey;
  let newTabIndex = 0;

  const add = () => {
    const newMyActiveKey = `newTab${newTabIndex++}`;
    items.push({
      label: "New Tab",
      children: "New Tab Pane",
      key: newMyActiveKey,
    });
    MyActiveKey = newMyActiveKey;
  };

  const remove = (targetKey) => {
    const targetIndex = items.findIndex((item) => item.key === targetKey);
    const newItems = items.filter((item) => item.key !== targetKey);
    const index =
      targetIndex === newItems.length ? targetIndex - 1 : targetIndex;
    MyActiveKey =
      items.length && targetKey === MyActiveKey
        ? items[index].key
        : MyActiveKey;
    items = newItems;
  };

  const onEdit = (targetKey, action) => {
    if (action === "add") {
      add();
    } else {
      remove(targetKey);
    }
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Button onClick={add}>ADD</Button>
      </div>
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
          onEdit={onEdit}
          activeKey={MyActiveKey}
          type="editable-card"
          hideAdd
        />
      </div>
    </div>
  );
};

export default TabsDemo;
