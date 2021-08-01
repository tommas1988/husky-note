export class CommandRegistry {

}

export interface CommandInterface {
    argNames: string[];

    handler(...args: any);
}
