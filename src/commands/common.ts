import { App, NoteView } from '../app';
import ViewManager from '../view-manager';
import ServiceLocator from '../service-locator';

const app = App.getInstance();

export default class CommonCommands {
    static readNote() {
        app.openNote(app.activeNote, NoteView.ReadMode);
    }

    static editNote() {
        app.openNote(app.activeNote, NoteView.EditMode);
    }

    static livePreview() {
        app.openNote(app.activeNote, NoteView.LivePreview);
    }

    static openOrphanNote() {
        // clear notebook list view active note
        ViewManager.notebookList.clearActiveNote();
        /* Open orphen note action */
        app.openNote(ServiceLocator.noteManager.orphanNote, NoteView.LivePreview);
    }

    static saveNote() {
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

    static openSettingPanel() {
        ViewManager.settings.openPanel();
    }
}