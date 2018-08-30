/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { ICodeEditorService } from '../../../browser/services/codeEditorService';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration';
import { IStorageService } from '../../../../platform/storage/common/storage';
import { ICodeEditor } from '../../../browser/editorBrowser';
import { registerEditorContribution } from '../../../browser/editorExtensions';
import { INotificationService } from '../../../../platform/notification/common/notification';
import { ReferencesController } from '../../../contrib/referenceSearch/referencesController';

export class StandaloneReferencesController extends ReferencesController {

	public constructor(
		editor: ICodeEditor,
		@IContextKeyService contextKeyService: IContextKeyService,
		@ICodeEditorService editorService: ICodeEditorService,
		@INotificationService notificationService: INotificationService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IStorageService storageService: IStorageService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		super(
			true,
			editor,
			contextKeyService,
			editorService,
			notificationService,
			instantiationService,
			storageService,
			configurationService,
		);
	}
}

registerEditorContribution(StandaloneReferencesController);
