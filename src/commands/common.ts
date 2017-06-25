import { App, NoteView } from '../app';
import ViewManager from '../view-manager';
import ServiceLocator from '../service-locator';

export function readNote(app: App) {
    app.openNote(app.activeNote, NoteView.ReadMode);
}

export function editNote(app: App) {
    app.openNote(app.activeNote, NoteView.EditMode);
}

export function livePreview(app: App) {
    app.openNote(app.activeNote, NoteView.LivePreview);
}

export function openOrphanNote(app: App) {
    // clear notebook list view active note
    ViewManager.notebookList.clearActiveNote();
    /* Open orphen note action */
    app.openNote(ServiceLocator.noteManager.orphanNote, NoteView.LivePreview);
}

export function saveNote(app: App) {
    let saveNote = app.activeNote;
    let orphanNote = ServiceLocator.noteManager.orphanNote;

    if (orphanNote === saveNote) {
        // Saving orphan note
        ViewManager.modal.open('save-orphan-note');
        return;
    }

    saveNote.save();
}

export function syncNotes() {
    // TODO: do some check
    ServiceLocator.noteManager.sync();
}

export function openSettingPanel() {
    ViewManager.settings.openPanel();
}