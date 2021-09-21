import Vue from 'vue';
import vuetify from './plugins/vuetify';
import 'vuetify/dist/vuetify.min.css'
import App from './components/App.vue';
import '@mdi/font/css/materialdesignicons.css';
import { readFile } from 'fs';
import { instance as Notebook } from './notebook';
import { Keymap } from './keymap'
import { manager as ContextManager, GLOBAL_CONTEXT_NAME } from './context';
import RuntimeMessage from './runtimeMessage';

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

document.body.onkeydown = (e: KeyboardEvent) => {
    Keymap.INSTANCE.handleEvent(e);
};

document.body.onclick = (e: MouseEvent) => {
    ContextManager.setActiveContext(GLOBAL_CONTEXT_NAME);
};

// prevent 'all selection'
document.onselectstart = () => {
    return false;
}

RuntimeMessage.onError((err) => {
    console.log(err);
});