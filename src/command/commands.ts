import { CommandExecutor, Command, CONTEXT_NAME } from '.';
import { CommandName } from '@/common/commandName';
import { ContextManager } from '@/context';

export class ExecuteCommandCommand extends Command {
    readonly name: string = CommandName.EXECUTE_COMMAND;

    invoke(): void {
        ContextManager.INSTANCE.setActiveContext(CONTEXT_NAME);
    }
}

export class FinishCommandCommand extends Command {
    readonly name: string = CommandName.FINISH_COMMAND;

    invoke(): void {
        CommandExecutor.INSTANCE.finish();
    }
}