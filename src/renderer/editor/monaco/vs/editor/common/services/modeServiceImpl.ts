/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { onUnexpectedError } from '../../../base/common/errors';
import { Event, Emitter } from '../../../base/common/event';
import { TPromise } from '../../../base/common/winjs.base';
import { IMode, LanguageId, LanguageIdentifier } from '../modes';
import { FrankensteinMode } from '../modes/abstractMode';
import { LanguagesRegistry } from './languagesRegistry';
import { IModeService } from './modeService';

export class ModeServiceImpl implements IModeService {
	public _serviceBrand: any;

	private readonly _instantiatedModes: { [modeId: string]: IMode; };
	private readonly _registry: LanguagesRegistry;

	private readonly _onDidCreateMode: Emitter<IMode> = new Emitter<IMode>();
	public readonly onDidCreateMode: Event<IMode> = this._onDidCreateMode.event;

	constructor(warnOnOverwrite = false) {
		this._instantiatedModes = {};

		this._registry = new LanguagesRegistry(true, warnOnOverwrite);
	}

	protected _onReady(): TPromise<boolean> {
		return TPromise.as(true);
	}

	public isRegisteredMode(mimetypeOrModeId: string): boolean {
		return this._registry.isRegisteredMode(mimetypeOrModeId);
	}

	public getModeIdForLanguageName(alias: string): string {
		return this._registry.getModeIdForLanguageNameLowercase(alias);
	}

	public getModeIdByFilenameOrFirstLine(filename: string, firstLine?: string): string {
		const modeIds = this._registry.getModeIdsFromFilenameOrFirstLine(filename, firstLine);

		if (modeIds.length > 0) {
			return modeIds[0];
		}

		return null;
	}

	public getModeId(commaSeparatedMimetypesOrCommaSeparatedIds: string): string {
		const modeIds = this._registry.extractModeIds(commaSeparatedMimetypesOrCommaSeparatedIds);

		if (modeIds.length > 0) {
			return modeIds[0];
		}

		return null;
	}

	public getLanguageIdentifier(modeId: string | LanguageId): LanguageIdentifier {
		return this._registry.getLanguageIdentifier(modeId);
	}

	// --- instantiation

	public getMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): IMode {
		const modeIds = this._registry.extractModeIds(commaSeparatedMimetypesOrCommaSeparatedIds);

		let isPlainText = false;
		for (let i = 0; i < modeIds.length; i++) {
			if (this._instantiatedModes.hasOwnProperty(modeIds[i])) {
				return this._instantiatedModes[modeIds[i]];
			}
			isPlainText = isPlainText || (modeIds[i] === 'plaintext');
		}

		if (isPlainText) {
			// Try to do it synchronously
			let r: IMode = null;
			this.getOrCreateMode(commaSeparatedMimetypesOrCommaSeparatedIds).then((mode) => {
				r = mode;
			}).done(null, onUnexpectedError);
			return r;
		}
		return null;
	}

	public getOrCreateMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): TPromise<IMode> {
		return this._onReady().then(() => {
			const modeId = this.getModeId(commaSeparatedMimetypesOrCommaSeparatedIds);
			// Fall back to plain text if no mode was found
			return this._getOrCreateMode(modeId || 'plaintext');
		});
	}

	public getOrCreateModeByFilenameOrFirstLine(filename: string, firstLine?: string): TPromise<IMode> {
		return this._onReady().then(() => {
			const modeId = this.getModeIdByFilenameOrFirstLine(filename, firstLine);
			// Fall back to plain text if no mode was found
			return this._getOrCreateMode(modeId || 'plaintext');
		});
	}

	private _getOrCreateMode(modeId: string): IMode {
		if (!this._instantiatedModes.hasOwnProperty(modeId)) {
			let languageIdentifier = this.getLanguageIdentifier(modeId);
			this._instantiatedModes[modeId] = new FrankensteinMode(languageIdentifier);

			this._onDidCreateMode.fire(this._instantiatedModes[modeId]);
		}
		return this._instantiatedModes[modeId];
	}
}
