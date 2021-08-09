export class CommandRegistry {

}

export interface CommandInterface {
    argNames: string[];

    handler(...args: any): void;
}

export enum CommonCommandName {
    KEYBOARD_QUIT = 'keyboard-quit',
};
