import { AbstractView } from './view';
import { Event as NoteManagerEvent } from '../note-manager';
import { AllHtmlEntities } from 'html-entities';
import { App, NoteView } from '../app';
import { Event as EditorEvent } from '../editor';
import { Notebook, Note } from '../note';
import ServiceLocator from '../service-locator';
import { remote } from 'electron';

const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

const { Menu, getCurrentWindow } = remote;
const entities = new AllHtmlEntities();

function notebookHtml(name: string = ''): string {
    name = entities.encode(name);

    let innerHtml = `
<a href="javascript:void(0)">
    <i class="fa fa-book"></i>
    <span>${name}</span>
    <i class="fa arrow"></i>
</a>
<ul class="notes collapse"></ul>`;
    return `
<li class="notebook" _data="${name}">
    ${name ? innerHtml : ''}
</li>`;
}

function noteHtml(name: string = ''): string {
    name = entities.encode(name);

    let innerHtml = `<a href="javascript:void(0)">${name}</a>`;
    return `
<li class="note" _data="${name}">
    ${name ? innerHtml : ''}
</li>`;
}

function editNotebookHtml(name: string = ''): string {
    name = entities.encode(name);
    return `
<div class="edit notebook-edit">
    <i class="fa fa-book"></i>
    <input type="text" autocorrect="off" autocapitalize="off" spellcheck="false" wrap="off" value="${name}">
</div>`;
}

function editNoteHtml(name: string = ''): string {
    name = entities.encode(name);
    return `
<div class="edit note-edit">
    <input type="text" autocorrect="off" autocapitalize="off" spellcheck="false" wrap="off" value="${name}">
</div>`;
}

const NOTEBOOK_CHANGE_BADGE_HTML = '<span class="change-badge"></span>';
const NOTE_CHANGE_FLAG_HTML = '<span class="change_flag"></span>';
const EDIT_BACKGROUND_HTML = '<div class="edit-background"></div>';

interface INoteView {
    // note elemenmt
    el: JQuery;
    changeFlagEl: JQuery;

    isEditing: boolean;
    isRenaming: boolean;
}

interface INotebookView {
    // notebook elment
    el: JQuery;
    // note container
    noteCon: JQuery;
    // collapse object
    coll: JQuery;
    // change badege
    changeBadgeEl: JQuery;
    changeCount: number;

    isEditing: boolean;
    isRenaming: boolean;

    notes: Map<Note, INoteView>;
}

export const Event = {
    select_note: 'notebook-list-view:select-note',
};

export class NotebookListView extends AbstractView {
    private _container: JQuery;
    private _notebooks: Map<Notebook, INotebookView> = new Map();

    constructor() {
        super('#notebook-list');
        this._container = this._el.find('.notebooks-container');
    }

    init() {
        this._initLoadNotesHandlers();
        this._initNotebookHandlers();
        this._initNoteHandlers();

        this._initContextMenu();
    }

    private _initLoadNotesHandlers() {
        // render notebook list when note index is loaded
        ServiceLocator.noteManager.on(NoteManagerEvent.loaded, () => {
            this.build();
        });
    }

    private _initNotebookHandlers() {
        let manager = ServiceLocator.noteManager;

        // click
        this._container.on('click', '.notebook', event => {
            let name: string = $(event.currentTarget).attr('_data');
            if (!name) { // creating notebook
                return false;
            }

            this.toggleNotebook(entities.decode(name));
            // stop event bubble and default action
            return false;
        });

        // creation
        manager.on(NoteManagerEvent.create_notebook, (notebook: Notebook) => {
            this.addNotebook(notebook);
            this.reorderNotebook();
        });

        // rename
        manager.on(NoteManagerEvent.rename_notebook, (notebook: Notebook) => {
            let el = this._notebooks.get(notebook).el;
            let newName = entities.encode(notebook.name);

            // update notebook view
            el.attr('_data', newName);
            el.find('> a span').text(newName);

            this.reorderNotebook();
        });
        manager.on(NoteManagerEvent.notebook_renamed, (notebook: Notebook) => {
            this._notebooks.get(notebook).isRenaming = false;
        });

        // deletion
        manager.on(NoteManagerEvent.delete_notebook, (notebook: Notebook) => {
            this.deleteNotebook(notebook);

        });
        manager.on(NoteManagerEvent.notebook_deleted, (notebook: Notebook) => {
            this._notebooks.get(notebook).notes.clear();
            this._notebooks.delete(notebook);
        });
    }

    private _initNoteHandlers() {
        let manager = ServiceLocator.noteManager;

        // click
        this._container.on('click', '.note', event => {
            let manager = ServiceLocator.noteManager;
            let el = $(event.currentTarget);

            let noteName: string = el.attr('_data');
            if (!noteName) { // creating note
                return false;
            }

            let note = manager.notebooks.get(entities.decode(el.parents('.notebook').attr('_data')))
                .notes
                .get(entities.decode(noteName));

            this.selectNote(note);
            // stop event bubble and default action
            return false;
        });

        // change
        ServiceLocator.editor.on(EditorEvent.change, (note: Note) => {
            if (note !== manager.orphanNote) {
                this.noteChange(note);
            }
        });

        // save
        manager.on(NoteManagerEvent.note_saved, (note: Note) => {
            this.saveNote(note);
        });
        manager.on(NoteManagerEvent.save_note_failed, (note: Note) => {
            // TODO: do some clean work
        });

        // creation
        manager.on(NoteManagerEvent.create_note, (note: Note) => {
            this.addNote(note);
            this.reorderNote(note.notebook);

            let notebookView = this._notebooks.get(note.notebook);
            // if note list is hidden, open it!
            if (notebookView.noteCon.is(':hidden')) {
                this.toggleNotebook(note.notebook.name);
            }

            this.selectNote(note, NoteView.LivePreview);
            if (note.changed) {
                this.noteChange(note);
            }
        });

        // rename
        manager.on(NoteManagerEvent.rename_note, (note: Note) => {
            let el = this._notebooks.get(note.notebook).notes.get(note).el;
            let newName = entities.encode(note.name);

            // update note view
            el.attr('_data', newName);
            el.find('> a').text(newName);

            this.reorderNote(note.notebook);
        });
        manager.on(NoteManagerEvent.note_renamed, (note: Note) => {
            this._notebooks.get(note.notebook).notes.get(note).isRenaming = false;
        });

        // deletion
        manager.on(NoteManagerEvent.delete_note, (note: Note) => {
            this.deleteNote(note);
        });
        manager.on(NoteManagerEvent.note_deleted, (note: Note) => {
            this._notebooks.get(note.notebook).notes.delete(note);
        });
    }

    toggleNotebook(name: string) {
        let manager = ServiceLocator.noteManager;
        let view = this._getNotebookView(manager.notebooks.get(name));

        if (view.isEditing) {
            return;
        }

        view.el.toggleClass('open');
        view.coll.collapse('toggle');
    }

    selectNote(note: Note, view?: NoteView) {
        let notebookView = this._getNotebookView(note.notebook);
        let noteView = this._getNoteView(notebookView, note);

        if (noteView.isEditing) {
            return;
        } else if (noteView.isRenaming || notebookView.isRenaming) {
            ServiceLocator.alerter.warn('Performing rename action');
            return;
        }

        let activeNote = App.getInstance().activeNote;
        if (note !== activeNote || !notebookView.el.hasClass('active')) {
            if (activeNote !== ServiceLocator.noteManager.orphanNote) {
                let notebookView = this._getNotebookView(activeNote.notebook);
                let noteView = this._getNoteView(notebookView, activeNote);
                notebookView.el.removeClass('active');
                noteView.el.removeClass('active');
            }

            notebookView.el.addClass('active');
            noteView.el.addClass('active');
        }

        // trigger select note event
        this.emit(Event.select_note, note, view);
    }

    private _getNotebookView(notebook: Notebook): INotebookView {
        if (!this._notebooks.has(notebook)) {
            throw new Error(`Cannot find notebook: ${notebook.name}`);
        }
        return this._notebooks.get(notebook);
    }

    private _getNoteView(notebook: INotebookView | Notebook, note: Note): INoteView {
        let notebookView = (notebook instanceof Notebook) ? this._getNotebookView(notebook) : notebook;
        let noteView = notebookView.notes.get(note);

        if (!noteView) {
            throw new Error(`Cannot find note: ${note.name} under ${note.notebook.name}`);
        }
        return noteView;
    }

    noteChange(note: Note) {
        let notebookView = this._notebooks.get(note.notebook);
        let noteView = notebookView.notes.get(note);

        if (note.changed) {
            if (noteView.changeFlagEl) {
                return;
            }

            let changeFlagEl = $(NOTE_CHANGE_FLAG_HTML);
            changeFlagEl.appendTo(noteView.el);
            noteView.changeFlagEl = changeFlagEl;

            let changeBadgeEl = notebookView.changeBadgeEl;
            if (!changeBadgeEl) {
                changeBadgeEl = notebookView.changeBadgeEl = $(NOTEBOOK_CHANGE_BADGE_HTML);
                changeBadgeEl.appendTo(notebookView.el);
                notebookView.changeCount = 1;
            } else {
                let changeCount = 0;
                for (let note of notebookView.notes.keys()) {
                    changeCount += (note.changed ? 1 : 0);
                }
                notebookView.changeCount = changeCount;
            }
        } else if (noteView.changeFlagEl) {
            noteView.changeFlagEl.remove();
            noteView.changeFlagEl = null;
            notebookView.changeCount--;
        }

        this._updateChangeBadge(notebookView);
    }

    saveNote(note: Note) {
        let notebookView = this._notebooks.get(note.notebook);
        let noteView = notebookView.notes.get(note);

        noteView.changeFlagEl.remove();
        noteView.changeFlagEl = null;

        notebookView.changeCount--;
        this._updateChangeBadge(notebookView);
    }

    private _updateChangeBadge(view: INotebookView) {
        if (view.changeCount) {
            view.changeBadgeEl.text(view.changeCount);
        } else {
            view.changeBadgeEl.remove();
            view.changeBadgeEl = null;
        }
    }

    addNotebook(notebook: Notebook): INotebookView {
        let el = $(notebookHtml(notebook.name));
        let noteCon = el.find('.notes');
        let view: INotebookView = {
            el: el,
            coll: noteCon.collapse({
                toggle: false
            }),
            noteCon: noteCon,
            isEditing: false,
            isRenaming: false,
            notes: new Map<Note, INoteView>(),
            changeBadgeEl: null,
            changeCount: 0
        };

        this._notebooks.set(notebook, view);
        for (let note of notebook.notes.values()) {
            noteCon.append(this.addNote(note).el);
        }

        return view;
    }

    addNote(note: Note): INoteView {
        let notebookView = this._getNotebookView(note.notebook);
        let noteView: INoteView = {
            el: $(noteHtml(note.name)),
            changeFlagEl: null,
            isEditing: false,
            isRenaming: false
        };

        notebookView.notes.set(note, noteView);
        return noteView;
    }

    reorderNotebook() {
        let views: { [name: string]: INotebookView } = {};
        this._notebooks.forEach((view: INotebookView, notebook: Notebook) => {
            views[notebook.name] = view;
        });

        let container = this._container;
        container.empty();
        Object.keys(views).sort().forEach((name: string) => {
            let view = views[name];
            container.append(view.el);
            // recreate collapse object
            view.coll = view.noteCon.collapse({
                // TODO: remember collapse status
                toggle: false
            });
        });
    }

    reorderNote(notebook: Notebook) {
        let views: { [name: string]: INoteView } = {};
        let notebookView: INotebookView = this._notebooks.get(notebook);
        notebookView.notes.forEach((view: INoteView, note: Note) => {
            views[note.name] = view;
        });

        let container = notebookView.noteCon;
        container.empty();
        Object.keys(views).sort().forEach((name: string) => {
            container.append(views[name].el);
        });
    }

    private _initContextMenu() {
        let note: Note; // clicked note
        let notebook: Notebook; // clicked notebook

        const manager = ServiceLocator.noteManager;

        const menuItemLabel = {
            newNote: 'New Note',
            newNotebook: 'New Notebook',
            rename: 'Rename',
            delete: 'Delete',
            read: 'Read Note',
            edit: 'Edit Note',
            livePreview: 'Live Preview'
        };
        const template: Electron.MenuItemOptions[] = [
            {
                label: menuItemLabel.newNote,
                click: () => {
                    this.createNote(notebook);
                }
            },
            {
                label: menuItemLabel.newNotebook,
                click: () => {
                    this.createNotebook();
                }
            },
            { type: 'separator' },
            {
                label: menuItemLabel.read,
                click: () => {
                    this.selectNote(note, NoteView.ReadMode);
                }
            },
            {
                label: menuItemLabel.edit,
                click: () => {
                    this.selectNote(note, NoteView.EditMode);
                }
            },
            {
                label: menuItemLabel.livePreview,
                click: () => {
                    this.selectNote(note, NoteView.LivePreview);
                }
            },
            { type: 'separator' },
            {
                label: menuItemLabel.rename,
                click: () => {
                    // rename note/notebook
                    if (note) {
                        this.renameNote(note);
                    } else {
                        this.renameNotebook(notebook);
                    }
                }
            },
            {
                label: menuItemLabel.delete,
                click: () => {
                    // delete note/notebook
                    try {
                        let dialogOptions: Electron.ShowMessageBoxOptions = {
                            type: 'warning',
                            defaultId: 1
                        };

                        if (note) {
                            if (note.changed) {
                                dialogOptions.message = 'Delete note?';
                                dialogOptions.detail = 'Delete unsaved note will lose changes!';
                                dialogOptions.buttons = ['Delete', 'Cancel'];
                                if (ServiceLocator.dialog.messsageBox(dialogOptions)) { // cancel
                                    return;
                                }
                            }
                            ServiceLocator.noteManager.deleteNote(note);
                        } else {
                            if (notebook.hasChangedNotes) {
                                dialogOptions.message = 'Drop notebooks?';
                                dialogOptions.detail = 'Drop notebook with unsaved note will lose changes!';
                                dialogOptions.buttons = ['Drop', 'Cancel'];
                                if (ServiceLocator.dialog.messsageBox(dialogOptions)) { // cancel
                                    return;
                                }
                            }
                            ServiceLocator.noteManager.deleteNotebook(notebook);
                        }
                    } catch (e) {
                        ServiceLocator.alerter.warn(e.message);
                    }
                }
            }
        ];

        const menu = Menu.buildFromTemplate(template);

        this._el.on('contextmenu', (event) => {
            let el = $(event.target);
            let notebookEl = el.parents('.notebook');
            let noteEl = el.parents('.note');

            // unset notebook and note first
            notebook = null;
            note = null;

            if (notebookEl.length) {
                notebook = manager.notebooks.get(entities.decode(notebookEl.attr('_data')));
            }
            if (noteEl.length) {
                note = notebook.notes.get(entities.decode(noteEl.attr('_data')));
            }

            menu.items.forEach((item: Electron.MenuItem) => {
                let label = item.label;

                item.enabled = false;
                if (menuItemLabel.newNotebook === label) {
                    item.enabled = true;
                }
                if (note) {
                    if (menuItemLabel.read === label
                        || menuItemLabel.edit === label
                        || menuItemLabel.livePreview === label) {
                        item.enabled = true;
                    }
                }
                if (notebook) {
                    if (menuItemLabel.newNote === label
                        || menuItemLabel.rename === label
                        || menuItemLabel.delete === label) {
                        item.enabled = true;
                    }
                }
            });

            menu.popup(getCurrentWindow());
            // stop event bubble and default action
            return false;
        });
    }

    build() {
        let notebooks = ServiceLocator.noteManager.notebooks;
        let container = this._container;

        container.empty();
        for (let notebook of notebooks.values()) {
            container.append(this.addNotebook(notebook).el);
        }
    }

    clearActiveNote() {
        let activeNote = App.getInstance().activeNote;
        if (activeNote === ServiceLocator.noteManager.orphanNote) {
            return;
        }

        let notebookView = this._getNotebookView(activeNote.notebook);
        let noteView = this._getNoteView(notebookView, activeNote);
        notebookView.el.removeClass('active');
        noteView.el.removeClass('active');
    }

    createNotebook() {
        this._create($(notebookHtml()), $(editNotebookHtml()), this._container, (name: string) => {
            let notebook = ServiceLocator.noteManager.createNotebook(name);
        });
    }

    createNote(notebook: Notebook) {
        let view: INotebookView = this._notebooks.get(notebook);
        let noteCon: JQuery = view.noteCon;

        let cb = (name: string) => {
            let note = ServiceLocator.noteManager.createNote(name, notebook);
        };

        // If the notebook is hidden, open it
        // TODO: do not use collapse to open, show it!
        if (!view.el.hasClass('open')) {
            noteCon.one('shown.bs.collapse', () => {
                this._create($(noteHtml()), $(editNoteHtml()), noteCon, cb, view);
            });
            this.toggleNotebook(notebook.name);
            return;
        }

        this._create($(noteHtml()), $(editNoteHtml()), noteCon, cb, view);
    }

    private _create(el: JQuery, editEl: JQuery, container: JQuery, cb: (name: string) => void, view?: INotebookView) {
        let inputEl = editEl.find('input');
        let bgEl = this._setEditBackground();
        let removeCreate = () => {
            el.remove();
            bgEl.remove();

            if (view) { // is creating note
                view.isEditing = false;
            }
        }

        if (view) { // is creating note
            view.isEditing = true;
        }

        editEl.prependTo(el);
        el.prependTo(container);

        inputEl.focus().on('blur', () => {
            removeCreate();
        }).on('keyup', (event) => {
            if (KEYCODE_ESC === event.keyCode) {
                removeCreate();
            } else if (KEYCODE_ENTER === event.keyCode) {
                try {
                    cb(inputEl.val());
                } catch (e) {
                    ServiceLocator.alerter.warn(e.message);
                }
                removeCreate();
            }
        });
    }

    renameNotebook(notebook: Notebook) {
        let view = this._notebooks.get(notebook);
        this._rename(view, $(editNotebookHtml(notebook.name)), (newName: string) => {
            // rename notebook
            ServiceLocator.noteManager.renameNotebook(newName, notebook);
        });
    }

    renameNote(note: Note) {
        let view = this._notebooks.get(note.notebook).notes.get(note);
        this._rename(view, $(editNoteHtml(note.name)), (newName: string) => {
            // rename note
            ServiceLocator.noteManager.renameNote(newName, note);
        });
    }

    private _rename(view: INotebookView | INoteView, editEl: JQuery, cb: (newName: string) => void) {
        let inputEl = editEl.find('input');
        let aEl = view.el.find('> a');
        let bgEl = this._setEditBackground();
        let removeEdit = () => {
            bgEl.remove();
            editEl.remove();
            aEl.show();
            view.isEditing = false;
        };

        aEl.hide();
        editEl.prependTo(view.el);
        inputEl.select().on('blur', () => {
            removeEdit();
        }).on('keyup', (event) => {
            if (KEYCODE_ESC === event.keyCode) {
                removeEdit();
            } else if (KEYCODE_ENTER === event.keyCode) {
                try {
                    cb(inputEl.val());
                    view.isRenaming = true;
                } catch (e) {
                    ServiceLocator.alerter.warn(e.message);
                }
                removeEdit();
            }
        });

        view.isEditing = true;
    }

    private _setEditBackground(): JQuery {
        return $(EDIT_BACKGROUND_HTML).prependTo(this._el);
    }

    deleteNotebook(notebook: Notebook) {
        this._notebooks.get(notebook).el.remove();
    }

    deleteNote(note: Note) {
        this._notebooks.get(note.notebook).notes.get(note).el.remove();
        // TODO: re-calculate change badge
    }
}
