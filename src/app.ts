import Vue from 'vue';
import vuetify from './plugins/vuetify';
import 'vuetify/dist/vuetify.min.css'
import App from './components/App.vue';
import '@mdi/font/css/materialdesignicons.css';
import { readFileSync } from 'fs';
import { instance as Notebook } from './notebook';

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')

const testDir = './test/notebook/';
const note_meta_filename = '.husky.json';
let content = readFileSync(`${testDir}/${note_meta_filename}`, {
  encoding: 'utf8'
});
let config = JSON.parse(content);

Notebook.load(config.notes);