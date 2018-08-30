/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { createDecorator } from '../../../platform/instantiation/common/instantiation';
import { WorkspaceEdit } from '../../common/modes';
import { TPromise } from '../../../base/common/winjs.base';
import { ICodeEditor } from '../editorBrowser';

export const IBulkEditService = createDecorator<IBulkEditService>('IWorkspaceEditService');


export interface IBulkEditOptions {
	editor?: ICodeEditor;
}

export interface IBulkEditResult {
	ariaSummary: string;
}

export interface IBulkEditService {
	_serviceBrand: any;

	apply(edit: WorkspaceEdit, options: IBulkEditOptions): TPromise<IBulkEditResult>;
}

