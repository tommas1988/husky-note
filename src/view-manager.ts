import { HeaderView } from './views/header';
import { NotebookListView } from './views/notebook-list';
import { MainView } from './views/main';
import { MessageView } from './views/message';
import { SettingsView } from './views/settings';
import { ModalView } from './views/modal';

let header: HeaderView;
let notebookList: NotebookListView;
let main: MainView;
let message: MessageView;
let settings: SettingsView;
let modal: ModalView;

const ViewManager = {
    get header(): HeaderView {
        if (!header) {
            header = new HeaderView();
        }
        return header;
    },

    get notebookList(): NotebookListView {
        if (!notebookList) {
            notebookList = new NotebookListView();
        }
        return notebookList;
    },

    get main(): MainView {
        if (!main) {
            main = new MainView();
        }
        return main;
    },

    get message(): MessageView {
        if (!message) {
            message = new MessageView;
        }
        return message;
    },

    get settings(): SettingsView {
        if (!settings) {
            settings = new SettingsView();
        }
        return settings;
    },

    get modal(): ModalView {
        if (!modal) {
            modal = new ModalView();
        }
        return modal;
    },

    load() {
        Object.getOwnPropertyNames(this).forEach((name: string) => {
            if (name !== 'load') {
                this[name].init();
            }
        });
    }
};

export default ViewManager;