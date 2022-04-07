import styles from './ComponentsInfo.less';
import Eye from '../svgs/Eye';
import Debug from '../svgs/Debug';
import Copy from '../svgs/Copy';
import Triangle from '../svgs/Triangle';
import { useState } from 'horizon';

type IComponentInfo = {
  name: string;
  attrs: {
    props?: IAttr[];
    context?: IAttr[];
    state?: IAttr[];
    hooks?: IAttr[];
  }
};

type IAttr = {
  name: string;
  type: string;
  value: string | boolean;
  indentation: number;
}

function ComponentAttr({ name, attr }: { name: string, attr: IAttr[] }) {
  const [collapsedNode, setCollapsedNode] = useState(new Set());
  const handleCollapse = (index: number) => {
    const newSet = new Set<number>();
    collapsedNode.forEach(value => {
      newSet.add(value);
    });
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCollapsedNode(newSet);
  };

  const showAttr = [];
  let currentIndentation = null;
  attr.forEach((item, index) => {
    const indentation = item.indentation;
    if (currentIndentation !== null) {
      if (indentation > currentIndentation) {
        return;
      } else {
        currentIndentation = null;
      }
    }
    const nextItem = attr[index + 1];
    const hasChild = nextItem ? nextItem.indentation - item.indentation > 0 : false;
    const isCollapsed = collapsedNode.has(index);
    showAttr.push(
      <div style={{ paddingLeft: item.indentation * 10 }} key={index} onClick={() => (handleCollapse(index))}>
        <span className={styles.attrArrow}>{hasChild && <Triangle director={isCollapsed ? 'right' : 'down'} />}</span>
        <span className={styles.attrName}>{`${item.name}`}</span>
        {' :'}
        <span className={styles.attrValue}>{item.value}</span>
      </div>
    );
    if (isCollapsed) {
      currentIndentation = indentation;
    }
  });

  return (
    <div className={styles.attrContainer}>
      <div className={styles.attrHead}>
        <span className={styles.attrType}>{name}</span>
        <span className={styles.attrCopy}>
          <Copy />
        </span>
      </div>
      <div className={styles.attrDetail}>
        {showAttr}
      </div>
    </div>
  );
}

export default function ComponentInfo({ name, attrs }: IComponentInfo) {
  const { state, props, context, hooks } = attrs;
  return (
    <div className={styles.infoContainer} >
      <div className={styles.componentInfoHead}>
        <span className={styles.name}>
          {name}
        </span>
        <span className={styles.eye} >
          <Eye />
        </span>
        <span className={styles.debug}>
          <Debug />
        </span>
      </div>
      <div className={styles.componentInfoMain}>
        {context && <ComponentAttr name={'context'} attr={context} />}
        {props && <ComponentAttr name={'props'} attr={props} />}
        {state && <ComponentAttr name={'state'} attr={state} />}
        {hooks && <ComponentAttr name={'hook'} attr={hooks} />}
        <div className={styles.renderInfo}>
          rendered by
        </div>
      </div>
    </div>
  );
}