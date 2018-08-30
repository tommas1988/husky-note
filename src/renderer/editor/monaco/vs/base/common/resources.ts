/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as paths from './paths';
import uri from './uri';
import { equalsIgnoreCase } from './strings';

export function basenameOrAuthority(resource: uri): string {
	return paths.basename(resource.path) || resource.authority;
}

export function isEqual(first: uri, second: uri, ignoreCase?: boolean): boolean {
	const identityEquals = (first === second);
	if (identityEquals) {
		return true;
	}

	if (!first || !second) {
		return false;
	}

	if (ignoreCase) {
		return equalsIgnoreCase(first.toString(), second.toString());
	}

	return first.toString() === second.toString();
}

export function dirname(resource: uri): uri {
	const dirname = paths.dirname(resource.path);
	if (resource.authority && dirname && !paths.isAbsolute(dirname)) {
		return null; // If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character
	}

	return resource.with({
		path: dirname
	});
}
