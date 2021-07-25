import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

class Editor {
    private engine: monaco.editor.IStandaloneCodeEditor = null;

    attatchOnDom(dom: HTMLElement, options: monaco.editor.IStandaloneEditorConstructionOptions) {
        engine = monaco.editor.create(dom, options);
    }

    getEngine(): any {
        return this.engine;
    }
}

export default new Editor();
