import { createApp } from 'horizon-vue'; //here original function is replaced with adapter!
import App from 'App.vue';
import i18n from './i18n';

const app = createApp(App); //createst global object
app.use(i18n); //attaches plugin to global object
app.mount('#app'); //renders and mounts root
