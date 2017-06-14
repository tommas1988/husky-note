import Setting from './setting';
import ServiceLocator from '../../service-locator';

export class GitUsernameSetting extends Setting {
    init() {
        this._name = 'git.username';
        this.el.find('input').val(ServiceLocator.config.git.username);
    }

    registerHandler() {
        this.el.find('input').change((event) => {
            ServiceLocator.config.git.username = $(event.target).val();
        });
    }
}