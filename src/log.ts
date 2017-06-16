import { remote, app} from 'electron';
import { sep } from 'path';
import { Console } from 'console';
import { createWriteStream } from 'fs';
import ServiceLocator from './service-locator';
import * as moment from 'moment';
import { isRendererProcess } from './utils';

const LogType = {
    error: 'ERROR',
    info: 'INFO',
};

export class Log extends Console {
    readonly logfile: string;

    constructor() {
        let logfile = `${(app ? app : remote.app).getPath('temp')}${sep}husky.log`;

        super(createWriteStream(logfile));
        this.logfile = logfile;
    }

    error(message?: any, ...optionalParams: any[]): void {
        if (message instanceof Error) {
            super.log(this._formatMsg(message.message, LogType.error), ...optionalParams);
            super.log(message.stack);
        } else {
            super.log(this._formatMsg(message.toString(), LogType.error), ...optionalParams);
            super.trace();
        }
    }

    info(message?: any, ...optionalParams: any[]): void {
        if (!ServiceLocator.config.debug) {
            return;
        }
        super.log(this._formatMsg(message.toString, LogType.info), ...optionalParams);
    }

    private _formatMsg(msg: string, type: string): string {
        return `[${isRendererProcess ? 'RENDERER' : 'MAIN'}] [${type}] [${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`;
    }
}