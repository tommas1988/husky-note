import { AbstractView } from './view';
import ServiceLocator from '../service-locator';

export class EditorView extends AbstractView {
    constructor(el: JQuery) {
        super(el);
    }

    setHeight(height: number) {
        ServiceLocator.editor.setSize(this._el.width(), height);
    }
}