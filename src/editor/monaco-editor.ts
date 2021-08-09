import { EditorInterface, EditorOptions, Dimension } from '../editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Registry } from 'monaco-editor/esm/vs/platform/registry/common/platform';

export class MonacoEditor implements EditorInterface {
    private engine: monaco.editor.IStandaloneCodeEditor|null = null;

    constructor() {
        // remove unwanted editor contributions
        let unwantedContribs = new Set();
        let editorContributions = (<any>Registry.as('editor.contributions')).editorContributions;

        unwantedContribs.add('editor.contrib.renameController');
        unwantedContribs.add('editor.contrib.hover');
        for (let i = 0, len = editorContributions.length; i < len; i++) {
            let contribId = editorContributions[i].id;
            if (unwantedContribs.has(contribId)) {
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
            automaticLayout: false,
            theme: options.theme
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
