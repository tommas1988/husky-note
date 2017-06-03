import { remote } from 'electron';
import { on as processOn } from 'process';
import ServiceLocator from './service-locator';
import { Editor } from './editor';
import { Event as NoteManagerEvent } from './note-manager';
import { NoteRenderer } from './note-renderer';
import { Notebook, Note } from './note';
import ViewManager from './view-manager';
import { Event as NotebookListViewEvent } from './views/notebook-list';
import commonCommands from './commands/common';
import { Event as ConfigEvent } from './config';

const { app, Menu } = remote;

export const APP_NAME = 'Husky Note';

export const enum NoteView {
    ReadMode = 1,
    EditMode,
    LivePreview,
};

interface INoteStatus {
    view: NoteView
}

// singleton App instance
let instance: App = null;

export class App {
    private _activeNote: Note;

    // TODO: use map and double linked list to implement open previous/next note
    // OR is there a better solutions??
    private _openNotes: Map<Note, INoteStatus> = new Map<Note, INoteStatus>();

    get activeNote(): Note {
        return this._activeNote;
    }

    static getInstance(): App {
        if (!instance) {
            instance = new App();
        }
        return instance;
    }

    private constructor() {
        // init handlers
        this._initViewHandlers();
        this._initNotebookHandlers();
        this._initNoteHandlers();
        this._initAppHandlers();

        // init application menu
        this._initAppMenu();
    }

    private _initViewHandlers() {
        // TODO: call app.openNote in NotebookListView and remove event ??
        // listen on select note event
        ViewManager.notebookList.on(NotebookListViewEvent.select_note, (selectedNote: Note, view: NoteView) => {
            this.openNote(selectedNote, view);
        });
    }

    private _initNotebookHandlers() {
        // cleanup open notes when note/notebook deleted
        ServiceLocator.noteManager.on(NoteManagerEvent.delete_notebook, (notebook: Notebook) => {
            let openNotes = this._openNotes;
            let containActiveNote = false;

            for (let note of notebook.notes.values()) {
                if (openNotes.has(note)) {
                    openNotes.delete(note);
                }
                if (note === this._activeNote) {
                    containActiveNote = true;
                }
            }

            if (containActiveNote) {
                // open orphan note
                this.execCommand('openOrphanNote');
            }
        });
    }

    private _initNoteHandlers() {
        ServiceLocator.noteManager.on(NoteManagerEvent.delete_note, (note: Note) => {
            if (this._openNotes.has(note)) {
                this._openNotes.delete(note);
            }

            if (note === this._activeNote) {
                // open orphan note
                this.execCommand('openOrphanNote');
            }
        });
    }

    private _initAppHandlers() {
        // uncaught exceptions
        processOn('uncaughtException', (e) => {
            ServiceLocator.alerter.fatal(e);
        });

        // prevent close window if there are unsaved notes
        window.onbeforeunload = (event) => {
            let manager = ServiceLocator.noteManager;
            for (let notebook of manager.notebooks.values()) {
                if (!notebook.hasChangedNotes) {
                    continue;
                }

                let response = ServiceLocator.dialog.messsageBox({
                    message: `Close ${APP_NAME} with unsaved notes?`,
                    detail: 'That will lose changes!',
                    defaultId: 1,
                    buttons: ['Close', 'Cancel']
                });

                if (response) { // cancel
                    event.returnValue = false;
                }
                return;
            }
        };

        let config = ServiceLocator.config;
        config.on(ConfigEvent.config_change, (name, newVal, oldVal) => {
            switch (name) {
                case 'debug':
                    ServiceLocator.alerter.info('__Reboot is needed__');
                    break;
            }
        });
    }

    private _initAppMenu() {
        const template: Electron.MenuItemOptions[] = [
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Read',
                        click: () => {
                            this.execCommand('readNote');
                        }
                    },
                    {
                        label: 'Edit',
                        click: () => {
                            this.execCommand('editNote');
                        }
                    },
                    {
                        label: 'Live Preview',
                        click: () => {
                            this.execCommand('livePreview');
                        }
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    { role: 'reload'},
                    { role: 'toggledevtools' },
                    {
                        label: 'About',
                        click: () => {
                            ServiceLocator.dialog.messsageBox({
                                type: 'info',
                                message: `${APP_NAME}`,
                                detail: `Version: ${app.getVersion()}`
                            });
                        }
                    }
                ],
            }
        ];

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }

    run() {
        let manager = ServiceLocator.noteManager;
        let orphanNote = manager.orphanNote;

        // load views
        ViewManager.load();

        if (!ServiceLocator.config.noteDir) {
            ServiceLocator.alerter.warn('No note directory is setted, __set it first!__');
        }

        manager.load();
        this.openNote(orphanNote, NoteView.LivePreview);
    }

    openNote(note: Note, view?: NoteView) {
        let mainView = ViewManager.main;
        let openNotes = this._openNotes;

        view = view ? view : (openNotes.has(note) ? openNotes.get(note).view : NoteView.ReadMode);
        switch (view) {
            case NoteView.ReadMode:
                mainView.reader.openNote(note);
                mainView.showReader();
                break;
            case NoteView.EditMode:
                mainView.showEditor();
                ServiceLocator.editor.edit(note).focus();
                break;
            case NoteView.LivePreview:
                mainView.reader.openNote(note);
                mainView.splitView();
                ServiceLocator.editor.edit(note).focus();
                break;
            default:
                throw new Error(`Unknown note view: ${view}`);
        }

        // remember open note view
        if (openNotes.has(note)) {
            openNotes.get(note).view = view;
        } else {
            openNotes.set(note, {
                view: view
            });
        }

        this._activeNote = note;
    }

    execCommand(command: string) {
        let parts = command.split('.');

        if (parts.length > 1) {
            if (parts[0] !== 'editor') {
                ServiceLocator.alerter.fatal(new Error(`Unkown command: ${command}`));
                return;
            }

            ServiceLocator.editor.execCommand(parts[1]);
            return;
        }

        if (!commonCommands[command]) {
            ServiceLocator.alerter.fatal(new Error(`Unkown command: ${command}`));
            return;
        }

        commonCommands[command]();
    }
}