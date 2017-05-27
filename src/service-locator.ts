import { Editor } from './editor';
import { NoteManager } from './note-manager';
import { NoteRenderer } from './note-renderer';
import { Alerter } from './alerter';
import { Config } from './config';
import { Dialog } from './dialog';
import ViewManager from './view-manager';

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
        if (!noteRenderer) {
            noteRenderer = new NoteRenderer();
        }
        return noteRenderer;
    },

    get alerter(): Alerter {
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