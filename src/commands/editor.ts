import ServiceLocator from '../service-locator';

const monacoEditor = ServiceLocator.editor.kernel;

export default class EditorCommads {
    static insertCodeBlock() {
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