import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Registry } from 'monaco-editor/esm/vs/platform/registry/common/platform';

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

        let editorContributions = Registry.as('editor.contributions').editorContributions;
        for (let i = 0, len = editorContributions.length; i < len; i++) {
            let contribId = editorContributions[i].id;
            if ("editor.contrib.renameController" == contribId) {
                editorContributions.splice(i, 1);
                len--;
            }
        }
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
