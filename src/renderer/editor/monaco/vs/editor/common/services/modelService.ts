/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Event } from '../../../base/common/event';
import URI from '../../../base/common/uri';
import { TPromise } from '../../../base/common/winjs.base';
import { createDecorator } from '../../../platform/instantiation/common/instantiation';
import { ITextModel, ITextBufferFactory } from '../model';
import { IMode } from '../modes';

export const IModelService = createDecorator<IModelService>('modelService');

export interface IModelService {
	_serviceBrand: any;

	createModel(value: string | ITextBufferFactory, modeOrPromise: TPromise<IMode> | IMode, resource: URI, isForSimpleWidget?: boolean): ITextModel;

	setMode(model: ITextModel, modeOrPromise: TPromise<IMode> | IMode): void;

	getModels(): ITextModel[];

	getModel(resource: URI): ITextModel;

	onModelAdded: Event<ITextModel>;

	onModelRemoved: Event<ITextModel>;

	onModelModeChanged: Event<{ model: ITextModel; oldModeId: string; }>;
}

export function shouldSynchronizeModel(model: ITextModel): boolean {
	return (
		!model.isTooLargeForSyncing() && !model.isForSimpleWidget
	);
}
