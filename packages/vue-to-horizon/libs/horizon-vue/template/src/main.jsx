import horizon from '@cloudsop/horizon';
import App from '../convert/App';
import 'element-theme-default';
import {init} from './utils/helper';
import {createApp, defineAsyncComponent} from '../adapters/vueAdapter';
import {createPinia} from '../adapters/piniaAdapter';
// import store from '../convert/testVuex/store/store';
// import GlobalPropertiesPlugin from '../convert/testGlobalProperties/GlobalPropertiesPlugin'

window.horizon = horizon;
init();

const app = createApp(<App/>);
// app.use(store);
app.use(createPinia());

app.component('GlobalComp', (props) => {
  return <div>{props.text}</div>
});

app.component('AsyncComp', defineAsyncComponent(() => import(`../convert/testDefineAsyncComp/AsyncComponent.jsx`)));

app.directive(
  'app-click-outside', {
    beforeMount(el, binding, vnode) {
      el.event = function (event) {
        if (!(el == event.target || el.contains(event.target))) {
          binding.value(event, el);
        }
      };
      document.body.addEventListener('click', el.event);
    },
    unmounted(el) {
      document.body.removeEventListener('click', el.event);
    },
  },
)

// app.use(GlobalPropertiesPlugin);
app.mount('#app');


