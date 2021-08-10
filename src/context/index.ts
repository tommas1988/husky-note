export {CommandName as GlobalCommandName} from './commandName';

export interface ContextInterface<T> {
    name: string;
    service: T;
};

export const ContextManager = new class () {
    getCurrentContext(): ContextInterface<any> {

    }

    registerContext<T>(name: string, service: T) {

    }
}

export class Context {
    getCurrentContext(): ContextInterface {

    }
}

export const globalContext: ContextInterface = {
    name: 'global',
}
