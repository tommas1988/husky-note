import { AbstractView } from './view';
import { readFile } from 'fs-promise';
import { sep } from 'path';

const basedir = `${__dirname}${sep}templates${sep}modals${sep}`;

const FADE_IN_CLASS = 'zoomIn';
const FADE_OUT_CLASS = 'zoomOut';

export interface IModalHandler {
    (el: JQuery, modelView: ModalView): void
}

export class ModalView extends AbstractView {
    constructor() {
        super('#modal');
        this._el.addClass('modal');
    }

    open(name: string) {
        readFile(`${basedir}${name}.html`, { encoding: 'utf8' }).then((html) => {
            let handler: IModalHandler = require(`./modals/${name}`).default;
            let el = $(html);
            let dialogEl = el.find('.modal-content');

            el.find('.modal-header .close').click(() => {
                this.close();
            });

            handler(el, this);

            dialogEl.addClass(`animated ${FADE_IN_CLASS}`)
                .removeClass(FADE_OUT_CLASS);

            el.css({ marginTop: window.innerHeight * 0.3 });

            this._el.append(el).show();

            setTimeout(() => {
                this._el.addClass('open');
            }, 0);
        }).catch((e) => {
            throw e;
        });
    }

    close() {
        this._el.find('.modal-content')
            .removeClass(FADE_IN_CLASS)
            .addClass(FADE_OUT_CLASS);

        this._el.removeClass('open');

        setTimeout(() => {
            this._el.hide().empty();
        }, 300);
    }
}