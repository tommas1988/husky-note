/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { createDecorator } from '../../instantiation/common/instantiation';
import { IDisposable } from '../../../base/common/lifecycle';

export const IStatusbarService = createDecorator<IStatusbarService>('statusbarService');

export interface IStatusbarService {

	_serviceBrand: any;

	/**
	 * Prints something to the status bar area with optional auto dispose and delay.
	 */
	setStatusMessage(message: string, autoDisposeAfter?: number, delayBy?: number): IDisposable;
}