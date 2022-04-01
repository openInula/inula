import { useState } from 'horizon';
import styles from './VTree.less';
import Arrow from '../svgs/Arrow';
import { createRegExp } from './../utils';

export interface IData {
  id: string;
  name: string;
  indentation: number;
  userKey: string;
}

type IItem = {
  style: any,
  hasChild: boolean,
  onCollapse: (id: string) => void,
  onClick: (id: string) => void,
  isCollapsed: boolean,
  isSelect: boolean,
  highlightValue: string,
} & IData

// TODO: 计算可以展示的最多数量，并且监听显示器高度变化修改数值
const showNum = 70;
const lineHeight = 18;
const indentationLength = 20;

function Item(props: IItem) {
  const {
    name,
    style,
    userKey,
    hasChild,
    onCollapse,
    isCollapsed,
    id,
    indentation,
    onClick,
    isSelect,
    highlightValue,
  } = props;
  const isShowKey = userKey !== '';
  const showIcon = hasChild ? <Arrow director={isCollapsed ? 'right' : 'down'} /> : '';
  const handleClickCollapse = () => {
    onCollapse(id);
  };
  const handleClick = () => {
    onClick(id);
  };
  const itemAttr: any = { style, className: styles.treeItem, onClick: handleClick };
  if (isSelect) {
    itemAttr.tabIndex = 0;
    itemAttr.className = styles.treeItem + ' ' + styles.select;
  }
  const reg = createRegExp(highlightValue);
  const heightCharacters = name.match(reg);
  let showName;
  if (heightCharacters) {
    let cutName = name;
    showName = [];
    // 高亮第一次匹配即可
    const char = heightCharacters[0];
    const index = name.search(char);
    const notHighlightStr = cutName.slice(0, index);
    showName.push(notHighlightStr);
    showName.push(<mark>{char}</mark>);
    cutName = cutName.slice(index + char.length);
    showName.push(cutName);
  } else {
    showName = name;
  }
  return (
    <div {...itemAttr}>
      <div style={{ marginLeft: indentation * indentationLength }} className={styles.treeIcon} onClick={handleClickCollapse} >
        {showIcon}
      </div>
      <span className={styles.componentName} >
        {showName}
      </span>
      {isShowKey && (
        <>
          <span className={styles.componentKeyName}>
            {' '}key
          </span>
          {'="'}
          <span className={styles.componentKeyValue}>
            {userKey}
          </span>
          {'"'}
        </>
      )}
    </div>
  );
}

function VTree({ data, highlightValue }: { data: IData[], highlightValue: string }) {
  const [scrollTop, setScrollTop] = useState(0);
  const [collapseNode, setCollapseNode] = useState(new Set<string>());
  const [selectItem, setSelectItem] = useState();
  const changeCollapseNode = (id: string) => {
    const nodes = new Set<string>();
    collapseNode.forEach(value => {
      nodes.add(value);
    });
    if (nodes.has(id)) {
      nodes.delete(id);
    } else {
      nodes.add(id);
    }
    setCollapseNode(nodes);
  };
  const handleClickItem = (id: string) => {
    setSelectItem(id);
  };
  const showList: any[] = [];

  let totalHeight = 0;
  let currentCollapseIndentation: null | number = null;
  data.forEach((item, index) => {
    // 存在未处理完的收起节点
    if (currentCollapseIndentation !== null) {
      const indentation = item.indentation;
      // 缩进更大，不显示
      if (indentation > currentCollapseIndentation) {
        return;
      } else {
        // 缩进小，说明完成了该收起节点的子节点处理。
        currentCollapseIndentation = null;
      }
    }
    const id = item.id;
    const isCollapsed = collapseNode.has(id);
    if (totalHeight >= scrollTop && showList.length <= showNum) {
      const nextItem = data[index + 1];
      // 如果存在下一个节点，并且节点缩进比自己大，说明下个节点是子节点，节点本身需要显示展开收起图标
      const hasChild = nextItem ? nextItem.indentation > item.indentation : false;
      showList.push(
        <Item
          key={id}
          hasChild={hasChild}
          style={{
            transform: `translateY(${totalHeight}px)`,
          }}
          onCollapse={changeCollapseNode}
          onClick={handleClickItem}
          isCollapsed={isCollapsed}
          isSelect={id === selectItem}
          highlightValue={highlightValue}
          {...item} />
      );
    }
    totalHeight = totalHeight + lineHeight;
    if (isCollapsed) {
      // 该节点需要收起子节点
      currentCollapseIndentation = item.indentation;
    }
  });

  const handleScroll = (event: any) => {
    const scrollTop = event.target.scrollTop;
    // 顶部留 100px 冗余高度
    setScrollTop(Math.max(scrollTop - 100, 0));
  };

  return (
    <div className={styles.treeContainer} onScroll={handleScroll}>
      {showList}
      {/* 确保有足够的高度 */}
      <div style={{ marginTop: totalHeight }} />
    </div>
  );
}

export default VTree;
