// 过滤树的抽象逻辑实现
// 需要知道渲染了哪些数据，搜索的字符串
// 控制Tree组件位置跳转，告知搜索文本
// 清空搜索框，告知搜索框当前是第几个结果，跳转搜索结果接口

import { useState, useRef } from 'horizon';
import { createRegExp } from '../utils';

export function FilterTree<T extends {
  id: string,
  name: string
}>(props: { data: T[] }) {
  const { data } = props;
  const [filterValue, setFilterValue] = useState('');
  const [selectId, setSelectId] = useState(null);
  const showItems = useRef([]);
  const matchItemsRef = useRef([]);
  const matchItems = matchItemsRef.current;
  const onChangeSearchValue = (search: string) => {
    const reg = createRegExp(search);
    let matchShowId = null;
    let newMatchItems = [];
    if (search !== '') {
      newMatchItems = data.reduce((pre, current) => {
        const { id, name } = current;
        if (reg && name.match(reg)) {
          pre.push(id);
          if (matchShowId === null) {
            matchShowId = id;
          }
        }
        return pre;
      }, []);
      if (newMatchItems.length === 0) {
        setSelectId(null);
      } else {
        if (matchShowId === null) {
          setSelectId(newMatchItems[0]);
        } else {
          setSelectId(matchShowId);
        }
      }
    }
    matchItemsRef.current = newMatchItems;
    setFilterValue(search);
  };
  const onSelectNext = () => {
    const index = matchItems.indexOf(selectId);
    const nextIndex = index + 1;
    if (nextIndex < matchItemsRef.current.length) {
      setSelectId(matchItems[nextIndex]);
    }
  };
  const onSelectLast = () => {
    const index = matchItems.indexOf(selectId);
    const last = index - 1;
    if (last >= 0) {
      setSelectId(matchItems[last]);
    }
  };
  const setShowItems = (items) => {
    showItems.current = [...items];
  };
  const onClear = () => {
    onChangeSearchValue('');
  };
  return {
    filterValue,
    setFilterValue: onChangeSearchValue,
    onClear,
    selectId,
    matchItems,
    onSelectNext,
    onSelectLast,
    setShowItems,
  };
}
