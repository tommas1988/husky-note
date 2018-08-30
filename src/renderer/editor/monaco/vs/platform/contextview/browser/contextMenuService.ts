/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { ContextMenuHandler } from './contextMenuHandler';
import { IContextViewService, IContextMenuService } from './contextView';
import { ITelemetryService } from '../../telemetry/common/telemetry';
import { Emitter } from '../../../base/common/event';
import { INotificationService } from '../../notification/common/notification';
import { IContextMenuDelegate } from '../../../base/browser/contextmenu';


export class ContextMenuService implements IContextMenuService {
	public _serviceBrand: any;

	private contextMenuHandler: ContextMenuHandler;
	private _onDidContextMenu = new Emitter<void>();

	constructor(container: HTMLElement, telemetryService: ITelemetryService, notificationService: INotificationService, contextViewService: IContextViewService) {
		this.contextMenuHandler = new ContextMenuHandler(container, contextViewService, telemetryService, notificationService);
	}

	public dispose(): void {
		this.contextMenuHandler.dispose();
	}

	// ContextMenu

	public showContextMenu(delegate: IContextMenuDelegate): void {
		this.contextMenuHandler.showContextMenu(delegate);
		this._onDidContextMenu.fire();
	}
}
