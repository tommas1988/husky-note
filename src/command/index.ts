import RuntimeMessage from '@/runtimeMessage';
import { Context as BaseContext, ContextManager } from '@/context';

export function initialize() {
    class Context extends BaseContext {
        name = CONTEXT_NAME;
    }

    const context = new Context();

    const commands = require('./commands');

    CommandRegistry.INSTANCE.register(new commands.ExecuteCommandCommand());
    CommandRegistry.INSTANCE.register(new commands.FinishCommandCommand());

    ContextManager.INSTANCE.registerContext(context);
}

export const CONTEXT_NAME = 'command';

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
        return this.args[this.values.length - 1];
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

export class CommandRegistry {
    public static readonly INSTANCE = new CommandRegistry();

    private commands: Map<string, Command> = new Map();

    register(command: Command) {
        this.commands.set(command.name, command);
    }

    get(name: string) {
        let command = <Command>this.commands.get(name);
        if (!command) {
            return null;
        }

        return command;
    }
}

class SessionCommandContext {
    private command: Command | null = null;

    setCommand(command: Command): void {
        this.command = command;
    }

    getCommand(): Command | null {
        return this.command;
    }

    reset(): void {
        this.command = null;
    }
}

export class CommandExecutor {
    public static readonly INSTANCE = new CommandExecutor();

    private context: SessionCommandContext = new SessionCommandContext();

    execute(command: Command): void {
        if (command.isSessionCommand()) {
            this.context.setCommand(command);
        }

        if (command.hasArguments()) {
            return;
        }

        try {
            command.invoke();
        } catch (e) {
            if (e instanceof String) {
                RuntimeMessage.setError(<string>e);
            } else if (e instanceof Error) {
                RuntimeMessage.setError((<Error>e).message);
            } else {
                RuntimeMessage.setError(<any>e);
            }
        }
    }

    inCommandSession(): boolean {
        return !!this.context.getCommand();
    }

    finish(): void {
        (<Command>this.context.getCommand()).finish();
        this.context.reset();
    }

    abort(): void {
        (<Command>this.context.getCommand()).abort();
        this.context.reset();
    }
}

export class CommandReader {
    
}