import ServiceLocator from '../service-locator';

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
        ServiceLocator.editor.kernel.getAction('editor.action.gotoLine').run();
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

    }

    static abort() {
        if (EditorCommads.markSetted) {
            EditorCommads.toggleMark();
        }
        ServiceLocator.editor.kernel.focus();
    }

    static insertCodeBlock() {
        const monacoEditor = ServiceLocator.editor.kernel;
        let lineNumber = monacoEditor.getPosition().lineNumber;
        let selections = monacoEditor.getSelections();
        let model = monacoEditor.getModel();
        let eol = model.getEOL();
        let operation: monaco.editor.IIdentifiedSingleEditOperation = {
            identifier: null,
			range: null,
			text: "``` \n```\n",
			forceMoveMarkers: true
        };

        // not empty line insert to next line
        if (eol !== model.getLineContent(lineNumber)) {
            lineNumber++;
        }
        operation.range = new Monaco.Range(lineNumber, 0, lineNumber, 0);

        model.pushEditOperations(selections, [operation], () => {
            return [new Monaco.Selection(lineNumber, 4, lineNumber, 4)];
        });
    }

    static recenter() {

    }
}