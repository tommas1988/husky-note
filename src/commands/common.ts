import { App, NoteView } from '../app';
import ViewManager from '../view-manager';
import ServiceLocator from '../service-locator';

// TODO: should have a register commands function to register commands

export default class CommonCommands {
    static readNote() {
        let app = App.getInstance();
        app.openNote(app.activeNote, NoteView.ReadMode);
    }

    static editNote() {
        let app = App.getInstance();
        app.openNote(app.activeNote, NoteView.EditMode);
    }

    static livePreview() {
        let app = App.getInstance();
        app.openNote(app.activeNote, NoteView.LivePreview);
    }

    static openOrphanNote() {
        // clear notebook list view active note
        ViewManager.notebookList.clearActiveNote();
        /* Open orphen note action */
        App.getInstance().openNote(ServiceLocator.noteManager.orphanNote, NoteView.LivePreview);
    }

    static saveNote() {
        let saveNote = App.getInstance().activeNote;
        let orphanNote = ServiceLocator.noteManager.orphanNote;

        if (orphanNote === saveNote) {
            ServiceLocator.alerter.warn('Currently, cannot save orphan note');
            // Saving orphan note
            // ViewManager.modal.saveOrphanNote();
            return;
        }

        saveNote.save();
    }

    static openSettingPanel() {
        ViewManager.settings.openPanel();
    }
}