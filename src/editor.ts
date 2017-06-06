import { App } from './app';
import { EventEmitter } from 'events';
import { EditorView } from './views/editor';
import { Note } from './note';
import ViewManager from './view-manager';
import * as editorCommands from './commands/editor';
import { noop } from './utils';
import ServiceLocator from './service-locator';

const TEXT_MODE = 'markdown';

export const Event = {
    change: 'editor:change',
};

export class Editor extends EventEmitter {
    readonly kernel: monaco.editor.IStandaloneCodeEditor;

    private _editingNote: Note;
    // view state of last edition
    private _viewStates: WeakMap<Note, monaco.editor.IEditorViewState>;

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
        this._viewStates = new WeakMap<Note, monaco.editor.IEditorViewState>();

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

        // set keybindings
        this._setKeyBindings();
    }

    private _setKeyBindings() {
        const kernel = this.kernel;
        const KeyMod = Monaco.KeyMod;
        const KeyCode = Monaco.KeyCode;

        if ('emacs' === ServiceLocator.config.editor.keybinding) {
            // disable default keybindings
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_C, noop, '');
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_Z, noop, '');

            // C-x C-s save note
            kernel.addCommand((KeyMod.CtrlCmd | KeyCode.KEY_X) | (KeyMod.CtrlCmd | KeyCode.KEY_S) << 16, () => {
                App.getInstance().execCommand('saveNote');
            }, '');
            // C-f forward charactor
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_F, editorCommands.forwardChar, '');
            // C-b backward charactor
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_B, editorCommands.backwardChar, '');
            // C-a begining of the line
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_A, editorCommands.moveBeginningOfLine, '');
            // C-e end of line
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_E, editorCommands.moveEndOfLine, '');
            // C-p previous line
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_P, editorCommands.previousLine, '');
            // C-n next line
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_N, editorCommands.nextLine, '');
            // M-< go to end of the text
            kernel.addCommand(KeyMod.Alt | KeyMod.Shift | KeyCode.US_DOT, editorCommands.endOfText, '');
            // M-> go to beginning of the text
            kernel.addCommand(KeyMod.Alt | KeyMod.Shift | KeyCode.US_COMMA, editorCommands.beginningOfText, '');
            // C-w cut
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_W, editorCommands.cut, '');
            // M-w copy
            kernel.addCommand(KeyMod.Alt | KeyCode.KEY_W, editorCommands.copy, '');
            // C-y paste
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_Y, editorCommands.paste, '');
            // C-d delete charactor
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_D, editorCommands.deleteChar, '');
            // C-k kill line
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_K, editorCommands.killLine, '');
            // C-_ undo
            kernel.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_MINUS, editorCommands.undo, '');
            // C-' ' active/deactive mark
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.Space, editorCommands.toggleMark, '');
            // C-g quit
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_G, editorCommands.abort, '');
            // M-g M-g go to line
            kernel.addCommand((KeyMod.Alt | KeyCode.KEY_G) | (KeyMod.Alt | KeyCode.KEY_G) << 16, editorCommands.gotoLine, '');
            // C-s search/search forward
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_S, editorCommands.search, '!findWidgetVisible');
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_S, editorCommands.searchForward, 'findWidgetVisible');
            // C-r search/serach barckward
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_R, editorCommands.search, '!findWidgetVisible');
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_R, editorCommands.searchBackward, 'findWidgetVisible');
            // C-l recenter
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_L, editorCommands.recenter, '');
            // C-x C-i insert code block
            kernel.addCommand((KeyMod.CtrlCmd | KeyCode.KEY_X) | (KeyMod.CtrlCmd | KeyCode.KEY_I) << 16, editorCommands.insertCodeBlock, '');
        } else {
            // save note
            kernel.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_S, () => {
                App.getInstance().execCommand('saveNote');
            }, '');
        }
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
            this._viewStates.set(this._editingNote, this.kernel.saveViewState());
        }

        this.kernel.setModel(model);
        this._editingNote = note;

        // foucs editor
        this.focus();

        return this;
    }

    focus(): Editor {
        let kernel = this.kernel;
        
        kernel.focus();
        kernel.restoreViewState(this._viewStates.get(this._editingNote));
        return this;
    }

    execCommand(command: string) {
        editorCommands[command]();
    }
}