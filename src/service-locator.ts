import { Editor } from './editor';
import { NoteManager } from './note-manager';
import { NoteRenderer } from './note-renderer';
import { Alerter } from './alerter';
import { Config } from './config';
import { Dialog } from './dialog';
import { isMainProcess } from './utils';

let config: Config;
let editor: Editor;
let noteManager: NoteManager;
let noteRenderer: NoteRenderer;
let alerter: Alerter;
let dialog: Dialog;

const ServiceLocator = {
    get config(): Config {
        if (!config) {
            config = new Config();
        }
        return config;
    },

    get editor(): Editor {
        if (isMainProcess) {
            return;
        }

        if (!editor) {
            editor = new Editor();
        }
        return editor;
    },

    get noteManager(): NoteManager {
        if (!noteManager) {
            noteManager = new NoteManager();
        }
        return noteManager;
    },

    get noteRenderer(): NoteRenderer {
        if (isMainProcess) {
            return;
        }

        if (!noteRenderer) {
            noteRenderer = new NoteRenderer();
        }
        return noteRenderer;
    },

    get alerter(): Alerter {
        if (isMainProcess) {
            return;
        }

        if (!alerter) {
            alerter = new Alerter();
        }
        return alerter;
    },

    get dialog(): Dialog {
        if (!dialog) {
            dialog = new Dialog();
        }
        return dialog;
    }
};

export default ServiceLocator;