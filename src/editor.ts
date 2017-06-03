import { App } from './app';
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
            quickSuggestions: false,
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

        this._setKeyBindings();
    }

    private _setKeyBindings() {
        const kernel = this.kernel;
        const KeyMod = Monaco.KeyMod;
        const KeyCode = Monaco.KeyCode;

        kernel.addCommand((KeyMod.CtrlCmd | KeyCode.KEY_X) | (KeyMod.CtrlCmd | KeyCode.KEY_S) << 16, () => {
            App.getInstance().execCommand('saveNote');
        }, '');

        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_F, editorCommands.forwardChar, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_B, editorCommands.backwardChar, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_A, editorCommands.moveBeginningOfLine, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_E, editorCommands.moveEndOfLine, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_P, editorCommands.previousLine, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_N, editorCommands.nextLine, '');
        kernel.addCommand(KeyMod.Alt | KeyMod.Shift | KeyCode.US_DOT, editorCommands.endOfText, '');
        kernel.addCommand(KeyMod.Alt | KeyMod.Shift | KeyCode.US_COMMA, editorCommands.beginningOfText, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_W, editorCommands.cut, '');
        kernel.addCommand(KeyMod.Alt | KeyCode.KEY_W, editorCommands.copy, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_Y, editorCommands.paste, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_D, editorCommands.deleteChar, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_K, editorCommands.killLine, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_MINUS, editorCommands.undo, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.Space, editorCommands.toggleMark, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_G, editorCommands.abort, '');
        kernel.addCommand((KeyMod.Alt | KeyCode.KEY_G) | (KeyMod.Alt | KeyCode.KEY_G) << 16, editorCommands.gotoLine, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_S, editorCommands.search, '!findWidgetVisible');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_S, editorCommands.searchForward, 'findWidgetVisible');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_R, editorCommands.search, '!findWidgetVisible');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_R, editorCommands.searchBackward, 'findWidgetVisible');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_L, editorCommands.recenter, '');
        kernel.addCommand((KeyMod.CtrlCmd | KeyCode.KEY_X) | (KeyMod.CtrlCmd | KeyCode.KEY_I) << 16, editorCommands.insertCodeBlock, '');

        // disable default keybindings
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_C, null, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_Z, null, '');
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