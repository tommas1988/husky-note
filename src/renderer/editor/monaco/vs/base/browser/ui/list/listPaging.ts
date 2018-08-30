/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './list.css';
import { IDisposable } from '../../../common/lifecycle';
import { range } from '../../../common/arrays';
import { IVirtualDelegate, IRenderer } from './list';
import { List, IListOptions } from './listWidget';
import { IPagedModel } from '../../../common/paging';
import { Event } from '../../../common/event';

export interface IPagedRenderer<TElement, TTemplateData> extends IRenderer<TElement, TTemplateData> {
	renderPlaceholder(index: number, templateData: TTemplateData): void;
}

export interface ITemplateData<T> {
	data: T;
	disposable: IDisposable;
}

class PagedRenderer<TElement, TTemplateData> implements IRenderer<number, ITemplateData<TTemplateData>> {

	get templateId(): string { return this.renderer.templateId; }

	constructor(
		private renderer: IPagedRenderer<TElement, TTemplateData>,
		private modelProvider: () => IPagedModel<TElement>
	) { }

	renderTemplate(container: HTMLElement): ITemplateData<TTemplateData> {
		const data = this.renderer.renderTemplate(container);
		return { data, disposable: { dispose: () => { } } };
	}

	renderElement(index: number, _: number, data: ITemplateData<TTemplateData>): void {
		data.disposable.dispose();

		const model = this.modelProvider();

		if (model.isResolved(index)) {
			return this.renderer.renderElement(model.get(index), index, data.data);
		}

		const promise = model.resolve(index);
		data.disposable = { dispose: () => promise.cancel() };

		this.renderer.renderPlaceholder(index, data.data);
		promise.done(entry => this.renderer.renderElement(entry, index, data.data));
	}

	disposeElement(): void {
		// noop
	}

	disposeTemplate(data: ITemplateData<TTemplateData>): void {
		data.disposable.dispose();
		data.disposable = null;
		this.renderer.disposeTemplate(data.data);
		data.data = null;
	}
}

export class PagedList<T> implements IDisposable {

	private list: List<number>;
	private _model: IPagedModel<T>;

	constructor(
		container: HTMLElement,
		virtualDelegate: IVirtualDelegate<number>,
		renderers: IPagedRenderer<T, any>[],
		options: IListOptions<any> = {}
	) {
		const pagedRenderers = renderers.map(r => new PagedRenderer<T, ITemplateData<T>>(r, () => this.model));
		this.list = new List(container, virtualDelegate, pagedRenderers, options);
	}

	getHTMLElement(): HTMLElement {
		return this.list.getHTMLElement();
	}

	isDOMFocused(): boolean {
		return this.list.getHTMLElement() === document.activeElement;
	}

	get onDidFocus(): Event<void> {
		return this.list.onDidFocus;
	}

	get onDidDispose(): Event<void> {
		return this.list.onDidDispose;
	}

	get model(): IPagedModel<T> {
		return this._model;
	}

	set model(model: IPagedModel<T>) {
		this._model = model;
		this.list.splice(0, this.list.length, range(model.length));
	}

	getFocus(): number[] {
		return this.list.getFocus();
	}

	dispose(): void {
		this.list.dispose();
	}
}
