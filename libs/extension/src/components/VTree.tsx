import { useState } from 'horizon';
import styles from './VTree.less';

export interface IData {
  id: string;
  name: string;
  indentation: number;
  userKey: string;
}

type IItem = {
  style: any,
  hasChild: boolean,
  onExpand: (id: string) => void,
} & IData

// TODO: 计算可以展示的最多数量，并且监听显示器高度变化修改数值
const showNum = 50;
const divHeight = 21;

function Item({ name, style, userKey, hasChild, onExpand, id, indentation }: IItem) {
  const key = userKey === '' ? '' : ` key = '${userKey}'`;
  const showIcon = hasChild ? '△' : '';
  const onClickExpand = () => {
    onExpand(id);
  }
  return (
    <div style={style} className={styles.tree_item}>
      <div style={{ display: 'inline-block', marginLeft: indentation * 20, width: 10 }} onClick={onClickExpand} >{showIcon}</div>
      {name + key}
    </div>
  )
}

function VTree({ data }: { data: IData[] }) {
  const [scrollTop, setScrollTop] = useState(0);
  const [collapseNode, setCollapseNode] = useState(new Set<string>());
  const changeExpandNode = (id: string) => {
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
  const showList: any[] = [];

  let totalHeight = 0;
  let currentCollapseIndentation: null| number = null;
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
    if (totalHeight >= scrollTop && showList.length <= showNum) {
      const nextItem = data[index + 1];
      const hasChild = nextItem ? nextItem.indentation > item.indentation : false;
      showList.push(
        <Item
          key={item.id}
          hasChild={hasChild}
          style={{
            position: 'absolute',
            transform: `translateY(${totalHeight}px)`,
          }}
          onExpand={changeExpandNode}
          {...item} />
      )
    }
    totalHeight = totalHeight + divHeight;
    let id = item.id;
    if (collapseNode.has(id)) {
      // 该节点需要收起子节点
      currentCollapseIndentation = item.indentation;
    }
  });

  const scroll = (event: any) => {
    const scrollTop = event.target.scrollTop;
    setScrollTop(Math.max(scrollTop - 100, 0));
  }

  return (
    <div className={styles.tree_container} onScroll={scroll}>
      {showList}
      {/* 确保有足够的高度 */}
      <div style={{ marginTop: totalHeight }} />
    </div>
  )
}

export default VTree;
