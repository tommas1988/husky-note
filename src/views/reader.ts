import { AbstractView } from './view';
import { Note, Notebook } from '../note';
import * as $ from 'jquery';
import { NoteManager } from '../note-manager';
import { NoteRenderer } from '../note-renderer';
import { Editor } from '../editor';
import ServiceLocator from '../service-locator';

let containerKey = 0;

function noteHtml(content: string = ''): string {
    return `<div class="${containerKey++}">${content}</div>`;
}

export class ReaderView extends AbstractView {
    private _outline: OutlineView;

    private _container: JQuery;
    private _notes: WeakMap<Note, JQuery> = new WeakMap();

    constructor(el: JQuery) {
        super(el);

        this._container = $('<div></div>').appendTo(this._el);
        this._outline = new OutlineView(this._el.find('.outline'));
    }

    init() {
        // update note reader view when note changes
        ServiceLocator.editor.on(Editor.EVENT_CHANGE, (note: Note) => {
            this.updateNote(note);
        });

        let manager = ServiceLocator.noteManager;
        // remove note view when delete notebook/note
        manager.on(NoteManager.EVENT_DELETE_NOTEBOOK, (notebook: Notebook) => {
            for (let note of notebook.notes.values()) {
                if (this._notes.has(note)) {
                    this._notes.get(note).remove();
                }
            }
        });
        manager.on(NoteManager.EVENT_DELETE_NOTE, (note: Note) => {
            if (this._notes.has(note)) {
                this._notes.get(note).remove();
            }
        });
    }

    setHeight(height: number) {
        this._container.height(height - 20 /* exclude margin-bottom */);
    }

    openNote(note: Note) {
        let el = this._notes.get(note);
        if (!el) {
            el = $(noteHtml(ServiceLocator.noteRenderer.render(note.content)));
            el.hide();
            el.appendTo(this._container);

            this._notes.set(note, el);
        }

        this._container.children().hide();

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