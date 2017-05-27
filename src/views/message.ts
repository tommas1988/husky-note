import { AbstractView } from './view';
import * as marked from 'marked';

function messageBarHtml(msg: string): string {
    return `
<div class="message-bar animated">
    ${msg}
    <button type="button" class="close">
        <span aria-hidden="true">×</span>
    </button>
</div>`;
}

const FADE_IN_CLASS = 'fadeInDown';
const FADE_OUT_CLASS = 'fadeOutUp';

export const enum MessageType {
    Info,
    Success,
    Warning,
    Danger
};

export class MessageView extends AbstractView {
    constructor() {
        super('#message');

        marked.setOptions({
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartypants: false
        });
    }

    show(msg: string, type: MessageType, liveTime: number = 0) {
        let classStr;
        switch (type) {
            case MessageType.Info:
                classStr = 'info';
                break;
            case MessageType.Success:
                classStr = 'success';
                break;
            case MessageType.Warning:
                classStr = 'warning';
                msg = `__Warning!__ ${msg}`;
                break;
            case MessageType.Danger:
                classStr = 'danger';
                msg = `__Fatal!__ ${msg}`;
                break;
        }

        let el = $(messageBarHtml(marked(msg)))
            .addClass(`alert-${classStr} ${classStr} ${FADE_IN_CLASS}`)
            .appendTo(this._el);

        let close = () => {
            el.addClass(FADE_OUT_CLASS);
            setTimeout(() => {
                el.remove();
            }, 500);
        };

        el.find('> button.close').click(close);

        if (liveTime) {
            setTimeout(close, liveTime);
        }
    }
}