/**
 * From https://remysharp.com/2010/07/21/throttling-function-calls
 * Use to avoid a function to invoke too frequently.
 * This can be happen for a function as event callback.
 */
export function throttle(fn: (...args: any) => void, threshhold: number, scope: any): () => void {
    threshhold || (threshhold = 250);
    // FIXME: Type 'Timeout' is not assignable to type 'number' when enable node types
    let last: number, deferTimer: NodeJS.Timeout;
    return function (this:any, ...args: any) {
        let context = scope || this;

        let now = +new Date;
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
