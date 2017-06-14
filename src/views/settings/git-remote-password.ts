import Setting from './setting';
import ServiceLocator from '../../service-locator';

export class GitRemotePasswordSetting extends Setting {
    init() {
        this._name = 'git.remotePassword';
        this.el.find('input').val(ServiceLocator.config.git.remotePassword);
    }

    registerHandler() {
        this.el.find('input').change((event) => {
            ServiceLocator.config.git.remotePassword = $(event.target).val();
        });
    }
}