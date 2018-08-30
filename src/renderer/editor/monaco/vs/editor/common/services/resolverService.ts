/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from '../../../base/common/winjs.base';
import URI from '../../../base/common/uri';
import { createDecorator } from '../../../platform/instantiation/common/instantiation';
import { ITextModel } from '../model';
import { IEditorModel } from '../../../platform/editor/common/editor';
import { IReference } from '../../../base/common/lifecycle';

export const ITextModelService = createDecorator<ITextModelService>('textModelService');

export interface ITextModelService {
	_serviceBrand: any;

	/**
	 * Provided a resource URI, it will return a model reference
	 * which should be disposed once not needed anymore.
	 */
	createModelReference(resource: URI): TPromise<IReference<ITextEditorModel>>;
}

export interface ITextEditorModel extends IEditorModel {

	/**
	 * Provides access to the underlying `ITextModel`.
	 */
	textEditorModel: ITextModel;
}
