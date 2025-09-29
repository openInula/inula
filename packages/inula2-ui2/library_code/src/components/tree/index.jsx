import "./index.css";
import { Checkbox } from "../checkbox/index.jsx";
import Icon from "../icon/index.jsx";

const Tree = ({
  autoExpandParent = false, // 是否自动展开父节点
  blockNode = false, //是否节点占据一行
  checkable = false, // 是否显示复选框
  checkedKeys = [], // 受控选中复选框的树节点，父节点设置时子节点自动选中，string[] | checkStrictly：{checked: string[], halfChecked: string[]}
  checkStrictly = false, // 父子节点不再关联，完全受控
  defaultCheckedKeys = [], // 默认选中的树节点
  defaultExpandAll = false, // 默认展开所有树节点
  defaultExpandParent = false, // 默认展开父节点
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
  selectable = false, // 是否支持选中
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
  const classNames = ["inula-tree", className].filter(Boolean).join(" ");
  const styles = {
    ...rootStyle,
  };

  const treeNodeClassName = ["inula-tree-node"].filter(Boolean).join(" ");

  /*TreeNode Props
   * title: 节点标题
   * key: 节点唯一标识，必填
   * isLeaf: 是否为叶子节点，默认false
   * selectable: 是否可选，默认false
   * disabled: 是否禁用，默认false
   * children: 子节点，array<TreeNode>
   * icon: 自定义图标，ReactNode
   * disableCheckbox: 是否禁用复选框，默认false
   */
  const TreeNode = ({ node }) => {
    console.log("TreeNode props:", node);
    console.log(
      node.isLeaf !== true && node.children && node.children.length > 0
    );
    const Switcher = () => {
      if (node.isLeaf || !node.children) return <></>;
      if (switcherIcon) {
        return switcherIcon;
      }
      return <Icon value="chevron-right" />;
    };

    return (
      <li className={treeNodeClassName}>
        <div className="inula-tree-node-content">
          {<Switcher />}
          {checkable && !node.disabledCheckbox && <Checkbox />}
          {showIcon && node.icon && <Icon value={icon} />}
          {titleRender ? titleRender(node) : <>{node.title}</>}
        </div>
        <ul>
          {/* {!node.isLeaf &&
            node.children &&
            node.children.length > 0 && */}
          {node.children.map((child) => (
            <TreeNode key={child.key} node={child} />
          ))}
        </ul>
      </li>
    );
  };

  return (
    <ul className={classNames} style={styles}>
      {treeData.map((node) => (
        <TreeNode key={node.key} node={node} />
      ))}
    </ul>
  );
};

export default Tree;
