import { ChildrenType, Component, Memo, useEffect, useRef } from '@cloudsop/horizon';
import { inject, provide } from './injectProvide';

type StringRegexList = String | RegExp | (String | RegExp)[];

interface KeepAliveProps {
  children?: ChildrenType;
  max?: number;
  include?: StringRegexList;
  exclude?: StringRegexList;
}

interface ComponentData {
  component: () => Component;
  timestamp: number;
}

export function onActivated(listener: () => void): () => void {
  const listeners = inject('onActivatedListeners');
  const key = inject('keep-alive-key');

  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }

  listeners.get(key).add(listener);

  return () => {
    const listeners = inject('onActivatedListeners');
    const key = inject('keep-alive-key');

    listeners.get(key).delete(listener);
  };
}

export function onDeactivated(listener: () => void): () => void {
  const listeners = inject('onDeactivatedListeners');
  const key = inject('keep-alive-key');

  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }

  listeners.get(key).add(listener);

  return () => {
    const listeners = inject('onDeactivatedListeners');
    const key = inject('keep-alive-key');

    listeners.get(key).delete(listener);
  };
}

function checkInclude(name: string, whitelist?: StringRegexList, blacklist?: StringRegexList): boolean {
  if (blacklist) {
    if (!Array.isArray(blacklist)) {
      blacklist = [blacklist];
    }
    for (let i = 0; i < blacklist.length; i++) {
      if (typeof blacklist[i] === 'string') {
        const keys = (blacklist[i] as string).split(/,\s*/g);
        for (let j = 0; j < keys.length; j++) {
          if (name === keys[j]) return false;
        }
      } else if (blacklist[i] instanceof RegExp) {
        if ((blacklist[i] as RegExp).exec(name)) return false;
      }
    }
  }

  if (whitelist) {
    if (!Array.isArray(whitelist)) {
      whitelist = [whitelist];
    }
    for (let i = 0; i < whitelist.length; i++) {
      if (typeof whitelist[i] === 'string') {
        const keys = (whitelist[i] as string).split(/,\s*/g);
        for (let j = 0; j < keys.length; j++) {
          if (name === keys[j]) return true;
        }
      } else if (whitelist[i] instanceof RegExp) {
        if ((whitelist[i] as RegExp).exec(name)) return true;
      }
    }
    return false;
  }

  return true;
}

export const KeepAlivePro = ({ children, max = Infinity, include, exclude }: KeepAliveProps) => {
  let componentData, activeComponent;
  const componentCache = useRef(new Map<string, ComponentData>());
  let searchComponent = Array.isArray(children) ? children[0] : children;
  const componentName = searchComponent.props.ref || searchComponent.props.is?.name;
  const onActivatedListeners = useRef(new Map());
  const onDeactivatedListeners = useRef(new Map<string, () => {}>());
  provide('onActivatedListeners', onActivatedListeners.current);
  provide('onDeactivatedListeners', onDeactivatedListeners.current);

  useEffect(() => {
    // deactivate active components
    return () => {
      Array.from(componentCache.current.entries()).forEach(([name, data]) => {
        provide('keep-alive-key', name);
        if (componentName === name) {
          const listeners: Set<() => {}> = inject('onDeactivatedListeners').get(name);
          if (!listeners) return;
          Array.from(listeners).forEach(listener => {
            listener();
          });
        }
      });
    };
  });

  const shouldInclude = checkInclude(componentName, include, exclude);

  if (shouldInclude) {
    if (componentCache.current.has(componentName)) {
      componentData = componentCache.current.get(componentName);
      activeComponent = componentData.component;
      componentData.timestamp = Date.now();
    } else {
      if (componentCache.current.size >= max) {
        let minKey = '';
        let minTimestamp = Infinity;

        for (let [key, value] of componentCache.current) {
          if (value.timestamp < minTimestamp) {
            minTimestamp = value.timestamp;
            minKey = key;
          }
        }

        if (minKey !== null) {
          componentCache.current.delete(minKey);
        }
      }

      componentCache.current.set(componentName, {
        timestamp: Date.now(),
        component: searchComponent,
      });
      activeComponent = componentCache.current.get(componentName);
    }
  }
  return (
    <>
      {Array.from(componentCache.current.entries()).map(([name, data]) => {
        provide('keep-alive-key', name);
        if (componentName === name) {
          setTimeout(() => {
            const listeners: Set<() => {}> = inject('onActivatedListeners').get(name);
            if (!listeners) return;
            Array.from(listeners).forEach(listener => {
              listener();
            });
          }, 1);
        }
        return <div style={componentName === name ? {} : { display: 'none' }}>{data.component}</div>;
      })}
      {shouldInclude ? [] : <div>{searchComponent}</div>}
    </>
  );
};
