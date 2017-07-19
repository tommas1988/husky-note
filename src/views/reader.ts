import { AbstractView } from './view';
import { Note, Notebook } from '../note';
import { Event as NoteManagerEvent } from '../note-manager';
import { NoteRenderer, IOutlineHeader, IRenderResult } from '../note-renderer';
import { Event as EditorEvent } from '../editor';
import ServiceLocator from '../service-locator';
import { App } from '../app';

const CONTAINER_HTML = '<div></div>';
const OUTLINE_HTML = '<div class="outline"></div>';

const SHOW_OUTLINE_CLASS = 'show-outline';

function noteHtml(content: string = ''): string {
    return `<div class="markdown-body">${content}</div>`;
}

export class ReaderView extends AbstractView {
    private _outline: OutlineView;

    private _container: JQuery;
    private _notes: WeakMap<Note, { el: JQuery, codeLines: number[], revealLine: number }> = new WeakMap();

    constructor(el: JQuery) {
        super(el);

        this._container = $(CONTAINER_HTML).appendTo(this._el);
        this._outline = new OutlineView($(OUTLINE_HTML).appendTo(el), this);
    }

    init() {
        let editor = ServiceLocator.editor;
        // update note reader view when note changes
        editor.on(EditorEvent.change, (note: Note) => {
            this.updateNote(note);
        });

        editor.on(EditorEvent.changeLineNumber, (note: Note, lineNumber) => {
            this.revealLine(note, lineNumber, false);
        });

        let manager = ServiceLocator.noteManager;
        // remove note view when delete notebook/note
        manager.on(NoteManagerEvent.delete_notebook, (notebook: Notebook) => {
            for (let note of notebook.notes.values()) {
                if (this._notes.has(note)) {
                    this._notes.get(note).el.remove();
                }
            }
        });
        manager.on(NoteManagerEvent.delete_note, (note: Note) => {
            if (this._notes.has(note)) {
                this._notes.get(note).el.remove();
            }
        });

        // init outline
        this._outline.init();
    }

    // TODO: reset all notes padding bottom when container height changes
    setHeight(height: number) {
        this._container.height(height - 40 /* exclude margin */);
    }

    // TODO: set padding bottom to this._container.innerHeight * 2 / 5
    openNote(note: Note, showOutline: boolean = true) {
        let el: JQuery;

        if (!this._notes.has(note)) {
            let renderResult: IRenderResult = ServiceLocator.noteRenderer.render(note);

            el = $(noteHtml(renderResult.content));
            el.hide();
            el.appendTo(this._container);

            this._notes.set(note, { el, codeLines: renderResult.blockCodeLines, revealLine: 0 });
            this._outline.setHeaders(note, renderResult.outlineHeaders);
        } else {
            el = this._notes.get(note).el;
        }

        this._container.children().hide();

        if (!showOutline) {
            this._el.removeClass(SHOW_OUTLINE_CLASS);
        } else {
            if (!this._el.hasClass(SHOW_OUTLINE_CLASS)) {
                this._el.addClass(SHOW_OUTLINE_CLASS);
            }
            this._outline.render(note);
        }

        el.show();
    }

    updateNote(note: Note) {
        let entry = this._notes.get(note);

        // not rendered yet
        if (!entry.el) {
            return;
        }

        let renderResult: IRenderResult = ServiceLocator.noteRenderer.render(note);

        entry.codeLines = renderResult.blockCodeLines;
        entry.el.empty().append(renderResult.content);

        this._outline.setHeaders(note, renderResult.outlineHeaders);
    }

    revealLine(note: Note, targetLine: number, alignTop: boolean = true) {
        let entry = this._notes.get(note);

        // already on the target line
        if (entry.revealLine === targetLine) {
            return;
        }

        let prevBlockLine = 0, nextBlockLine;
        for (const codeLine of entry.codeLines) {
            if (codeLine === targetLine) {
                break;
            }

            if (codeLine < targetLine) {
                prevBlockLine = codeLine;
            } else {
                nextBlockLine = codeLine;
                break;
            }
        }

        let scrollTo;
        if (nextBlockLine) {
            // between two blocks
            let prevBlockEl = entry.el.find(`[data-line=${prevBlockLine}]`).get(0);
            let nextBlockEl = entry.el.find(`[data-line=${nextBlockLine}]`).get(0);
            if (!prevBlockEl || !nextBlockEl) {
                return;
            }

            let betweenProgress = (targetLine - prevBlockLine) / (nextBlockLine - prevBlockLine);
            let elementOffset = nextBlockEl.getBoundingClientRect().top - prevBlockEl.getBoundingClientRect().top;

            scrollTo = prevBlockEl.getBoundingClientRect().top + betweenProgress * elementOffset;
        } else {
            let el = entry.el.find(`[data-line=${targetLine}]`).get(0);
            if (!el) {
                return;
            }

            scrollTo = el.getBoundingClientRect().top;
        }

        let container = this._container;
        if (!alignTop) {
            scrollTo -= container.innerHeight() * 1 / 5;
        }

        container.scrollTop(container.scrollTop() + scrollTo - 40); // exclude header height

        // remember current line
        entry.revealLine = targetLine;
    }

    getLineNumberFromCurrentPostion(note: Note): number {
        let blockEls = this._notes.get(note).el.get();
        let scrollTop = this._container.scrollTop();
        let prevBlockEl, nextBlockEl;
        let prevBounds, nextBounds;

        for (const blockEl of blockEls) {
            const bounds = blockEl.getBoundingClientRect();
			if (bounds.top > 0) {
                if (!prevBlockEl) {
                    prevBlockEl = blockEl;
                    prevBounds = bounds;
                    break;
                } else if (Math.abs(prevBounds.top) < prevBounds.height) {
                    break;
                }

                nextBlockEl = blockEl;
                nextBounds = bounds;
                break;
            }
            prevBlockEl = blockEl;
            prevBounds = bounds;
        }

        if (nextBlockEl) {
            const betweenProgress = Math.abs(prevBounds.top) / (nextBounds.top - prevBounds.top);
            const prevLine = prevBlockEl.getAttribute('data-line');
            const nextLine = nextBlockEl.getAttribute('data-line');

            return prevLine + betweenProgress * (nextLine - prevLine);
        } else {
            return +prevBlockEl.getAttribute('data-line');
        }
    }
}

class OutlineView extends AbstractView {
    private _readerView: ReaderView;
    private _headers: WeakMap<Note, IOutlineHeader[]>;

    constructor(el: JQuery, readerView: ReaderView) {
        super(el);
        this._readerView = readerView;
        this._headers = new WeakMap<Note, IOutlineHeader[]>();
    }

    init() {
        const app = App.getInstance();
        this._el.on('click', 'a', event => {
            let gotoLine = +$(event.currentTarget).attr('data-line');
            this._readerView.revealLine(app.activeNote, gotoLine);
        });
    }

    setHeaders(note: Note, headers: IOutlineHeader[]) {
        this._headers.set(note, headers);
    }

    render(note: Note) {
        let headers = this._headers.get(note);

        if (!headers) {
            throw new Error('Can not find out outline headers');
        }

        let html = '<nav class="nav flex-column">';
        headers.forEach((val: IOutlineHeader) => {
            html += `<a class="nav-link" data-line="${val.line}">${val.title}</a>`;
        });
        html += '</nav>';

        this._el.empty().append(html);
    }
}