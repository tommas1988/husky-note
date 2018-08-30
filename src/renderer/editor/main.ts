import './monaco/vs/editor/editor.main';

export class Editor {
    public static create(element: HTMLElement): Editor {
        return new Editor(monaco.editor.create(element, {
            language: 'markdown',
            theme: 'vs',
            renderLineHighlight: 'none',
            wordWrap: 'on',
            quickSuggestions: false,
            selectionHighlight: false,
            minimap: {
                enabled: false
            },
            scrollbar: {
                horizontalScrollbarSize: 0,
                verticalScrollbarSize: 0
            }
        }));
    }

    private kernel: monaco.editor.IStandaloneCodeEditor

    private constructor(kernel: monaco.editor.IStandaloneCodeEditor) {
        this.kernel = kernel;
    }

    public setSize(width: number, height: number) {
        this.kernel.layout({
            width, height
        });
    }
}