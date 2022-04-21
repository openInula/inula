import styles from './ComponentsInfo.less';
import Eye from '../svgs/Eye';
import Debug from '../svgs/Debug';
import Copy from '../svgs/Copy';
import Triangle from '../svgs/Triangle';
import { useState, useEffect } from 'horizon';
import { IData } from './VTree';
import { IAttr } from '../parser/parseAttr';

type IComponentInfo = {
  name: string;
  attrs: {
    props?: IAttr[];
    context?: IAttr[];
    state?: IAttr[];
    hooks?: IAttr[];
  };
  parents: IData[];
  onClickParent: (item: IData) => void;
};

function collapseAllNodes(attrs: IAttr[]) {
  return attrs.filter((item, index) => {
    const nextItem = attrs[index + 1];
    return nextItem ? nextItem.indentation - item.indentation > 0 : false;
  });
}

function ComponentAttr({ name, attrs }: { name: string, attrs: IAttr[] }) {
  const [collapsedNode, setCollapsedNode] = useState(collapseAllNodes(attrs));
  useEffect(() => {
    setCollapsedNode(collapseAllNodes(attrs));
  }, [attrs]);
  const handleCollapse = (item: IAttr) => {
    const nodes = [...collapsedNode];
    const i = nodes.indexOf(item);
    if (i === -1) {
      nodes.push(item);
    } else {
      nodes.splice(i, 1);
    }
    setCollapsedNode(nodes);
  };

  const showAttr = [];
  let currentIndentation = null;
  attrs.forEach((item, index) => {
    const indentation = item.indentation;
    if (currentIndentation !== null) {
      if (indentation > currentIndentation) {
        return;
      } else {
        currentIndentation = null;
      }
    }
    const nextItem = attrs[index + 1];
    const hasChild = nextItem ? nextItem.indentation - item.indentation > 0 : false;
    const isCollapsed = collapsedNode.includes(item);
    showAttr.push(
      <div style={{ paddingLeft: item.indentation * 10 }} key={index} onClick={() => (handleCollapse(item))}>
        <span className={styles.attrArrow}>{hasChild && <Triangle director={isCollapsed ? 'right' : 'down'} />}</span>
        <span className={styles.attrName}>{`${item.name}`}</span>
        {' :'}
        {item.type === 'string' || item.type === 'number' 
        ? <input value={item.value} className={styles.attrValue}>{item.value}</input>
        : <span className={styles.attrValue}>{item.value}</span>}
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

export default function ComponentInfo({ name, attrs, parents, onClickParent }: IComponentInfo) {
  const { state, props, context, hooks } = attrs;
  return (
    <div className={styles.infoContainer} >
      <div className={styles.componentInfoHead}>
        {name && <>
          <span className={styles.name}>
            {name}
          </span>
          <span className={styles.eye} >
            <Eye />
          </span>
          <span className={styles.debug}>
            <Debug />
          </span>
        </>}
      </div>
      <div className={styles.componentInfoMain}>
        {context && <ComponentAttr name={'context'} attrs={context} />}
        {props && props.length !== 0 && <ComponentAttr name={'props'} attrs={props} />}
        {state && state.length !== 0 && <ComponentAttr name={'state'} attrs={state} />}
        {hooks && hooks.length !== 0 && <ComponentAttr name={'hook'} attrs={hooks} />}
        <div className={styles.parentsInfo}>
          {name && <div>
            parents: {
              parents.map(item => (<button
              className={styles.parent}
                onClick={() => (onClickParent(item))}>
                {item.name}
              </button>))
            }
          </div>}
        </div>
      </div>
    </div>
  );
}