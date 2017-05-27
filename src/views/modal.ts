import { AbstractView } from './view';
import { readFile } from 'fs-promise';
import { sep } from 'path';

const basedir = `${__dirname}${sep}templates${sep}modals${sep}`;

const FADE_IN_CLASS = 'zoomIn';
const FADE_OUT_CLASS = 'zoomOut';

export class ModalView extends AbstractView {
    constructor() {
        super('#modal');
        this._el.addClass('modal');
    }

    saveOrphanNote() {
        this._loadModal('save-orphan-note', (el: JQuery) => {

        });
    }

    private _loadModal(name: string, cb: (el: JQuery) => void) {
        readFile(`${basedir}${name}.html`, { encoding: 'utf8' }).then((html) => {
            let el = $(html);
            let dialogEl = el.find('.modal-content');

            el.find('.modal-header .close').click(() => {
                this.close();
            });

            dialogEl.addClass(`animated ${FADE_IN_CLASS}`)
                .removeClass(FADE_OUT_CLASS);

            el.css({ marginTop: window.innerHeight * 0.3 });
            this._el.append(el).show();

            cb(el);
        }).catch((e) => {
            throw e;
        });
    }

    close() {
        let el = this._el.find('.modal-content');

        el.removeClass(FADE_IN_CLASS).addClass(FADE_OUT_CLASS);
        setTimeout(() => {
            this._el.hide().empty();
        }, 300);
    }
}