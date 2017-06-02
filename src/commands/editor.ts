import ServiceLocator from '../service-locator';
import ViewManager from '../view-manager';

// TODO: should have register command function

const source = 'husky.editor.command';

export default class EditorCommads {
    private static markSetted = false;

    static previousLine() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorUpSelect : Monaco.editor.Handler.CursorUp;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static nextLine() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorDownSelect : Monaco.editor.Handler.CursorDown;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static forwardChar() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorRightSelect : Monaco.editor.Handler.CursorRight;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static backwardChar() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorLeftSelect : Monaco.editor.Handler.CursorLeft;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static moveBeginningOfLine() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorHomeSelect : Monaco.editor.Handler.CursorHome;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static moveEndOfLine() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorEndSelect : Monaco.editor.Handler.CursorEnd;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static scrollUp() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorPageUpSelect : Monaco.editor.Handler.CursorPageUp;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static scrollDown() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorPageDownSelect : Monaco.editor.Handler.CursorPageDown;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static beginningOfText() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorTopSelect : Monaco.editor.Handler.CursorTop
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static endOfText() {
        let command = EditorCommads.markSetted ? Monaco.editor.Handler.CursorBottomSelect : Monaco.editor.Handler.CursorBottom;
        ServiceLocator.editor.kernel.trigger(source, command, null);
    }

    static copy() {
        ServiceLocator.editor.kernel.getAction('editor.action.clipboardCopyAction').run();
        if (EditorCommads.markSetted) {
            EditorCommads.toggleMark();
        }
    }

    static cut() {
        ServiceLocator.editor.kernel.getAction('editor.action.clipboardCutAction').run();
        if (EditorCommads.markSetted) {
            EditorCommads.toggleMark();
        }
    }

    static paste() {
        ServiceLocator.editor.kernel.getAction('editor.action.clipboardPasteAction').run();
        if (EditorCommads.markSetted) {
            EditorCommads.toggleMark();
        }
    }

    static undo() {
        ServiceLocator.editor.kernel.trigger(source, Monaco.editor.Handler.Undo, null);
        if (EditorCommads.markSetted) {
            EditorCommads.toggleMark();
        }
    }

    static redo() {
        ServiceLocator.editor.kernel.trigger(source, Monaco.editor.Handler.Redo, null);
        if (EditorCommads.markSetted) {
            EditorCommads.toggleMark();
        }
    }

    static gotoLine() {
        if (EditorCommads.quickOpenWidgetVisable()) {
            return;
        }
        ServiceLocator.editor.kernel.getAction('editor.action.gotoLine').run();
    }

    private static quickOpenWidgetVisable() {
        // workaround to check whether gotoLine is showing
        return ViewManager.main.editor.el.find('.quick-open-widget:visible').length !== 0;
    }

    static toggleMark() {
        let kernel = ServiceLocator.editor.kernel;
        let position = kernel.getPosition();
        kernel.setSelection({
            startColumn: position.column,
            endColumn: position.column,
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber
        });

        EditorCommads.markSetted = !EditorCommads.markSetted;
    }

    static killLine() {
        let kernel = ServiceLocator.editor.kernel;
        let Handler = Monaco.editor.Handler;
        kernel.trigger(source, Handler.CursorEndSelect, null);
        kernel.trigger(source, Handler.DeleteRight, null);
    }

    static deleteChar() {
        ServiceLocator.editor.kernel.trigger(source, Monaco.editor.Handler.DeleteRight, null);
    }

    static abort() {
        let kernel = ServiceLocator.editor.kernel;

        if (EditorCommads.markSetted) {
            EditorCommads.toggleMark();
        }
        kernel.focus();

        var press = jQuery.Event("keypress");
        press.ctrlKey = false;
        press.which = 27;
        ViewManager.main.editor.el.trigger(press);

        if (EditorCommads.findWidgetVisable()) {
            kernel.trigger(source, 'closeFindWidget', null);
        }
    }

    static search() {
        ServiceLocator.editor.kernel.getAction('actions.find').run();
    }

    static searchForward() {
        ServiceLocator.editor.kernel.getAction('editor.action.nextMatchFindAction').run();
    }

    static searchBackward() {
        ServiceLocator.editor.kernel.getAction('editor.action.previousMatchFindAction').run();
    }

    private static findWidgetVisable() {
        // workaround to check findWidget visable
        return ViewManager.main.editor.el.find('.editor-widget.find-widget.visible').length !== 0;
    }

    static insertCodeBlock() {
        let monacoEditor = ServiceLocator.editor.kernel;
        let position = monacoEditor.getPosition();
        let model = monacoEditor.getModel();
        let lineContent = model.getLineContent(position.lineNumber);

        // not empty line
        if (position.column !== 1 || lineContent && model.getEOL() !== lineContent) {
            return;
        }

        let lineNumber = position.lineNumber;
        let selections = monacoEditor.getSelections();
        let operation: monaco.editor.IIdentifiedSingleEditOperation = {
            identifier: null,
			range: new Monaco.Range(lineNumber, 0, lineNumber, 0),
			text: "``` \n```",
			forceMoveMarkers: true
        };

        model.pushEditOperations(selections, [operation], null);

        monacoEditor.setPosition(new Monaco.Position(lineNumber, 5));
    }

    static recenter() {
        let kernel = ServiceLocator.editor.kernel;
        let position = kernel.getPosition();
        kernel.revealPositionInCenter(position);
    }
}