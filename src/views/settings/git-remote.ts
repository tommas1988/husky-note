import Setting from './setting';
import ServiceLocator from '../../service-locator';

export class GitRemoteSetting extends Setting {
    init() {
        this._name = 'git.remote';
        this.el.find('input').val(ServiceLocator.config.git.remote);
    }

    registerHandler() {
        this.el.find('input').change((event) => {
            ServiceLocator.config.git.remote = $(event.target).val();
        });
    }
}