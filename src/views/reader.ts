import { AbstractView } from './view';
import { Note, Notebook } from '../note';
import { Event as NoteManagerEvent } from '../note-manager';
import { NoteRenderer, IOutlineHeader, IRenderResult } from '../note-renderer';
import { Event as EditorEvent } from '../editor';
import ServiceLocator from '../service-locator';

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
        this._outline = new OutlineView($(OUTLINE_HTML).appendTo(el));
    }

    init() {
        let editor = ServiceLocator.editor;
        // update note reader view when note changes
        editor.on(EditorEvent.change, (note: Note) => {
            this.updateNote(note);
        });

        editor.on(EditorEvent.changeLineNumber, (note: Note, lineNumber) => {
            this.revealLine(note, lineNumber);
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
    }

    setHeight(height: number) {
        this._container.height(height - 40 /* exclude margin */);
    }

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

        // reset reveal line
        entry.revealLine = 0;
    }

    revealLine(note: Note, targetLine: number) {
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
            let $prevBlock = entry.el.find(`[data-line=${prevBlockLine}]`).get(0);
            let $nextBlock = entry.el.find(`[data-line=${nextBlockLine}]`).get(0);
            if (!$prevBlock || !$nextBlock) {
                return;
            }

            let betweenProgress = (targetLine - prevBlockLine) / (nextBlockLine - prevBlockLine);
            let elementOffset = $nextBlock.getBoundingClientRect().top - $prevBlock.getBoundingClientRect().top;

            scrollTo = $prevBlock.getBoundingClientRect().top + betweenProgress * elementOffset;
        } else {
            let el = entry.el.find(`[data-line=${targetLine}]`).get(0);
            if (!el) {
                return;
            }

            scrollTo = el.getBoundingClientRect().top;
        }

        this._container.scrollTop(this._container.scrollTop() + scrollTo - 40); // exclude header height

        // remember current line
        entry.revealLine = targetLine;
    }
}

class OutlineView extends AbstractView {
    private _headers: WeakMap<Note, IOutlineHeader[]>;

    constructor(el: JQuery) {
        super(el);
        this._headers = new WeakMap<Note, IOutlineHeader[]>();
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