import Setting from './setting';
import ServiceLocator from '../../service-locator';
import ViewManager from '../../view-manager';

export class GitRemoteAuthSetting extends Setting {
    init() {
        this._name = 'git.auth';
    }

    registerHandler() {
        this.el.on('click', '> button', () => {
            ViewManager.modal.open('git-auth-setting');
        });
    }
}