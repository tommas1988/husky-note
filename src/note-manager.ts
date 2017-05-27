import { sep as pathSep } from 'path';
import { ipcRenderer as ipc } from 'electron';
import { EventEmitter } from 'events';
import { readJson, writeJson, remove, move, exists } from 'fs-promise';
import { existsSync } from 'fs';
import { Notebook, Note } from './note';
import { Config } from './config';
import ServiceLocator from './service-locator';

type Index = { [notebook: string]: string[] };

export class NoteManager extends EventEmitter {
    static EVENT_RELOAD = 'note-manager:reload';
    static EVENT_LOADED = 'note-manager:loaded';

    // create notebook events
    static EVENT_CREATE_NOTEBOOK = 'note-manager:create-notebook';
    static EVENT_NOTEBOOK_CREATED = 'note-manager:notebook-created';
    static EVENT_CREATE_NOTEBOOK_FAILED = 'note-manager:create-notebook-failed';

    // create note events
    static EVENT_CREATE_NOTE = 'note-manager:create-note';
    static EVENT_NOTE_CREATED = 'note-manager:note-created';
    static EVENT_CREATE_NOTE_FAILED = 'note-manager:create-note-failed';

    // rename notebook events
    static EVENT_RENAME_NOTEBOOK = 'note-manager:rename-notebook';
    static EVENT_NOTEBOOK_RENAMED = 'note-manager:notebook-renamed';
    static EVENT_RENAME_NOTEBOOK_FAILED = 'note-manager:rename-notebook-failed';

    // rename note events;
    static EVENT_RENAME_NOTE = 'note-manager:rename-note';
    static EVENT_NOTE_RENAMED = 'note-manager:note-renamed';
    static EVENT_RENAME_NOTE_FAILED = 'note-manager:rename-note-failed';

    // delete notebook events
    static EVENT_DELETE_NOTEBOOK = 'note-manager:delete-notebook';
    static EVENT_NOTEBOOK_DELETED = 'note-manager:notebook-deleted';
    static EVENT_DELETE_NOTEBOOK_FAILED = 'note-manager:delete-notebook-failed';

    // delete note events
    static EVENT_DELETE_NOTE = 'note-manager:delete-note';
    static EVENT_NOTE_DELETED = 'note-manager:note-deleted';
    static EVENT_DELETE_NOTE_FAILED = 'note-manager:delete-note-failed';

    // save note events
    static EVENT_NOTE_SAVED = 'note-manager:note-saved';
    static EVENT_SAVE_NOTE_FAILED = 'note-manager:save-note-failed';

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

        this._notebooks = new Map<string, Notebook>();

        let config = ServiceLocator.config;
        this._basedir = config.noteDir;

        // TODO: IPC reload event should defined in NoteManager
        ipc.on(NoteManager.EVENT_RELOAD, () => {
            this.load();
        });

        config.on(Config.EVENT_CONFIG_CHANGE, (name, newVal, oldVal) => {
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
        }).then((index: Index) => {
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
                this.emit(NoteManager.EVENT_RELOAD);
            } else {
                this.emit(NoteManager.EVENT_LOADED);
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
        this.emit(NoteManager.EVENT_CREATE_NOTEBOOK, notebook);

        this._save().catch((e) => {
            // TODO: do some clean work
            this.emit(NoteManager.EVENT_CREATE_NOTEBOOK_FAILED, notebook);
            e.message = `__Reload Needed!!!__ ${e.message}`;
            ServiceLocator.alerter.fatal(e);
        });

        return notebook;
    }

    createNote(name: string, notebook: Notebook): Note {
        if (!name) {
            throw new Error('Empty note name');
        } else if (notebook.notes.has(name)) {
            throw new Error(`Note: ${name} already exists`);
        }

        let note = new Note(name, notebook);

        // if note is note exists on the disk, set content to empty
        if (!existsSync(note.filename)) {
            note.content = '';
        }
        notebook.notes.set(name, note);

        // emit create note event
        this.emit(NoteManager.EVENT_CREATE_NOTE, note);

        this._save().catch((e) => {
            // TODO: do some clean work
            this.emit(NoteManager.EVENT_CREATE_NOTE_FAILED, note);
            e.message = `__Reload Needed!!!__ ${e.message}`;
            ServiceLocator.alerter.fatal(e);
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
            this.emit(NoteManager.EVENT_NOTEBOOK_RENAMED, notebook);
        }).catch((e) => {
            // TODO: do some clean work
            this.emit(NoteManager.EVENT_RENAME_NOTEBOOK_FAILED, oldName, notebook);
            e.message = `__Restore Manually Needed!!!__ ${e.message}`;
            ServiceLocator.alerter.fatal(e);
        });

        notebooks.set(newName, notebook);
        notebooks.delete(oldName);

        // emit rename notebook event
        this.emit(NoteManager.EVENT_RENAME_NOTEBOOK, notebook);
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
            this.emit(NoteManager.EVENT_NOTE_RENAMED, note);
        }).catch((e) => {
            // TODO: do some clean work
            this.emit(NoteManager.EVENT_RENAME_NOTE_FAILED, newName, note);
            e.message = `__Restore Manually Needed!!!__ ${e.message}`;
            ServiceLocator.alerter.fatal(e);
        });

        notes.set(newName, note);
        notes.delete(oldName);

        // emit rename note event
        this.emit(NoteManager.EVENT_RENAME_NOTE, note);
        return note;
    }

    deleteNotebook(notebook: Notebook) {
        // emit delete notebook event
        this.emit(NoteManager.EVENT_DELETE_NOTEBOOK, notebook);

        remove(notebook.pathname).then(() => {
            notebook.notes.clear();
            this._notebooks.delete(notebook.name);
            return this._save();
        }).then(() => {
            this.emit(NoteManager.EVENT_NOTEBOOK_DELETED, notebook);
        }).catch((e) => {
            // TODO: do some clean work
            this.emit(NoteManager.EVENT_DELETE_NOTEBOOK_FAILED, notebook);
            e.message = `__Restore Manually Needed!!!__ ${e.message}`;
            ServiceLocator.alerter.fatal(e);
        });
    }

    deleteNote(note: Note) {
        // emit delete note event
        this.emit(NoteManager.EVENT_DELETE_NOTE, note);

        remove(note.filename).then(() => {
            note.notebook.notes.delete(note.name);
            return this._save();
        }).then(() => {
            this.emit(NoteManager.EVENT_NOTE_DELETED, note);
        }).catch((e) => {
            // TODO: do some clean work
            this.emit(NoteManager.EVENT_DELETE_NOTE_FAILED, note);
            e.message = `__Restore Manually Needed!!!__ ${e.message}`;
            ServiceLocator.alerter.fatal(e);
        });
    }

    private _save(): Promise<void> {
        let indexFile = this._getIndexFile();

        if (!indexFile) {
            return new Promise<void>(() => {
                throw new Error('No note directory is setted');
            });
        }

        let promise = new Promise<Index>((resolve, reject) => {
            let raw: Index = {};
            let notebooks = this._notebooks;
            for (let notebook of notebooks.values()) {
                let notes: string[] = [];
                for (let noteName of notebook.notes.keys()) {
                    notes.push(noteName);
                }
                raw[notebook.name] = notes.sort();
            }

            let ordered: Index = {};
            Object.keys(raw).sort().forEach((notebookName) => {
                ordered[notebookName] = raw[notebookName];
            });

            resolve(ordered);
        });

        return promise.then((index: Index) => {
            return writeJson(indexFile, index);
        });
    }
}