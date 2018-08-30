/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { createDecorator as createServiceDecorator } from '../../instantiation/common/instantiation';
import { IDisposable } from '../../../base/common/lifecycle';

export const ILogService = createServiceDecorator<ILogService>('logService');

export interface ILogService extends IDisposable {
	_serviceBrand: any;
	trace(message: string, ...args: any[]): void;
	error(message: string | Error, ...args: any[]): void;
}

export class NullLogService implements ILogService {
	_serviceBrand: any;
	trace(message: string, ...args: any[]): void { }
	error(message: string | Error, ...args: any[]): void { }
	dispose(): void { }
}