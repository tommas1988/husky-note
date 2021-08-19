import { Context, GLOBAL_CONTEXT_NAME, GlobalCommandName, manager as ContextManager } from '../context';
import { Command, executor as CommandExecutor, registry as CommandRegistry } from '../command';
import { KeyCode } from './keyCodes';
import RuntimeMessage from '../runtimeMessage';

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

let NAME_KEY_CODE_MAP: Map<string, KeyCode> = new Map([
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
    ['a', KeyCode.KEY_A],
    ['b', KeyCode.KEY_B],
    ['c', KeyCode.KEY_C],
    ['d', KeyCode.KEY_D],
    ['e', KeyCode.KEY_E],
    ['f', KeyCode.KEY_F],
    ['g', KeyCode.KEY_G],
    ['h', KeyCode.KEY_H],
    ['i', KeyCode.KEY_I],
    ['j', KeyCode.KEY_J],
    ['k', KeyCode.KEY_K],
    ['l', KeyCode.KEY_L],
    ['m', KeyCode.KEY_M],
    ['n', KeyCode.KEY_N],
    ['o', KeyCode.KEY_O],
    ['p', KeyCode.KEY_P],
    ['q', KeyCode.KEY_Q],
    ['r', KeyCode.KEY_R],
    ['s', KeyCode.KEY_S],
    ['t', KeyCode.KEY_T],
    ['u', KeyCode.KEY_U],
    ['v', KeyCode.KEY_V],
    ['w', KeyCode.KEY_W],
    ['x', KeyCode.KEY_X],
    ['y', KeyCode.KEY_Y],
    ['z', KeyCode.KEY_Z],
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

let KEY_CODE_NAME_MAP: Map<KeyCode, string> = new Map();
NAME_KEY_CODE_MAP.forEach(function(keyCode: KeyCode, name: string) {
    KEY_CODE_NAME_MAP.set(keyCode, name);
});

const CTRL_KEY_NAME = 'C';
const ALT_KEY_NAME = 'M';
const KEY_CHORD_SEP = '-';

export interface KeybindingInfo {
    keyChord: string,
    command: string,
    context?: string,
}

class KeyChordContext {
    keyChords: KeyChord[] = [];
    nthKeyChordKBQuit: number = 0;
    nthKeyChordCmdFinish: number = 0;

    getKeyChordLiteral(): string {
        let keyChords = '';
        this.keyChords.forEach((keyChord: KeyChord) => {
            if (keyChords.length > 0)
                keyChords += ' ';
            keyChords += keyChord.literal;
        });

        return keyChords;
    }

    reset(): void {
        this.keyChords = [];
        this.nthKeyChordKBQuit = 0;
        this.nthKeyChordCmdFinish = 0;
    }
}

abstract class KeyChord {
    readonly literal: string;
    readonly commandName: string;

    constructor(literal: string, commandName: string) {
        this.literal = literal;
        this.commandName = commandName;
    }

    abstract handle(context: KeyChordContext): void;
}

class PrefixKeyChord extends KeyChord {
    handle(context: KeyChordContext): void {
        context.keyChords.push(this);
        RuntimeMessage.setStatus(() => {
            return context.getKeyChordLiteral();
        });
    }
}

class NotFoundCommand extends Command {
    name = 'command-not-found';

    private targetCommand: string;

    constructor(targetCommand: string) {
        super();
        this.targetCommand = targetCommand;
    }

    invoke(): void {
        RuntimeMessage.setError(() => {
            return `Cannot find command: ${this.targetCommand}`;
        });
    }
}

class LastKeyChord extends KeyChord {
    private command: Command|null = null;

    handle(context: KeyChordContext): void {
        console.log(`Execute command: ${this.commandName}`);

        if (!this.command && !(this.command = CommandRegistry.get(this.commandName))) {
            this.command = new NotFoundCommand(this.commandName);
        }

        CommandExecutor.execute(this.command);
        context.reset();
    }
}

export class Keymap {
    private readonly CTRL_KEY_MASK = 1 << 8;
    private readonly ALT_KEY_MASK = 1 << 7;

    private keymap: Map<string, KeyChord>[] = new Array(512);
    private context = new KeyChordContext();

    config(keybindings: KeybindingInfo[]) {
        for (let i = 0; i < keybindings.length; i++) {
            let kb = keybindings[i];

            let keyChords: string[] = kb.keyChord.split(' ');
            let context = kb.context ? kb.context : GLOBAL_CONTEXT_NAME;
            if (keyChords.length == 1) {
                this.addKeyChord(keyChords[0], kb.keyChord, 0, context, kb.command, true);
            } else {
                for (let j = 0; j < keyChords.length; j++) {
                    this.addKeyChord(keyChords[j], kb.keyChord, j, context, kb.command, keyChords.length == j+1);
                }
            }
        }
    }

    private addKeyChord(keyChordLiteral: string, whole: string, nth: number, context: string, command: string, isLastChord: boolean) {
        let keyCode = this.parseKeyChordLiteral(keyChordLiteral);
        let keyChordMap = this.keymap[keyCode];
        let keyChordKey = this.getKeyChordMapKey(context, nth)
        let keyChord: KeyChord = isLastChord ? new LastKeyChord(keyChordLiteral, command) : new PrefixKeyChord(keyChordLiteral, command);

        if (!keyChordMap) {
            this.keymap[keyCode] = keyChordMap = new Map();
            keyChordMap.set(keyChordKey, keyChord);
            return;
        }

        if (keyChordMap.has(keyChordKey)) {
            throw new Error('Keybinding conflict on: ' + whole + 'with context: ' + context);
        }

        keyChordMap.set(keyChordKey, keyChord);
    }

    private parseKeyChordLiteral(keyChord: string): number {
        let keys = keyChord.split(KEY_CHORD_SEP);
        let keyCode = <KeyCode> NAME_KEY_CODE_MAP.get(keys[keys.length-1]);

        if (!keyCode) {
            throw new Error('Unknown key name: ' + keys[keys.length-1]);
        }

        keys.pop();
        keys.forEach((key: string) => {
            if (key == CTRL_KEY_NAME) {
                keyCode |= this.CTRL_KEY_MASK;
            } else if (key == ALT_KEY_NAME) {
                keyCode |= this.ALT_KEY_MASK;
            } else {
                throw new Error('Invalid key chord: ' + keyChord);
            }
        });

        return keyCode;
    }

    private getKeyChordMapKey(context: string, nthKeyChord: number) {
        return context + (nthKeyChord > 0 ? `.${nthKeyChord}` : '');
    }

    handleEvent(e: KeyboardEvent): void {
        let keyCode = KEY_CODE_MAP[e.keyCode];

        if (!keyCode) return;

        if (e.shiftKey && keyCode > KeyCode.SHIFT_CONBINED_KEY_START)
            keyCode++;

        if (e.ctrlKey) {
            keyCode |= this.CTRL_KEY_MASK;
        }
            
        if (e.altKey || e.metaKey) {
            keyCode |= this.ALT_KEY_MASK;
        }

        let shouldPreventDefault = this.dispatch(keyCode);
        let keybindingNotFound = !shouldPreventDefault && this.context.keyChords.length != 0;

        if (keybindingNotFound) {
            let keyChords = this.context.getKeyChordLiteral();
            keyChords += ` ${this.getKeyChordLiteral(keyCode)}`;
            RuntimeMessage.setStatus(`Can not find keybinding: ${keyChords}`);

            this.context.reset();
        }

        if (shouldPreventDefault || keybindingNotFound) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // reset key chord context
        this.context.reset();
    }

    private dispatch(keyCode: number): boolean {
        let keyChordMap: Map<string, KeyChord>, keyChord: KeyChord|undefined, nthKeyChord: number;

        keyChordMap = this.keymap[keyCode];
        if (!keyChordMap)
            return false;

        // check keyboard-quit command
        let inKeyChordKBQuit = false;
        if ((keyChord = keyChordMap.get(this.getKeyChordMapKey(GLOBAL_CONTEXT_NAME, this.context.nthKeyChordKBQuit))) &&
            keyChord.commandName === GlobalCommandName.KEYBOARD_QUIT) {
            if (keyChord instanceof PrefixKeyChord) {
                inKeyChordKBQuit = true;
                this.context.nthKeyChordKBQuit++;
            } else {
                // process keyboard quit command
                keyChord.handle(this.context);
                return true;
            }
        }

        // process finish command session
        if (CommandExecutor.inCommandSession() &&
            (keyChord = keyChordMap.get(this.getKeyChordMapKey(GLOBAL_CONTEXT_NAME, this.context.nthKeyChordCmdFinish))) &&
            keyChord.commandName === GlobalCommandName.FINISH_COMMAND) {
            if (keyChord instanceof PrefixKeyChord) {
                this.context.nthKeyChordKBQuit++;
            } else {
                keyChord.handle(this.context);
            }

            return true;
        }

        nthKeyChord = this.context.keyChords.length;

        // process contexted keybinding
        let activeContext = ContextManager.getActiveContext();
        if (activeContext.name !== GLOBAL_CONTEXT_NAME &&
            (keyChord = keyChordMap.get(this.getKeyChordMapKey(activeContext.name, nthKeyChord)))
           ) {
            // process key chord handler
            keyChord.handle(this.context);
            return true;
        }

        // process global context keybinding
        if (keyChord = keyChordMap.get(this.getKeyChordMapKey(activeContext.name, nthKeyChord))) {
            keyChord.handle(this.context);
            return true;
        }

        // wait for keyboard-quit key chord
        if (inKeyChordKBQuit) {
            return true;
        }

        return false;
    }

    private getKeyChordLiteral(keyCode: number): string {
        let literal = '';
        if (keyCode & this.CTRL_KEY_MASK) {
            literal += CTRL_KEY_NAME + KEY_CHORD_SEP;
            keyCode &= ~this.CTRL_KEY_MASK;
        }

        if (keyCode & this.ALT_KEY_MASK) {
            literal += ALT_KEY_NAME + KEY_CHORD_SEP;
            keyCode &= ~this.ALT_KEY_MASK;
        }

        literal += KEY_CODE_NAME_MAP.get(keyCode);

        return literal;
    }
}