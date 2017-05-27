import { App, NoteView } from './app';
import ViewManager from './view-manager';
import ServiceLocator from './service-locator';

const Commands = {
    readNote() {
        let app = App.getInstance();
        app.openNote(app.activeNote, NoteView.ReadMode);
    },

    editNote() {
        let app = App.getInstance();
        app.openNote(app.activeNote, NoteView.EditMode);
    },

    livePreview() {
        let app = App.getInstance();
        app.openNote(app.activeNote, NoteView.LivePreview);
    },

    openOrphanNote() {
        // clear notebook list view active note
        ViewManager.notebookList.clearActiveNote();
        /* Open orphen note action */
        App.getInstance().openNote(ServiceLocator.noteManager.orphanNote, NoteView.LivePreview);
    },

    saveNote() {
        let saveNote = App.getInstance().activeNote;
        let orphanNote = ServiceLocator.noteManager.orphanNote;

        if (orphanNote === saveNote) {
            ServiceLocator.alerter.warn('Currently, cannot save orphan note');
            // Saving orphan note
            // ViewManager.modal.saveOrphanNote();
            return;
        }

        saveNote.save();
    },

    openSettingPanel() {
        ViewManager.settings.openPanel();
    }
};

export default Commands;