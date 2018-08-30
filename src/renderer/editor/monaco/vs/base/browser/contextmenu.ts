/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { IAction, IActionRunner } from '../common/actions';
import { IActionItem } from './ui/actionbar/actionbar';
import { TPromise } from '../common/winjs.base';
import { ResolvedKeybinding } from '../common/keyCodes';
import { SubmenuAction } from './ui/menu/menu';

export interface IEvent {
}

export class ContextSubMenu extends SubmenuAction {
	constructor(label: string, public entries: (ContextSubMenu | IAction)[]) {
		super(label, entries, 'contextsubmenu');
	}
}

export interface IContextMenuDelegate {
	getAnchor(): HTMLElement | { x: number; y: number; };
	getActions(): TPromise<(IAction | ContextSubMenu)[]>;
	getActionItem?(action: IAction): IActionItem;
	getActionsContext?(event?: IEvent): any;
	getKeyBinding?(action: IAction): ResolvedKeybinding;
	getMenuClassName?(): string;
	onHide?(didCancel: boolean): void;
	actionRunner?: IActionRunner;
	autoSelectFirstItem?: boolean;
}