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
import { Tree } from './Tree';
import {displayValue, omit} from './utils';

type Mutation = {
  mutation: boolean;
  items?: Mutation[];
  attributes?: { [key: string]: Mutation };
  values?: Mutation[];
  entries?: Mutation[];
  from?: any;
  to?: any;
};

export function DiffTree({
  mutation,
  indent = 0,
  index = '',
  expand = false,
  search = '',
  forcedExpand = false,
  omitAttrs = [],
  doNotDisplayIcon = false,
  forcedLabel = null,
  className,
}: {
  mutation: Mutation;
  indent: number;
  index?: string | number;
  expand?: boolean;
  search: string;
  forcedExpand?: boolean;
  omitAttrs: string[];
  doNotDisplayIcon?: boolean;
  forcedLabel?: string | number | null;
  className?: string;
}) {
  if (omitAttrs.length && mutation.attributes) {
    mutation.attributes = omit(mutation.attributes, ...omitAttrs);
    mutation.from = mutation.from && omit(mutation.from, ...omitAttrs);
    mutation.to = mutation.to && omit(mutation.to, ...omitAttrs);
  }
  const [expanded, setExpanded] = useState(expand);

  const deleted = mutation.mutation && !('to' in mutation);
  const newValue = mutation.mutation && !('from' in mutation);
  const mutated = mutation.mutation;

  const isArray = mutated && mutation.items;
  const isObject = mutated && mutation.attributes;
  const isMap = mutated && mutation.entries;
  const isSet = mutated && mutation.values;
  const isPrimitive = !isArray && !isObject && !isMap && !isSet;

  if (!mutated) {
    return (
      <Tree
        data={mutation.to}
        indent={indent}
        search={search}
        expand={expand}
        forcedExpand={forcedExpand}
        omitAttrs={omitAttrs}
        forcedLabel={forcedLabel}
      />
    );
  }

  if (newValue) {
    return (
      <Tree
        data={mutation.to}
        indent={indent}
        search={search}
        expand={expand}
        forcedExpand={forcedExpand}
        className={styles.added}
        omitAttrs={omitAttrs}
        forcedLabel={forcedLabel}
      />
    );
  }

  if (deleted) {
    return (
      <Tree
        data={mutation.from}
        indent={indent}
        search={search}
        expand={expand}
        forcedExpand={forcedExpand}
        className={styles.deleted}
        omitAttrs={omitAttrs}
        forcedLabel={forcedLabel}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: 'monospace',
      }}
      className={`${
        expanded
          ? 'expanded'
          : `not-expanded ${
            mutated && !isPrimitive && !expanded ? styles.changed : ''
          }`
      }`}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <span
        style={{
          cursor: 'pointer',
        }}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {new Array(Math.max(indent, 0)).fill(<span>&nbsp;</span>)}
        {isPrimitive ? (
          // 如果两个 value 是基本变量并且不同，则简单显示不同点
          <div
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <Tree
              data={mutation.from}
              indent={indent}
              search={search}
              index={index}
              className={styles.deleted}
              omitAttrs={omitAttrs}
            />
            <Tree
              data={mutation.to}
              indent={indent}
              search={search}
              index={index}
              className={styles.added}
              omitAttrs={omitAttrs}
            />
          </div>
        ) : (
          // 如果至少有一个是复杂变量，则需要展开按钮
          <>
            {forcedExpand ? '' : expanded ? <span>▼</span> : <span>▶</span>}
            {index === 0 || index ? (
              <b className={styles.purple}>{displayValue(index, search)}: </b>
            ) : (
              ''
            )}
            {isArray ? (
              // 如果都是数组进行比较
              expanded ? (
                [
                  Array(Math.max(mutation.from.length, mutation.to.length))
                    .fill(true)
                    .map((i, index) => {
                      return (
                        <div>
                          {mutation.items[index].mutation ? (
                            <DiffTree
                              mutation={{
                                ...mutation.items[index],
                                to: mutation.to[index],
                              }}
                              indent={indent}
                              search={search}
                              omitAttrs={omitAttrs}
                              forcedLabel={index}
                            />
                          ) : (
                            <Tree
                              data={mutation.to[index]}
                              indent={indent}
                              search={search}
                              index={index}
                              className={styles.default}
                              omitAttrs={omitAttrs}
                            />
                          )}
                        </div>
                      );
                    }),
                ]
              ) : (
                forcedLabel || `Array(${mutation.to?.length})`
              )
            ) : isSet ? (
              expanded ? (
                <div>
                  <div>
                    {forcedLabel || `Set(${mutation.to?.values.length})`}
                  </div>
                  {Array(
                    Math.max(
                      mutation.from?.values.length,
                      mutation.to?.values.length
                    )
                  )
                    .fill(true)
                    .map((i ,index) => (
                      <div>
                        {mutation.values[index].mutation ? (
                          <DiffTree
                            mutation={{
                              ...mutation.values[index],
                            }}
                            indent={indent + 2}
                            search={search}
                            omitAttrs={omitAttrs}
                          />
                        ) : (
                          <Tree
                            data={mutation.to?.values[index]}
                            indent={indent + 2}
                            search={search}
                            className={styles.default}
                            omitAttrs={omitAttrs}
                          />
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <span>
                  {forcedLabel || `Set(${mutation.to?.values.length})`}
                </span>
              )
            ) : isMap ? (
              expanded ? (
                <>
                  <span>
                    {forcedLabel || `Map(${mutation.to?.entries.length})`}
                  </span>
                  {Array(
                    Math.max(
                      mutation.from?.entries.length,
                      mutation.to?.entries.length
                    )
                  )
                    .fill(true)
                    .map((i, index) =>
                      mutation.entries[index].mutation ? (
                        <div>
                          <DiffTree
                            mutation={{
                              ...mutation.entries[index],
                            }}
                            indent={indent + 2}
                            search={search}
                            omitAttrs={omitAttrs}
                            forcedLabel={'[map item]'}
                          />
                        </div>
                      ) : (
                        <div>
                          <Tree
                            data={mutation.to?.entries[index]}
                            indent={indent + 2}
                            search={search}
                            className={styles.default}
                            omitAttrs={omitAttrs}
                            forcedLabel={'[map item]'}
                          />
                        </div>
                      )
                    )}
                </>
              ) : (
                <span>
                  {forcedLabel || `Map(${mutation.to?.entries.length})`}
                </span>
              )
            ) : expanded ? (
              // 如果都是 object 进行比较
              Object.entries(mutation.attributes).map(([key, item]) => {
                return item.mutation ? (
                  <span onClick={e => e.stopPropagation()}>
                    {
                      <DiffTree
                        mutation={item}
                        index={key}
                        indent={indent}
                        search={search}
                        className={!expanded && mutated ? '' : styles.changed}
                        omitAttrs={omitAttrs}
                      />
                    }
                  </span>
                ) : (
                  <span onClick={e => e.stopPropagation()}>
                    {
                      <Tree
                        data={mutation.to[key]}
                        index={key}
                        indent={indent}
                        search={search}
                        className={styles.default}
                        omitAttrs={omitAttrs}
                      />
                    }
                  </span>
                );
              })
            ) : (
              forcedLabel || '{ ... }'
            )}
          </>
        )}
      </span>
    </div>
  );
}
