import { AbstractView } from './view';
import { EditorView } from './editor';
import { ReaderView } from './reader';

export class MainView extends AbstractView {
    public editor: EditorView;
    public reader: ReaderView;

    private _editorEl: JQuery;
    private _readerEl: JQuery;

    constructor() {
        super('#main');

        this._editorEl = this._el.find('.editor');
        this._readerEl = this._el.find('.reader');

        this.editor = new EditorView(this._editorEl);
        this.reader = new ReaderView(this._readerEl);
    }

    init() {
        // init child view
        this.editor.init();
        this.reader.init();

        // set height when window size change
        $(window).resize(() => {
            this.setHeight(window.innerHeight);
        });

        // init height
        this.setHeight(window.innerHeight);
    }

    setHeight(height: number) {
        this._el.height(height);

        // exclude header height
        height -= 40;
        this.reader.setHeight(height);
        this.editor.setHeight(height);
    }

    showEditor() {
        this._editorEl.css({
            flex: '0 0 100%',
            maxWidth: '100%',
            display: 'block'
        });
        this._readerEl.css({
            flex: '0 0 0',
            maxWidth: 0,
            display: 'none'
        });

        $(window).resize();
    }

    showReader() {
        this._readerEl.css({
            flex: '0 0 100%',
            maxWidth: '100%',
            display: 'block'
        });
        this._editorEl.css({
            flex: '0 0 0',
            maxWidth: 0,
            display: 'none'
        });

        $(window).resize();
    }

    splitView() {
        this._editorEl.css({
            flex: '0 0 50%',
            maxWidth: '50%',
            display: 'block'
        });
        this._readerEl.css({
            flex: '0 0 50%',
            maxWidth: '50%',
            display: 'block'
        });

        $(window).resize();
    }
}