import { AbstractView } from './view';
import { readFileSync } from 'fs';
import { sep } from 'path';
import { Config } from '../config';
import ServiceLocator from '../service-locator';
import Setting from './settings/setting';
import { NoteDirSetting } from './settings/note-dir';
import { DebugSetting } from './settings/debug';
import { EditorKeybindingSetting } from './settings/editor-keybinding';
import { GitUsernameSetting } from './settings/git-username';
import { GitUserEmailSetting } from './settings/git-user-email';
import { GitRemoteSetting } from './settings/git-remote';
import { GitPublicKeySetting } from './settings/git-ssh-pub-key';
import { GitPrivateKeySetting } from './settings/git-ssh-priv-key';
import { GitRemoteUsernameSetting } from './settings/git-remote-username';
import { GitRemotePasswordSetting } from './settings/git-remote-password';

const FADE_IN_CLASS = 'fadeInRight';
const FADE_OUT_CLASS = 'fadeOutRight';

const settings = [
    NoteDirSetting,
    DebugSetting,
    EditorKeybindingSetting,
    GitUsernameSetting,
    GitUserEmailSetting,
    GitRemoteSetting,
    GitPublicKeySetting,
    GitPrivateKeySetting,
    GitRemoteUsernameSetting,
    GitRemoteUsernameSetting,
];

export class SettingsView extends AbstractView {
    private _setHeightHandler: () => void;
    private _closePanelHandler: () => void;

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

        // init setting item
        settings.forEach((settingClass, i, settings) => {
            let setting: Setting = new settingClass(el);
            setting.registerHandler();
        });

        this._closePanelHandler = () => {
            this.closePanel();
        };

        this._setHeightHandler = () => {
            el.height(window.innerHeight);
        };

        el.on('click', '.back a', this._closePanelHandler);
        $(window).on('resize', this._setHeightHandler);

        this._setHeightHandler();
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

        el.off('click', '.back a', this._closePanelHandler);
        $(window).off('resize', this._setHeightHandler);

        this._closePanelHandler = null;
        this._setHeightHandler = null;
    }
}