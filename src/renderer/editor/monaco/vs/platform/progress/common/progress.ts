/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { createDecorator } from '../../instantiation/common/instantiation';

export const IProgressService = createDecorator<IProgressService>('progressService');

export interface IProgressService {
	_serviceBrand: any;

	/**
	 * Indicate progress for the duration of the provided promise. Progress will stop in
	 * any case of promise completion, error or cancellation.
	 */
	showWhile(promise: Thenable<any>, delay?: number): Thenable<void>;
}
