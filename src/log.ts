import { remote, app} from 'electron';
import { sep } from 'path';
import { Console } from 'console';
import { createWriteStream } from 'fs';
import ServiceLocator from './service-locator';

const logfile = `${(app ? app : remote.app).getPath('desktop')}${sep}husky.log`;

export class Log extends Console {
    constructor() {
        super(createWriteStream(logfile));
    }

    error(message?: any, ...optionalParams: any[]): void {
        super.error(message, ...optionalParams);
    }

    info(message?: any, ...optionalParams: any[]): void {
        if (!ServiceLocator.config.debug) {
            return;
        }
        super.error(message, ...optionalParams);
    }
}