import { EventEmitter } from 'events';
import { remote, app, ipcMain, ipcRenderer } from 'electron';
import { sep } from 'path';
import { readJsonSync } from 'fs-extra';
import { writeJson } from 'fs-promise';
import { isMainProcess, checkMainProcess } from './utils';

abstract class BaseConfig extends EventEmitter {
    protected _configs;

    constructor() {
        super();
    }

    abstract save(name: string, newVal: any, oldVal: any);

    protected _getConfig(name: string, defaults: any = '') {
        return this._configs[name] || defaults;
    }

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

class SubConfig extends BaseConfig {
    protected _parent: BaseConfig;
    protected _nodeName: string;

    constructor(parent: BaseConfig, configs) {
        super();
        this._configs = configs;
        this._parent = parent;
    }

    save(name: string, newVal: any, oldVal: any) {
        this._parent.save(`${this._nodeName}.${name}`, newVal, oldVal);
    }
}

export class EditorConfig extends SubConfig {
    constructor(parent, configs) {
        super(parent, configs);
        this._nodeName = 'editor';
    }

    get keybinding() {
        return  this._getConfig('keybinding', 'default');
    }

    set keybinding(val: string) {
        this._setConfig('keybinding', val);
    }
}

export class GitConfig extends SubConfig {
    constructor(parent, configs) {
        super(parent, configs);
        this._nodeName = 'git';
    }

    get username(): string {
        return this._getConfig('userName');
    }

    set username(name: string) {
        this._setConfig('userName', name);
    }

    get userEmail(): string {
        return this._getConfig('userEmail');
    }

    set userEmail(email: string) {
        this._setConfig('userEmail', email);
    }

    get remote(): string {
        return this._getConfig('remote');
    }

    set remote(url: string) {
        this._setConfig('remote', url);
    }

    get sshPubKey(): string {
        return this._getConfig('sshPubKey');
    }

    set sshPubKey(filename: string) {
        this._setConfig('sshPubKey', filename);
    }

    get sshPrivKey(): string {
        return this._getConfig('sshPrivKey');
    }

    set sshPrivKey(filename: string) {
        this._setConfig('sshPrivKey', filename);
    }

    get remoteUsername(): string {
        return this._getConfig('remoteUsername');
    }

    set remoteUsername(username: string) {
        this._setConfig('remoteUsername', username);
    }

    get remotePassword(): string {
        return this._getConfig('remotePassword');
    }

    set remotePassword(password: string) {
        this._setConfig('remotePassword', password);
    }
}

const IpcEvent = {
    sync: 'config:sync',
};

export const Event = {
    change: 'config:config-change',
    change_failed: 'config:config-change-failed',
};

const configFile = `${isMainProcess ? app.getPath('home') : remote.app.getPath('home')}${sep}.husky-note.json`;

export class Config extends BaseConfig {
    private _editor: EditorConfig;
    private _git: GitConfig;

    get editor(): EditorConfig {
        return this._editor;
    }

    get git(): GitConfig {
        return this._git;
    }

    get noteDir(): string {
        return this._getConfig('noteDir');
    }

    set noteDir(dirname: string) {
        this._setConfig('noteDir', dirname);
    }

    get debug(): boolean {
        return this._getConfig('debug', false);
    }

    set debug(val: boolean) {
        this._setConfig('debug', val);
    }

    constructor() {
        super();

        try {
            this._configs = readJsonSync(configFile);
        } catch (e) {
            this._configs = {};
        }

        this._setConfigs(this._configs);

        if (isMainProcess) {
            ipcMain.on(IpcEvent.sync, (event, configs, name, newVal, oldVal) => {
                this.update(configs, name, newVal, oldVal);
            });
        }
    }

    /**
     * Could only be called in main process
     */
    update(configs, name: string, newVal: any, oldVal: any) {
        checkMainProcess();
        this._setConfigs(configs);
        this.emit(Event.change, name, newVal, oldVal);
    }

    private _setConfigs(configs) {
        configs.editor = configs.editor || {};
        this._editor = new EditorConfig(this, configs.editor);

        configs.git = configs.git || {};
        this._git = new GitConfig(this, configs.git);
    }

    save(name: string, newVal: any, oldVal: any) {
        writeJson(configFile, this._configs).then(() => {
            ipcRenderer.send(IpcEvent.sync, this._configs, name, newVal, oldVal);
            this.emit(Event.change, name, newVal, oldVal);
        }).catch(() => {
            this.emit(Event.change_failed, name);
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