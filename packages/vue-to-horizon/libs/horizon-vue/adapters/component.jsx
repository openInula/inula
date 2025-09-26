import { registerComponent, GlobalComponent } from '@cloudsop/horizon-adapter';

export {
  /**
   *注册全局组件
   * @param {*} name
   * @param {*} conponent
   *
   *  registerComponent('aLazy',  React.lazy(() => import('./SomeComponent')))
   *  or....
   *  import a from './a.jsx'
   *  registerComponent('a', a)
   */
  registerComponent,
  /**
   * 全局加载组件
   * import GlobalComponent from 'adapters/component'
   * <GlobalComponent componentName={'You Registered component'}  {...props} />
   */
  GlobalComponent,
};
