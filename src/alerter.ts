import { MessageView, MessageType } from './views/message';
import ViewManager from './view-manager';

export class Alerter {
    info(msg: string) {
        ViewManager.message.show(msg, MessageType.Info, 5000);
    }

    warn(msg: string) {
        ViewManager.message.show(msg, MessageType.Warning, 5000);
    }

    fatal(e: Error) {
        ViewManager.message.show(e.message, MessageType.Danger);
        console.log(e.stack);
    }
}