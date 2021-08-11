export abstract class Command {
    abstract readonly name: string;

    abstract invoke(): void;

    hasArguments(): boolean {
        return false;
    }

    currentArgumentName(): string {
        return '';
    }

    setCurrentArgument(value: any): void {
    }

    collectAllArguments(): boolean {
        return true;
    }

    isSessionCommand(): boolean {
        return false;
    }

    // finish a session command
    finish(): void {
        // shold be override by a session command
    }

    // abort a session command
    abort(): void {
        // shold be override by a session command
    }

    // reset a command state for a fresh execution
    reset(): void {
    }
}

export abstract class ArgumentCommand extends Command {
    protected abstract readonly args: string[];
    protected values: any[] = [];
    
    hasArguments(): boolean {
        return this.args && this.args.length > 0;
    }

    currentArgumentName(): string {
        return this.args[this.values.length-1];
    }

    setCurrentArgument(value: any): void {
        this.values.push(value);
    }

    collectAllArguments(): boolean {
        return this.args.length === this.values.length;
    }
    
    reset(): void {
        this.values = [];
    }
}

class CommandRegistry {
    private commands: Map<string, Command> = new Map();

    register(command: Command) {
        this.commands.set(command.name, command);
    }

    get(name: string) {
        let command = <Command> this.commands.get(name);
        if (!command) {
            throw new Error(`Can not find command: ${name}`);
        }

        return command;
    }
}

class SessionCommandContext {
    setCommand(command: Command): void {

    }

    currentCommand(): Command {

    }

    reset(): void {

    }
}

class CommandExecutor {
    private context: SessionCommandContext = new SessionCommandContext();

    execute(command: Command): void {
        if (command.isSessionCommand()) {
            this.context.setCommand(command);
        }

        if (command.hasArguments()) {
            return;
        }

        command.invoke();
    }

    inCommandSession(): boolean {
        return !!this.context.currentCommand();
    }

    finish(): void {
        this.context.currentCommand().finish();
        this.context.reset();
    }

    abort(): void {
        this.context.currentCommand().abort();
        this.context.reset();
    }
}

export const registry = new CommandRegistry();
export const executor = new CommandExecutor();
