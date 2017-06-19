import { remote, app } from 'electron';
import { sep, dirname } from 'path';
import { Console } from 'console';
import { openSync, createWriteStream, WriteStream, truncateSync } from 'fs';
import ServiceLocator from './service-locator';
import * as moment from 'moment';
import { isRendererProcess } from './utils';
import { inspect, format } from 'util';

const LogType = {
    error: 'ERROR',
    info: 'INFO',
};

export class Log extends Console {
    readonly logfile;

    constructor() {
        let logfile = `${dirname((app ? app : remote.app).getPath('exe'))}${sep}husky.log`

        super(createWriteStream(logfile, {
            flags: 'r+',
            encoding: 'utf8',
            fd: null,
            mode: 0o666,
            autoClose: true
        }));

        this.logfile = logfile;
    }

    clear() {
        truncateSync(this.logfile);
    }

    error(message?: any, ...optionalParams: any[]): void {
        if (message instanceof Error) {
            this.log(this._formatMsg(message.message, LogType.error), ...optionalParams);
            this.log(message.stack);
        } else {
            message = (typeof message === 'string') ? message : inspect(message);
            this.log(this._formatMsg(message, LogType.error), ...optionalParams);
            this.trace();
        }
    }

    info(message?: any, ...optionalParams: any[]): void {
        if (!ServiceLocator.config.debug) {
            return;
        }
        this.log(this._formatMsg((typeof message === 'string') ? message : inspect(message), LogType.info), ...optionalParams);
    }

    /**
     * Modified version of node to avoid recursive calls
     */
    trace(...args) {
        let err = new Error();
        err.name = 'Trace';
        err.message = format.apply(null, args);
        Error.captureStackTrace(err, this.trace);
        this.log(err.stack);
    }

    private _formatMsg(msg: string, type: string): string {
        return `[${isRendererProcess ? 'RENDERER' : 'MAIN'}] [${type}] [${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`;
    }
}