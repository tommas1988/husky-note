import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

interface EdtiorOptions {

}

interface EditorInterface {
    attatchOnDom(dom: HTMLElement, options: EditorOptions);
    getEngine(): any;
}

class MonacoEditorImp implements EditorInterface {
    private engine: monaco.editor.IStandaloneCodeEditor = null;

    attatchOnDom(dom: HTMLElement, options: monaco.editor.IStandaloneEditorConstructionOptions) {
        engine = monaco.editor.create(dom, options);
    }

    getEngine(): any {
        return this.engine;
    }
}

export default new MonacoEditorImp();
