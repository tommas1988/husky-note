/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from '../../../base/common/winjs.base';
import { ITelemetryService, ITelemetryInfo, ITelemetryData } from './telemetry';

export const NullTelemetryService = new class implements ITelemetryService {
	_serviceBrand: undefined;
	publicLog(eventName: string, data?: ITelemetryData) {
		return TPromise.wrap<void>(null);
	}
	isOptedIn: true;
	getTelemetryInfo(): TPromise<ITelemetryInfo> {
		return TPromise.wrap({
			instanceId: 'someValue.instanceId',
			sessionId: 'someValue.sessionId',
			machineId: 'someValue.machineId'
		});
	}
};
