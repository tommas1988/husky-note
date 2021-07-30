import Vue from 'vue';
import vuetify from './plugins/vuetify';
import App from './components/App.vue';
import '@mdi/font/css/materialdesignicons.css';

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')
