import Setting from './setting';
import ServiceLocator from '../../service-locator';

export class EditorKeybindingSetting extends Setting {
    init() {
        this._name = 'editor.keybinding';
        $('#setting-keybinding').val(ServiceLocator.config.editor.keybinding);
    }

    registerHandler() {
        $('#setting-keybinding').change((event) => {
            ServiceLocator.config.editor.keybinding = $(event.target).val();
        });
    }
}