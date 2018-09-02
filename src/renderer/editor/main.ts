import './monaco/vs/editor/editor.main';
import { conf, language } from './markdown/markdown';

const MARKDOWN_LANG = 'markdown';

// register markdown language to monaco
((function() {
    monaco.languages.register({
        id: MARKDOWN_LANG,
	    extensions: ['.md', '.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.mdtxt', '.mdtext']
    });
    monaco.languages.setMonarchTokensProvider(MARKDOWN_LANG, language);
	monaco.languages.setLanguageConfiguration(MARKDOWN_LANG, conf);
})());

export class Editor {
    public static create(element: HTMLElement): Editor {
        return new Editor(monaco.editor.create(element, {
            language: MARKDOWN_LANG,
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