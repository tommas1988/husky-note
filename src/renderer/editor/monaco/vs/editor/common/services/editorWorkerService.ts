/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import URI from '../../../base/common/uri';
import { TPromise } from '../../../base/common/winjs.base';
import { createDecorator } from '../../../platform/instantiation/common/instantiation';
import { ILineChange } from '../editorCommon';
import { IInplaceReplaceSupportResult, TextEdit } from '../modes';
import { IRange } from '../core/range';

export const ID_EDITOR_WORKER_SERVICE = 'editorWorkerService';
export const IEditorWorkerService = createDecorator<IEditorWorkerService>(ID_EDITOR_WORKER_SERVICE);

export interface IEditorWorkerService {
	_serviceBrand: any;

	canComputeDiff(original: URI, modified: URI): boolean;
	computeDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): TPromise<ILineChange[]>;

	computeMoreMinimalEdits(resource: URI, edits: TextEdit[]): TPromise<TextEdit[]>;

	canNavigateValueSet(resource: URI): boolean;
	navigateValueSet(resource: URI, range: IRange, up: boolean): TPromise<IInplaceReplaceSupportResult>;
}
