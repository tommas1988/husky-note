import { AbstractView } from './view';
import { App } from '../app';
import * as $ from 'jquery';

const quickAccessers = [
    {
        command: 'readNote',
        icon: 'fa fa-eye',
        title: 'Read note'
    },
    {
        command: 'editNote',
        icon: 'fa fa-pencil',
        title: 'Edit note'
    },
    {
        command: 'livePreview',
        icon: 'fa fa-pencil-square-o',
        title: 'Live preview'
    },
    {
        command: 'openOrphanNote',
        icon: 'fa fa-sticky-note-o',
        title: 'Open a new note'
    },
    {
        command: 'saveNote',
        icon: 'fa fa-floppy-o',
        title: 'Save note'
    }
];

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
        quickAccessers.forEach((accesser) => {
            $(accesserHtml(accesser.command, accesser.icon, accesser.title)).appendTo(container);
        });

        this._el.append(SETTING_HTML);

        let app = App.getInstance();
        this._el.on('click', '> nav > ul .nav-item', (event) => {
            let name = event.currentTarget.getAttribute('_data');
            app.execCommand(name);
        });

        this._el.on('click', '.setting', () => {
            app.execCommand('openSettingPanel');
        });
    }
}