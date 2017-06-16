import { MessageView, MessageType } from './views/message';
import ViewManager from './view-manager';

export class Alerter {
    info(msg: string) {
        ViewManager.message.show(msg, MessageType.Info, 5000);
    }

    warn(msg: string) {
        ViewManager.message.show(msg, MessageType.Warning, 5000);
    }

    fatal(msg: string) {
        ViewManager.message.show(msg, MessageType.Danger);
    }
}