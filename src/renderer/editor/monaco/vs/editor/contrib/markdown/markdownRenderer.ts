/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { TPromise } from '../../../base/common/winjs.base';
import { IMarkdownString } from '../../../base/common/htmlContent';
import { renderMarkdown, RenderOptions } from '../../../base/browser/htmlContentRenderer';
import { IOpenerService, NullOpenerService } from '../../../platform/opener/common/opener';
import { IModeService } from '../../common/services/modeService';
import URI from '../../../base/common/uri';
import { onUnexpectedError } from '../../../base/common/errors';
import { tokenizeToString } from '../../common/modes/textToHtmlTokenizer';
import { ICodeEditor } from '../../browser/editorBrowser';
import { optional } from '../../../platform/instantiation/common/instantiation';
import { Event, Emitter } from '../../../base/common/event';
import { IDisposable, dispose } from '../../../base/common/lifecycle';

export interface IMarkdownRenderResult extends IDisposable {
	element: HTMLElement;
}

export class MarkdownRenderer {

	private _onDidRenderCodeBlock = new Emitter<void>();
	readonly onDidRenderCodeBlock: Event<void> = this._onDidRenderCodeBlock.event;

	constructor(
		private readonly _editor: ICodeEditor,
		@IModeService private readonly _modeService: IModeService,
		@optional(IOpenerService) private readonly _openerService: IOpenerService = NullOpenerService,
	) {
	}

	private getOptions(disposeables: IDisposable[]): RenderOptions {
		return {
			codeBlockRenderer: (languageAlias, value): TPromise<string> => {
				// In markdown,
				// it is possible that we stumble upon language aliases (e.g.js instead of javascript)
				// it is possible no alias is given in which case we fall back to the current editor lang
				const modeId = languageAlias
					? this._modeService.getModeIdForLanguageName(languageAlias)
					: this._editor.getModel().getLanguageIdentifier().language;

				return this._modeService.getOrCreateMode(modeId).then(_ => {
					return tokenizeToString(value, modeId);
				}).then(code => {
					return `<span style="font-family: ${this._editor.getConfiguration().fontInfo.fontFamily}">${code}</span>`;
				});
			},
			codeBlockRenderCallback: () => this._onDidRenderCodeBlock.fire(),
			actionHandler: {
				callback: (content) => {
					this._openerService.open(URI.parse(content)).then(void 0, onUnexpectedError);
				},
				disposeables
			}
		};
	}

	render(markdown: IMarkdownString): IMarkdownRenderResult {
		let disposeables: IDisposable[] = [];

		let element: HTMLElement;
		if (!markdown) {
			element = document.createElement('span');
		} else {
			element = renderMarkdown(markdown, this.getOptions(disposeables));
		}

		return {
			element,
			dispose: () => dispose(disposeables)
		};
	}
}
