/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { EditorSimpleWorkerImpl } from './common/services/editorSimpleWorker';
import { SimpleWorkerServer } from '../base/common/worker/simpleWorker';

let initialized = false;

export function initialize(foreignModule: any) {
	if (initialized) {
		return;
	}
	initialized = true;

	const editorWorker = new EditorSimpleWorkerImpl(foreignModule);
	const simpleWorker = new SimpleWorkerServer((msg) => {
		(<any>self).postMessage(msg);
	}, editorWorker);

	self.onmessage = (e) => {
		simpleWorker.onmessage(e.data);
	};
}

self.onmessage = (e) => {
	// Ignore first message in this case and initialize if not yet initialized
	if (!initialized) {
		initialize(null);
	}
};
