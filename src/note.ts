import { sep as pathSep } from 'path';
import { readFileSync } from 'fs';
import { ensureFile, writeFile, rename } from 'fs-promise';
import ServiceLocator from './service-locator';
import { Event as  NoteManagerEvent } from './note-manager';

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
    private _editorModel: monaco.editor.IModel;
    private _versionId: number;
    private _changed: boolean;

    get name(): string {
        return this._name;
    }

    get content(): string {
        if (this._editorModel) {
            return this._editorModel.getValue();
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

        if (this._editorModel) {
            return this._editorModel.getAlternativeVersionId() !== this._versionId;
        }

        return false;
    }

    get filename(): string {
        return getNoteFilename(this.notebook.name, this._name);
    }

    get editorModel(): monaco.editor.IModel {
        return this._editorModel;
    }

    constructor(name: string, notebook: Notebook = null) {
        this._name = name;
        this.notebook = notebook;
    }

    setModel(model: monaco.editor.IModel) {
        this._editorModel = model;
        this._versionId = model.getAlternativeVersionId();

        // set content to null to save memory
        this._content = null;
        // use monaco.editor.IModel to manager changes
        this._changed = false;
    }

    save() {
        let model = this._editorModel;
        let versionId;

        if (!model || (versionId = model.getAlternativeVersionId()) === this._versionId) {
            // not edit note yet
            return;
        }

        this._versionId = versionId;

        let filename = getNoteFilename(this.notebook.name, this._name);
        ensureFile(filename).then(() => {
            return writeFile(filename, model.getValue());
        }).then(() => {
            ServiceLocator.noteManager.emit(NoteManagerEvent.note_saved, this);
        }).catch((e) => {
            ServiceLocator.noteManager.emit(NoteManagerEvent.save_note_failed, this);
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