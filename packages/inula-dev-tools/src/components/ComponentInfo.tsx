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

import styles from './ComponentInfo.less';
import Eye from '../svgs/Eye';
import Debug from '../svgs/Debug';
import Location from '../svgs/Location';
import Triangle from '../svgs/Triangle';
import { memo, useContext, useEffect, useState, useRef, useMemo, createRef } from 'openinula';
import { IData } from './VTree';
import { buildAttrModifyData, IAttr } from '../parser/parseAttr';
import { postMessageToBackground } from '../panelConnection';
import { CopyToConsole, InspectDom, LogComponentData, ModifyAttrs, StorageValue } from '../utils/constants';
import type { Source } from '../../../inula/src/renderer/Types';
import ViewSourceContext from '../utils/ViewSource';
import PickElementContext from '../utils/PickElement';
import Operation from '../svgs/Operation';

type IComponentInfo = {
  name: string;
  attrs: {
    parsedProps?: IAttr[];
    parsedState?: IAttr[];
    parsedHooks?: IAttr[];
  };
  parents: IData[];
  id: number;
  source?: Source;
  onClickParent: (item: IData) => void;
};

const ComponentAttr = memo(function ComponentAttr({
  attrsName,
  attrsType,
  attrs,
  id,
  dropdownRef,
}: {
  attrsName: string;
  attrsType: string;
  attrs: IAttr[];
  id: number;
  dropdownRef: null | HTMLElement;
}) {
  const [editableAttrs, setEditableAttrs] = useState(attrs);
  const [expandNodes, setExpandNodes] = useState([]);

  useEffect(() => {
    setEditableAttrs(attrs);
  }, [attrs]);

  const handleCollapse = (item: IAttr) => {
    const nodes = [...expandNodes];
    const expandItem = `${item.name}_${editableAttrs.indexOf(item)}`;
    const i = nodes.indexOf(expandItem);
    if (i === -1) {
      nodes.push(expandItem);
    } else {
      nodes.splice(i, 1);
    }
    setExpandNodes(nodes);
  };

  // props 展示的 key: value 中的 value 值
  const getShowName = item => {
    let retStr;
    if (item === undefined) {
      retStr = String(item);
    } else if (typeof item === 'number') {
      retStr = item;
    } else if (typeof item === 'string') {
      retStr = item.endsWith('>') ? `<${item}` : item;
    } else {
      retStr = `"${item}"`;
    }
    return retStr;
  };

  /**
   * 拿到 props 或 hooks 在 VNode 里的路径
   *
   * @param {Array<IAttr>} editableAttrs 所有 props 与 hooks 的值
   * @param {number} index 此值在 editableAttrs 的下标位置
   * @param {string} attrsType 此值属于 props 还是 hooks
   * @return {Array} 值在 vNode 里的路径
   */
  const getPath = (editableAttrs: IAttr[], index: number, attrsType: string): Array<string | number> => {
    const path: Array<string | number> = [];
    let local = editableAttrs[index].indentation;
    if (local === 1) {
      path.push(attrsType === 'Hooks' ? editableAttrs[index].hIndex : editableAttrs[index].name);
    } else {
      let location = local;
      let id = index;
      while (location > 0) {
        // local === 1 时处于 vNode.hooks 的子元素最外层
        if (location < local || id === index || local === 1) {
          if (local === 1) {
            attrsType === 'Hooks'
              ? path.unshift(editableAttrs[id + 1].hIndex, 'state')
              : path.unshift(editableAttrs[id + 1].name);
            break;
          } else {
            if (editableAttrs[id]?.indentation === 1) {
              if (editableAttrs[id]?.name === 'State') {
                path.unshift('stateValue');
              }
              if (editableAttrs[id]?.name === 'Ref') {
                path.unshift('current');
              }
            } else {
              path.unshift(editableAttrs[id].name);
            }
          }
          // 跳过同级
          local = location;
        }
        location = id >= 1 ? editableAttrs[id - 1].indentation : -1;
        id = -1;
      }
    }
    return path;
  };

  const showAttr = [];
  let currentIndentation = null;

  // 为每一行数据添加一个 ref
  const refsById = useMemo(() => {
    const refs = {};
    editableAttrs.forEach((item, index) => {
      refs[index] = createRef();
    });
    return refs;
  }, [editableAttrs]);

  editableAttrs.forEach((item, index) => {
    const operationRef = refsById[index];
    const indentation = item.indentation;
    if (currentIndentation !== null) {
      if (indentation > currentIndentation) {
        return;
      } else {
        currentIndentation = null;
      }
    }
    const nextItem = editableAttrs[index + 1];
    const hasChild = nextItem ? nextItem.indentation - item.indentation > 0 : false;
    const isCollapsed = !expandNodes.includes(`${item.name}_${index}`);

    // 按钮点击事件
    const operationClick = (e: Event, operationRef: any) => {
      // 防止点击按钮触发展开或者合起数据
      e.stopPropagation();
      if (operationRef.current) {
        const operationRect = operationRef.current.getBoundingClientRect();
        // 19.2 为图标按钮高度，85 为弹框高度的一半
        dropdownRef.style.setProperty('--content-top', `${operationRect.top + 19.2}px`);
        dropdownRef.style.setProperty('--content-left', `${operationRect.left - 85}px`);
      }
      dropdownRef.classList.toggle(styles['active']);
      const attrInfo = {
        id: { id },
        itemName: item.name,
        attrsName: attrsName,
        path: getPath(editableAttrs, index, attrsName),
      };
      (dropdownRef as any).attrInfo = attrInfo;
      console.log(dropdownRef);
    };

    showAttr.push(
      <div
        className={styles.info}
        style={{ paddingLeft: item.indentation * 10 }}
        key={index}
        onclick={() => handleCollapse(item)}
      >
        <span className={styles.attrArrow}>{hasChild && <Triangle director={isCollapsed ? 'right' : 'down'} />}</span>
        <span className={styles.attrName}>{`${item.name}`}</span>
        <div className={styles.colon}>{':'}</div>
        {item.type === 'string' || item.type === 'number' || item.type === 'undefined' || item.type === 'null' ? (
          <>
            <input
              value={getShowName(item.value)}
              data-type={item.type}
              className={styles.attrValue}
              onChange={event => {
                const nextAttrs = [...editableAttrs];
                const nextItem = { ...item };
                nextItem.value = event.target.value;
                nextAttrs[index] = nextItem;
                setEditableAttrs(nextAttrs);
              }}
              onKeyUp={event => {
                const value = (event.target as HTMLInputElement).value;
                if (event.key === 'Enter') {
                  if (isDev) {
                    console.log('post attr change', value);
                  } else {
                    const data = buildAttrModifyData(attrsType, attrs, value, item, index, id);
                    postMessageToBackground(ModifyAttrs, data);
                  }
                }
              }}
            />
            <div className={styles.operation} ref={operationRef}>
              <span className={styles.operationIcon} onclick={event => operationClick(event, operationRef)}>
                <Operation />
              </span>
            </div>
          </>
        ) : item.type === 'boolean' ? (
          <>
            <span data-type={item.type} className={styles.attrValue}>
              {item.value.toString()}
            </span>
            <input
              type={'checkbox'}
              checked={item.value}
              className={styles.checkBox}
              onChange={event => {
                const nextAttrs = [...editableAttrs];
                const nextItem = { ...item };
                nextItem.value = event.target.checked;
                nextAttrs[index] = nextItem;
                setEditableAttrs(nextAttrs);
                if (!isDev) {
                  const data = buildAttrModifyData(attrsType, attrs, nextItem.value, item, index, id);
                  postMessageToBackground(ModifyAttrs, data);
                }
              }}
            />
          </>
        ) : (
          <>
            <span data-type={item.type} className={styles.attrValue}>
              {item.value}
            </span>
            <div className={styles.operation} ref={operationRef}>
              <span className={styles.operationIcon} onClick={event => operationClick(event, operationRef)}>
                <Operation />
              </span>
            </div>
          </>
        )}
      </div>
    );
    if (isCollapsed) {
      currentIndentation = indentation;
    }
  });

  return (
    <div className={styles.attrContainer}>
      <div className={styles.attrHead}>
        <span className={styles.attrType}>{attrsName}</span>
      </div>
      <div className={styles.attrDetail}>{showAttr}</div>
    </div>
  );
});

function ComponentInfo({ name, attrs, parents, id, source, onClickParent }: IComponentInfo) {
  const view = useContext(ViewSourceContext) as any;
  const viewSource = view.viewSourceFunction.viewSource;

  const pick = useContext(PickElementContext) as any;
  const inspectVNode = pick.pickElementFunction.inspectVNode;
  const dropdownRef = useRef<null | HTMLElement>(null);

  const doViewSource = (id: number) => {
    postMessageToBackground(InspectDom, { id });
    setTimeout(function () {
      inspectVNode();
    }, 100);
  };

  const doInspectDom = (id: number) => {
    postMessageToBackground(InspectDom, { id });
    setTimeout(function () {
      inspectVNode();
    }, 100);
  };

  const sourceFormatted = (fileName: string, lineNumber: number) => {
    const pathWithoutLastName = /^(.*)[\\/]/;

    let realName = fileName.replace(pathWithoutLastName, '');
    if (/^index\./.test(realName)) {
      const fileNameMatch = fileName.match(pathWithoutLastName);
      if (fileNameMatch) {
        const pathBeforeName = fileNameMatch[1];
        if (pathBeforeName) {
          const folderName = pathBeforeName.replace(pathWithoutLastName, '');
          realName = folderName + '/' + realName;
        }
      }
    }

    return `${realName}:${lineNumber}`;
  };

  const copyToConsole = (itemName: string | number, attrsName: string, path: Array<string | number>) => {
    postMessageToBackground(CopyToConsole, { id, itemName, attrsName, path });
    dropdownRef.current.classList.toggle(styles['active']);
  };

  const storeVariable = (attrsName: string, path: Array<string | number>) => {
    postMessageToBackground(StorageValue, { id, attrsName, path });
    dropdownRef.current.classList.toggle(styles['active']);
  };

  return (
    <div className={styles.infoContainer}>
      <div className={styles.componentInfoHead}>
        {name && (
          <>
            <div className={styles.name}>
              <div className={styles.text}>{name}</div>
            </div>

            <button className={styles.button}>
              <span
                className={styles.eye}
                title={'Inspect dom element'}
                onClick={() => {
                  doInspectDom(id);
                }}
              >
                <Eye />
              </span>
            </button>

            <button className={styles.button} disabled={false}>
              <span
                className={styles.location}
                onClick={() => {
                  doViewSource(id);
                }}
                title={'View source for this element'}
              >
                <Location />
              </span>
            </button>

            <button className={styles.button}>
              <span
                className={styles.debug}
                title={'Log this component data'}
                onClick={() => {
                  postMessageToBackground(LogComponentData, id);
                }}
              >
                <Debug />
              </span>
            </button>
          </>
        )}
      </div>
      <div className={styles.componentInfoMain}>
        {Object.keys(attrs).map(attrsType => {
          const parsedAttrs = attrs[attrsType];
          if (parsedAttrs && parsedAttrs.length !== 0) {
            const attrsName = attrsType.slice(6); // parsedState => State
            return (
              <ComponentAttr
                attrsName={attrsName}
                attrsType={attrsType}
                attrs={parsedAttrs}
                id={id}
                dropdownRef={dropdownRef.current}
              />
            );
          }
          return null;
        })}
        <div className={styles.parentsInfo}>
          {name && (
            <div>
              <div className={styles.parentName}>Parents</div>
              {parents.map(item => (
                <button className={styles.parent} onClick={() => onClickParent(item)}>
                  {`<${item.name.itemName}>`}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.parentsInfo}>
          {source && (
            <>
              <div>source: {''}</div>
              <div style={{ marginLeft: '1rem' }}>{sourceFormatted(source.fileName, source.lineNumber)}</div>
            </>
          )}
        </div>
        <div ref={dropdownRef} className={styles.dropdown}>
          <ul>
            <li
              onClick={() =>
                copyToConsole(
                  (dropdownRef.current as any).attrInfo.itemName,
                  (dropdownRef.current as any).attrInfo.attrsName,
                  (dropdownRef.current as any).attrInfo.path
                )
              }
            >
              <b>Copy value to console</b>
            </li>
            <li
              onClick={() =>
                storeVariable(
                  (dropdownRef.current as any).attrInfo.attrsName,
                  (dropdownRef.current as any).attrInfo.path
                )
              }
            >
              <b>Store as global variable</b>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default memo(ComponentInfo);
