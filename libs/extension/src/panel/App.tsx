import { useState, useEffect, useRef } from 'horizon';
import VTree, { IData } from '../components/VTree';
import Search from '../components/Search';
import ComponentInfo from '../components/ComponentInfo';
import styles from './App.less';
import Select from '../svgs/Select';
import { mockParsedVNodeData, parsedMockState } from '../devtools/mock';
import { FilterTree } from '../hooks/FilterTree';
import Close from '../svgs/Close';
import Arrow from './../svgs/Arrow';
import {
  AllVNodeTreesInfos,
  RequestComponentAttrs,
  ComponentAttrs,
} from '../utils/constants';
import {
  addBackgroundMessageListener,
  initBackgroundConnection,
  postMessageToBackground, removeBackgroundMessageListener,
} from '../panelConnection';
import { IAttr } from '../parser/parseAttr';
import { createLogger } from '../utils/logUtil';

const logger = createLogger('panelApp');

const parseVNodeData = (rawData, idToTreeNodeMap , nextIdToTreeNodeMap) => {
  const idIndentationMap: {
    [id: string]: number;
  } = {};
  const data: IData[] = [];
  let i = 0;
  while (i < rawData.length) {
    const id = rawData[i] as number;
    i++;
    const name = rawData[i] as string;
    i++;
    const parentId = rawData[i] as string;
    i++;
    const userKey = rawData[i] as string;
    i++;
    const indentation = parentId === '' ? 0 : idIndentationMap[parentId] + 1;
    idIndentationMap[id] = indentation;
    const lastItem = idToTreeNodeMap[id];
    if (lastItem) {
      // 由于 diff 算法限制，一个 vNode 的 name，userKey，indentation 属性不会发生变化
      // 但是在跳转到新页面时，id 值重置，此时原有 id 对应的节点都发生了变化，需要更新
      // 为了让架构尽可能简单，我们不区分是否是页面跳转，所以每次都需要重新赋值
      nextIdToTreeNodeMap[id] = lastItem;
      lastItem.name = name;
      lastItem.indentation = indentation;
      lastItem.userKey = userKey;
      data.push(lastItem);
    } else {
      const item = {
        id, name, indentation, userKey
      };
      nextIdToTreeNodeMap[id] = item;
      data.push(item);
    }
  }
  return data;
};

const getParents = (item: IData | null, parsedVNodeData: IData[]) => {
  const parents: IData[] = [];
  if (item) {
    const index = parsedVNodeData.indexOf(item);
    let indentation = item.indentation;
    for (let i = index; i >= 0; i--) {
      const last = parsedVNodeData[i];
      const lastIndentation = last.indentation;
      if (lastIndentation < indentation) {
        parents.push(last);
        indentation = lastIndentation;
      }
    }
  }
  return parents;
};

interface IIdToNodeMap {
  [id: number]: IData;
}

function App() {
  const [parsedVNodeData, setParsedVNodeData] = useState([]);
  const [componentAttrs, setComponentAttrs] = useState<{
    parsedProps?: IAttr[],
    parsedState?: IAttr[],
    parsedHooks?: IAttr[],
  }>({});
  const [selectComp, setSelectComp] = useState(null);
  const idToTreeNodeMapRef = useRef<IIdToNodeMap>({});

  const {
    filterValue,
    onChangeSearchValue: setFilterValue,
    onClear,
    currentItem,
    matchItems,
    onSelectNext,
    onSelectLast,
    setShowItems,
    collapsedNodes,
    setCollapsedNodes,
  } = FilterTree({ data: parsedVNodeData });

  useEffect(() => {
    if (isDev) {
      const nextIdToTreeNodeMap: IIdToNodeMap = {};
      const parsedData = parseVNodeData(mockParsedVNodeData, idToTreeNodeMapRef.current, nextIdToTreeNodeMap);
      idToTreeNodeMapRef.current = nextIdToTreeNodeMap;
      setParsedVNodeData(parsedData);
      setComponentAttrs({
        parsedProps: parsedMockState,
        parsedState: parsedMockState,
      });
    } else {
      const handleBackgroundMessage = (message) => {
        const { payload } = message;
        // 对象数据只是记录了引用，内容可能在后续被修改，打印字符串可以获取当前真正内容，不被后续修改影响
        logger.info(JSON.stringify(payload));
        if (payload) {
          const { type, data } = payload;
          if (type === AllVNodeTreesInfos) {
            const idToTreeNodeMap = idToTreeNodeMapRef.current;
            const nextIdToTreeNodeMap: IIdToNodeMap = {};
            const allTreeData = data.reduce((pre, current) => {
              const parsedTreeData = parseVNodeData(current, idToTreeNodeMap, nextIdToTreeNodeMap);
              return pre.concat(parsedTreeData);
            }, []);
            idToTreeNodeMapRef.current = nextIdToTreeNodeMap;
            setParsedVNodeData(allTreeData);
          } else if (type === ComponentAttrs) {
            const {parsedProps, parsedState, parsedHooks} = data;
            setComponentAttrs({
              parsedProps,
              parsedState,
              parsedHooks,
            });
          }
        }
      };
      // 在页面渲染后初始化连接
      initBackgroundConnection();
      // 监听 background消息
      addBackgroundMessageListener(handleBackgroundMessage);
      return () => {
        removeBackgroundMessageListener(handleBackgroundMessage);
      };
    }
  }, []);

  const handleSearchChange = (str: string) => {
    setFilterValue(str);
  };

  const handleSelectComp = (item: IData) => {
    if (isDev) {
      setComponentAttrs({
        parsedProps: parsedMockState,
        parsedState: parsedMockState,
      });
    } else {
      postMessageToBackground(RequestComponentAttrs, item.id);
    }
    setSelectComp(item);
  };

  const handleClickParent = (item: IData) => {
    setSelectComp(item);
  };

  const onRendered = (info) => {
    setShowItems(info.visibleItems);
  };
  const parents = getParents(selectComp, parsedVNodeData);

  return (
    <div className={styles.app}>
      <div className={styles.left}>
        <div className={styles.left_top} >
          <div className={styles.select} >
            <Select />
          </div>
          <div className={styles.divider} />
          <div className={styles.search}>
            <Search onChange={handleSearchChange} value={filterValue} />
          </div>
          {filterValue !== '' && <>
            <span className={styles.searchResult}>{`${matchItems.indexOf(currentItem) + 1}/${matchItems.length}`}</span>
            <div className={styles.divider} />
            <button className={styles.searchAction} onClick={onSelectLast}><Arrow direction={'up'} /></button>
            <button className={styles.searchAction} onClick={onSelectNext}><Arrow direction={'down'} /></button>
            <button className={styles.searchAction} onClick={onClear}><Close /></button>
          </>}
        </div>
        <div className={styles.left_bottom}>
          <VTree
            data={parsedVNodeData}
            highlightValue={filterValue}
            onRendered={onRendered}
            collapsedNodes={collapsedNodes}
            onCollapseNode={setCollapsedNodes}
            scrollToItem={currentItem}
            selectItem={selectComp}
            onSelectItem={handleSelectComp} />
        </div>
      </div>
      <div className={styles.right}>
        <ComponentInfo
          name={selectComp ? selectComp.name : null}
          attrs={selectComp ? componentAttrs : {}}
          parents={parents}
          id={selectComp ? selectComp.id : null}
          onClickParent={handleClickParent} />
      </div>
    </div>
  );
}

export default App;