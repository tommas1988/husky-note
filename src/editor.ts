import { App } from './app';
import { EventEmitter } from 'events';
import { EditorView } from './views/editor';
import { Note } from './note';
import ViewManager from './view-manager';
import editorCommands from './commands/editor';
import { noop } from './utils';

const TEXT_MODE = 'markdown';

export const Event = {
    change: 'editor:change',
};

export class Editor extends EventEmitter {
    readonly kernel: monaco.editor.IStandaloneCodeEditor;

    private _editingNote: Note;
    private _positions: WeakMap<Note, monaco.Position>;

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
        this._positions = new WeakMap<Note, monaco.Position>();

        this._init();
    }

    private _init() {
        // emit change event when note content change
        let timmer = null;
        this.kernel.onDidChangeModelContent(() => {
            let note = this._editingNote;

            if (timmer) {
                clearTimeout(timmer);
            }

            timmer = setTimeout(() => {
                this.emit(Event.change, note);
                timmer = null;
            }, 100);
        });

        // set saved postion when editor is focused
        this.kernel.onDidFocusEditorText(() => {
            let kernel = this.kernel;
            let postion = this._positions.get(this._editingNote);

            postion = postion ? postion : new Monaco.Position(1, 1);
            kernel.setPosition(postion);
            kernel.revealPositionInCenter(postion);
        });

        // set keybindings
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
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_C, noop, '');
        kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_Z, noop, '');
    }

    setSize(width: number, height: number) {
        this.kernel.layout({ width, height });
    }

    edit(note: Note): Editor {
        let model = note.editorModel;
        let editingNote = this._editingNote;

        if (!model) {
            model = Monaco.editor.createModel(note.content, TEXT_MODE);
            note.setModel(model);
        }

        // save postion while change edit note
        if (this._editingNote) {
            this._positions.set(this._editingNote, this.kernel.getPosition());
        }

        this.kernel.setModel(model);
        this._editingNote = note;

        // foucs editor
        this.kernel.focus();

        return this;
    }

    focus(): Editor {
        this.kernel.focus();
        return this;
    }

    execCommand(command: string) {
        editorCommands[command]();
    }
}