/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as errors from './errors';
import { TPromise, ValueCallback, ErrorCallback, ProgressCallback } from './winjs.base';
import { CancellationToken, CancellationTokenSource } from './cancellation';
import { Disposable, IDisposable } from './lifecycle';

export function isThenable<T>(obj: any): obj is Thenable<T> {
	return obj && typeof (<Thenable<any>>obj).then === 'function';
}

export function toThenable<T>(arg: T | Thenable<T>): Thenable<T> {
	if (isThenable(arg)) {
		return arg;
	} else {
		return TPromise.as(arg);
	}
}

export interface CancelablePromise<T> extends Promise<T> {
	cancel(): void;
}

export function createCancelablePromise<T>(callback: (token: CancellationToken) => Thenable<T>): CancelablePromise<T> {
	const source = new CancellationTokenSource();

	const thenable = callback(source.token);
	const promise = new Promise<T>((resolve, reject) => {
		source.token.onCancellationRequested(() => {
			reject(errors.canceled());
		});
		Promise.resolve(thenable).then(value => {
			source.dispose();
			resolve(value);
		}, err => {
			source.dispose();
			reject(err);
		});
	});

	return new class implements CancelablePromise<T> {
		cancel() {
			source.cancel();
		}
		then<TResult1 = T, TResult2 = never>(resolve?: ((value: T) => TResult1 | Thenable<TResult1>) | undefined | null, reject?: ((reason: any) => TResult2 | Thenable<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
			return promise.then(resolve, reject);
		}
		catch<TResult = never>(reject?: ((reason: any) => TResult | Thenable<TResult>) | undefined | null): Promise<T | TResult> {
			return this.then(undefined, reject);
		}
	};
}

export function asWinJsPromise<T>(callback: (token: CancellationToken) => T | TPromise<T> | Thenable<T>): TPromise<T> {
	let source = new CancellationTokenSource();
	return new TPromise<T>((resolve, reject, progress) => {
		let item = callback(source.token);
		if (item instanceof TPromise) {
			item.then(result => {
				source.dispose();
				resolve(result);
			}, err => {
				source.dispose();
				reject(err);
			}, progress);
		} else if (isThenable<T>(item)) {
			item.then(result => {
				source.dispose();
				resolve(result);
			}, err => {
				source.dispose();
				reject(err);
			});
		} else {
			source.dispose();
			resolve(item);
		}
	}, () => {
		source.cancel();
	});
}

/**
 * Hook a cancellation token to a WinJS Promise
 */
export function wireCancellationToken<T>(token: CancellationToken, promise: TPromise<T>, resolveAsUndefinedWhenCancelled?: boolean): Thenable<T> {
	const subscription = token.onCancellationRequested(() => promise.cancel());
	if (resolveAsUndefinedWhenCancelled) {
		promise = promise.then<T>(undefined, err => {
			if (!errors.isPromiseCanceledError(err)) {
				return TPromise.wrapError(err);
			}
			return undefined;
		});
	}
	return always(promise, () => subscription.dispose());
}

export interface ITask<T> {
	(): T;
}

/**
 * A helper to prevent accumulation of sequential async tasks.
 *
 * Imagine a mail man with the sole task of delivering letters. As soon as
 * a letter submitted for delivery, he drives to the destination, delivers it
 * and returns to his base. Imagine that during the trip, N more letters were submitted.
 * When the mail man returns, he picks those N letters and delivers them all in a
 * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
 *
 * The throttler implements this via the queue() method, by providing it a task
 * factory. Following the example:
 *
 * 		const throttler = new Throttler();
 * 		const letters = [];
 *
 * 		function deliver() {
 * 			const lettersToDeliver = letters;
 * 			letters = [];
 * 			return makeTheTrip(lettersToDeliver);
 * 		}
 *
 * 		function onLetterReceived(l) {
 * 			letters.push(l);
 * 			throttler.queue(deliver);
 * 		}
 */
export class Throttler {

	private activePromise: TPromise;
	private queuedPromise: TPromise;
	private queuedPromiseFactory: ITask<TPromise>;

	constructor() {
		this.activePromise = null;
		this.queuedPromise = null;
		this.queuedPromiseFactory = null;
	}

	queue<T>(promiseFactory: ITask<TPromise<T>>): TPromise<T> {
		if (this.activePromise) {
			this.queuedPromiseFactory = promiseFactory;

			if (!this.queuedPromise) {
				const onComplete = () => {
					this.queuedPromise = null;

					const result = this.queue(this.queuedPromiseFactory);
					this.queuedPromiseFactory = null;

					return result;
				};

				this.queuedPromise = new TPromise((c, e, p) => {
					this.activePromise.then(onComplete, onComplete, p).done(c);
				}, () => {
					this.activePromise.cancel();
				});
			}

			return new TPromise((c, e, p) => {
				this.queuedPromise.then(c, e, p);
			}, () => {
				// no-op
			});
		}

		this.activePromise = promiseFactory();

		return new TPromise((c, e, p) => {
			this.activePromise.done((result: any) => {
				this.activePromise = null;
				c(result);
			}, (err: any) => {
				this.activePromise = null;
				e(err);
			}, p);
		}, () => {
			this.activePromise.cancel();
		});
	}
}

/**
 * A helper to delay execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 * 		const delayer = new Delayer(WAITING_PERIOD);
 * 		const letters = [];
 *
 * 		function letterReceived(l) {
 * 			letters.push(l);
 * 			delayer.trigger(() => { return makeTheTrip(); });
 * 		}
 */
export class Delayer<T> {

	private timeout: number;
	private completionPromise: TPromise;
	private onSuccess: ValueCallback;
	private task: ITask<T | TPromise<T>>;

	constructor(public defaultDelay: number) {
		this.timeout = null;
		this.completionPromise = null;
		this.onSuccess = null;
		this.task = null;
	}

	trigger(task: ITask<T | TPromise<T>>, delay: number = this.defaultDelay): TPromise<T> {
		this.task = task;
		this.cancelTimeout();

		if (!this.completionPromise) {
			this.completionPromise = new TPromise((c) => {
				this.onSuccess = c;
			}, () => {
				// no-op
			}).then(() => {
				this.completionPromise = null;
				this.onSuccess = null;
				const task = this.task;
				this.task = null;

				return task();
			});
		}

		this.timeout = setTimeout(() => {
			this.timeout = null;
			this.onSuccess(null);
		}, delay);

		return this.completionPromise;
	}

	cancel(): void {
		this.cancelTimeout();

		if (this.completionPromise) {
			this.completionPromise.cancel();
			this.completionPromise = null;
		}
	}

	private cancelTimeout(): void {
		if (this.timeout !== null) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}
}

export class ShallowCancelThenPromise<T> extends TPromise<T> {

	constructor(outer: TPromise<T>) {

		let completeCallback: ValueCallback,
			errorCallback: ErrorCallback,
			progressCallback: ProgressCallback;

		super((c, e, p) => {
			completeCallback = c;
			errorCallback = e;
			progressCallback = p;
		}, () => {
			// cancel this promise but not the
			// outer promise
			errorCallback(errors.canceled());
		});

		outer.then(completeCallback, errorCallback, progressCallback);
	}
}

/**
 * Replacement for `WinJS.TPromise.timeout`.
 */
export function timeout(n: number): CancelablePromise<void> {
	return createCancelablePromise(token => {
		return new Promise((resolve, reject) => {
			const handle = setTimeout(resolve, n);
			token.onCancellationRequested(_ => {
				clearTimeout(handle);
				reject(errors.canceled());
			});
		});
	});
}

function isWinJSPromise(candidate: any): candidate is TPromise {
	return TPromise.is(candidate) && typeof (<TPromise>candidate).done === 'function';
}

/**
 * Returns a new promise that joins the provided promise. Upon completion of
 * the provided promise the provided function will always be called. This
 * method is comparable to a try-finally code block.
 * @param promise a promise
 * @param f a function that will be call in the success and error case.
 */
export function always<T>(thenable: TPromise<T>, f: Function): TPromise<T>;
export function always<T>(promise: Thenable<T>, f: Function): Thenable<T>;
export function always<T>(winjsPromiseOrThenable: Thenable<T> | TPromise<T>, f: Function): TPromise<T> | Thenable<T> {
	if (isWinJSPromise(winjsPromiseOrThenable)) {
		return new TPromise<T>((c, e, p) => {
			winjsPromiseOrThenable.done((result) => {
				try {
					f(result);
				} catch (e1) {
					errors.onUnexpectedError(e1);
				}
				c(result);
			}, (err) => {
				try {
					f(err);
				} catch (e1) {
					errors.onUnexpectedError(e1);
				}
				e(err);
			}, (progress) => {
				p(progress);
			});
		}, () => {
			winjsPromiseOrThenable.cancel();
		});

	} else {
		// simple
		winjsPromiseOrThenable.then(_ => f(), _ => f());
		return winjsPromiseOrThenable;
	}
}

export function first2<T>(promiseFactories: ITask<Promise<T>>[], shouldStop: (t: T) => boolean = t => !!t, defaultValue: T = null): Promise<T> {

	let index = 0;
	const len = promiseFactories.length;

	const loop = () => {
		if (index >= len) {
			return Promise.resolve(defaultValue);
		}
		const factory = promiseFactories[index++];
		const promise = factory();
		return promise.then(result => {
			if (shouldStop(result)) {
				return Promise.resolve(result);
			}
			return loop();
		});
	};

	return loop();
}

export function first<T>(promiseFactories: ITask<TPromise<T>>[], shouldStop: (t: T) => boolean = t => !!t, defaultValue: T = null): TPromise<T> {
	let index = 0;
	const len = promiseFactories.length;

	const loop: () => TPromise<T> = () => {
		if (index >= len) {
			return TPromise.as(defaultValue);
		}

		const factory = promiseFactories[index++];
		const promise = factory();

		return promise.then(result => {
			if (shouldStop(result)) {
				return TPromise.as(result);
			}

			return loop();
		});
	};

	return loop();
}

export function setDisposableTimeout(handler: Function, timeout: number, ...args: any[]): IDisposable {
	const handle = setTimeout(handler, timeout, ...args);
	return { dispose() { clearTimeout(handle); } };
}

export class TimeoutTimer extends Disposable {
	private _token: number;

	constructor() {
		super();
		this._token = -1;
	}

	dispose(): void {
		this.cancel();
		super.dispose();
	}

	cancel(): void {
		if (this._token !== -1) {
			clearTimeout(this._token);
			this._token = -1;
		}
	}

	cancelAndSet(runner: () => void, timeout: number): void {
		this.cancel();
		this._token = setTimeout(() => {
			this._token = -1;
			runner();
		}, timeout);
	}

	setIfNotSet(runner: () => void, timeout: number): void {
		if (this._token !== -1) {
			// timer is already set
			return;
		}
		this._token = setTimeout(() => {
			this._token = -1;
			runner();
		}, timeout);
	}
}

export class IntervalTimer extends Disposable {

	private _token: number;

	constructor() {
		super();
		this._token = -1;
	}

	dispose(): void {
		this.cancel();
		super.dispose();
	}

	cancel(): void {
		if (this._token !== -1) {
			clearInterval(this._token);
			this._token = -1;
		}
	}

	cancelAndSet(runner: () => void, interval: number): void {
		this.cancel();
		this._token = setInterval(() => {
			runner();
		}, interval);
	}
}

export class RunOnceScheduler {

	protected runner: (...args: any[]) => void;

	private timeoutToken: number;
	private timeout: number;
	private timeoutHandler: () => void;

	constructor(runner: (...args: any[]) => void, timeout: number) {
		this.timeoutToken = -1;
		this.runner = runner;
		this.timeout = timeout;
		this.timeoutHandler = this.onTimeout.bind(this);
	}

	/**
	 * Dispose RunOnceScheduler
	 */
	dispose(): void {
		this.cancel();
		this.runner = null;
	}

	/**
	 * Cancel current scheduled runner (if any).
	 */
	cancel(): void {
		if (this.isScheduled()) {
			clearTimeout(this.timeoutToken);
			this.timeoutToken = -1;
		}
	}

	/**
	 * Cancel previous runner (if any) & schedule a new runner.
	 */
	schedule(delay = this.timeout): void {
		this.cancel();
		this.timeoutToken = setTimeout(this.timeoutHandler, delay);
	}

	/**
	 * Returns true if scheduled.
	 */
	isScheduled(): boolean {
		return this.timeoutToken !== -1;
	}

	private onTimeout() {
		this.timeoutToken = -1;
		if (this.runner) {
			this.doRun();
		}
	}

	protected doRun(): void {
		this.runner();
	}
}
