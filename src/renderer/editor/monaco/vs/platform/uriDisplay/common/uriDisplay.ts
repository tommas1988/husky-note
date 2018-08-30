/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import URI from '../../../base/common/uri';
import { createDecorator } from '../../instantiation/common/instantiation';

export interface IUriDisplayService {
	_serviceBrand: any;
	getLabel(resource: URI, relative?: boolean): string;
}

const URI_DISPLAY_SERVICE_ID = 'uriDisplay';

export const IUriDisplayService = createDecorator<IUriDisplayService>(URI_DISPLAY_SERVICE_ID);
