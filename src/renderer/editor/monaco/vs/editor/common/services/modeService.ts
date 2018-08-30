/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Event } from '../../../base/common/event';
import { TPromise } from '../../../base/common/winjs.base';
import { createDecorator } from '../../../platform/instantiation/common/instantiation';
import { IMode, LanguageId, LanguageIdentifier } from '../modes';
import URI from '../../../base/common/uri';

export const IModeService = createDecorator<IModeService>('modeService');

export interface ILanguageExtensionPoint {
	id: string;
	extensions?: string[];
	filenames?: string[];
	filenamePatterns?: string[];
	firstLine?: string;
	aliases?: string[];
	mimetypes?: string[];
	configuration?: URI;
}

export interface IModeService {
	_serviceBrand: any;

	onDidCreateMode: Event<IMode>;

	// --- reading
	isRegisteredMode(mimetypeOrModeId: string): boolean;
	getModeIdForLanguageName(alias: string): string;
	getModeIdByFilenameOrFirstLine(filename: string, firstLine?: string): string;
	getModeId(commaSeparatedMimetypesOrCommaSeparatedIds: string): string;
	getLanguageIdentifier(modeId: string | LanguageId): LanguageIdentifier;

	// --- instantiation
	getMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): IMode;
	getOrCreateMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): TPromise<IMode>;
	getOrCreateModeByFilenameOrFirstLine(filename: string, firstLine?: string): TPromise<IMode>;
}
