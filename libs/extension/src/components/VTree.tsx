import { useState, useEffect } from 'horizon';
import styles from './VTree.less';
import Triangle from '../svgs/Triangle';
import { createRegExp } from './../utils';
import { SizeObserver } from './SizeObserver';
import { renderInfoType, VList } from './VList';

export interface IData {
  id: string;
  name: string;
  indentation: number;
  userKey: string;
}

type IItem = {
  hasChild: boolean,
  onCollapse: (id: string) => void,
  onClick: (id: string) => void,
  isCollapsed: boolean,
  isSelect: boolean,
  highlightValue: string,
} & IData

const indentationLength = 20;

function Item(props: IItem) {
  const {
    name,
    userKey,
    hasChild,
    onCollapse,
    isCollapsed,
    id,
    indentation,
    onClick,
    isSelect,
    highlightValue = '',
  } = props;
  const isShowKey = userKey !== '';
  const showIcon = hasChild ? <Triangle director={isCollapsed ? 'right' : 'down'} /> : '';
  const handleClickCollapse = () => {
    onCollapse(id);
  };
  const handleClick = () => {
    onClick(id);
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

function VTree({ data, highlightValue, selectedId, onRendered }: {
  data: IData[],
  highlightValue: string,
  selectedId: number,
  onRendered: (renderInfo: renderInfoType) => void
}) {
  const [collapseNode, setCollapseNode] = useState(new Set<string>());
  const [selectItem, setSelectItem] = useState(selectedId);
  useEffect(() => {
    setSelectItem(selectedId);
  }, [selectedId]);
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
    const id = item.id;
    const isCollapsed = collapseNode.has(id);
    if (isCollapsed) {
      // 该节点需要收起子节点
      currentCollapseIndentation = item.indentation;
    }
    return true;
  };

  return (
    <SizeObserver className={styles.treeContainer}>
      {(width, height) => {
        return (
          <VList
            data={data}
            width={width}
            height={height}
            itemHeight={18}
            scrollIndex={data.indexOf(selectItem)}
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
                  isCollapsed={collapseNode.has(item.id)}
                  isSelect={selectItem === item.id}
                  onCollapse={changeCollapseNode}
                  onClick={handleClickItem}
                  highlightValue={highlightValue}
                  {...item} />
              );
            }}
          </VList>
        );
      }}
    </SizeObserver>
  );
}

export default VTree;
