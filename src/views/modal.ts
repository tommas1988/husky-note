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
    private _keyUpHandler;

    constructor() {
        super('#modal');
        this._el.keyup()
    }

    open(name: string) {
        readFile(`${basedir}${name}.html`, { encoding: 'utf8' }).then((html) => {
            let handler: IModalHandler = require(`./modals/${name}`).default;
            let el = $(html);

            // close modal when press ESC
            this._el.on('keyup', (event) => {
                if (event.keyCode === 27) {
                    this.close();
                }
            });

            el.find('.modal-header .close').click(() => {
                this.close();
            });

            // insert html before calling handler
            this._el.append(el);

            el.find('.modal-content')
                .addClass(`animated ${FADE_IN_CLASS}`)
                .removeClass(FADE_OUT_CLASS);

            // set dialog postion
            el.css({ marginTop: window.innerHeight * 0.3 });

            handler(el, this);

            // show & focus
            this._el.show().focus();

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
        this._el.off('keyup');

        setTimeout(() => {
            this._el.hide().empty();
        }, 300);
    }
}