namespace Commands {
    const { App, NoteView } = require('../app');
    const ViewManager = require('../view-manager');
    const ServiceLocator = require('../service-locator');
    
    const app = App.getInstance();

    export function readNote() {
        app.openNote(app.activeNote, NoteView.ReadMode);
    }

    export function editNote() {
        app.openNote(app.activeNote, NoteView.EditMode);
    }

    export function livePreview() {
        app.openNote(app.activeNote, NoteView.LivePreview);
    }

    export function openOrphanNote() {
        // clear notebook list view active note
        ViewManager.notebookList.clearActiveNote();
        /* Open orphen note action */
        app.openNote(ServiceLocator.noteManager.orphanNote, NoteView.LivePreview);
    }

    export function saveNote() {
        let saveNote = app.activeNote;
        let orphanNote = ServiceLocator.noteManager.orphanNote;

        if (orphanNote === saveNote) {
            ServiceLocator.alerter.warn('Currently, cannot save orphan note');
            // Saving orphan note
            // ViewManager.modal.saveOrphanNote();
            return;
        }

        saveNote.save();
    }

    export function openSettingPanel() {
        ViewManager.settings.openPanel();
    }
}