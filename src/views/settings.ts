import { AbstractView } from './view';
import { readFileSync } from 'fs';
import { sep, dirname } from 'path';
import { Config } from '../config';
import ServiceLocator from '../service-locator';
import { remote } from 'electron';

const FADE_IN_CLASS = 'fadeInRight';
const FADE_OUT_CLASS = 'fadeOutRight';

export class SettingsView extends AbstractView {
    constructor() {
        super('#setting');
        this._el.addClass('animated');
    }

    openPanel() {
        let html = readFileSync(`${__dirname}${sep}templates${sep}settings.html`, { encoding: 'utf8' });

        if (!html) {
            ServiceLocator.alerter.fatal(new Error('Cannot open setting template'));
            return;
        }

        let el = this._el;

        el.append(html);
        this._setPanelHandlers()

        this._initNoteDirSetting();
        this._initDebugSetting();
        this._initEditorKeybinding();

        el.addClass(FADE_IN_CLASS).show();
    }

    closePanel() {
        let el = this._el;
        el.removeClass(FADE_IN_CLASS).addClass(FADE_OUT_CLASS);
        setTimeout(() => {
            el.removeClass(`${FADE_IN_CLASS} ${FADE_OUT_CLASS}`)
                .hide()
                .empty();
        }, 400);
    }

    private _setPanelHandlers() {
        this._el.on('click', '.back a', () => {
            this.closePanel();
        });
    }

    private _getSettingEl(name: string): JQuery {
        return this._el.find(`section[_data="${name}"]`);
    }

    private _initNoteDirSetting() {
        let el = this._getSettingEl('nodeDir');
        let inputEl = el.find('input');
        let config = ServiceLocator.config;
        let noteDir = config.noteDir;

        // set note directory
        inputEl.val(noteDir);

        el.on('click', 'button', (event) => {
            let dirs = remote.dialog.showOpenDialog({
                title: 'Select note directory',
                defaultPath: noteDir ? dirname(noteDir) : remote.app.getPath('home'),
                properties: ['openDirectory']
            });

            let newDir: string = (dirs && dirs.length) ? dirs[0] : '';
            if (!newDir || newDir === noteDir) {
                return;
            }

            config.noteDir = newDir;
            inputEl.val(newDir);
        });
    }

    private _initDebugSetting() {
        let radios = this._getSettingEl('debug').find('input');
        let config = ServiceLocator.config;

        if (config.debug) {
            radios.get(0).setAttribute('checked', 'checked');
        } else {
            radios.get(1).setAttribute('checked', 'checked');
        }

        radios.click((event) => {
            let el = $(event.currentTarget);
            let val = el.val();
            if ('on' === val && !config.debug) {
                config.debug = true;
                radios.get(1).removeAttribute('checked');
                el.attr('checked', 'checked');
            } else if ('off' === val && config.debug) {
                config.debug = false;
                radios.get(0).removeAttribute('checked');
                el.attr('checked', 'checked');
            }
        });
    }

    private _initEditorKeybinding() {
        let select = $('#setting-keybinding');
        let config = ServiceLocator.config.editor;

        select.val(config.keybinding);
        select.change(() => {
            config.keybinding = select.val();
        });
    }
}