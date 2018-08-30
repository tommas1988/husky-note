/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as objects from '../../../base/common/objects';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation';
import { ICommandService } from '../../../platform/commands/common/commands';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey';
import { ICodeEditorService } from '../services/codeEditorService';
import { ICodeEditor } from '../editorBrowser';
import { CodeEditorWidget } from './codeEditorWidget';
import { IConfigurationChangedEvent, IEditorOptions } from '../../common/config/editorOptions';
import { IThemeService } from '../../../platform/theme/common/themeService';
import { INotificationService } from '../../../platform/notification/common/notification';

export class EmbeddedCodeEditorWidget extends CodeEditorWidget {

	private _parentEditor: ICodeEditor;
	private _overwriteOptions: IEditorOptions;

	constructor(
		domElement: HTMLElement,
		options: IEditorOptions,
		parentEditor: ICodeEditor,
		@IInstantiationService instantiationService: IInstantiationService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@ICommandService commandService: ICommandService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IThemeService themeService: IThemeService,
		@INotificationService notificationService: INotificationService
	) {
		super(domElement, parentEditor.getRawConfiguration(), {}, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService);

		this._parentEditor = parentEditor;
		this._overwriteOptions = options;

		// Overwrite parent's options
		super.updateOptions(this._overwriteOptions);

		this._register(parentEditor.onDidChangeConfiguration((e: IConfigurationChangedEvent) => this._onParentConfigurationChanged(e)));
	}

	getParentEditor(): ICodeEditor {
		return this._parentEditor;
	}

	private _onParentConfigurationChanged(e: IConfigurationChangedEvent): void {
		super.updateOptions(this._parentEditor.getRawConfiguration());
		super.updateOptions(this._overwriteOptions);
	}

	updateOptions(newOptions: IEditorOptions): void {
		objects.mixin(this._overwriteOptions, newOptions, true);
		super.updateOptions(this._overwriteOptions);
	}
}
