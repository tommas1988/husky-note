import { EventEmitter } from 'events';
import { EditorView } from './views/editor';
import { Note } from './note';
import ViewManager from './view-manager';
import editorCommands from './commands/editor';

const TEXT_MODE = 'markdown';

export class Editor extends EventEmitter {
    // TODO: move events to top level
    static EVENT_CHANGE = 'editor:change';

    readonly kernel: monaco.editor.IStandaloneCodeEditor;

    private _editingNote: Note;

    constructor() {
        super();

        this.kernel = Monaco.editor.create(ViewManager.main.editor.dom, {
            theme: 'vs',
            model: null,
            renderLineHighlight: 'none',
            wrappingColumn: 0,
            scrollbar: {
                horizontalScrollbarSize: 0,
                verticalScrollbarSize: 0
            }
        });

        this._init();
    }

    private _init() {
        let timmer = null;
        this.kernel.onDidChangeModelContent(() => {
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

    private _registerCommands() {
        
    }

    setSize(width: number, height: number) {
        this.kernel.layout({ width, height });
    }

    edit(note: Note): Editor {
        let model = note.editorModel;
        if (!model) {
            model = Monaco.editor.createModel(note.content, TEXT_MODE);
            note.setModel(model);
        }

        this.kernel.setModel(model);
        this._editingNote = note;

        return this;
    }

    focus(): Editor {
        this.kernel.focus();
        return this;
    }
}