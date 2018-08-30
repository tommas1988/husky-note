/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { coalesce } from '../../../base/common/arrays';
import { onUnexpectedExternalError } from '../../../base/common/errors';
import { ITextModel } from '../../common/model';
import { registerDefaultLanguageCommand } from '../../browser/editorExtensions';
import { Hover, HoverProviderRegistry } from '../../common/modes';
import { Position } from '../../common/core/position';
import { CancellationToken } from '../../../base/common/cancellation';

export function getHover(model: ITextModel, position: Position, token: CancellationToken): Promise<Hover[]> {

	const supports = HoverProviderRegistry.ordered(model);

	const promises = supports.map(support => {
		return Promise.resolve(support.provideHover(model, position, token)).then(hover => {
			return hover && isValid(hover) ? hover : undefined;
		}, err => {
			onUnexpectedExternalError(err);
			return undefined;
		});
	});

	return Promise.all(promises).then(values => coalesce(values));
}

registerDefaultLanguageCommand('_executeHoverProvider', (model, position) => getHover(model, position, CancellationToken.None));

function isValid(result: Hover) {
	const hasRange = (typeof result.range !== 'undefined');
	const hasHtmlContent = typeof result.contents !== 'undefined' && result.contents && result.contents.length > 0;
	return hasRange && hasHtmlContent;
}
