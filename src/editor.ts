import { EventEmitter } from 'events';
import { EditorView } from './views/editor';
import { Note } from './note';
import ViewManager from './view-manager';

const TEXT_MODE = 'markdown';

export class Editor extends EventEmitter {
    // TODO: move events to top level
    static EVENT_CHANGE = 'editor:change';

    private _notes: WeakMap<Note, monaco.editor.IModel>;
    private _editingNote: Note;

    private _editor: monaco.editor.IStandaloneCodeEditor;

    constructor() {
        super();
        this._notes = new WeakMap<Note, monaco.editor.IModel>();

        this._init();
    }

    private _init() {
        this._editor = Monaco.editor.create(ViewManager.main.editor.dom, {
            theme: 'vs',
            model: null,
            renderLineHighlight: 'none',
            wrappingColumn: 0,
            scrollbar: {
                horizontalScrollbarSize: 0,
                verticalScrollbarSize: 0
            }
        });

        let timmer = null;
        this._editor.onDidChangeModelContent(() => {
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

    setSize(width: number, height: number) {
        this._editor.layout({ width, height });
    }

    edit(note: Note): Editor {
        let model = this._notes.get(note);
        if (!model) {
            model = Monaco.editor.createModel(note.content, TEXT_MODE);
            this._notes.set(note, model);
            note.setModel(model);
        }

        this._editor.setModel(model);
        this._editingNote = note;

        return this;
    }

    focus(): Editor {
        this._editor.focus();
        return this;
    }
}