import { EventEmitter } from 'events';

export abstract class AbstractView extends EventEmitter {
    protected _el: JQuery;

    get el(): JQuery {
        return this._el;
    }

    get dom(): HTMLElement {
        return this._el[0];
    }

    constructor(dom: string | JQuery) {
        super();

        if (typeof dom === 'string') {
            dom = $(dom);
        }
        this._el = dom;
    }

    init() {
        // no-op
    }
}