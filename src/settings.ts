import { readFile } from 'fs/promises';
import { KeybindingInfo } from './keymap';

class Settings {
    private keybindings: KeybindingInfo[] | undefined;

    getKeybindings(): Promise<KeybindingInfo[]> {
        if (this.keybindings) {
            return Promise.resolve(this.keybindings);
        } else {
            let keymapConfigFile = './test/settings/keymap/emacs.json';
            return readFile(keymapConfigFile, 'utf8').then(data => {
                this.keybindings = <KeybindingInfo[]> JSON.parse(data);
                return this.keybindings;
            });
        }
    }
}

export default new Settings();