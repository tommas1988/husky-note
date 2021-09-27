import { ContextManager } from './index';
import { CommandName } from '@/common/commandName';
import { Command, ArgumentCommand, CommandExecutor } from '@/command';

export class KeyboardQuitCommand extends Command {
    readonly name: string = CommandName.KEYBOARD_QUIT;

    invoke(): void {
        if (CommandExecutor.INSTANCE.inCommandSession()) {
            CommandExecutor.INSTANCE.abort();
        }

        ContextManager.INSTANCE.getActiveContext().keyboardQuit();
    }
}

export class SwitchContextCommand extends ArgumentCommand {
    readonly name: string = CommandName.SWITCH_CONTEXT;
    protected readonly args: string[] = [
        'context name',
    ];

    invoke(): void {
        let contextName = this.args[0];
        ContextManager.INSTANCE.setActiveContext(contextName);
    }
}
