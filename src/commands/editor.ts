import ServiceLocator from '../service-locator';
import ViewManager from '../view-manager';

const source = 'husky.editor.command';

let markSetted = false;

export function previousLine() {
    let command = markSetted ? 'cursorUpSelect' : 'cursorUp';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function nextLine() {
    let command = markSetted ? 'cursorDownSelect' : 'cursorDown';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function forwardChar() {
    let command = markSetted ? 'cursorRightSelect' : 'cursorRight';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function backwardChar() {
    let command = markSetted ? 'cursorLeftSelect' : 'cursorLeft';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function moveBeginningOfLine() {
    let command = markSetted ? 'cursorHomeSelect' : 'cursorHome';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function moveEndOfLine() {
    let command = markSetted ? 'cursorEndSelect' : 'cursorEnd';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function scrollUp() {
    let command = markSetted ? 'cursorPageUpSelect' : 'cursorPageUp';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function scrollDown() {
    let command = markSetted ? 'cursorPageDownSelect' : 'cursorPageDown';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function beginningOfText() {
    let command = markSetted ? 'cursorTopSelect' : 'cursorTop';
    ServiceLocator.editor.kernel.trigger(source, command, null);
}

export function endOfText() {
    let command = markSetted ? 'cursorBottomSelect' : 'cursorBottom';
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
    ServiceLocator.editor.kernel.trigger(source, 'undo', null);
    if (markSetted) {
        toggleMark();
    }
}

export function redo() {
    ServiceLocator.editor.kernel.trigger(source, 'redo', null);
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
    kernel.trigger(source, 'cursorEndSelect', null);
    kernel.trigger(source, 'deleteRight', null);
}

export function deleteChar() {
    ServiceLocator.editor.kernel.trigger(source, 'deleteRight', null);
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