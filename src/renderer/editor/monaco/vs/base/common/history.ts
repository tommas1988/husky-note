/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { INavigator, ArrayNavigator } from './iterator';

export class HistoryNavigator<T> implements INavigator<T> {

	private _history: Set<T>;
	private _limit: number;
	private _navigator: ArrayNavigator<T>;

	constructor(history: T[] = [], limit: number = 10) {
		this._initialize(history);
		this._limit = limit;
		this._onChange();
	}

	public add(t: T) {
		this._history.delete(t);
		this._history.add(t);
		this._onChange();
	}

	public next(): T {
		return this._navigator.next();
	}

	public previous(): T {
		return this._navigator.previous();
	}

	public current(): T {
		return this._navigator.current();
	}

	public parent(): T {
		return null;
	}

	public first(): T {
		return this._navigator.first();
	}

	public last(): T {
		return this._navigator.last();
	}

	public has(t: T): boolean {
		return this._history.has(t);
	}

	private _onChange() {
		this._reduceToLimit();
		this._navigator = new ArrayNavigator(this._elements, 0, this._elements.length, this._elements.length);
	}

	private _reduceToLimit() {
		let data = this._elements;
		if (data.length > this._limit) {
			this._initialize(data.slice(data.length - this._limit));
		}
	}

	private _initialize(history: T[]): void {
		this._history = new Set();
		for (const entry of history) {
			this._history.add(entry);
		}
	}

	private get _elements(): T[] {
		const elements: T[] = [];
		this._history.forEach(e => elements.push(e));
		return elements;
	}
}