import { EventEmitter } from 'events';
import * as CodeMirror from 'codemirror';
import { EditorView } from './views/editor';
import { Note } from './note';
import ViewManager from './view-manager';

// load GitHub Flavored Markdown mode
require('codemirror/mode/gfm/gfm');

const TEXT_MODE = 'gfm';

export class Editor extends EventEmitter {
    static EVENT_CHANGE = 'editor:change';

    private _cm: CodeMirror.Editor;
    private _notes: WeakMap<Note, CodeMirror.Doc>;
    private _editingNote: Note;

    constructor() {
        super();
        this._notes = new WeakMap<Note, CodeMirror.Doc>();

        this._init();
    }

    private _init() {
        this._cm = CodeMirror(ViewManager.main.editor.dom, {
            mode: TEXT_MODE,
            cursorHeight: 0.85,
            lineWrapping: true,
            lineNumbers: true,
            autofocus: true,
            scrollbarStyle: null
        });

        let timmer = null;
        this._cm.on('change', () => {
            let note = this._editingNote;

            if (timmer) {
                clearTimeout(timmer);
            }

            timmer = setTimeout(() => {
                this.emit(Editor.EVENT_CHANGE, note);
                timmer = null;
            }, 100);
        });
    }

    setHeight(height: number) {
        this._cm.setSize(null, height);
    }

    edit(note: Note): Editor {
        let doc = this._notes.get(note);
        if (!doc) {
            // TODO: need wrap CodeMirror.Doc ??
            doc = CodeMirror.Doc(note.content, TEXT_MODE);
            this._notes.set(note, doc);
            note.setDoc(doc);
        }

        this._cm.swapDoc(doc);
        this._editingNote = note;

        return this;
    }

    focus(): Editor {
        this._cm.focus();
        return this;
    }
}