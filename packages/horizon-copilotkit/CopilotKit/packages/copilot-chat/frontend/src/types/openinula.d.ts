declare module 'react/jsx-runtime' {
  export * from 'openinula/jsx-runtime';
}

declare module 'react' {
  export * from 'openinula';
  export { default } from 'openinula';
}

declare module 'react-dom' {
  export * from 'openinula';
}

declare module 'react-dom/client' {
  export * from 'openinula/client';
}

// 扩展全局类型以支持 openinula
declare global {
  namespace JSX {
    interface Element extends Inula.InulaElement<any, any> {}
    interface ElementClass extends Inula.Component<any, any> {}
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements extends Inula.IntrinsicElements {}
  }
}