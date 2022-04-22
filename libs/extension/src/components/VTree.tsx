import { useState, useEffect } from 'horizon';
import styles from './VTree.less';
import Triangle from '../svgs/Triangle';
import { createRegExp } from '../utils/regExpUtils';
import { SizeObserver } from './SizeObserver';
import { renderInfoType, VList } from './VList';

export interface IData {
  id: number;
  name: string;
  indentation: number;
  userKey: string;
}

interface IItem {
  hasChild: boolean,
  onCollapse: (data: IData) => void,
  onClick: (id: IData) => void,
  isCollapsed: boolean,
  isSelect: boolean,
  highlightValue: string,
  data: IData,
}

const indentationLength = 20;

function Item(props: IItem) {
  const {
    hasChild,
    onCollapse,
    isCollapsed,
    data,
    onClick,
    isSelect,
    highlightValue = '',
  } = props;

  const {
    name,
    userKey,
    indentation,
  } = data;

  const isShowKey = userKey !== '';
  const showIcon = hasChild ? <Triangle director={isCollapsed ? 'right' : 'down'} /> : '';
  const handleClickCollapse = () => {
    onCollapse(data);
  };
  const handleClick = () => {
    onClick(data);
  };
  const itemAttr: any = { className: styles.treeItem, onClick: handleClick };
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

function VTree(props: {
  data: IData[],
  highlightValue: string,
  scrollToItem: IData,
  onRendered: (renderInfo: renderInfoType<IData>) => void,
  collapsedNodes?: IData[],
  onCollapseNode?: (item: IData[]) => void,
  selectItem: IData,
  onSelectItem: (item: IData) => void,
}) {
  const { data, highlightValue, scrollToItem, onRendered, onCollapseNode, onSelectItem } = props;
  const [collapseNode, setCollapseNode] = useState(props.collapsedNodes || []);
  const [selectItem, setSelectItem] = useState(props.selectItem);
  useEffect(() => {
    setSelectItem(scrollToItem);
  }, [scrollToItem]);
  useEffect(() => {
    if (props.selectItem !== selectItem) {
      setSelectItem(props.selectItem);
    }
  }, [props.selectItem]);
  useEffect(() => {
    setCollapseNode(props.collapsedNodes || []);
  }, [props.collapsedNodes]);

  const changeCollapseNode = (item: IData) => {
    const nodes: IData[] = [...collapseNode];
    const index = nodes.indexOf(item);
    if (index === -1) {
      nodes.push(item);
    } else {
      nodes.splice(index, 1);
    }
    setCollapseNode(nodes);
    if (onCollapseNode) {
      onCollapseNode(nodes);
    }
  };
  const handleClickItem = (item: IData) => {
    setSelectItem(item);
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  let currentCollapseIndentation: null | number = null;
  // 过滤掉折叠的 item，不展示在 VList 中
  const filter = (item: IData) => {
    if (currentCollapseIndentation !== null) {
      // 缩进更大，不显示
      if (item.indentation > currentCollapseIndentation) {
        return false;
      } else {
        // 缩进小，说明完成了该收起节点的子节点处理。
        currentCollapseIndentation = null;
      }
    }
    const isCollapsed = collapseNode.includes(item);
    if (isCollapsed) {
      // 该节点需要收起子节点
      currentCollapseIndentation = item.indentation;
    }
    return true;
  };

  return (
    <SizeObserver className={styles.treeContainer}>
      {(width: number, height: number) => {
        return (
          <VList
            data={data}
            width={width}
            height={height}
            itemHeight={18}
            scrollToItem={selectItem}
            filter={filter}
            onRendered={onRendered}
          >
            {(index: number, item: IData) => {
              // 如果存在下一个节点，并且节点缩进比自己大，说明下个节点是子节点，节点本身需要显示展开收起图标
              const nextItem = data[index + 1];
              const hasChild = nextItem && nextItem.indentation > item.indentation;
              return (
                <Item
                  hasChild={hasChild}
                  isCollapsed={collapseNode.includes(item)}
                  isSelect={selectItem === item}
                  onCollapse={changeCollapseNode}
                  onClick={handleClickItem}
                  highlightValue={highlightValue}
                  data={item} />
              );
            }}
          </VList>
        );
      }}
    </SizeObserver>
  );
}

export default VTree;
