/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './selectBox.css';

import { IDisposable, dispose } from './..\..\..\common\lifecycle';
import { Event } from './..\..\..\common\event';
import { Widget } from './..\widget';
import { Color } from './..\..\..\common\color';
import { deepClone, mixin } from './..\..\..\common\objects';
import { IContextViewProvider } from './..\contextview\contextview';
import { IListStyles } from './..\list\listWidget';
import { SelectBoxNative } from './selectBoxNative';
import { SelectBoxList } from './selectBoxCustom';
import { isMacintosh } from './..\..\..\common\platform';

// Public SelectBox interface - Calls routed to appropriate select implementation class

export interface ISelectBoxDelegate {

	// Public SelectBox Interface
	readonly onDidSelect: Event<ISelectData>;
	setOptions(options: string[], selected?: number, disabled?: number): void;
	select(index: number): void;
	focus(): void;
	blur(): void;
	dispose(): void;

	// Delegated Widget interface
	render(container: HTMLElement): void;
	style(styles: ISelectBoxStyles): void;
	applyStyles(): void;
}

export interface ISelectBoxOptions {
	minBottomMargin?: number;
}

export interface ISelectBoxStyles extends IListStyles {
	selectBackground?: Color;
	selectListBackground?: Color;
	selectForeground?: Color;
	selectBorder?: Color;
	focusBorder?: Color;
}

export const defaultStyles = {
	selectBackground: Color.fromHex('#3C3C3C'),
	selectForeground: Color.fromHex('#F0F0F0'),
	selectBorder: Color.fromHex('#3C3C3C')
};

export interface ISelectData {
	selected: string;
	index: number;
}

export class SelectBox extends Widget implements ISelectBoxDelegate {
	private toDispose: IDisposable[];
	private styles: ISelectBoxStyles;
	private selectBoxDelegate: ISelectBoxDelegate;

	constructor(options: string[], selected: number, contextViewProvider: IContextViewProvider, styles: ISelectBoxStyles = deepClone(defaultStyles), selectBoxOptions?: ISelectBoxOptions) {
		super();

		this.toDispose = [];

		mixin(this.styles, defaultStyles, false);

		// Instantiate select implementation based on platform
		if (isMacintosh) {
			this.selectBoxDelegate = new SelectBoxNative(options, selected, styles);
		} else {
			this.selectBoxDelegate = new SelectBoxList(options, selected, contextViewProvider, styles, selectBoxOptions);
		}

		this.toDispose.push(this.selectBoxDelegate);
	}

	// Public SelectBox Methods - routed through delegate interface

	public get onDidSelect(): Event<ISelectData> {
		return this.selectBoxDelegate.onDidSelect;
	}

	public setOptions(options: string[], selected?: number, disabled?: number): void {
		this.selectBoxDelegate.setOptions(options, selected, disabled);
	}

	public select(index: number): void {
		this.selectBoxDelegate.select(index);
	}

	public focus(): void {
		this.selectBoxDelegate.focus();
	}

	public blur(): void {
		this.selectBoxDelegate.blur();
	}

	// Public Widget Methods - routed through delegate interface

	public render(container: HTMLElement): void {
		this.selectBoxDelegate.render(container);
	}

	public style(styles: ISelectBoxStyles): void {
		this.selectBoxDelegate.style(styles);
	}

	public applyStyles(): void {
		this.selectBoxDelegate.applyStyles();
	}

	public dispose(): void {
		this.toDispose = dispose(this.toDispose);
		super.dispose();
	}
}