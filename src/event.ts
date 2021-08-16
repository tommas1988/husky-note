import { EventEmitter } from 'events';

export class Event extends EventEmitter {
    constructor() {
        super({
            captureRejections: true
        });

        this.on('error', (err) => {
            // require is use to avoid error arised by loop dependency
            import('./runtimeMessage').then((module) => {
                module.default.setError(err);
            });
        });
    }

    addListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.removeListener(event, listener);
        super.addListener(event, listener);
        return this;
    }
}
