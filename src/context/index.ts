import { registry as CommandRegistry } from '../command';
import * as command from './command';

export { CommandName as GlobalCommandName } from './commandName';

export abstract class Context {
    abstract name: string;

    // should be override by subclass to process keyboard-quit command
    keyboardQuit(): void {
    }
};

class ContextManager {
    current(): ContextInterface {

    }

    registryCommand() {
        CommandRegistry.register(new command.KeyboardQuitCommand());
        CommandRegistry.register(new command.ExecuteCommandCommand());
        CommandRegistry.register(new command.FinishCommandCommand());
    }
}

export const manager = new ContextManager();
manager.registryCommand();

export const globalContext: ContextInterface = {
    name: 'global',
};
