import store from './index';

let installed = false;

function hideLoading(oMsg) {
  store.commit(removeLoadingMsg, oMsg);
}

export default {
  install(app) {
    if (installed) {
      return;
    }
    installed = true;
    // We need to decide how this can be processed to implement custom global functions
    app.config.globalProperties.$hideLoading = hideLoading;
    // Should we do something like this?
    import { registerGlobal } from 'inula-vue';
    registerGlobal('$hideLoading', hideLoading);
  },
};
