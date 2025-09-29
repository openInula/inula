import "./index.css";
import Icon from "../icon/index.jsx";
import { watch } from "@openinula/next";

/** 
TabProps: {
    key: string; // 选项卡唯一标识
    label: ReactNode; // 选项卡头显示文字
    disabled?: boolean; // 是否禁用该选项卡，默认为 false
    forceRender?: boolean; // 被隐藏时是否渲染 DOM，默认为 false
    destoryOnHide?: boolean; // 被隐藏时是否销毁 DOM，默认为 false
    closeIcon?: ReactNode; // 关闭按钮，只在 type="editable-card" 时有效, 设置为null或false时不显示关闭按钮
    closable?: boolean; // 是否显示关闭按钮，只在 type="editable-card" 时有效
    icon?: ReactNode; // 选项卡图标
    children?: ReactNode; // 选项卡内容
}
**/

const Tabs = ({
  type = "line", // line | card | editable-card
  size = "default", // default | large | small
  tabPosition = "top", // top | bottom | left | right
  centered = false, // true | false
  // animated = false, // true | false
  // destoryOnHide = false, // true | false
  addIcon = <Icon value="plus" size={16} />, // ReactNode，只在 type="editable-card" 时有效
  hideAdd = false, // true | false 只在 type="editable-card" 时有效
  // removeIcon = <Icon value="close" size={14} />, // ReactNode，只在 type="editable-card" 时有效
  indicator, //{ size?: number | (origin: number) => number; align: start | center | end; } 自定义指示器长度和对齐方式
  // renderTabBar, // (props: TabBarProps) => ReactNode; 自定义 TabBar 内容
  items, // TabProps[]; 选项卡列表
  activeKey, // string; 当前选中的选项卡的 key
  defaultActiveKey = items[0].key, // string; 默认选中的选项卡的 key
  tabBarExtraContent, // ReactNode | {left?: ReactNode, right?: ReactNode},TabBar 额外内容
  tabBarGutter, // number; TabBar 的间隔距离，单位为 px
  tabBarStyle, // CSSProperties; TabBar 的样式
  className, // string
  style, // CSSProperties; 选项卡的样式
  onChange, // (key: string) => void; 选项卡切换时的回调函数
  onTabClick, // (key: string, e: React.MouseEvent) => void; 选项卡点击时的回调函数
  onEdit, // (targetKey: string, action: 'add' | 'remove') => void; 选项卡编辑时的回调函数, 只在 type="editable-card" 时有效
  onTabScroll, // ({ direction: left | right | top | bottom }) => void 选项卡滚动时的回调函数
}) => {
  let customActiveKey = activeKey || defaultActiveKey;
  let customItems = items || [];

  watch(() => {
    // console.log(activeKey);
    customItems = items || [];
    // customActiveKey = activeKey || defaultActiveKey;
  });

  function addItem(item) {
    customItems.push(item);
    customActiveKey = item.key;
  }

  function removeItem(key) {
    const targetIndex = customItems.findIndex((item) => item.key === key);
    customItems = customItems.filter((item) => item.key !== key);
    const index =
      targetIndex === customItems.length ? targetIndex - 1 : targetIndex;
    customActiveKey =
      customItems.length && key === customActiveKey
        ? customItems[index].key
        : customActiveKey;
  }

  function setActiveKey(key) {
    customActiveKey = key;
  }

  const classNames = [
    "inula-tabs",
    `inula-tabs-bar-pos-${tabPosition}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const tabBarClassNames = [
    "inula-tabs-bar",
    `inula-tabs-bar-pos-${tabPosition}`,
    `inula-tabs-bar-${type}`,
    `inula-tabs-bar-${size}`,
    centered ? "inula-tabs-bar-center" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const tabBarStyles = {
    ...tabBarStyle,
    ...{ gap: `${tabBarGutter}px` },
  };

  const indictorSize = () => {
    if (indicator && indicator.size) {
      if (typeof indicator.size === "number") {
        return `${indicator.size}px`;
      } else if (typeof indicator.size === "function") {
        const value = indicator.size(0);
        const sign = value > 0 ? "+" : value < 0 ? "- " : "";
        return `calc(100% ${sign} ${Math.abs(value)}px)`;
      }
    } else {
      return "100%";
    }
  };

  const handleTabClick = (item, e) => {
    if (item.disabled) return;
    if (activeKey) {
      setActiveKey(item.key);
      onChange && onChange(item.key, e);
      onTabClick && onTabClick(item.key, e);
    } else {
      setActiveKey(item.key);
      console.log(activeKey);
      onChange && onChange(item.key, e);
      onTabClick && onTabClick(item.key, e);
    }
  };

  const handleEdit = (targetKey, action, isDisabled = false) => {
    if (isDisabled) return;
    if (onEdit) {
      //受控，直接返回
      if (!onEdit) throw new Error("受控模式没有onEdit");
      onEdit(targetKey, action);
      return;
    }

    if (action === "add") {
      addItem({
        key: `tab_${Date.now()}`, // 使用时间戳生成唯一key
        label: "New Tab",
        children: "New Tab Content",
      });
    } else if (action === "remove") {
      removeItem(targetKey);
    }
  };

  return (
    <div className={classNames} style={style}>
      {/* tabBar */}
      <div
        className={tabBarClassNames}
        style={tabBarStyles}
        onScroll={onTabScroll}
      >
        {/* tabBar左侧额外内容 */}
        {tabBarExtraContent && tabBarExtraContent.left && (
          <div
            className={`inula-tabs-bar-extra-content-left ${`inula-tabs-bar-pos-${tabPosition}`}`}
          >
            {tabBarExtraContent.left}
          </div>
        )}

        {/* 标签项 */}
        <for each={customItems}>
          {(item) => {
            return (
              <div
                key={item.key}
                className={`inula-tabs-bar-item ${
                  // customState.activeKey === item.key
                  customActiveKey === item.key
                    ? "inula-tabs-bar-item-active"
                    : ""
                } 
                ${item.disabled ? "inula-tabs-bar-item-disabled" : ""} 
                ${`inula-tabs-bar-pos-${tabPosition}`} 
                ${`inula-tabs-bar-item-${type}`} 
                ${
                  indicator && indicator.align
                    ? `inula-tabs-bar-indicator-${indicator.align}`
                    : ""
                }`}
                style={{ "--indicator-size": indictorSize() }}
              >
                <div
                  className="inula-tabs-bar-item-content"
                  onClick={(e) => handleTabClick(item, e)}
                >
                  {item.icon}
                  <text>{item.label}</text>
                </div>
                <if cond={type === "editable-card" && item.closable !== false}>
                  <div
                    className="inula-tabs-bar-item-close"
                    onClick={() =>
                      handleEdit(item.key, "remove", item.disabled)
                    }
                  >
                    {item.closeIcon
                      ? item.closeIcon
                      : new Icon({
                          value: "close",
                          size: 16,
                          color: "#8c8c8c",
                        })}
                  </div>
                </if>
              </div>
            );
          }}
        </for>

        {/* 可编辑卡片类型时，添加按钮位置在最后一个标签后面 */}
        {type === "editable-card" && !hideAdd && (
          <div
            className="inula-tabs-bar-item-add"
            onClick={() => handleEdit(`${customItems.length + 1}`, "add")}
          >
            {addIcon}
          </div>
        )}

        {/* tabBar右侧额外内容 */}
        {tabBarExtraContent && tabBarExtraContent.right && (
          <div
            className={`inula-tabs-bar-extra-content-right ${`inula-tabs-bar-pos-${tabPosition}`}`}
          >
            {tabBarExtraContent.right}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="inula-tabs-content">
        <for each={customItems}>
          {(item) => {
            return (
              <if cond={customActiveKey === item.key}>
                <div className="inula-tabs-content-item">{item.children}</div>
              </if>
            );
          }}
        </for>
      </div>
    </div>
  );
};

export default Tabs;
