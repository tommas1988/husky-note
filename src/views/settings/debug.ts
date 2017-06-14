import Setting from './setting';
import ServiceLocator from '../../service-locator';

export class DebugSetting extends Setting {
    init() {
        this._name = 'debug';

        let $radios = this.el.find('input');
        if (ServiceLocator.config.debug) {
            $radios.get(0).setAttribute('checked', 'checked');
        } else {
            $radios.get(1).setAttribute('checked', 'checked');
        }
    }

    registerHandler() {
        let $radios = this.el.find('input');
        let config = ServiceLocator.config;

        $radios.click((event) => {
            let el = $(event.currentTarget);
            let val = el.val();
            if ('on' === val && !config.debug) {
                config.debug = true;
                $radios.get(1).removeAttribute('checked');
                el.attr('checked', 'checked');
            } else if ('off' === val && config.debug) {
                config.debug = false;
                $radios.get(0).removeAttribute('checked');
                el.attr('checked', 'checked');
            }
        });
    }
}