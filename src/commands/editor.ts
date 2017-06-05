import ServiceLocator from '../service-locator';
import ViewManager from '../view-manager';

const source = 'husky.editor.command';

let markSetted = false;

export function previousLine() {
    let command = markSetted ? Monaco.editor.Handler.CursorUpSelect : Monaco.editor.Handler.CursorUp;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function nextLine() {
    let command = markSetted ? Monaco.editor.Handler.CursorDownSelect : Monaco.editor.Handler.CursorDown;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function forwardChar() {
    let command = markSetted ? Monaco.editor.Handler.CursorRightSelect : Monaco.editor.Handler.CursorRight;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function backwardChar() {
    let command = markSetted ? Monaco.editor.Handler.CursorLeftSelect : Monaco.editor.Handler.CursorLeft;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function moveBeginningOfLine() {
    let command = markSetted ? Monaco.editor.Handler.CursorHomeSelect : Monaco.editor.Handler.CursorHome;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function moveEndOfLine() {
    let command = markSetted ? Monaco.editor.Handler.CursorEndSelect : Monaco.editor.Handler.CursorEnd;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function scrollUp() {
    let command = markSetted ? Monaco.editor.Handler.CursorPageUpSelect : Monaco.editor.Handler.CursorPageUp;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function scrollDown() {
    let command = markSetted ? Monaco.editor.Handler.CursorPageDownSelect : Monaco.editor.Handler.CursorPageDown;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function beginningOfText() {
    let command = markSetted ? Monaco.editor.Handler.CursorTopSelect : Monaco.editor.Handler.CursorTop
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function endOfText() {
    let command = markSetted ? Monaco.editor.Handler.CursorBottomSelect : Monaco.editor.Handler.CursorBottom;
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function toggleMark() {
    let kernel = ServiceLocator.editor.kernel;
    let position = kernel.getPosition();
    kernel.setSelection({
        startColumn: position.column,
        endColumn: position.column,
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber
    });

    markSetted = !markSetted;
}

export function copy() {
    ServiceLocator.editor.kernel.getAction('editor.action.clipboardCopyAction').run();
    if (markSetted) {
        toggleMark();
    }
}

export function cut() {
    ServiceLocator.editor.kernel.getAction('editor.action.clipboardCutAction').run();
    if (markSetted) {
        toggleMark();
    }
}

export function paste() {
    ServiceLocator.editor.kernel.getAction('editor.action.clipboardPasteAction').run();
    if (markSetted) {
        toggleMark();
    }
}

export function undo() {
    ServiceLocator.editor.kernel.trigger(source, Monaco.editor.Handler.Undo, null);
    if (markSetted) {
        toggleMark();
    }
}

export function redo() {
    ServiceLocator.editor.kernel.trigger(source, Monaco.editor.Handler.Redo, null);
    if (markSetted) {
        toggleMark();
    }
}

// workaround to check whether gotoLine is showing
function quickOpenWidgetVisable() {
    return ViewManager.main.editor.el.find('.quick-open-widget:visible').length !== 0;
}

export function gotoLine() {
    if (quickOpenWidgetVisable()) {
        return;
    }
    ServiceLocator.editor.kernel.getAction('editor.action.gotoLine').run();
}

export function killLine() {
    let kernel = ServiceLocator.editor.kernel;
    let Handler = Monaco.editor.Handler;
    kernel.trigger(source, Handler.CursorEndSelect, null);
    kernel.trigger(source, Handler.DeleteRight, null);
}

export function deleteChar() {
    ServiceLocator.editor.kernel.trigger(source, Monaco.editor.Handler.DeleteRight, null);
}

// workaround to check findWidget visable
function findWidgetVisable() {
    return ViewManager.main.editor.el.find('.editor-widget.find-widget.visible').length !== 0;
}

export function abort() {
    let kernel = ServiceLocator.editor.kernel;

    if (markSetted) {
        toggleMark();
    }
    kernel.focus();

    var press = jQuery.Event("keypress");
    press.ctrlKey = false;
    press.which = 27;
    ViewManager.main.editor.el.trigger(press);

    if (findWidgetVisable()) {
        kernel.trigger(source, 'closeFindWidget', null);
    }
}

export function search() {
    ServiceLocator.editor.kernel.getAction('actions.find').run();
}

export function searchForward() {
    ServiceLocator.editor.kernel.getAction('editor.action.nextMatchFindAction').run();
}

export function searchBackward() {
    ServiceLocator.editor.kernel.getAction('editor.action.previousMatchFindAction').run();
}

export function recenter() {
    let kernel = ServiceLocator.editor.kernel;
    let position = kernel.getPosition();
    kernel.revealPositionInCenter(position);
}

export function insertCodeBlock() {
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