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
  InitDevToolPageConnection,
  AllVNodeTreesInfos,
  RequestComponentAttrs,
  ComponentAttrs,
  DevToolPanel,
} from './../utils/constants';
import { packagePayload } from './../utils/transferTool';

const parseVNodeData = (rawData) => {
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
    const item = {
      id, name, indentation, userKey
    };
    data.push(item);
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

let connection;
if (!isDev) {
  // 与 background 的唯一连接
  connection = chrome.runtime.connect({
    name: 'panel'
  });
}

function postMessage(type: string, data: any) {
  try {
    connection.postMessage(packagePayload({
      type: type,
      data: data,
    }, DevToolPanel));
  } catch(err) {
    // 可能出现 port 关闭的场景，需要重新建立连接，增加可靠性
    console.error(err);
    connection = chrome.runtime.connect({
      name: 'panel'
    });
    connection.postMessage(packagePayload({
      type: type,
      data: data,
    }, DevToolPanel));
  }
}

function App() {
  const [parsedVNodeData, setParsedVNodeData] = useState([]);
  const [componentAttrs, setComponentAttrs] = useState({});
  const [selectComp, setSelectComp] = useState(null);
  const treeRootInfos = useRef<{id: number, length: number}[]>([]); // 记录保存的根节点 id 和长度，

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
      const parsedData = parseVNodeData(mockParsedVNodeData);
      setParsedVNodeData(parsedData);
      setComponentAttrs({
        state: parsedMockState,
        props: parsedMockState,
      });
    } else {
      // 页面打开后发送初始化请求
      postMessage(InitDevToolPageConnection, chrome.devtools.inspectedWindow.tabId);
      // 监听 background消息
      connection.onMessage.addListener(function (message) {
        const { payload } = message;
        if (payload) {
          const { type, data } = payload;
          if (type === AllVNodeTreesInfos) {
            const allTreeData = data.reduce((pre, current) => {
              const parsedTreeData = parseVNodeData(current);
              const length = parsedTreeData.length;
              treeRootInfos.current.length = 0;
              if (length) {
                const treeRoot = parsedTreeData[0];
                treeRootInfos.current.push({id: treeRoot.id, length: length});
              }
              return pre.concat(parsedTreeData);
            }, []);
            setParsedVNodeData(allTreeData);
          } else if (type === ComponentAttrs) {
            const {parsedProps, parsedState} = data;
            setComponentAttrs({
              state: parsedProps,
              props: parsedState,
            });
          }
        }
      });
    }
  }, []);

  const handleSearchChange = (str: string) => {
    setFilterValue(str);
  };

  const handleSelectComp = (item: IData) => {
    if (isDev) {
      setComponentAttrs({
        state: parsedMockState,
        props: parsedMockState,
      });
    } else {
      postMessage(RequestComponentAttrs, item.id);
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
          onClickParent={handleClickParent} />
      </div>
    </div>
  );
}

export default App;
