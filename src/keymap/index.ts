import { ContextInterface } from 'context';
import { CommandInterface } from 'command';

class Keymap {
    private complexKeymap = new Array(256);
    private simpleKeymap = new Array(64);

    build(keybindings: []) {
        for (let i = 0; i < keybindings.length; i++) {
            let kb = keybindings[i];
            let keyChords: string[] = kb.keyChordString.splite(' ');

            if (keyChords.length == 1) {

            } else {

            }
        }
    }

    private addKeyChord(context, keybinding, keymap: Array) {
        let contextKeybindingMap = map[keybinding.keyChord];

        if (!contextKeybindingMap) {
            contextKeybindingMap = new Map();
            contextKeybindingMap.set(context, keybinding);
            return;
        }

        if (contextKeybindingMap.has(context)) {
            throw 'Keybinding confict';
        }

        contextKeybindingMap.set(context, keybinding);
    }
}

export class Registry {

    register(keybinding: Keybinding, context: ContextInterface, command: CommandInterface) {

    }
}

function nextKeyStrokeHandler() {

}
