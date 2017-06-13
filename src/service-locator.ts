import { Editor } from './editor';
import { NoteManager } from './note-manager';
import { NoteRenderer } from './note-renderer';
import { Alerter } from './alerter';
import { Config } from './config';
import { Dialog } from './dialog';
import { Git } from './git';
import { checkRendererProcess, checkMainProcess } from './utils';

let config: Config;
let editor: Editor;
let noteManager: NoteManager;
let noteRenderer: NoteRenderer;
let alerter: Alerter;
let dialog: Dialog;
let git: Git;

const ServiceLocator = {
    get config(): Config {
        if (!config) {
            config = new Config();
        }
        return config;
    },

    get editor(): Editor {
        checkRendererProcess();

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
        checkRendererProcess();

        if (!noteRenderer) {
            noteRenderer = new NoteRenderer();
        }
        return noteRenderer;
    },

    get alerter(): Alerter {
        checkRendererProcess();

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
    },

    get git(): Git {
        checkMainProcess();

        if (!git) {
            let GitClass: typeof Git = require('./git');
            git = new GitClass(this.config.noteDir, this.config.git);
        }
        return git;
    },
};

export default ServiceLocator;