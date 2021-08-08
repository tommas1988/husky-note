export class CommandRegistry {

}

export interface CommandInterface {
    argNames: string[];

    handler(...args: any);
}

export enum CommonCommandName {
    KEYBOARD_QUIT: 'keyboard-quit',
};
