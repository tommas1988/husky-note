import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

interface EditorOptions {

}

interface EditorInterface {
    attatchOnDom(dom: HTMLElement, options: EditorOptions): void;
    getEngine(): any;
}

class MonacoEditorImp implements EditorInterface {
    private engine: monaco.editor.IStandaloneCodeEditor|null = null;

    attatchOnDom(dom: HTMLElement, options: EditorOptions): void {
        let monacoOptions = {
            minimap: {
                enabled: false
            },
            automaticLayout: false
        };
        this.engine = monaco.editor.create(dom, monacoOptions);
    }

    getEngine(): any {
        return this.engine;
    }
}

export default new MonacoEditorImp();
