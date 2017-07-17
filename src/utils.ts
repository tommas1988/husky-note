import { type as processType } from 'process';

export const isRendererProcess: boolean = processType === 'renderer';
export const isMainProcess: boolean = processType === 'browser';

export function noop(...args): any { }

export function checkRendererProcess() {
    if (!isRendererProcess) {
        throw new Error('Run in main process');
    }
}

export function checkMainProcess() {
    if (!isMainProcess) {
        throw new Error('Run in renderer process');
    }
}

// From https://remysharp.com/2010/07/21/throttling-function-calls
export function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}