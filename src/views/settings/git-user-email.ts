import Setting from './setting';
import ServiceLocator from '../../service-locator';

export class GitUserEmailSetting extends Setting {
    init() {
        this._name = 'git.userEmail';
        this.el.find('input').val(ServiceLocator.config.git.userEmail);
    }

    registerHandler() {
        this.el.find('input').change((event) => {
            ServiceLocator.config.git.userEmail = $(event.target).val();
        });
    }
}