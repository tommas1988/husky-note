import { EventEmitter } from 'events';
import { remote, app } from 'electron';
import { sep } from 'path';
import { readJsonSync } from 'fs-extra';
import { writeJson } from 'fs-promise';
import * as utils from './utils';

abstract class BaseConfig extends EventEmitter {
    protected _configs;

    constructor() {
        super();
    }

    abstract save(name: string, newVal: any, oldVal: any);

    protected _setConfig(name: string, newVal: any, compare?: (oldVal: any, newVal: any) => boolean) {
        let oldVal = this._configs[name];

        if (compare) {
            if (!compare(oldVal, newVal)) {
                return;
            }
        } else if (oldVal === newVal) {
            return;
        }

        this._configs[name] = newVal;
        this.save(name, newVal, oldVal);
    }
}

abstract class SubConfig extends BaseConfig {
    protected _parent: BaseConfig;
    protected _nodeName: string;

    get configs() {
        return this._configs;
    }

    save(name: string, newVal: any, oldVal: any) {
        this._parent.save(`${this._nodeName}.${name}`, newVal, oldVal);
    }
}

const configFile = `${utils.isMainProcess ? app.getPath('home') : remote.app.getPath('home')}${sep}.husky-note.json`;

export class Config extends BaseConfig {
    // TODO: move events to top level
    static EVENT_CONFIG_CHANGE: 'config:config-change';
    static EVENT_CONFIG_CHANGE_FAILED: 'config:config-change-failed';

    constructor() {
        super();

        try {
            this._configs = readJsonSync(configFile);
        } catch (e) {
            this._configs = {};
        }
    }

    get noteDir(): string {
        return this._configs.noteDir || '';
    }

    set noteDir(dirname: string) {
        this._setConfig('noteDir', dirname);
    }

    get debug(): boolean {
        return this._configs.debug || false;
    }

    set debug(val: boolean) {
        this._setConfig('debug', val);
    }

    save(name: string, newVal: any, oldVal: any) {
        writeJson(configFile, this._configs).then(() => {
            this.emit(Config.EVENT_CONFIG_CHANGE, name, newVal, oldVal);
        }).catch(() => {
            this.emit(Config.EVENT_CONFIG_CHANGE_FAILED, name);
            let parts = name.split('.');
            let config = this._configs;

            // restore to old value
            while (parts.length > 1) {
                config = config[parts.shift()];
            }
            config[parts[0]] = oldVal;
        });
    }
}