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

import { useState } from 'openinula';
import styles from './PanelX.less';
import { Modal } from './Modal';
import { displayValue, omit } from './utils';

export function Tree({
  data,
  indent = 0,
  index = '',
  expand = false,
  search = '',
  forcedExpand = false,
  onEdit = null,
  omitAttrs = [],
  className,
  forcedLabel = null,
}: {
  data: any;
  indent?: number;
  index?: string | number;
  expand?: boolean;
  search?: string;
  forcedExpand?: boolean;
  className?: string | undefined;
  omitAttrs?: string[];
  onEdit?: (path: any[], value: any) => void | null;
  forcedLabel?: string | number | null;
}) {
  const [expanded, setExpanded] = useState(expand);
  const [modal, setModal] = useState(false);
  const isArray = Array.isArray(data);
  const isObject = data && !isArray && typeof data === 'object';
  const isSet = isObject && data?._type === 'Set';
  const isWeakSet = isObject && data?._type === 'WeakSet';
  const isMap = isObject && data?._type === 'Map';
  const isWeakMap = isObject && data?._type === 'WeakMap';
  const isVNode = isObject && data.vtype;
  const canBeExpanded = isArray || (isObject && !isWeakSet && !isWeakMap);

  if (isObject && omitAttrs?.length) {
    data = omit(data, ...omitAttrs);
  }

  return canBeExpanded ? (
    <div
      style={{ fontFamily: 'monoSpace' }}
      className={`${expanded ? 'expanded' : 'not-expanded'} ${className}`}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <span
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {new Array(Math.max(indent, 0)).fill(<span>&nbsp;</span>)}
        {forcedExpand || isVNode ? null : expanded ? <span>▼</span> : <span>▶</span>}
        {index === 0 || index ? (
          <>
            <b className={styles.purple}>{displayValue(index, search)}: </b>
          </>
        ) : (
          ''
        )}
        {forcedLabel
          ? forcedLabel
          : expanded
            ? isVNode
              ? null
              : Array.isArray(data)
                ? `Array(${data.length})`
                : isMap
                  ? `Map(${data.entries.length})`
                  : isSet
                    ? `Set(${data.values.length})`
                    : '{ ... }'
            : isWeakMap
              ? 'WeakMap()'
              : isWeakSet
                ? 'WeakSet()'
                : isMap
                  ? `Map(${data.entries.length})`
                  : isSet
                    ? `Set(${data.values.length})`
                    : Array.isArray(data)
                      ? `Array(${data.length})`
                      : '{ ... }'}
      </span>
      {expanded || isVNode ? (
        isArray ? (
          <>
            {data.map((value, index) => {
              return (
                <div>
                  <Tree
                    data={value}
                    indent={indent + 4}
                    index={index}
                    search={search}
                    className={className}
                    onEdit={
                      onEdit
                        ? (path, val) => {
                            onEdit(path.concat([index]), val);
                          }
                        : null
                    }
                  />
                </div>
              );
            })}
          </>
        ) : isVNode ? (
          data
        ) : isMap ? (
          <div>
            {data.entries.map(([key, value]) => {
              return (
                <Tree
                  data={{ key, value }}
                  indent={indent + 4}
                  search={search}
                  className={className}
                  // TODO: editable sets
                />
              );
            })}
          </div>
        ) : isSet ? (
          data.values.map(item => {
            return (
              <div>
                <Tree
                  data={item}
                  indent={indent + 4}
                  search={search}
                  className={className}
                  // TODO: editable sets
                />
              </div>
            );
          })
        ) : (
          Object.entries(data).map(([key, value]) => {
            return (
              <div>
                <Tree
                  data={value}
                  indent={indent + 4}
                  index={key}
                  search={search}
                  className={className}
                  onEdit={
                    onEdit
                      ? (path, val) => {
                          onEdit(path.concat([key]), val);
                        }
                      : null
                  }
                />
              </div>
            );
          })
        )
      ) : (
        ''
      )}
    </div>
  ) : (
    <div className={'not-expanded'}>
      {new Array(indent).fill(<span>&nbsp;</span>)}
      <span className={`${className}`}>
        {typeof index !== 'undefined' ? (
          <>
            <b className={styles.purple}>{displayValue(index, search)}: </b>
          </>
        ) : (
          ''
        )}
        {displayValue(data, search)}
        {onEdit && !isWeakSet && !isWeakMap ? ( // TODO: editable weak set and map
          <>
            <b
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setModal(true);
              }}
            >
              ☼
            </b>
            {onEdit && modal ? (
              <Modal
                closeModal={() => {
                  setModal(false);
                }}
                then={data => {
                  onEdit([], data);
                  setModal(false);
                }}
              >
                <h3>Edit value:</h3> {index}
              </Modal>
            ) : null}
          </>
        ) : null}
      </span>
    </div>
  );
}
