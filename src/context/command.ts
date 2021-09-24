import { manager } from './index';
import { CommandName } from './commandName';
import { Command, ArgumentCommand, executor as CommandExecutor } from '../command';

export class KeyboardQuitCommand extends Command {
    readonly name: string = CommandName.KEYBOARD_QUIT;

    invoke(): void {
        if (CommandExecutor.inCommandSession()) {
            CommandExecutor.abort();
        }

        manager.getActiveContext().keyboardQuit();
    }
}

export class ExecuteCommandCommand extends ArgumentCommand {
    readonly name: string = CommandName.EXECUTE_COMMAND;
    protected readonly args: string[] = [
        'command name',
    ];

    invoke(): void {}
}

export class FinishCommandCommand extends Command {
    readonly name: string = CommandName.FINISH_COMMAND;

    invoke(): void {
        CommandExecutor.finish();
    }
}

export class SwitchContextCommand extends ArgumentCommand {
    readonly name: string = CommandName.SWITCH_CONTEXT;
    protected readonly args: string[] = [
        'context name',
    ];

    invoke(): void {
        let contextName = this.args[0];
        manager.setActiveContext(contextName);
    }
}
