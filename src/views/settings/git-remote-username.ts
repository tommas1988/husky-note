import Setting from './setting';
import ServiceLocator from '../../service-locator';

export class GitRemoteUsernameSetting extends Setting {
    init() {
        this._name = 'git.remoteUsername';
        this.el.find('input').val(ServiceLocator.config.git.remoteUsername);
    }

    registerHandler() {
        this.el.find('input').change((event) => {
            ServiceLocator.config.git.remoteUsername = $(event.target).val();
        });
    }
}