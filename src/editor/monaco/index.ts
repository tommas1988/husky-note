import { EditorInterface, EditorOptions, Dimension, EDITOR_CONTEXT_NAME } from '../index';
import { Context as BaseContext, manager as ContextManager } from '../../context';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Registry } from 'monaco-editor/esm/vs/platform/registry/common/platform';
import { Keymap } from '../../keymap';

class Context extends BaseContext {
    name = EDITOR_CONTEXT_NAME;

    keyboardQuit(): void {
    }

    onActive(): void {
    }

    onDeactive(): void {
    }
}

export class MonacoEditor implements EditorInterface {
    private engine: monaco.editor.IStandaloneCodeEditor | null = null;
    private context: Context;

    constructor() {
        this.context = new Context();

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
        let engine = monaco.editor.create(dom, monacoOptions);

        // disable monaco keybinding function
        let dumyResolver: any = {
            resolve: function (): null {
                return null;
            }
        };
        (<any>engine)._standaloneKeybindingService._cachedResolver = dumyResolver;

        dom.addEventListener('keydown', (e: KeyboardEvent) => {
            Keymap.INSTANCE.handleEvent(e);
        });

        this.engine = engine;
    }

    resize(dimension: Dimension): void {
        if (this.engine) {
            this.engine.layout(dimension);
        }
    }

    getEngine(): any {
        return this.engine;
    }

    getContext(): BaseContext {
        return this.context;
    }
}
