/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Action } from '../../../base/common/actions';
import { TPromise } from '../../../base/common/winjs.base';
import { createDecorator } from '../../instantiation/common/instantiation';
import { ContextKeyExpr, IContextKeyService } from '../../contextkey/common/contextkey';
import { ICommandService } from '../../commands/common/commands';
import { IDisposable } from '../../../base/common/lifecycle';

export interface ILocalizedString {
	value: string;
}

export interface IBaseCommandAction {
	id: string;
	title: string | ILocalizedString;
}

export interface ICommandAction extends IBaseCommandAction {
	precondition?: ContextKeyExpr;
}

export interface IMenuItem {
	command: ICommandAction;
	alt?: ICommandAction;
	when?: ContextKeyExpr;
	group?: 'navigation' | string;
	order?: number;
}

export interface ISubmenuItem {
	title: string | ILocalizedString;
	when?: ContextKeyExpr;
	group?: 'navigation' | string;
	order?: number;
}

export function isIMenuItem(item: IMenuItem | ISubmenuItem): item is IMenuItem {
	return (item as IMenuItem).command !== undefined;
}

export class MenuId {

	private static ID = 1;
	static readonly EditorContext = new MenuId();
	static readonly CommandPalette = new MenuId();
	static readonly MenubarEditMenu = new MenuId();
	static readonly MenubarSelectionMenu = new MenuId();

	readonly id: string = String(MenuId.ID++);
}

export interface IMenuActionOptions {
	arg?: any;
	shouldForwardArgs?: boolean;
}

export interface IMenu extends IDisposable {
	getActions(options?: IMenuActionOptions): [string, (MenuItemAction | SubmenuItemAction)[]][];
}

export const IMenuService = createDecorator<IMenuService>('menuService');

export interface IMenuService {

	_serviceBrand: any;

	createMenu(id: MenuId, scopedKeybindingService: IContextKeyService): IMenu;
}

export interface IMenuRegistry {
	appendMenuItem(menu: MenuId, item: IMenuItem | ISubmenuItem): IDisposable;
	getMenuItems(loc: MenuId): (IMenuItem | ISubmenuItem)[];
}

export const MenuRegistry: IMenuRegistry = new class implements IMenuRegistry {

	private _commands: { [id: string]: ICommandAction } = Object.create(null);

	private _menuItems: { [loc: string]: (IMenuItem | ISubmenuItem)[] } = Object.create(null);

	addCommand(command: ICommandAction): boolean {
		const old = this._commands[command.id];
		this._commands[command.id] = command;
		return old !== void 0;
	}

	getCommand(id: string): ICommandAction {
		return this._commands[id];
	}

	appendMenuItem({ id }: MenuId, item: IMenuItem | ISubmenuItem): IDisposable {
		let array = this._menuItems[id];
		if (!array) {
			this._menuItems[id] = array = [item];
		} else {
			array.push(item);
		}
		return {
			dispose() {
				const idx = array.indexOf(item);
				if (idx >= 0) {
					array.splice(idx, 1);
				}
			}
		};
	}

	getMenuItems({ id }: MenuId): (IMenuItem | ISubmenuItem)[] {
		const result = this._menuItems[id] || [];

		if (id === MenuId.CommandPalette.id) {
			// CommandPalette is special because it shows
			// all commands by default
			this._appendImplicitItems(result);
		}
		return result;
	}

	private _appendImplicitItems(result: (IMenuItem | ISubmenuItem)[]) {
		const set = new Set<string>();

		const temp = result.filter(item => { return isIMenuItem(item); }) as IMenuItem[];

		for (const { command, alt } of temp) {
			set.add(command.id);
			if (alt) {
				set.add(alt.id);
			}
		}
		for (let id in this._commands) {
			if (!set.has(id)) {
				result.push({ command: this._commands[id] });
			}
		}
	}
};

export class ExecuteCommandAction extends Action {

	constructor(
		id: string,
		label: string,
		@ICommandService private readonly _commandService: ICommandService) {

		super(id, label);
	}

	run(...args: any[]): TPromise<any> {
		return this._commandService.executeCommand(this.id, ...args);
	}
}

export class SubmenuItemAction extends Action {
	// private _options: IMenuActionOptions;

	readonly item: ISubmenuItem;
	constructor(item: ISubmenuItem) {
		typeof item.title === 'string' ? super('', item.title, 'submenu') : super('', item.title.value, 'submenu');
		this.item = item;
	}
}

export class MenuItemAction extends ExecuteCommandAction {

	private _options: IMenuActionOptions;

	readonly item: ICommandAction;
	readonly alt: MenuItemAction;

	constructor(
		item: ICommandAction,
		alt: ICommandAction,
		options: IMenuActionOptions,
		@IContextKeyService contextKeyService: IContextKeyService,
		@ICommandService commandService: ICommandService
	) {
		typeof item.title === 'string' ? super(item.id, item.title, commandService) : super(item.id, item.title.value, commandService);
		this._cssClass = undefined;
		this._enabled = !item.precondition || contextKeyService.contextMatchesRules(item.precondition);
		this._options = options || {};

		this.item = item;
		this.alt = alt ? new MenuItemAction(alt, undefined, this._options, contextKeyService, commandService) : undefined;
	}

	run(...args: any[]): TPromise<any> {
		let runArgs: any[] = [];

		if (this._options.arg) {
			runArgs = [...runArgs, this._options.arg];
		}

		if (this._options.shouldForwardArgs) {
			runArgs = [...runArgs, ...args];
		}

		return super.run(...runArgs);
	}
}
