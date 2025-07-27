/**
 *  系统默认会转换的全局库
 */
export const globalLibPaths = {
  vue: 'adapters/vueAdapter',
  'vue-router': 'adapters/routerAdapter',
  pinia: 'adapters/piniaAdapter',
  'vue-i18n': 'adapters/intlAdapter',
  vueAdapter: 'adapters/vueAdapter',
  vuex: {
    path: 'adapters/vuexAdapter',
    imports: {
      mapState: 'useMapState',
      mapGetters: 'useMapGetters',
      mapMutations: 'useMapMutations',
      mapActions: 'useMapActions',
    },
  },
  $t: 'adapters/intlAdapter',
  jquery: 'jquery',
  wdk: '@baize/wdk',
  horizon: '@cloudsop/horizon',
};

export const globalComponentConfig = {
  importPath: 'adapters/component.jsx',
  render: 'GlobalComponent',
};

export const globalComponent = {
  RouterLink: { default: {} },
  'router-link': { default: {} },
  RouterView: { default: {} },
  'router-view': { default: {} },
  GlobalComp: { default: {} }, // for testGlobalComponent
  AsyncComp: { default: {} }, // for testGlobalComponent
};

export const GlobalMethod = {
  $watch: '$watch',
  $emit: '$emit',
  $forceUpdate: '$forceUpdate',
  $nextTick: '$nextTick',
};
