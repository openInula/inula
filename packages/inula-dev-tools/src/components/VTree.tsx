/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { useState, useEffect, useCallback, memo } from 'openinula';
import styles from './VTree.less';
import Triangle from '../svgs/Triangle';
import { createRegExp } from '../utils/regExpUtil';
import { SizeObserver } from './SizeObserver';
import { RenderInfoType, VList } from './VList';
import { postMessageToBackground } from '../panelConnection';
import { Highlight, RemoveHighlight } from '../utils/constants';
import { NameObj } from '../parser/parseVNode';

export interface IData {
  id: number;
  name: NameObj;
  indentation: number;
  userKey: string;
}

interface IItem {
  indentationLength: number;
  hasChild: boolean;
  onCollapse: (data: IData) => void;
  onClick: (id: IData) => void;
  onMouseEnter: (id: IData) => void;
  onMouseLeave: (id: IData) => void;
  isCollapsed: boolean;
  isSelect: boolean;
  highlightValue: string;
  data: IData;
  isSelectedItemChild: boolean;
}

function Item(props: IItem) {
  const {
    hasChild,
    onCollapse,
    isCollapsed,
    data,
    onClick,
    indentationLength,
    onMouseEnter,
    onMouseLeave,
    isSelect,
    highlightValue = '',
    isSelectedItemChild,
  } = props;

  const { name, userKey, indentation } = data;

  const isShowKey = userKey !== '';
  const showIcon = hasChild ? <Triangle director={isCollapsed ? 'right' : 'down'} /> : '';
  const handleClickCollapse = () => {
    onCollapse(data);
  };
  const handleClick = () => {
    onClick(data);
  };
  const handleMouseEnter = () => {
    onMouseEnter(data);
  };
  const handleMouseLeave = () => {
    onMouseLeave(data);
  };

  const itemAttr: Record<string, any> = {
    className: isSelectedItemChild ? styles.selectedItemChild : styles.treeItem,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  if (isSelect) {
    itemAttr.tabIndex = 0;
    itemAttr.className = styles.treeItem + ' ' + styles.select;
  }

  if (isSelectedItemChild) {
    itemAttr.className = styles.treeItem + ' ' + styles.selectedItemChild;
  }

  const pushBadge = (showName: Array<any>, badgeName: string) => {
    showName.push('  ');
    showName.push(<div className={`${styles.Badge}`}>{badgeName}</div>);
  };

  const pushItemName = (showName: Array<any>, cutName: string, char: string) => {
    const index = cutName.search(char);
    if (index > -1) {
      const notHighlightStr = cutName.slice(0, index);
      showName.push(`<${notHighlightStr}`);
      showName.push(<mark>{char}</mark>);
      showName.push(`${cutName.slice(index + char.length)}>`);
    } else {
      showName.push(`<${cutName}`);
    }
  };

  const pushBadgeName = (showName: Array<any>, cutName: string, char: string) => {
    const index = cutName.search(char);
    if (index > -1) {
      const notHighlightStr = cutName.slice(0, index);
      showName.push(
        <div className={`${styles.Badge}`}>
          {notHighlightStr}
          {<mark>{char}</mark>}
          {cutName.slice(index + char.length)}
        </div>
      );
    } else {
      pushBadge(showName, cutName);
    }
  };

  const reg = createRegExp(highlightValue);
  const heightCharacters = name.itemName.match(reg);
  const showName = [];

  const addShowName = (showName: Array<string>, name: NameObj) => {
    showName.push(`<${name.itemName}>`);
    name.badge.forEach(key => {
      showName.push(<div className={`${styles.Badge}`}>{key}</div>);
    });
  };

  if (heightCharacters) {
    // 高亮第一次匹配即可
    const char = heightCharacters[0];
    pushItemName(showName, name.itemName, char);
    if (name.badge.length > 0) {
      name.badge.forEach(key => {
        pushBadgeName(showName, key, char);
      });
    }
  } else {
    addShowName(showName, name);
  }

  return (
    <div {...itemAttr}>
      <div
        style={{marginLeft: indentation * indentationLength}}
        className={styles.treeIcon}
        onclick={handleClickCollapse}
      >
        {showIcon}
      </div>
      <span className={styles.componentName}>{showName}</span>
      {isShowKey && (
        <>
          <span className={styles.componentKeyName}>&nbsp;key</span>
          {'="'}
          <span className={styles.componentKeyValue}>{userKey}</span>
          {'"'}
        </>
      )}
    </div>
  );
}

function VTree(props: {
  data: IData[];
  maxDeep: number;
  highlightValue: string;
  scrollToItem: IData;
  onRendered: (renderInfo: RenderInfoType<IData>) => void;
  collapsedNodes?: IData[];
  onCollapseNode?: (item: IData[]) => void;
  selectItem: IData;
  onSelectItem: (item: IData) => void;
}) {
  const {
    data,
    maxDeep,
    highlightValue,
    scrollToItem,
    onRendered,
    onCollapseNode,
    onSelectItem
  } = props;
  const [collapseNode, setCollapseNode] = useState(props.collapsedNodes || []);
  const [selectItem, setSelectItem] = useState(props.selectItem);
  const [childItems, setChildItems] = useState<Array<IData>>([]);

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

  const getChildItem = (item: IData): Array<IData> => {
    const index = data.indexOf(item);
    const childList: Array<IData> = [];

    for (let i = index + 1; i < data.length; i++) {
      if (data[i].indentation > item.indentation) {
        childList.push(data[i]);
      } else {
        break;
      }
    }
    return childList;
  };

  const handleClickItem = useCallback(
    (item: IData) => {
      const childItem = getChildItem(item);
      setSelectItem(item);
      setChildItems(childItem);
      if (onSelectItem) {
        onSelectItem(item);
      }
    },
    [onSelectItem]
  );

  const handleMouseEnterItem = useCallback(
    item => {
      postMessageToBackground(Highlight, item);
    },
    null
  );

  const handleMouseLeaveItem = () => {
    postMessageToBackground(RemoveHighlight);
  };

  let currentCollapseIndentation: null | number = null;
  // 过滤掉折叠的 item，不展示在 VList 中
  const filter = (item: IData) => {
    if (currentCollapseIndentation !== null) {
      // 缩进更大，不显示
      if (item.indentation > currentCollapseIndentation) {
        return false;
      } else {
        // 缩进小，说明完成了收起节点的子节点处理
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

  const showList = data.filter(filter);

  return (
    <SizeObserver className={styles.treeContainer}>
      {(width: number, height: number) => {
        return (
          <VList
            data={showList}
            maxDeep={maxDeep}
            width={width}
            height={height}
            itemHeight={17.5}
            scrollToItem={selectItem}
            onRendered={onRendered}
          >
            {(item: IData, indentationLength: number) => {
              const isCollapsed = collapseNode.includes(item);
              const index = showList.indexOf(item);
              // 如果收起，一定有 child
              // 不收起场景，如果存在下一个节点，并且节点缩进比自己大，说明下个节点是子节点，节点本身需要显示展开收起图标
              const hasChild = isCollapsed || showList[index + 1]?.indentation > item.indentation;
              return (
                <Item
                  indentationLength={indentationLength}
                  hasChild={hasChild}
                  onCollapse={changeCollapseNode}
                  onClick={handleClickItem}
                  onMouseEnter={handleMouseEnterItem}
                  onMouseLeave={handleMouseLeaveItem}
                  isCollapsed={collapseNode.includes(item)}
                  isSelect={selectItem === item}
                  highlightValue={highlightValue}
                  data={item}
                  isSelectedItemChild={childItems.includes(item)}
                />
              );
            }}
          </VList>
        );
      }}
    </SizeObserver>
  );
}

export default memo(VTree);
