/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { first2 } from '../../../base/common/async';
import { onUnexpectedExternalError } from '../../../base/common/errors';
import { registerDefaultLanguageCommand } from '../../browser/editorExtensions';
import { Position } from '../../common/core/position';
import { ITextModel } from '../../common/model';
import { SignatureHelp, SignatureHelpProviderRegistry } from '../../common/modes';
import { RawContextKey } from '../../../platform/contextkey/common/contextkey';
import { CancellationToken } from '../../../base/common/cancellation';

export const Context = {
	Visible: new RawContextKey<boolean>('parameterHintsVisible', false),
	MultipleSignatures: new RawContextKey<boolean>('parameterHintsMultipleSignatures', false),
};

export function provideSignatureHelp(model: ITextModel, position: Position, token: CancellationToken): Promise<SignatureHelp> {

	const supports = SignatureHelpProviderRegistry.ordered(model);

	return first2(supports.map(support => () => {
		return Promise.resolve(support.provideSignatureHelp(model, position, token)).catch(onUnexpectedExternalError);
	}));
}

registerDefaultLanguageCommand('_executeSignatureHelpProvider', (model, position) => provideSignatureHelp(model, position, CancellationToken.None));
