/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { IDisposable } from '../../../base/common/lifecycle';
import { createDecorator } from '../../instantiation/common/instantiation';
import { IContextMenuDelegate } from '../../../base/browser/contextmenu';

export const IContextViewService = createDecorator<IContextViewService>('contextViewService');

export interface IContextViewService {
	_serviceBrand: any;
	showContextView(delegate: IContextViewDelegate): void;
	hideContextView(data?: any): void;
	layout(): void;
}

export interface IContextViewDelegate {
	getAnchor(): HTMLElement | { x: number; y: number; };
	render(container: HTMLElement): IDisposable;
	canRelayout?: boolean;
	onHide?(data?: any): void;
}

export const IContextMenuService = createDecorator<IContextMenuService>('contextMenuService');

export interface IContextMenuService {
	_serviceBrand: any;
	showContextMenu(delegate: IContextMenuDelegate): void;
}