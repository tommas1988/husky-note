import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export interface EditorOptions {

}

export interface Dimension {
    width: number,
    height: number,
}

interface EditorInterface {
    attatchOnDom(dom: HTMLElement, options: EditorOptions): void;
    resize(dimension: Dimension): void;
    getEngine(): any;
}

class MonacoEditorImp implements EditorInterface {
    private engine: monaco.editor.IStandaloneCodeEditor|null = null;

    constructor() {
        // TODO: find a way to get EditorContributionRegistry.INSTANCE
        // to remove unwanted Contributions
    }

    attatchOnDom(dom: HTMLElement, options: EditorOptions): void {
        let monacoOptions = {
            minimap: {
                enabled: false
            },
            automaticLayout: false
        };
        this.engine = monaco.editor.create(dom, monacoOptions);
    }

    resize(dimension: Dimension): void {
        if (this.engine) {
            this.engine.layout(dimension);
        }
    }

    getEngine(): any {
        return this.engine;
    }
}

export const instance = new MonacoEditorImp();
