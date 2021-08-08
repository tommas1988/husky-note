import { Context } from 'context';
import { CommonCommandName } from 'command';
import { KeyCode } from './keyCodes.ts';

let KEY_CODE_MAP: { [keyCode: number]: KeyCode } = new Array(230);
KEY_CODE_MAP[8] = KeyCode.Backspace;
KEY_CODE_MAP[9] = KeyCode.Tab;
KEY_CODE_MAP[13] = KeyCode.Enter;
KEY_CODE_MAP[27] = KeyCode.Escape;
KEY_CODE_MAP[32] = KeyCode.Space;
KEY_CODE_MAP[33] = KeyCode.PageUp;
KEY_CODE_MAP[34] = KeyCode.PageDown;
KEY_CODE_MAP[35] = KeyCode.End;
KEY_CODE_MAP[36] = KeyCode.Home;
KEY_CODE_MAP[37] = KeyCode.LeftArrow;
KEY_CODE_MAP[38] = KeyCode.UpArrow;
KEY_CODE_MAP[39] = KeyCode.RightArrow;
KEY_CODE_MAP[40] = KeyCode.DownArrow;
KEY_CODE_MAP[45] = KeyCode.Insert;
KEY_CODE_MAP[46] = KeyCode.Delete;

KEY_CODE_MAP[48] = KeyCode.KEY_0;
KEY_CODE_MAP[49] = KeyCode.KEY_1;
KEY_CODE_MAP[50] = KeyCode.KEY_2;
KEY_CODE_MAP[51] = KeyCode.KEY_3;
KEY_CODE_MAP[52] = KeyCode.KEY_4;
KEY_CODE_MAP[53] = KeyCode.KEY_5;
KEY_CODE_MAP[54] = KeyCode.KEY_6;
KEY_CODE_MAP[55] = KeyCode.KEY_7;
KEY_CODE_MAP[56] = KeyCode.KEY_8;
KEY_CODE_MAP[57] = KeyCode.KEY_9;

KEY_CODE_MAP[65] = KeyCode.KEY_A;
KEY_CODE_MAP[66] = KeyCode.KEY_B;
KEY_CODE_MAP[67] = KeyCode.KEY_C;
KEY_CODE_MAP[68] = KeyCode.KEY_D;
KEY_CODE_MAP[69] = KeyCode.KEY_E;
KEY_CODE_MAP[70] = KeyCode.KEY_F;
KEY_CODE_MAP[71] = KeyCode.KEY_G;
KEY_CODE_MAP[72] = KeyCode.KEY_H;
KEY_CODE_MAP[73] = KeyCode.KEY_I;
KEY_CODE_MAP[74] = KeyCode.KEY_J;
KEY_CODE_MAP[75] = KeyCode.KEY_K;
KEY_CODE_MAP[76] = KeyCode.KEY_L;
KEY_CODE_MAP[77] = KeyCode.KEY_M;
KEY_CODE_MAP[78] = KeyCode.KEY_N;
KEY_CODE_MAP[79] = KeyCode.KEY_O;
KEY_CODE_MAP[80] = KeyCode.KEY_P;
KEY_CODE_MAP[81] = KeyCode.KEY_Q;
KEY_CODE_MAP[82] = KeyCode.KEY_R;
KEY_CODE_MAP[83] = KeyCode.KEY_S;
KEY_CODE_MAP[84] = KeyCode.KEY_T;
KEY_CODE_MAP[85] = KeyCode.KEY_U;
KEY_CODE_MAP[86] = KeyCode.KEY_V;
KEY_CODE_MAP[87] = KeyCode.KEY_W;
KEY_CODE_MAP[88] = KeyCode.KEY_X;
KEY_CODE_MAP[89] = KeyCode.KEY_Y;
KEY_CODE_MAP[90] = KeyCode.KEY_Z;

KEY_CODE_MAP[112] = KeyCode.F1;
KEY_CODE_MAP[113] = KeyCode.F2;
KEY_CODE_MAP[114] = KeyCode.F3;
KEY_CODE_MAP[115] = KeyCode.F4;
KEY_CODE_MAP[116] = KeyCode.F5;
KEY_CODE_MAP[117] = KeyCode.F6;
KEY_CODE_MAP[118] = KeyCode.F7;
KEY_CODE_MAP[119] = KeyCode.F8;
KEY_CODE_MAP[120] = KeyCode.F9;
KEY_CODE_MAP[121] = KeyCode.F10;
KEY_CODE_MAP[122] = KeyCode.F11;
KEY_CODE_MAP[123] = KeyCode.F12;
KEY_CODE_MAP[124] = KeyCode.F13;
KEY_CODE_MAP[125] = KeyCode.F14;
KEY_CODE_MAP[126] = KeyCode.F15;
KEY_CODE_MAP[127] = KeyCode.F16;
KEY_CODE_MAP[128] = KeyCode.F17;
KEY_CODE_MAP[129] = KeyCode.F18;
KEY_CODE_MAP[130] = KeyCode.F19;

KEY_CODE_MAP[186] = KeyCode.US_SEMICOLON;
KEY_CODE_MAP[187] = KeyCode.US_EQUAL;
KEY_CODE_MAP[188] = KeyCode.US_COMMA;
KEY_CODE_MAP[189] = KeyCode.US_MINUS;
KEY_CODE_MAP[190] = KeyCode.US_DOT;
KEY_CODE_MAP[191] = KeyCode.US_SLASH;
KEY_CODE_MAP[192] = KeyCode.US_BACKTICK;
KEY_CODE_MAP[219] = KeyCode.US_OPEN_SQUARE_BRACKET;
KEY_CODE_MAP[220] = KeyCode.US_BACKSLASH;
KEY_CODE_MAP[221] = KeyCode.US_CLOSE_SQUARE_BRACKET;
KEY_CODE_MAP[222] = KeyCode.US_QUOTE;

let NAME_KEY_CODE_MAP: { string: KeyCode } = new Map([
    ['BACKSPACE', KeyCode.Backspace],
    ['TAB', KeyCode.Tab],
    ['SPACE', KeyCode.Space],
    ['PAGE_UP', KeyCode.PageUp],
    ['PAGE_DOWN', KeyCode.PageDown],
    ['END', KeyCode.End],
    ['HOME', KeyCode.Home],
    ['LEFT', KeyCode.LeftArrow],
    ['UP', KeyCode.UpArrow],
    ['RIGHT', KeyCode.RightArrow],
    ['DOWN', KeyCode.DownArrow],
    ['INSERT', KeyCode.Insert],
    ['DEL', KeyCode.Delete],
    ['ENTER', KeyCode.Enter],
    ['ESC', KeyCode.Escape],
    ['F1', KeyCode.F1],
    ['F2', KeyCode.F2],
    ['F3', KeyCode.F3],
    ['F4', KeyCode.F4],
    ['F5', KeyCode.F5],
    ['F6', KeyCode.F6],
    ['F7', KeyCode.F7],
    ['F8', KeyCode.F8],
    ['F9', KeyCode.F9],
    ['F10', KeyCode.F10],
    ['F11', KeyCode.F11],
    ['F12', KeyCode.F12],
    ['A', KeyCode.KEY_A],
    ['B', KeyCode.KEY_B],
    ['C', KeyCode.KEY_C],
    ['D', KeyCode.KEY_D],
    ['E', KeyCode.KEY_E],
    ['F', KeyCode.KEY_F],
    ['G', KeyCode.KEY_G],
    ['H', KeyCode.KEY_H],
    ['I', KeyCode.KEY_I],
    ['J', KeyCode.KEY_J],
    ['K', KeyCode.KEY_K],
    ['L', KeyCode.KEY_L],
    ['M', KeyCode.KEY_M],
    ['N', KeyCode.KEY_N],
    ['O', KeyCode.KEY_O],
    ['P', KeyCode.KEY_P],
    ['Q', KeyCode.KEY_Q],
    ['R', KeyCode.KEY_R],
    ['S', KeyCode.KEY_S],
    ['T', KeyCode.KEY_T],
    ['U', KeyCode.KEY_U],
    ['V', KeyCode.KEY_V],
    ['W', KeyCode.KEY_W],
    ['X', KeyCode.KEY_X],
    ['Y', KeyCode.KEY_Y],
    ['Z', KeyCode.KEY_Z],
    ['0', KeyCode.KEY_0],
    [')', KeyCode.KEY_0_SHIFT],
    ['1', KeyCode.KEY_1],
    ['!', KeyCode.KEY_1_SHIFT],
    ['2', KeyCode.KEY_2],
    ['@', KeyCode.KEY_2_SHIFT],
    ['3', KeyCode.KEY_3],
    ['#', KeyCode.KEY_3_SHIFT],
    ['4', KeyCode.KEY_4],
    ['$', KeyCode.KEY_4_SHIFT],
    ['5', KeyCode.KEY_5],
    ['%', KeyCode.KEY_5_SHIFT],
    ['6', KeyCode.KEY_6],
    ['^', KeyCode.KEY_6_SHIFT],
    ['7', KeyCode.KEY_7],
    ['&', KeyCode.KEY_7_SHIFT],
    ['8', KeyCode.KEY_8],
    ['*', KeyCode.KEY_8_SHIFT],
    ['9', KeyCode.KEY_9],
    ['(', KeyCode.KEY_9_SHIFT],
    [';', KeyCode.US_SEMICOLON],
    [':', KeyCode.US_SEMICOLON_SHIFT],
    ['=', KeyCode.US_EQUAL],
    ['+', KeyCode.US_EQUAL_SHIFT],
    [',', KeyCode.US_COMMA],
    ['<', KeyCode.US_COMMA_SHIFT],
    ['-', KeyCode.US_MINUS],
    ['_', KeyCode.US_MINUS_SHIFT],
    ['.', KeyCode.US_DOT],
    ['>', KeyCode.US_DOT_SHIFT],
    ['/', KeyCode.US_SLASH],
    ['?', KeyCode.US_SLASH_SHIFT],
    ['`', KeyCode.US_BACKTICK],
    ['~', KeyCode.US_BACKTICK_SHIFT],
    ['[', KeyCode.US_OPEN_SQUARE_BRACKET],
    ['{', KeyCode.US_OPEN_SQUARE_BRACKET_SHIFT],
    ['\\', KeyCode.US_BACKSLASH],
    ['|', KeyCode.US_BACKSLASH_SHIFT],
    [']', KeyCode.US_CLOSE_SQUARE_BRACKET],
    ['}', KeyCode.US_CLOSE_SQUARE_BRACKET_SHIFT],
    ['\'', KeyCode.US_QUOTE],
    ['"', KeyCode.US_QUOTE_SHIFT],
]);

let KEY_CODE_NAME_MAP: { KeyCode: string } = new Map();
NAME_KEY_CODE_MAP.forEach(function(keyCode: KeyCode, name: string) {
    KEY_CODE_NAME_MAP.set(keyCode, name);
});

document.body.onkeyup = eventHandler;

function eventHandler(e) {

}


const ALL_CONTEXT_NAME = '*';
const CTRL_KEY_NAME = 'C';
const ALT_KEY_NAME = 'M';
const KEY_CHORD_SEP = '-';

export interface KeybindingInfo {
    keyChord: string,
    command: string,
    context?: string,
}

export class KeyChord {
    private handler: () => void;

    constructor(handler: () => void) {
        this.handler = handler;
    }
}

class Keymap {
    private const CTRL_KEY_MASK = 1 << 7;
    private const ALT_KEY_MASK = 1 << 6;

    private keymap: Map[] = new Array(256);
    private keyChordContext = new KeyChordContext();

    config(keybindings: KeybindingInfo[]) {
        for (let i = 0; i < keybindings.length; i++) {
            let kb = keybindings[i];

            let keyChords: string[] = kb.keyChord.splite(' ');
            let context = kb.context ? kb.context : ALL_CONTEXT_NAME;
            if (keyChords.length == 1) {
                addKeyChord(keyChords[0], kb.keyChord, 0, kb.context, commandHandler);
            } else {
                addKeyChord(keyChords[i], kb.keyChord, i, kb.context,
                            (keyChords.length == i+1) ? commandHandler, nextKeyChordHandler);
            }
        }
    }

    private addKeyChord(keyChord: string, whole: string, nth: number, context: string, handler: () => void) {
        let keyCode = parseKeyChordString(keyChord);
        let keyChordMap = this.keymap[keyCode];
        let keyChordKey = this.getKeyChordMapKey(context, nth)
        let keyChord = new KeyChord(handler);

        if (!keyChordMap) {
            keyChordMap = new Map();
            keyChordMap.set(keyChordKey, keyChord);
            return;
        }

        if (keyChordMap.has(keyChordKey)) {
            throw new Error('Keybinding conflict on: ' + whole + 'with context: ' + context);
        }

        keyChordMap.set(keyChordKey, keyChord);
    }

    private parseKeyChordString(keyChord: string): number {
        let keys = keyChord.splite(KEY_CHORD_SEP);
        let keyCode = NAME_KEY_CODE_MAP.get(keys[keys.length-1]);

        if (!keyCode) {
            throw new Error('Unknown key name: ' + keys[keys.length-1]);
        }
        keys.pop();

        keys.forEach(function(key: string) {
            if (key == CTRL_KEY_NAME) {
                keyCode |= CTRL_KEY_MASK;
            } else if (key == ALT_KEY_NAME) {
                keyCode |= ALT_KEY_MASK;
            } else {
                throw new Error('Invalid key chord: ' + keyChord);
            }
        });

        return keyCode;
    }

    private getKeyChordMapKey(context: string, nthKeyChord: number) {
        return context + (nthKeyChord > 0 `.${nthKeyChord}` : '');
    }

    handleEvent(e: DomEvent) {
        let keyCode = KEY_CODE_MAP[e.keyCode];

        if (!keyCode) return;

        if (e.isShift && keyCode > KeyCode.SHIFT_CONBINED_KEY_START)
            keyCode++;

        if (e.isCtrl)
            keyCode |= this.CTRL_KEY_MASK;

        if (e.isAlt || e.isMeta) {
            keyCode |= this.ALT_KEY_MASK;
        }

        let keyChordMap, keyChord;

        // check keyboard-quit command first
        keyChordMap = this.keymap[keyCode];
        if ((keybinding = contextKeybindingMap[ALL_CONTEXT_NAME]) &&
            keybinding.name == CommonCommandName.KEYBOARD_QUIT) {
            // process keyboard quit command

            e.preventDefault();
            return;
        }

        let contextName = Context.getCurrentContext().name;
        if (this.keyChordContext.keyChords.length > 0)
            contextName += `.${this.keyChordContext.keyChords.length}`;

        if ((keybinding = contextKeybindingMap[contextName])) {
            // process key chord handler

            e.preventDefault();
            return;
        }
    }

}

class KeyChordContext {
    keyChords: KeyChord[] = [];
}

function commandHandler() {

}

function nextKeyChordHandler() {

}
