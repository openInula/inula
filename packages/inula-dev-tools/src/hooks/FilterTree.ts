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

/**
 * 过滤树的抽象逻辑
 * 需要知道渲染了哪些数据，过滤的字符串/正则表达式
 * 控制 Tree 组件位置跳转，告知匹配结果
 * 清空搜索框，告知搜索框当前是第几个结果，转跳搜索结果
 *
 * 转跳搜索结果的交互逻辑：
 * 如果当前页面存在匹配项，页面不动
 * 如果当前页面不存在匹配项，页面转跳到第一个匹配项位置
 * 如果匹配项被折叠，需要展开其父节点。注意只展开当前匹配项的父节点，其他匹配项的父节点不展开
 * 转跳到上一个匹配或下一个匹配项时，如果匹配项被折叠，需要展开其父节点
 *
 * 寻找父节点
 * 找到该节点的缩进值和 index 值，在 data 中向上遍历，通过缩进值判断父节点
 */
import { useState, useRef } from 'openinula';
import { createRegExp } from '../utils/regExpUtil';
import { NameObj } from '../parser/parseVNode';

type BaseType = {
  id: number;
  name: NameObj;
  indentation: number;
};

/**
 * 把节点的父节点从收起节点数组中删除，并返回新的收起节点数组
 *
 * @param item 需要展开父节点的节点
 * @param data 全部数据
 * @param collapsedNodes 收起节点数据
 * @returns 新的收起节点数组
 */
function expandItemParent(item: BaseType, data: BaseType[], collapsedNodes: BaseType[]): BaseType[] {
  const index = data.indexOf(item);
  let currentIndentation = item.indentation;
  // 不对原始数据进行修改
  const newCollapsedNodes = [...collapsedNodes];
  for (let i = index - 1; i >= 0; i--) {
    const lastData = data[i];
    const lastIndentation = lastData.indentation;
    // 缩进更小，找到了父节点
    if (lastIndentation < currentIndentation) {
      // 更新缩进值，只招父节点的父节点，避免修改父节点的兄弟节点的展开状态
      currentIndentation = lastIndentation;
      const cIndex = newCollapsedNodes.indexOf(lastData);
      if (cIndex !== -1) {
        newCollapsedNodes.splice(cIndex, 1);
      }
    }
  }
  return newCollapsedNodes;
}

export function FilterTree<T extends BaseType>(props: { data: T[] }) {
  const { data } = props;
  const [filterValue, setFilterValue] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const showItemsRef = useRef([]); // 页面展示的 items
  const matchItemsRef = useRef([]); //匹配过滤条件的 items
  const collapsedNodesRef = useRef([]); // 折叠节点，如果匹配 item 被折叠了，需要展开

  const matchItems = matchItemsRef.current;
  const collapsedNodes = collapsedNodesRef.current;

  const updateCollapsedNodes = (item: BaseType) => {
    const newCollapsedNodes = expandItemParent(item, data, collapsedNodes);
    // 如果新旧收起节点数组长度不一致，说明存在收起节点
    if (newCollapsedNodes.length !== collapsedNodes.length) {
      // 更新引用，确保 VTree 拿到新的 collapsedNodes
      collapsedNodesRef.current = newCollapsedNodes;
    }
  };

  const onChangeSearchValue = (search: string) => {
    const reg = createRegExp(search);
    let newCurrentItem = null;
    let newMatchItems = [];
    if (search !== '') {
      const showItems: T[] = showItemsRef.current;
      newMatchItems = data.reduce((pre, current) => {
        const { name } = current;
        if (name && reg && name.itemName.match(reg)) {
          pre.push(current);
          // 如果当前页面显示的 item 存在匹配项，则把他设置为 currentItem
          if (newCurrentItem === null && showItems.includes(current)) {
            newCurrentItem = current;
          }
        }
        return pre;
      }, []);

      if (newMatchItems.length === 0) {
        setCurrentItem(null);
      } else {
        if (newCurrentItem === null) {
          const item = newMatchItems[0];
          // 不处于当前展示页面，需要展开父节点
          updateCollapsedNodes(item);
          setCurrentItem(item);
        } else {
          setCurrentItem(newCurrentItem);
        }
      }
    } else {
      setCurrentItem(null);
    }
    matchItemsRef.current = newMatchItems;
    setFilterValue(search);
  };

  const onSelectNext = () => {
    const index = matchItems.indexOf(currentItem);
    const nextIndex = index + 1;
    const item = nextIndex < matchItemsRef.current.length ? matchItems[nextIndex] : matchItems[0];
    // 可能不处于当前展示页面，需要展开父节点
    updateCollapsedNodes(item);
    setCurrentItem(item);
  };

  const onSelectLast = () => {
    const index = matchItems.indexOf(currentItem);
    const last = index - 1;
    const item = last >= 0 ? matchItems[last] : matchItems[matchItems.length - 1];
    // 可能不处于当前展示页面，需要展开父节点
    updateCollapsedNodes(item);
    setCurrentItem(item);
  };

  const setShowItems = items => {
    showItemsRef.current = [...items];
  };

  const onClear = () => {
    onChangeSearchValue('');
  };

  const setCollapsedNodes = items => {
    // 不更新引用，避免子组件的重复渲染
    collapsedNodesRef.current.length = 0;
    collapsedNodesRef.current.push(...items);
  };

  return {
    filterValue,
    onChangeSearchValue,
    onClear,
    currentItem,
    matchItems,
    onSelectNext,
    onSelectLast,
    setShowItems,
    collapsedNodes,
    setCollapsedNodes,
  };
}
