import { MessageView, MessageType } from './views/message';
import ViewManager from './view-manager';

export class Alerter {
    warn(msg: string) {
        ViewManager.message.show(msg, MessageType.Warning, 5000);
    }

    fatal(e: Error) {
        ViewManager.message.show(e.message, MessageType.Danger);
        console.log(e.stack);
    }
}