import { ModalView } from '../modal';
import ServiceLoactor from '../../service-locator';

const KEYCODE_ENTER = 13;

export default function (el: JQuery, modalView: ModalView) {
    const ERROR_CLASS = 'has-danger';
    const PARENT_CLASS = 'form-group';
    const NOTEBOOK_ID = 'modal-orphan-notebook-text-input';
    const NOTE_ID = 'modal-orphan-note-text-input';

    // remove error class
    el.on('focus', 'input', (event) => {
        let targetId = event.currentTarget.id;
        if (targetId !== NOTEBOOK_ID && targetId !== NOTE_ID) {
            return;
        }
        $(event.currentTarget).parents(`.${PARENT_CLASS}`).removeClass(ERROR_CLASS);
    });
    // check input & add error class
    el.on('blur', 'input', (event) => {
        let targetId = event.currentTarget.id;
        if (targetId !== NOTEBOOK_ID && targetId !== NOTE_ID) {
            return;
        }

        let targetEl = $(event.currentTarget);
        if (!targetEl.val()) {
            targetEl.parents(`.${PARENT_CLASS}`).addClass(ERROR_CLASS);
        }
    });

    let noteManager = ServiceLoactor.noteManager;

    // save handler
    el.on('click', 'button.save', (event) => {
        let notebookName = $(`#${NOTEBOOK_ID}`).val();
        let noteName = $(`#${NOTE_ID}`).val();

        if (!notebookName || !noteName) {
            return;
        }

        let notebook = noteManager.notebooks.get(notebookName);
        if (!notebook) {
            notebook = noteManager.createNotebook(notebookName);
        }

        noteManager.createNote(noteName, notebook, true);

        modalView.close();
    });

    let notebooks = [];
    for (let notebook of noteManager.notebooks.keys()) {
        notebooks.push(notebook);
    }

    let dataSource = new Bloodhound<string>({
        local: notebooks,
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace
    });

    let dataset = {
        source: (query, sync, async) => {
            if (query === '') {
                sync(notebooks);
            } else {
                dataSource.search(query, sync, async);
            }
        }
    };

    let notebookEl = $(`#${NOTEBOOK_ID}`);
    notebookEl.typeahead<string>({
        minLength: 0,
        highlight: true
    }, dataset);

    notebookEl.parent().css({ width: '100%' });

    notebookEl.on('keyup', (event) => {
        if (KEYCODE_ENTER === event.keyCode) {
            notebookEl.typeahead('close');
        }
    });
}