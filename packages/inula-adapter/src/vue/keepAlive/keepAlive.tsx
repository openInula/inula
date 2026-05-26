import React, { useRef, useEffect, useState, useMemo } from 'openinula';
import Keeper from './keeper';

type StringRegexList = string | RegExp | (string | RegExp)[];
interface KeepAliveProps {
  include?: StringRegexList;
  max?: number;
  exclude?: StringRegexList;
  children?: any;
}

// 更新缓存的children节点key数组
// 当缓存的实例超过max时，移除最久没有使用的组件缓存, 并把最新的key插到尾部
function updateCachedChildrenKeys(allKeys: string[], lastestKey: string, max: number) {
  const index = allKeys.indexOf(lastestKey);
  let needDeletedKey: string = '';
  if (index >= 0) {
    // 如果已经缓存过了，则刷新位置
    allKeys.splice(index, 1);
  } else if (allKeys.length >= max) {
    // 如果没有缓存过，且已经达到最大缓存数量，则先把老的删了
    needDeletedKey = allKeys.shift() as string;
  }
  allKeys.push(lastestKey);
  return needDeletedKey;
}

function isKeyMatched(key: string, limit: StringRegexList) {
  if (Array.isArray(limit)) {
    return limit.find(limitItem => isKeyMatched(key, limitItem));
  }
  if (typeof limit === 'string') {
    return limit.split(',').includes(key);
  }
  // instanceof 检查的是对象在当前执行环境下的原型链上是否存在该构造函数。
  // 如果在不同的执行环境（例如不同的 iframe 或 window）中创建了正则表达式对象，instanceof 可能不会返回 true
  if (Object.prototype.toString.call(limit) === '[object RegExp]') {
    return limit.test(key);
  }
  return false;
}

// 获取组件的key
function getComponentKey(children) {
  const { ref, is } = children.props;

  if (ref) return ref;

  // 处理is属性
  if (is) {
    // 如果is是函数,获取函数名
    if (typeof is === 'function') {
      return is.name || is.displayName;
    }
    return is;
  }

  // fallback到组件名
  return children?.type?.name;
}

export default function KeepAlive({ children, exclude, include, max = Number.MAX_SAFE_INTEGER }: KeepAliveProps) {
  const childrenMap = useRef(new Map()); // 缓存所有的组件节点
  const cachedChildrenKeys = useRef<string[]>([]); // 已经缓存的所有children节点的key的数组，按照激活事件由老到新排序。主要用于处理max场景下，有些移除最久没用的组件缓存
  const [currentChildrenKey, updateCurrentChildrenKey] = useState(null);

  const needCache = useMemo(() => {
    const key = getComponentKey(children);
    const isInInclude = !include || isKeyMatched(key, include);
    const isNotInExclude = !exclude || !isKeyMatched(key, exclude);
    return isInInclude && isNotInExclude && max !== 0;
  }, [children, include, exclude, max]);

  useEffect(() => {
    if (!children) {
      updateCurrentChildrenKey(null);
      return;
    }

    const key = getComponentKey(children);

    if (needCache) {
      if (key === currentChildrenKey) {
        return;
      }

      childrenMap.current.set(key, {
        key,
        children: children,
      });

      const needDeletedKey = updateCachedChildrenKeys(cachedChildrenKeys.current, key, max);
      if (needDeletedKey) {
        childrenMap.current.delete(needDeletedKey);
      }
    } else {
      childrenMap.current.delete(key);
    }

    updateCurrentChildrenKey(key);
  }, [children]);

  return (
    <>
      {Array.from(childrenMap.current.values()).map(({ children, key }) => {
        return <Keeper children={children} key={key} active={key === currentChildrenKey} />;
      })}
      {/* 挂载当前组件的节点 */}
      {needCache ? null : children}
    </>
  );
}
