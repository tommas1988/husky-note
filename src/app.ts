import Vue from 'vue';
import vuetify from './plugins/vuetify';
import 'vuetify/dist/vuetify.min.css'
import App from './components/App.vue';
import '@mdi/font/css/materialdesignicons.css';
import { readFile } from 'fs';
import { instance as Notebook } from './notebook';
import { Keymap } from './keymap'

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')


// notebook config file
const note_meta_filename = '.husky.json';
const notebookConfigFile = `./test/notebook/${note_meta_filename}`;
readFile(notebookConfigFile, 'utf8', (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    let config = JSON.parse(data);
    Notebook.load(config.notes);
});

// app setting file

// keymap
const keymap = new Keymap();
let keymapConfigFile = './test/settings/keymap/emacs.json';
readFile(keymapConfigFile, 'utf8', (err, data) => {
    let keybindings = JSON.parse(data);
    keymap.config(keybindings);
});

document.body.onkeyup = (e: KeyboardEvent) => {
    keymap.handleEvent(e);
};
