import { App, NoteView } from '../app';
import ViewManager from '../view-manager';
import ServiceLocator from '../service-locator';

export function readNote() {
    let app = App.getInstance();
    app.openNote(app.activeNote, NoteView.ReadMode);
}

export function editNote() {
    let app = App.getInstance();
    app.openNote(app.activeNote, NoteView.EditMode);
}

export function livePreview() {
    let app = App.getInstance();
    app.openNote(app.activeNote, NoteView.LivePreview);
}

export function openOrphanNote() {
    // clear notebook list view active note
    ViewManager.notebookList.clearActiveNote();
    /* Open orphen note action */
    App.getInstance().openNote(ServiceLocator.noteManager.orphanNote, NoteView.LivePreview);
}

export function saveNote() {
    let saveNote = App.getInstance().activeNote;
    let orphanNote = ServiceLocator.noteManager.orphanNote;

    if (orphanNote === saveNote) {
        // Saving orphan note
        ViewManager.modal.open('save-orphan-note');
        return;
    }

    saveNote.save();
}

export function openSettingPanel() {
    ViewManager.settings.openPanel();
}