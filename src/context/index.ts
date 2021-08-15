import { registry as CommandRegistry } from '../command';
import * as command from './command';
import { Event } from '../event';

export { CommandName as GlobalCommandName } from './commandName';

export abstract class Context {
    abstract name: string;

    // should be override by subclass to process keyboard-quit command
    keyboardQuit(): void {
    }

    // Triggered when context active
    onActive(): void {
    }

    // Triggered when context deactive
    onDeactive(): void {
    }
};

export const GLOBAL_CONTEXT_NAME = 'global';
class GlobalContext extends Context {
    name = GLOBAL_CONTEXT_NAME;
}

class ContextManager {
    private contextMap: Map<string, Context> = new Map();
    private activeContext: Context;
    private event: Event;
    private readonly EVENT_CONTEXT_CHANGE = 'context_change';

    constructor() {
        let globalContext = new GlobalContext();
        this.activeContext = globalContext;
        this.registerContext(globalContext);

        this.event = new Event();
    }

    getActiveContext(): Context {
        return this.activeContext;
    }

    setActiveContext(context: Context|string): void {
        if (!(context instanceof Context)) {
            let contextName = context;
            if (!(context = <Context> this.contextMap.get(context))) {
                throw new Error(`Cannot find context: ${contextName}`);
            }
        }

        let prevContext = this.activeContext;
        context.onActive();

        this.activeContext = context;

        prevContext.onDeactive();

        this.event.emit(this.EVENT_CONTEXT_CHANGE, context);
    }

    registerContext(context: Context) {
        this.contextMap.set(context.name, context);
    }

    registryCommand() {
        CommandRegistry.register(new command.KeyboardQuitCommand());
        CommandRegistry.register(new command.ExecuteCommandCommand());
        CommandRegistry.register(new command.FinishCommandCommand());
        CommandRegistry.register(new command.SwitchContextCommand());
    }

    onContextChange(listener: (context: Context) => void) {
        this.event.addListener(this.EVENT_CONTEXT_CHANGE, listener);
    }
}

export const manager = new ContextManager();
manager.registryCommand();
