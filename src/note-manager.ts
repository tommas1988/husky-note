import { sep as pathSep } from 'path';
import { ipcRenderer, ipcMain } from 'electron';
import { EventEmitter } from 'events';
import { readJson, writeJson, remove, move, exists } from 'fs-promise';
import { existsSync } from 'fs';
import { Notebook, Note } from './note';
import { Event as ConfigEvent } from './config';
import ServiceLocator from './service-locator';
import { isRendererProcess, checkMainProcess } from './utils';
import { Git } from './git';

type NoteIndex = { [notebook: string]: string[] };

const IpcEvent = {
    reload: 'ipc:note-manager:reload',
    sync: 'ipc:note-manager:sync'
};

export const Event = {
    reload: 'note-manager:reload',
    loaded: 'note-manager:loaded',

    // create notebook events
    create_notebook: 'note-manager:create-notebook',
    notebook_created: 'note-manager:notebook-created',
    create_notebook_failed: 'note-manager:create-notebook-failed',

    // create note events
    create_note: 'note-manager:create-note',
    note_created: 'note-manager:note-created',
    create_note_failed: 'note-manager:create-note-failed',

    // rename notebook events
    rename_notebook: 'note-manager:rename-notebook',
    notebook_renamed: 'note-manager:notebook-renamed',
    rename_notebook_failed: 'note-manager:rename-notebook-failed',

    // rename note events;
    rename_note: 'note-manager:rename-note',
    note_renamed: 'note-manager:note-renamed',
    rename_note_failed: 'note-manager:rename-note-failed',

    // delete notebook events
    delete_notebook: 'note-manager:delete-notebook',
    notebook_deleted: 'note-manager:notebook-deleted',
    delete_notebook_failed: 'note-manager:delete-notebook-failed',

    // delete note events
    delete_note: 'note-manager:delete-note',
    note_deleted: 'note-manager:note-deleted',
    delete_note_failed: 'note-manager:delete-note-failed',

    // save note events
    note_saved: 'note-manager:note-saved',
    save_note_failed: 'note-manager:save-note-failed',
};

export class NoteManager extends EventEmitter {
    // Notes structure
    private _notebooks: Map<string, Notebook>;

    private _orphanNote: Note;
    // base directory to store notes
    private _basedir: string;

    get notebooks(): Map<string, Notebook> {
        return this._notebooks;
    }

    get orphanNote(): Note {
        if (!this._orphanNote || this._orphanNote.notebook) { // undefined or no longer a orphan
            // TODO: need a orphan note name ??
            let note = new Note('');
            note.content = '';
            this._orphanNote = note;
        }
        return this._orphanNote;
    }

    get basedir(): string {
        let basedir = this._basedir
        if (!basedir) {
            throw new Error('Note directory is not set');
        }
        return basedir;
    }

    constructor() {
        super();

        if (isRendererProcess) {
            this._initFromRenderer();
        } else {
            this._initFromMain();
        }
    }

    private _initFromRenderer() {
        this._notebooks = new Map<string, Notebook>();

        let config = ServiceLocator.config;
        this._basedir = config.noteDir;

        ipcRenderer.on(IpcEvent.reload, () => {
            this.load();
        });

        config.on(ConfigEvent.change, (name, newVal, oldVal) => {
            if (name !== 'noteDir') {
                return;
            }

            // first time set note directory
            if (!oldVal) {
                // update basedir
                this._basedir = newVal;
                this.load();
            } else {
                // TODO: check if index file exists, and merge two index file
                // move notes
                this._move(newVal);
            }
        });
    }

    private _initFromMain() {
        ipcMain.on(IpcEvent.sync, (event) => {
            this.sync(event.sender);
        });
    }

    sync(sender?: Electron.WebContents) {
        if (isRendererProcess) {
            ipcRenderer.send(IpcEvent.sync);
            return;
        }

        this.archive();

        let git = ServiceLocator.git;
        git.pull();
        git.push();

        if (sender) {
            sender.send(IpcEvent.reload);
        }
    }

    /**
     * Could only by called in main process
     */
    archive() {
        checkMainProcess();

        let git = ServiceLocator.git;
        git.status().then((files) => {
            if (files.length) {
                git.addAll();
                git.commit();
            }
        });
    }

    load() {
        let indexFile = this._getIndexFile();

        // not select note directory yet
        if (!indexFile) {
            return;
        }

        exists(indexFile).then((exists: boolean) => {
            if (!exists) {
                throw new Error(`Index file: ${indexFile} not exists`);
            }
            return readJson(indexFile);
        }).then((index: NoteIndex) => {
            let isReload = this._notebooks.size ? true : false;
            let notes = new Map<string, Notebook>();

            for (let notebookName in index) {
                let notebook = new Notebook(notebookName);
                index[notebookName].forEach((noteName) => {
                    notebook.notes.set(noteName, new Note(noteName, notebook));
                });
                notes.set(notebookName, notebook);
            }
            this._notebooks = notes;

            // emit loaded or reload event
            if (isReload) {
                this.emit(Event.reload);
            } else {
                this.emit(Event.loaded);
            }
        }).catch((e) => {
            throw e;
        });
    }

    private _getIndexFile(): string {
        let basedir = this._basedir;

        if (!basedir) {
            return '';
        }
        return `${basedir}${pathSep}.note-index.json`;
    }

    private _move(newDir: string) {
        move(this._basedir, newDir).then(() => {
            this._basedir = newDir;
        }).catch((e) => {
            throw new Error(`Cannot move notes from ${this._basedir} to ${newDir}`);
        });
    }

    createNotebook(name: string): Notebook {
        if (!name) {
            throw new Error('Empty notebook name');
        } else if (this._notebooks.has(name)) {
            throw new Error(`Notebook: ${name} already exists`);
        } else if (!this._basedir) {
            throw new Error('No note directory is setted');
        }

        let notebook = new Notebook(name);
        this._notebooks.set(name, notebook);

        // emit create notebook event
        this.emit(Event.create_notebook, notebook);

        this._save().catch((e) => {
            // TODO: do some clean work
            this.emit(Event.create_notebook_failed, notebook);
            ServiceLocator.alerter.fatal(`__Reload Needed!!!__ ${e.message}`);
        });

        return notebook;
    }

    createNote(name: string, notebook: Notebook, fromOrphan: boolean = false): Note {
        if (!name) {
            throw new Error('Empty note name');
        } else if (notebook.notes.has(name)) {
            throw new Error(`Note: ${name} already exists`);
        }

        let note;
        if (fromOrphan) {
            note = this._orphanNote;
            note.notebook = notebook;
            note.name = name;
        } else {
            note = new Note(name, notebook);
            // if note is note exists on the disk, set content to empty
            if (!existsSync(note.filename)) {
                note.content = '';
            }
        }

        notebook.notes.set(name, note);

        // emit create note event
        this.emit(Event.create_note, note);

        this._save().catch((e) => {
            // TODO: do some clean work
            this.emit(Event.create_note_failed, note);
            ServiceLocator.alerter.fatal(`__Reload Needed!!!__ ${e.message}`);
        });

        return note;
    }

    renameNotebook(newName: string, notebook: Notebook): Notebook {
        if (notebook.hasChangedNotes) {
            throw new Error(`Cannot rename notebook: ${notebook.name} cause there some unsaved notes`);
        }

        let oldName = notebook.name;
        let notebooks = this._notebooks;

        notebook.rename(newName).then(() => {
            return this._save();
        }).then(() => {
            this.emit(Event.notebook_renamed, notebook);
        }).catch((e) => {
            // TODO: do some clean work
            this.emit(Event.rename_notebook_failed, oldName, notebook);
            ServiceLocator.alerter.fatal(`__Restore Manually Needed!!!__ ${e.message}`);
        });

        notebooks.set(newName, notebook);
        notebooks.delete(oldName);

        // emit rename notebook event
        this.emit(Event.rename_notebook, notebook);
        return notebook;
    }

    renameNote(newName: string, note: Note): Note {
        if (note.changed) {
            throw new Error(`Cannot rename unsaved note: _${note.name}_`);
        }

        let oldName = note.name;
        let notes = note.notebook.notes;

        note.rename(newName).then(() => {
            return this._save();
        }).then(() => {
            this.emit(Event.note_renamed, note);
        }).catch((e) => {
            // TODO: do some clean work
            this.emit(Event.rename_note_failed, newName, note);
            ServiceLocator.alerter.fatal(`__Restore Manually Needed!!!__ ${e.message}`);
        });

        notes.set(newName, note);
        notes.delete(oldName);

        // emit rename note event
        this.emit(Event.rename_note, note);
        return note;
    }

    deleteNotebook(notebook: Notebook) {
        // emit delete notebook event
        this.emit(Event.delete_notebook, notebook);

        remove(notebook.pathname).then(() => {
            notebook.notes.clear();
            this._notebooks.delete(notebook.name);
            return this._save();
        }).then(() => {
            this.emit(Event.notebook_deleted, notebook);
        }).catch((e) => {
            // TODO: do some clean work
            this.emit(Event.delete_notebook_failed, notebook);
            ServiceLocator.alerter.fatal(`__Restore Manually Needed!!!__ ${e.message}`);
        });
    }

    deleteNote(note: Note) {
        // emit delete note event
        this.emit(Event.delete_note, note);

        remove(note.filename).then(() => {
            note.notebook.notes.delete(note.name);
            return this._save();
        }).then(() => {
            this.emit(Event.note_deleted, note);
        }).catch((e) => {
            // TODO: do some clean work
            this.emit(Event.delete_note_failed, note);
            ServiceLocator.alerter.fatal(`__Restore Manually Needed!!!__ ${e.message}`);
        });
    }

    private _save(): Promise<void> {
        let indexFile = this._getIndexFile();

        if (!indexFile) {
            return new Promise<void>(() => {
                throw new Error('No note directory is setted');
            });
        }

        let promise = new Promise<NoteIndex>((resolve, reject) => {
            let raw: NoteIndex = {};
            let notebooks = this._notebooks;
            for (let notebook of notebooks.values()) {
                let notes: string[] = [];
                for (let noteName of notebook.notes.keys()) {
                    notes.push(noteName);
                }
                raw[notebook.name] = notes.sort();
            }

            let ordered: NoteIndex = {};
            Object.keys(raw).sort().forEach((notebookName) => {
                ordered[notebookName] = raw[notebookName];
            });

            resolve(ordered);
        });

        return promise.then((index: NoteIndex) => {
            return writeJson(indexFile, index, { flag: 'w' });
        });
    }
}
