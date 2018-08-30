/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import URI from './uri';
import { normalize, basename as pathsBasename, sep } from './paths';
import { ltrim, startsWithIgnoreCase, rtrim, startsWith } from './strings';
import { Schemas } from './network';
import { isLinux, isWindows } from './platform';
import { isEqual } from './resources';

export interface IWorkspaceFolderProvider {
	getWorkspaceFolder(resource: URI): { uri: URI, name?: string };
	getWorkspace(): {
		folders: { uri: URI, name?: string }[];
	};
}

export interface IUserHomeProvider {
	userHome: string;
}

/**
 * @deprecated use UriLabelService instead
 */
export function getPathLabel(resource: URI | string, userHomeProvider: IUserHomeProvider, rootProvider?: IWorkspaceFolderProvider): string {
	if (!resource) {
		return null;
	}

	if (typeof resource === 'string') {
		resource = URI.file(resource);
	}

	// return early if we can resolve a relative path label from the root
	const baseResource = rootProvider ? rootProvider.getWorkspaceFolder(resource) : null;
	if (baseResource) {
		const hasMultipleRoots = rootProvider.getWorkspace().folders.length > 1;

		let pathLabel: string;
		if (isEqual(baseResource.uri, resource, !isLinux)) {
			pathLabel = ''; // no label if paths are identical
		} else {
			pathLabel = normalize(ltrim(resource.path.substr(baseResource.uri.path.length), sep), true);
		}

		if (hasMultipleRoots) {
			const rootName = (baseResource && baseResource.name) ? baseResource.name : pathsBasename(baseResource.uri.fsPath);
			pathLabel = pathLabel ? (rootName + ' • ' + pathLabel) : rootName; // always show root basename if there are multiple
		}

		return pathLabel;
	}

	// return if the resource is neither file:// nor untitled:// and no baseResource was provided
	if (resource.scheme !== Schemas.file && resource.scheme !== Schemas.untitled) {
		return resource.with({ query: null, fragment: null }).toString(true);
	}

	// convert c:\something => C:\something
	if (hasDriveLetter(resource.fsPath)) {
		return normalize(normalizeDriveLetter(resource.fsPath), true);
	}

	// normalize and tildify (macOS, Linux only)
	let res = normalize(resource.fsPath, true);
	if (!isWindows && userHomeProvider) {
		res = tildify(res, userHomeProvider.userHome);
	}

	return res;
}

export function getBaseLabel(resource: URI | string): string {
	if (!resource) {
		return null;
	}

	if (typeof resource === 'string') {
		resource = URI.file(resource);
	}

	const base = pathsBasename(resource.path) || (resource.scheme === Schemas.file ? resource.fsPath : resource.path) /* can be empty string if '/' is passed in */;

	// convert c: => C:
	if (hasDriveLetter(base)) {
		return normalizeDriveLetter(base);
	}

	return base;
}

function hasDriveLetter(path: string): boolean {
	return isWindows && path && path[1] === ':';
}

export function normalizeDriveLetter(path: string): string {
	if (hasDriveLetter(path)) {
		return path.charAt(0).toUpperCase() + path.slice(1);
	}

	return path;
}

let normalizedUserHomeCached: { original: string; normalized: string } = Object.create(null);
export function tildify(path: string, userHome: string): string {
	if (isWindows || !path || !userHome) {
		return path; // unsupported
	}

	// Keep a normalized user home path as cache to prevent accumulated string creation
	let normalizedUserHome = normalizedUserHomeCached.original === userHome ? normalizedUserHomeCached.normalized : void 0;
	if (!normalizedUserHome) {
		normalizedUserHome = `${rtrim(userHome, sep)}${sep}`;
		normalizedUserHomeCached = { original: userHome, normalized: normalizedUserHome };
	}

	// Linux: case sensitive, macOS: case insensitive
	if (isLinux ? startsWith(path, normalizedUserHome) : startsWithIgnoreCase(path, normalizedUserHome)) {
		path = `~/${path.substr(normalizedUserHome.length)}`;
	}

	return path;
}
