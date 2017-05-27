import { sep as pathSep } from 'path';
import { readFileSync } from 'fs';
import { ensureFile, writeFile, rename } from 'fs-promise';
import * as CodeMirror from 'codemirror';
import ServiceLocator from './service-locator';
import { NoteManager } from './note-manager';

const CONVERT_NAME_REG = /[/\\:?"<>| ]/g;

function getNoteDirname(notebook: string): string {
    return `${ServiceLocator.noteManager.basedir}${pathSep}${notebook.toLocaleLowerCase().replace(CONVERT_NAME_REG, '-')}`;
}

function getNoteFilename(notebook: string, note: string): string {
    return `${getNoteDirname(notebook)}${pathSep}${note.toLocaleLowerCase().replace(CONVERT_NAME_REG, '-')}.md`;
}

function getNoteContents(note: Note): string {
    let noteFile = getNoteFilename(note.notebook.name, note.name);

    return readFileSync(noteFile, {
        encoding: 'utf8'
    });
}

export class Notebook {
    notes: Map<string, Note>;

    private _name: string;

    get name(): string {
        return this._name;
    }

    get pathname(): string {
        return getNoteDirname(this._name);
    }

    get hasChangedNotes(): boolean {
        for (let note of this.notes.values()) {
            if (note.changed) {
                return true;
            }
        }
        return false;
    }

    constructor(name: string) {
        this._name = name;
        this.notes = new Map<string, Note>();
    }

    rename(newName: string): Promise<void> {
        if (!newName) {
            throw new Error('Empty notebook name');
        }

        let oldName = this.name;
        this._name = newName;

        return rename(getNoteDirname(oldName), getNoteDirname(newName));
    }
}

export class Note {
    notebook: Notebook;

    private _name: string;
    private _content: string;
    private _doc: CodeMirror.Doc;
    private _changed: boolean;

    get name(): string {
        return this._name;
    }

    get content(): string {
        if (this._doc) {
            return this._doc.getValue();
        }

        if (typeof this._content === 'undefined') {
            this._content = getNoteContents(this);
        }
        return this._content;
    }

    set content(content: string) {
        this._content = content;
        this._changed = true;
    }

    get changed(): boolean {
        if (this._changed) {
            return true;
        }

        if (this._doc) {
            return !this._doc.isClean();
        }

        return false;
    }

    get filename(): string {
        return getNoteFilename(this.notebook.name, this._name);
    }

    constructor(name: string, notebook: Notebook = null) {
        this._name = name;
        this.notebook = notebook;
    }

    setDoc(doc: CodeMirror.Doc) {
        this._doc = doc;
        // set content to null to save memory
        this._content = null;
        // use CodeMirror.Doc to manager changes
        this._changed = false;
    }

    save() {
        let doc = this._doc;

        if (!doc || doc.isClean()) {
            // not edit note yet
            return;
        }

        doc.markClean();

        let filename = getNoteFilename(this.notebook.name, this._name);
        ensureFile(filename).then(() => {
            return writeFile(filename, doc.getValue());
        }).then(() => {
            ServiceLocator.noteManager.emit(NoteManager.EVENT_NOTE_SAVED, this);
        }).catch((e) => {
            ServiceLocator.noteManager.emit(NoteManager.EVENT_SAVE_NOTE_FAILED, this);
            e.message = `__Reboot Needed!!!__ ${e.message}`;
            ServiceLocator.alerter.fatal(e);
        });
    }

    rename(newName: string): Promise<void> {
        if (!newName) {
            throw new Error('Empty note name');
        }

        let oldName = this.name;
        let notebookName = this.notebook.name;
        this._name = newName;

        return rename(getNoteFilename(notebookName, oldName), getNoteFilename(notebookName, newName));
    }
}