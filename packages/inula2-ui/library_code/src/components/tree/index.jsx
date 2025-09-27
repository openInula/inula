import "./index.css";
import { Checkbox } from "../checkbox/index.jsx";
import Icon from "../icon/index.jsx";
import VirtualList from "./virtualList.jsx";
import { didMount, watch } from "@openinula/next";
import {
  getKeyToTreeMap,
  getAllRelatedChildKeys,
  initialAllExpandedKeys,
  initialCustomExpandedKeys,
  initialCustomCheckedKeys,
  initialCustomSelectedKeys,
  calculateExpandKeys,
  calculateCheckedKeys,
  calculateSelectedKeys,
  judgeHalfCheckedKeys,
  flattenTreeData,
} from "./utils/index.js";

const Tree = ({
  autoExpandParent = false, // 是否自动展开父节点
  blockNode = false, //是否节点占据一行
  checkable = false, // 是否显示复选框
  checkedKeys = [], // 受控选中复选框的树节点，父节点设置时子节点自动选中，string[] | checkStrictly：{checked: string[], halfChecked: string[]}
  checkStrictly = false, // 父子节点不再关联，完全受控
  defaultCheckedKeys = [], // 默认选中的树节点
  defaultExpandAll = false, // 默认展开所有树节点
  defaultExpandParent = true, // 默认展开父节点
  defaultExpandedKeys = [], // 默认展开指定的树节点
  expandedKeys = [], // 受控展开的树节点
  disabled = false, // 禁用树
  fieldNames = {}, // 自定义字段名
  filterTreeNode = () => true, // 按需筛选树节点
  height, //设置虚拟滚动容器高度，设置后内部不再支持横向滚动
  icon, //标题之前插入自定义图标，需设置showIcon为true
  loadData, // 异步加载数据，需设置loadData属性，返回Promise对象，返回值为树节点数据
  loadedKeys = [], // 受控已加载的树节点，用于控制异步加载，需配合loadData属性使用
  multiple = false, // 是否支持多选
  selectable = true, // 是否支持选中，为false时点击为check选中
  defaultSelectedKeys = [], //默认选中的树节点，多选需配合multiple属性使用
  selectedKeys = [], // 受控选中的树节点，多选需配合multiple属性使用
  showIcon = false, // 是否显示图标
  showLine = false, // 是否显示连接线
  switcherIcon, // 自定义展开图标
  switcherLoadingIcon, // 自定义加载中图标
  titleRender, // 自定义渲染节点
  rootStyle, //Tree最外层Style
  treeData, // 树节点数据,array<{key, title, children, [disabled, selectable]}>
  virtual = true, // 是否开启虚拟滚动，设置false关闭虚拟滚动
  onCheck, // 点击复选框触发
  onDrop, //drop事件触发
  onExpand, // 展开/收起节点时触发
  onLoad, // 异步加载数据时触发
  onSelect, // 选中/取消选中节点时触发
  onRightClick, // 右键点击节点时触发
  className, // 自定义类名
  ...rest
}) => {
  //选中、展开节点
  let customCheckedKeys = [];
  let customSelectedKeys = [];
  let customExpandedKeys = [];
  //节点树的相关信息
  let keyToNodeInfoMap = new Map(); //nodeInfo: { node, parent, depth, isLast };
  let maxDepth = 1; //树最大深度
  //异步节点管理
  let customLoadedKeys = loadedKeys;
  let customLoadingKeys = [];
  let flattenedTreeNodes = [];

  /**
   * 树节点展开控制
   * 优先级：受控 > all > 默认
   */
  //初始化
  const initialExpandedKeys = (currentTree) => {
    if (expandedKeys.length > 0) {
      return initialCustomExpandedKeys(
        currentTree,
        expandedKeys,
        autoExpandParent || defaultExpandParent
      );
    }
    if (defaultExpandAll) {
      return initialAllExpandedKeys(currentTree);
    }
    if (!defaultExpandAll && defaultExpandedKeys.length > 0) {
      return initialCustomExpandedKeys(
        currentTree,
        defaultExpandedKeys,
        autoExpandParent || defaultExpandParent
      );
    }
    return [];
  };

  /**
   * 树节点选中控制
   * 优先级：受控 > 默认
   */
  //checked选中
  const initialCheckedKeys = (currentTree) => {
    if (checkedKeys.length > 0) {
      return initialCustomCheckedKeys(currentTree, checkedKeys, checkStrictly);
    } else {
      return initialCustomCheckedKeys(
        currentTree,
        defaultCheckedKeys,
        checkStrictly
      );
    }
  };

  //selected选中
  const initialSelectedKeys = () => {
    if (selectedKeys.length > 0) {
      return initialCustomSelectedKeys(selectedKeys, multiple);
    } else {
      return initialCustomSelectedKeys(defaultSelectedKeys, multiple);
    }
  };

  /** 点击事件 */
  //type = 'expand' | 'check' | 'select'
  const hanldleClick = (target, type, e) => {
    switch (type) {
      case "expand": {
        const isAlreadyLoaded = customLoadedKeys.includes(target.key);
        const isLoading = customLoadingKeys.includes(target.key);
        const shouldLoad = loadData && !isAlreadyLoaded && !isLoading;

        if (shouldLoad) {
          customLoadingKeys = [...customLoadingKeys, target.key];

          loadData(target)
            .then(() => {
              customLoadingKeys = customLoadingKeys.filter(
                (key) => key !== target.key
              );
              customLoadedKeys = [...customLoadedKeys, target.key];
            })
            .catch(() => {
              customLoadingKeys = customLoadingKeys.filter(
                (key) => key !== target.key
              );
              customLoadedKeys = [...customLoadedKeys, target.key];
            });
        }

        customExpandedKeys = calculateExpandKeys(target, [
          ...customExpandedKeys,
        ]);
        if (onExpand) onExpand(customExpandedKeys, e);
        break;
      }
      case "check": {
        const childKeys = getAllRelatedChildKeys(target);
        customCheckedKeys = calculateCheckedKeys(
          target,
          [...customCheckedKeys],
          keyToNodeInfoMap,
          childKeys,
          checkStrictly
        );
        if (onCheck) onCheck(customCheckedKeys, e);
        break;
      }
      case "select": {
        customSelectedKeys = calculateSelectedKeys(
          target,
          [...customSelectedKeys],
          multiple
        );
        if (onSelect) onSelect(customSelectedKeys, e);
        break;
      }
      default:
        console.error("错误操作");
    }
  };

  //样式控制
  const classNames = ["inula-tree", className].filter(Boolean).join(" ");
  const styles = {
    ...rootStyle,
  };

  /** TreeNode节点组件 */
  /*TreeNode Props
   * title: 节点标题
   * key: 节点唯一标识，必填
   * isLeaf: 是否为叶子节点，默认false
   * selectable: 是否可选，默认true，为false时点击为check选中
   * disabled: 是否禁用，默认false
   * children: 子节点，array<TreeNode>
   * icon: 自定义图标，ReactNode
   * disableCheckbox: 是否禁用复选框，默认false
   */
  const TreeNode = ({ node }) => {
    //是否为虚拟列表模式
    const isVirtualMode = virtual && height;
    //节点信息：{ node：节点, parent：父节点, depth：深度, isLast：是否为当前层最后一个节点 }
    const nodeInfo = keyToNodeInfoMap.get(node.key);
    //非叶子结点是否展开
    const isExpanded = customExpandedKeys.includes(node.key);
    //节点是否check选中，针对复选框
    const isChecked = customCheckedKeys.includes(node.key);
    //是否支持select选中
    const isSelectable = selectable || node.isSelectable;
    //节点是否select选中，针对text部分，需selectable为true
    const isSelected = customSelectedKeys.includes(node.key) && isSelectable;
    //checkbox禁用
    const isCheckDisabled = node.disabled || node.disableCheckbox || disabled;
    //select禁用
    const isSelectDisabled = node.disabled || disabled;
    //子节点部分选择
    const isHalfChecked =
      !isChecked &&
      node.children &&
      judgeHalfCheckedKeys(
        node,
        customCheckedKeys,
        getAllRelatedChildKeys(node)
      );
    //是否为异步加载树的叶子节点
    const isLoadLeafNode = loadData && node.isLeaf;
    //是否为普通树的叶子节点
    // const isSimpleLeafNode = !loadData && (node?.isLeaf || !node?.children);
    //是否为叶子节点
    // const isLeafNode = isLoadLeafNode || isSimpleLeafNode;
    //是否为加载中节点
    // const isLoading = customLoadingKeys.includes(node.key);

    const isSimpleLeafNode = true;
    // 是否为叶子节点
    const isLeafNode = true;
    // 是否为加载中节点
    const isLoading = true;

    //展开收起切换按钮
    const Switcher = () => {
      if (isLeafNode) return null; //叶子节点，不渲染
      // loading状态，渲染loadingIcon
      if (isLoading)
        return (
          <>
            {switcherLoadingIcon || (
              <Icon
                value="circle-notch"
                theme="filled"
                color="blue"
                size={14}
              />
            )}
          </>
        );

      //用户自定义swictherIcon优先渲染
      if (switcherIcon) {
        return (
          <div
            style={{
              rotate: `${isExpanded ? 90 : 0}deg`,
              transition: "all 0.3s ease-in-out",
            }}
          >
            {switcherIcon}
          </div>
        );
      }

      return (
        <Icon
          value="caret-right"
          theme="filled"
          size={14}
          rotate={isExpanded ? 90 : 0}
        />
      );
    };

    //子节点渲染
    const ChildrenRender = () => {
      let contentRef;
      if (isVirtualMode) return null; //虚拟列表模式只渲染本身

      //如果为叶子节点或者没有孩子，不渲染
      if (isLeafNode || node.children?.length === 0) return <></>;

      return (
        <div
          ref={contentRef}
          className={childClassNames}
          // style={{ "--max-height": `${maxHeight}px` }}
        >
          {node.children?.map((child) => (
            <TreeNode key={child.key} node={child} />
          ))}
        </div>
      );
    };

    //TreeNode样式计算
    const treeNodeClassName = [
      "inula-tree-node",
      showLine && isLeafNode && "showLine",
    ]
      .filter(Boolean)
      .join(" ");

    //展开收起按钮样式
    const switcherClassNames = [
      "inula-tree-node-content-switcher",
      isLeafNode && "noSwitcher",
      isLoading && "isLoading",
    ]
      .filter(Boolean)
      .join(" ");

    //内容部分样式
    const titleClassNames = [
      "inula-tree-node-content-title",
      nodeInfo?.depth === maxDepth && isLeafNode && "indent",
      showLine && isLeafNode && "showLine",
    ]
      .filter(Boolean)
      .join(" ");

    //内容中文字部分样式
    const textClassNames = [
      "inula-tree-node-content-text",
      isSelected && "isSelected",
      isSelectDisabled && "disabled",
    ]
      .filter(Boolean)
      .join(" ");

    //子节点容器渲染样式
    const childClassNames = [
      "inula-tree-children",
      !isExpanded ? "inula-tree-children-fold" : "",
      showLine && !nodeInfo?.isLast && "showLine",
    ]
      .filter(Boolean)
      .join(" ");

    // 虚拟列表模式渲染;
    if (isVirtualMode) {
      const { level } = node;
      return (
        <div
          key={node.key}
          className={treeNodeClassName}
          style={{ paddingLeft: level * 24 }}
          data-leaf={isLeafNode}
        >
          <div className="inula-tree-node-content">
            {(nodeInfo?.depth !== maxDepth || loadData) && (
              <div
                className={switcherClassNames}
                onClick={(e) => hanldleClick(node, "expand", e)}
              >
                <Switcher />
              </div>
            )}

            <div className={titleClassNames}>
              {showLine && isSimpleLeafNode && !nodeInfo?.isLast && (
                <div className="inula-tree-node-content-line"></div>
              )}

              {checkable && (
                <Checkbox
                  indeterminate={isHalfChecked}
                  checked={isChecked}
                  disabled={isCheckDisabled}
                  onChange={(e) => hanldleClick(node, "check", e)}
                />
              )}

              <div
                className={textClassNames}
                onClick={(e) => {
                  if (isCheckDisabled) return;
                  if (isSelectable) hanldleClick(node, "select", e);
                  else hanldleClick(node, "check", e);
                }}
              >
                {showIcon && (node.icon || icon) && <>{node.icon || icon}</>}
                {titleRender ? titleRender(node) : <>{node.title}</>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    //普通模式渲染
    return (
      <li key={node.key} className={treeNodeClassName} data-leaf={isLeafNode}>
        <div className="inula-tree-node-content">
          {(nodeInfo?.depth !== maxDepth || loadData) && (
            <div
              className={switcherClassNames}
              onClick={(e) => hanldleClick(node, "expand", e)}
            >
              <Switcher />
            </div>
          )}

          <div className={titleClassNames}>
            {/* 连接线 */}
            {showLine && isLeafNode && !nodeInfo?.isLast && (
              <div className="inula-tree-node-content-line"></div>
            )}

            {/* 复选框，需checkable为true */}
            {checkable && (
              <Checkbox
                indeterminate={isHalfChecked}
                checked={isChecked}
                disabled={isCheckDisabled}
                onChange={(e) => hanldleClick(node, "check", e)}
              />
            )}

            {/* 文字部分，支持自定义图标和自定义文字 */}
            <text
              className={textClassNames}
              onClick={(e) => {
                if (isCheckDisabled) return;
                if (isSelectable) hanldleClick(node, "select", e);
                else hanldleClick(node, "check", e);
              }}
            >
              {showIcon && (node.icon || icon) && <>{node.icon || icon}</>}
              {titleRender ? titleRender(node) : <>{node.title}</>}
            </text>
          </div>
        </div>

        {/* 子节点渲染 */}
        <ul>
          <ChildrenRender />
        </ul>
      </li>
    );
  };

  // 初始化，以及受控初始化
  // didMount(() => {
  //   onLoad && onLoad();
  //   customExpandedKeys = initialExpandedKeys(treeData);
  //   customCheckedKeys = initialCheckedKeys(treeData);
  //   customSelectedKeys = initialSelectedKeys(treeData);
  // });

  watch(() => {
    onLoad && onLoad();
    customExpandedKeys = initialExpandedKeys(treeData);
    customCheckedKeys = initialCheckedKeys(treeData);
    customSelectedKeys = initialSelectedKeys(treeData);
  });

  watch(() => {
    if (treeData) {
      const { map, depth } = getKeyToTreeMap(treeData);
      keyToNodeInfoMap = map;
      maxDepth = depth;
    }
    // const { map, depth } = getKeyToTreeMap(treeData);
    // keyToNodeInfoMap = map;
    // maxDepth = depth;
  });

  // 虚拟列表扁平化
  watch(() => {
    flattenedTreeNodes = flattenTreeData(
      treeData,
      customExpandedKeys,
      keyToNodeInfoMap
    );
  });

  return (
    <li className={classNames} style={styles} {...rest}>
      {virtual && height ? (
        <VirtualList
          height={height}
          itemHeight={24}
          items={flattenedTreeNodes}
          renderItem={(node) => <TreeNode key={node.key} node={node} />}
        ></VirtualList>
      ) : (
        <ul>
          {treeData.map((node) => (
            <TreeNode key={node.key} node={node} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default Tree;
