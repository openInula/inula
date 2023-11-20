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

import {
  useState,
  useEffect,
  useRef,
  memo,
  useMemo,
  useCallback,
  useReducer,
} from 'openinula';
import VTree, { IData } from '../components/VTree';
import Search from '../components/Search';
import ComponentInfo from '../components/ComponentInfo';
import styles from './Panel.less';
import Select from '../svgs/Select';
import { FilterTree } from '../hooks/FilterTree';
import Close from '../svgs/Close';
import Arrow from '../svgs/Arrow';
import {
  AllVNodeTreeInfos,
  RequestComponentAttrs,
  ComponentAttrs,
  PickElement,
  StopPickElement,
} from '../utils/constants';
import {
  addBackgroundMessageListener,
  initBackgroundConnection,
  postMessageToBackground,
  removeBackgroundMessageListener,
} from '../panelConnection';
import { IAttr } from '../parser/parseAttr';
import { NameObj } from '../parser/parseVNode';
import { createLogger } from '../utils/logUtil';
import type { Source } from '../../../inula/src/renderer/Types';
import ViewSourceContext from '../utils/ViewSource';
import PickElementContext from '../utils/PickElement';
import Discover from '../svgs/Discover';

type ResizeActionType = 'START_RESIZE' | 'SET_HORIZONTAL_PERCENTAGE';

type ResizeAction = {
  type: ResizeActionType;
  payload: any;
};

type ResizeState = {
  horizontalPercentage: number;
  isResizing: boolean;
};

const logger = createLogger('panelApp');
let maxDeep = 0;
const parseVNodeData = (rawData, idToTreeNodeMap, nextIdToTreeNodeMap) => {
  const indentationMap: {
    [id: string]: number;
  } = {};
  const data: IData[] = [];
  let i = 0;
  while (i < rawData.length) {
    const id = rawData[i] as number;
    i++;
    const name = rawData[i] as NameObj;
    i++;
    const parentId = rawData[i] as string;
    i++;
    const userKey = rawData[i] as string;
    i++;
    const indentation = parentId === '' ? 0 : indentationMap[parentId] + 1;
    maxDeep = maxDeep >= indentation ? maxDeep : indentation;
    indentationMap[id] = indentation;
    const lastItem = idToTreeNodeMap[id];
    if (lastItem) {
      // 由于 diff 算法限制，一个 vNode 的 name，userKey，indentation 属性不会发生变化
      // 但是在跳转到新页面时， id 值重置，此时原有 id 对应的节点都发生了变化，需要更新
      // 为了让架构尽可能简单，不区分是否是页面挑战，所以每次都需要重新赋值
      nextIdToTreeNodeMap[id] = lastItem;
      lastItem.name = name;
      lastItem.indentation = indentation;
      lastItem.userKey = userKey;
      data.push(lastItem);
    } else {
      const item = {
        id,
        name,
        indentation,
        userKey,
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

/**
 * 设置 dev tools 页面左树占比
 *
 * @param {null | HTMLElement} resizeElement 要改变宽度的页面元素
 * @param {number} percentage 宽度占比
 */
const setResizePCTForElement = (
  resizeElement: null | HTMLElement,
  percentage: number
): void => {
  if (resizeElement !== null) {
    resizeElement.style.setProperty(
      '--horizontal-percentage',
      `${percentage}`
    );
  }
};

function resizeReducer(state: ResizeState, action: ResizeAction): ResizeState {
  switch (action.type) {
    case "START_RESIZE":
      return {
        ...state,
        isResizing: action.payload,
      };
    case "SET_HORIZONTAL_PERCENTAGE":
      return {
        ...state,
        horizontalPercentage: action.payload,
      };
    default:
      return state;
  }
}

function initResizeState(): ResizeState {
  const horizontalPercentage = 0.62;

  return {
    horizontalPercentage,
    isResizing: false,
  };
}

function Panel({ viewSource, inspectVNode }) {
  const [parsedVNodeData, setParsedVNodeData] = useState([]);
  const [componentAttrs, setComponentAttrs] = useState<{
    parsedProps?: IAttr[];
    parsedState?: IAttr[];
    parsedHooks?: IAttr[];
  }>({});
  const [selectComp, setSelectComp] = useState<IData>(null);
  const [isPicking, setPicking] = useState(false);
  const [source, setSource] = useState<Source>(null);
  const idToTreeNodeMapref = useRef<IIdToNodeMap>({});
  const [state, dispatch] = useReducer(
    resizeReducer,
    null,
    initResizeState
  );
  const pageRef = useRef<null | HTMLElement>(null);
  const treeRef = useRef<null | HTMLElement>(null);

  const { horizontalPercentage } = state;
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
      // const nextIdToTreeNodeMap: IIdToNodeMap = {};
    } else {
      const handleBackgroundMessage = message => {
        const { payload } = message;
        // 对象数据只是记录了引用，内容可能在后续被修改，打印字符串可以获取当前真正内容，不被后续修改影响
        logger.info(JSON.stringify(payload));
        if (payload) {
          const {type, data} = payload;
          if (type === AllVNodeTreeInfos) {
            const idToTreeNodeMap = idToTreeNodeMapref.current;
            const nextIdToTreeNodeMap: IIdToNodeMap = {};
            const allTreeData = data.reduce((pre, current) => {
              const parsedTreeData = parseVNodeData(
                current,
                idToTreeNodeMap,
                nextIdToTreeNodeMap
              );
              return pre.concat(parsedTreeData);
            }, []);
            idToTreeNodeMapref.current = nextIdToTreeNodeMap;
            setParsedVNodeData(allTreeData);
            if (selectComp) {
              postMessageToBackground(RequestComponentAttrs, selectComp.id);
            }
          } else if (type === ComponentAttrs) {
            const { parsedProps, parsedState, parsedHooks, src } = data;
            setComponentAttrs({
              parsedProps,
              parsedState,
              parsedHooks,
            });
            setSource(src);
          } else if (type === StopPickElement) {
            setPicking(false);
          } else if (type === PickElement) {
            const target = Object.values(idToTreeNodeMapref.current).find(({ id }) => id == data);
            setSelectComp(target);
          }
        }
      };
      // 在页面渲染后初始化连接
      initBackgroundConnection('panel');
      // 监听 background 消息
      addBackgroundMessageListener(handleBackgroundMessage);
      return () => {
        removeBackgroundMessageListener(handleBackgroundMessage);
      };
    }
  }, [selectComp]);

  useEffect(() => {
    const treeElement = treeRef.current;

    setResizePCTForElement(treeElement, horizontalPercentage * 100);
  }, []);

  const handleSearchChange = (str: string) => {
    setFilterValue(str);
  };

  const handleSelectComp = (item: IData) => {
    setSelectComp(item);
    if (isDev) {
      // setComponentAttrs({});
    } else {
      postMessageToBackground(RequestComponentAttrs, item.id);
    }
  };

  const handleClickParent = useCallback((item: IData) => {
    setSelectComp(item);
  }, []);

  const onRendered = info => {
    setShowItems(info.visibleItems);
  };

  const parents = useMemo(
    () => getParents(selectComp, parsedVNodeData),
    [selectComp, parsedVNodeData]
  );

  const viewSourceFunction = useMemo(
    () => ({
      viewSource: viewSource || null,
    }),
    [viewSource]
  );

  // 选择页面元素对应到 dev tools
  const pickElementFunction = useMemo(
    () => ({
      inspectVNode: inspectVNode || null,
    }),
    [inspectVNode]
  );

  // 选择页面元素图标样式
  let pickClassName;
  if (isPicking) {
    pickClassName = styles.Picking;
  } else {
    pickClassName = styles.StopPicking;
  }

  const MINIMUM_SIZE = 50;
  const { isResizing } = state;
  const doResize = () => dispatch({ type: 'START_RESIZE', payload: true });
  let onResize;
  let stopResize;
  if (isResizing) {
    stopResize = () => dispatch({ type: 'START_RESIZE', payload: false });

    onResize = event => {
      // 设置横向 resize 百分比区域（左树部分）
      const treeElement = treeRef.current;
      // 整个页面（左树部分加节点详情部分），要拿到页面宽度，防止 resize 时移出页面
      const pageElement = pageRef.current;

      if (isResizing || pageElement === null || treeElement === null) {
        return;
      }

      // 左移时防止左树移出页面
      event.preventDefault();

      const { width, left } = pageElement.getBoundingClientRect();

      const mouseAbscissa = event.clientX - left;

      const pageSizeMin = MINIMUM_SIZE;
      const pageSizeMax = width-MINIMUM_SIZE;

      const isMouseInPage = mouseAbscissa > pageSizeMin && mouseAbscissa < pageSizeMax;

      if (isMouseInPage) {
        const resizedElementWidth = width;
        const actionType = 'SET_HORIZONTAL_PERCENTAGE';
        const percentage = (mouseAbscissa / resizedElementWidth) * 100;

        setResizePCTForElement(treeElement, percentage);

        dispatch({
          type: actionType,
          payload: mouseAbscissa / resizedElementWidth,
        });
      }
    };
  }

  return (
    <ViewSourceContext.Provider value={{ viewSourceFunction }}>
      <PickElementContext.Provider value={{ pickElementFunction }}>
        <div
          ref={pageRef}
          onMouseMove={onResize}
          onMouseLeave={stopResize}
          onMouseUp={stopResize}
          className={styles.app}
        >
          <div ref={treeRef} className={styles.left}>
            <div className={styles.leftTop}>
              <div className={styles.select}>
                <button className={`${pickClassName}`}>
                  <span
                    className={styles.eye}
                    title={'Pick an element from the page'}
                    onClick={() => {
                      postMessageToBackground(!isPicking ? PickElement : StopPickElement);
                      setPicking(!isPicking);
                    }}
                  >
                    <Select />
                  </span>
                </button>
              </div>
              <div className={styles.divider} />
              <div className={styles.search}>
                <Discover />
                <Search onKeyUp={onSelectNext} onChange={handleSearchChange} value={filterValue} />
              </div>
              {filterValue !== '' && (
                <>
                  <span className={styles.searchResult}>
                    {`${matchItems.indexOf(currentItem) + 1}/${matchItems.length}`}
                  </span>
                  <div className={styles.divider} />
                  <button
                    className={styles.searchAction}
                    onClick={onSelectLast}
                  >
                    <Arrow direction={'up'} />
                  </button>
                  <button
                    className={styles.searchAction}
                    onClick={onSelectNext}
                  >
                    <Arrow direction={'down'} />
                  </button>
                  <button className={styles.searchAction} onClick={onClear}>
                    <Close />
                  </button>
                </>
              )}
            </div>
            <div>
              <VTree
                data={parsedVNodeData}
                maxDeep={maxDeep}
                highlightValue={filterValue}
                onRendered={onRendered}
                collapsedNodes={collapsedNodes}
                onCollapseNode={setCollapsedNodes}
                scrollToItem={currentItem}
                selectItem={selectComp}
                onSelectItem={handleSelectComp}
              />
            </div>
          </div>
          <div>
            <div onMouseDown={doResize} className={styles.resizeLine} />
          </div>
          <div>
            <ComponentInfo
              name={selectComp ? selectComp.name.itemName : null}
              attrs={selectComp ? componentAttrs : {}}
              parents={parents}
              id={selectComp ? selectComp.id : null}
              source={selectComp ? source : null}
              onClickParent={handleClickParent}
            />
          </div>
        </div>
      </PickElementContext.Provider>
    </ViewSourceContext.Provider>
  );
}

export default memo(Panel);
