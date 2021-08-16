import { Event } from './event';

type message = string | (() => string);

class RuntimeMessage {
    private event: Event;

    private readonly EVENT_STATUS = '__status__';
    private readonly EVENT_INFO = '__info__';
    private readonly EVENT_WARNING = '__warning__';
    private readonly EVENT_ERROR = '__error__';

    constructor() {
        this.event = new Event();
    }

    setStatus(msg: message) {
        this.setMessage(this.EVENT_STATUS, msg);
    }

    onStatus(listener: (msg: string) => void) {
        this.event.addListener(this.EVENT_STATUS, listener);
    }

    setInfo(msg: message) {
        this.setMessage(this.EVENT_INFO, msg);
    }

    onInfo(listener: (msg: string) => void) {
        this.event.addListener(this.EVENT_INFO, listener);
    }

    setWarning(msg: message) {
        this.setMessage(this.EVENT_WARNING, msg);
    }

    onWarning(listener: (msg: string) => void) {
        this.event.addListener(this.EVENT_WARNING, listener);
    }

    setError(msg: message) {
        this.setMessage(this.EVENT_ERROR, msg);
    }

    onError(listener: (msg: string) => void) {
        this.event.addListener(this.EVENT_ERROR, listener);
    }

    private setMessage(event: string, msg: message): void {
        if (msg instanceof Function) {
            setImmediate(() => {
                this.event.emit(event, msg());
            });
        } else {
            this.event.emit(event, msg);
        }
    }
}

export default new RuntimeMessage();