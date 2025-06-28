import {
  ComponentType,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  createElement,
  vueReactive,
} from 'openinula';
import { useDirectives } from './globalAPI';

const { useInstance } = vueReactive;

/**
 * Vue写法：<div v-click-outside:foo.bar="closePopup" v-focus class="popup">
 * Inula写法：
 * <DirectiveComponent
 *   componentName={'div'}
 *   directives={[
 *     {
 *       name: 'click-outside',
 *       arg: 'foo',
 *       modifiers: { bar: true },
 *       value: closePopup,
 *     },
 *     {
 *       name: 'focus',
 *     },
 *   ]}
 *   class="popup"
 * >
 *   <div>child</div>
 * </DirectiveComponent>
 *
 * @param props 组件属性
 */

interface DirectiveBinding {
  value?: any;
  oldValue?: any;
  arg?: string;
  modifiers?: Record<string, boolean>;
}

export interface Directive {
  bind?: (el: HTMLElement, binding: DirectiveBinding) => void;
  inserted?: (el: HTMLElement, binding: DirectiveBinding) => void;
  update?: (el: HTMLElement, binding: DirectiveBinding) => void;
  componentUpdated?: (el: HTMLElement, binding: DirectiveBinding) => void;
  unbind?: (el: HTMLElement, binding: DirectiveBinding) => void;
  beforeMount?: (el: HTMLElement, binding: DirectiveBinding) => void;
  mounted?: (el: HTMLElement, binding: DirectiveBinding) => void;
  updated?: (el: HTMLElement, binding: DirectiveBinding) => void;
  beforeUnmount?: (el: HTMLElement, binding: DirectiveBinding) => void;
  unmounted?: (el: HTMLElement, binding: DirectiveBinding) => void;
}

interface DirectiveComponentProps {
  children?: any;
  componentName: string | ComponentType<any>;
  directives: {
    name: string;
    value?: any;
    oldValue?: any;
    arg?: string;
    modifiers?: Record<string, boolean>;
  }[];
  registerDirectives?: Record<string, Directive>;

  [key: string]: any;
}

export function DirectiveComponent(props: DirectiveComponentProps) {
  const { children, componentName, directives, registerDirectives, ...rest } = props;
  const appDirectives = useDirectives();
  const instance = useInstance();

  useLayoutEffect(() => {
    applyDirectives('beforeMount', directives);
    applyDirectives('mounted', directives);
    applyDirectives('bind', directives);
    return () => {
      applyDirectives('beforeUnmount', directives);
      applyDirectives('unmounted', directives);
      applyDirectives('unbind', directives);
    };
  }, []);

  useEffect(() => {
    applyDirectives('updated', directives);
    applyDirectives('update', directives);
    applyDirectives('componentUpdated', directives);
  });

  const prevDirectiveValues: Record<string, any> = useMemo(() => ({}), []);
  const applyDirectives = useCallback((hook: keyof Directive, directives) => {
    directives.forEach(directive => {
      const { name, value, arg, modifiers } = directive;
      const oldValue = prevDirectiveValues[name];
      prevDirectiveValues[name] = value;

      let directiveObj: Directive = {};
      if (registerDirectives && registerDirectives[name]) {
        directiveObj = registerDirectives[name];
      } else {
        directiveObj = appDirectives[name];
      }

      if (directiveObj && directiveObj[hook]) {
        directiveObj[hook]!(instance['$el']!, { value, oldValue, arg, modifiers });
      }
    });
  }, []);

  return createElement(
    componentName,
    {
      ...rest,
    },
    children
  );
}

DirectiveComponent.__internal_comp_tag = 'DirectiveComponent';
