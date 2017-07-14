import { AbstractView } from './view';
import { Note, Notebook } from '../note';
import { Event as NoteManagerEvent } from '../note-manager';
import { NoteRenderer } from '../note-renderer';
import { Event as EditorEvent } from '../editor';
import ServiceLocator from '../service-locator';

let containerKey = 0;

const CONTAINER_HTML = '<div></div>';
const OUTLINE_HTML = '<div class="outline"></div>';

const SHOW_OUTLINE_CLASS = 'show-outline';

function noteHtml(content: string = ''): string {
    return `<div class="markdown-body ${containerKey++}">${content}</div>`;
}

export class ReaderView extends AbstractView {
    private _outline: OutlineView;

    private _container: JQuery;
    private _notes: WeakMap<Note, JQuery> = new WeakMap();

    constructor(el: JQuery) {
        super(el);

        this._container = $(CONTAINER_HTML).appendTo(this._el);
        this._outline = new OutlineView($(OUTLINE_HTML).appendTo(el));
    }

    init() {
        // update note reader view when note changes
        ServiceLocator.editor.on(EditorEvent.change, (note: Note) => {
            this.updateNote(note);
        });

        let manager = ServiceLocator.noteManager;
        // remove note view when delete notebook/note
        manager.on(NoteManagerEvent.delete_notebook, (notebook: Notebook) => {
            for (let note of notebook.notes.values()) {
                if (this._notes.has(note)) {
                    this._notes.get(note).remove();
                }
            }
        });
        manager.on(NoteManagerEvent.delete_note, (note: Note) => {
            if (this._notes.has(note)) {
                this._notes.get(note).remove();
            }
        });
    }

    setHeight(height: number) {
        this._container.height(height - 20 /* exclude margin-bottom */);
    }

    openNote(note: Note, showOutline: boolean = true) {
        let el = this._notes.get(note);
        if (!el) {
            el = $(noteHtml(ServiceLocator.noteRenderer.render(note.content)));
            el.hide();
            el.appendTo(this._container);

            this._notes.set(note, el);
        }

        this._container.children().hide();

        if (!showOutline) {
            this._el.removeClass(SHOW_OUTLINE_CLASS);
        } else if (!this._el.hasClass(SHOW_OUTLINE_CLASS)) {
            this._el.addClass(SHOW_OUTLINE_CLASS);
        }

        el.show();
    }

    // TODO: need to only update the changes of the note
    updateNote(note: Note) {
        let el = this._notes.get(note);

        // not rendered yet
        if (!el) {
            return;
        }

        el.empty();
        el.append(ServiceLocator.noteRenderer.render(note.content));
    }
}

class OutlineView extends AbstractView {
    constructor(el: JQuery) {
        super(el);
    }

    init() {
        // no-op
    }
}