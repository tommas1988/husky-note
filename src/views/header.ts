import { AbstractView } from './view';
import { App } from '../app';
import ServiceLocator from '../service-locator';
import { IpcEvent as NoteManagerIpcEvent, Event as NoteManagerEvent } from '../note-manager';
import { ipcRenderer } from 'electron';

const CLASS_SPIN = 'fa-spin';

const quickAccessers = {
    readNote: {
        handler: 'readNote',
        icon: 'fa fa-eye',
        title: 'Read note'
    },
    editNote: {
        handler: 'editNote',
        icon: 'fa fa-pencil',
        title: 'Edit note'
    },
    livePreview: {
        handler: 'livePreview',
        icon: 'fa fa-pencil-square-o',
        title: 'Live preview'
    },
    openOrphanNote: {
        handler: 'openOrphanNote',
        icon: 'fa fa-sticky-note-o',
        title: 'Open a new note'
    },
    saveNote: {
        handler: 'saveNote',
        icon: 'fa fa-floppy-o',
        title: 'Save note'
    },
    syncNotes: {
        handler: (event) => {
            let el = $(event.currentTarget).find('i');
            if (el.hasClass(CLASS_SPIN)) {
                // already in sync
                return;
            }

            App.getInstance().execCommand('syncNotes');
        },
        icon: 'fa fa-refresh',
        title: 'Sync notes',
    },
};

const SETTING_HTML = `<div class="setting">
    <a href="javascript:void(0)"><i class="fa fa-gear"></i></a>
</div>`;

function accesserHtml(command: string, icon: string, title: string) {
    return `
<li class="nav-item" title="${title}" _data="${command}">
    <a href="javascript:void(0)"><i class="${icon}"></i></a>
</li>`;
}

export class HeaderView extends AbstractView {
    constructor() {
        super('#header');
    }

    init() {
        let container = this._el.find('> nav > ul');
        for (let name in quickAccessers) {
            let accesser = quickAccessers[name];
            $(accesserHtml(name, accesser.icon, accesser.title)).appendTo(container);
        }

        this._el.append(SETTING_HTML);

        let app = App.getInstance();
        this._el.on('click', '> nav > ul .nav-item', (event) => {
            let name = event.currentTarget.getAttribute('_data');
            let handler = quickAccessers[name].handler;
            if (typeof handler === 'string') {
                app.execCommand(name);
            } else {
                handler(event);
            }
        });

        this._el.on('click', '.setting', () => {
            app.execCommand('openSettingPanel');
        });

        // start sync icon spin when sync
        ServiceLocator.noteManager.on(NoteManagerEvent.sync, () => {
            this.startSyncSpin();
        });

        // stop sync icon spin when sync stopped
        ipcRenderer.on(NoteManagerIpcEvent.syncComplete, () => {
            this.stopSyncSpin();
        });
        ipcRenderer.on(NoteManagerIpcEvent.syncFailed, () => {
            this.stopSyncSpin();
        });
    }

    startSyncSpin() {
        let el = this._el.find('[_data=syncNotes]').find('i');
        if (!el.hasClass(CLASS_SPIN)) {
            el.addClass(CLASS_SPIN);
        }
    }

    stopSyncSpin() {
        this._el.find('[_data=syncNotes]').find('i').removeClass(CLASS_SPIN);
    }
}