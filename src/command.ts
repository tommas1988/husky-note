export interface CommandDefinition {
    name: string;

    args?: string[];

    handler(...args: any): void;
}

export class Command {
    protected context: any = null;
    private handler: () => void;

    constructor(def: CommandDefinition) {
        this.handler = def.handler;
    }

    setExecuteContext(context: any) {
        this.context = context;
    }

    invoke(): void {
        this.handler.apply(this.context);
    }
}

export class ArgumentCommand {
    private args: string[];
    private values: any[];
    private handler: (...args: any): void;

    constructor(def: CommandDefinition) {
        this.args = defs.args;
        this.values = [];
        this.handler = defs.handler;
    }

    getCurrentArg(): string {
        return this.args[this.values.length-1];
    }

    isAllArgsSet(): boolean {
        return this.args.length === this.values.length;
    }

    setArgValue(value: any): void {
        this.values.push(value);
    }

    invoke() {
        this.handler.apply(this.context, values);
    }
}

class CommandRegistry {
    private commands: Map<string, Command> = new Map();

    register(def: CommandDefinition, executeContext?: any) {
        let command: Command;
        if (def.args) {
            command = new ArgumentCommand(def);
        } else {
            command = new Command(def);
        }

        if (executeContext) {
            command.setExecuteContext(executeContext);
        }

        this.commands.set(def.name, command);
    }

    get(name: string) {
        let command = <Commmand> this.commands.get(name);
        if (!command) {
            throw new Error(`Can not find command: ${name}`);
        }

        return command;
    }
}

export const commandRegistry = new CommandRegistry();
