/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { flatten, coalesce } from '../../../base/common/arrays';
import { asWinJsPromise } from '../../../base/common/async';
import { CancellationToken } from '../../../base/common/cancellation';
import { onUnexpectedExternalError } from '../../../base/common/errors';
import { TPromise } from '../../../base/common/winjs.base';
import { registerDefaultLanguageCommand } from '../../browser/editorExtensions';
import { Position } from '../../common/core/position';
import { ITextModel } from '../../common/model';
import { DefinitionLink, DefinitionProviderRegistry, ImplementationProviderRegistry, TypeDefinitionProviderRegistry } from '../../common/modes';
import LanguageFeatureRegistry from '../../common/modes/languageFeatureRegistry';

function getDefinitions<T>(
	model: ITextModel,
	position: Position,
	registry: LanguageFeatureRegistry<T>,
	provide: (provider: T, model: ITextModel, position: Position, token: CancellationToken) => DefinitionLink | DefinitionLink[] | Thenable<DefinitionLink | DefinitionLink[]>
): TPromise<DefinitionLink[]> {
	const provider = registry.ordered(model);

	// get results
	const promises = provider.map((provider): TPromise<DefinitionLink | DefinitionLink[]> => {
		return asWinJsPromise((token) => {
			return provide(provider, model, position, token);
		}).then(undefined, err => {
			onUnexpectedExternalError(err);
			return null;
		});
	});
	return TPromise.join(promises)
		.then(flatten)
		.then(references => coalesce(references));
}


export function getDefinitionsAtPosition(model: ITextModel, position: Position): TPromise<DefinitionLink[]> {
	return getDefinitions(model, position, DefinitionProviderRegistry, (provider, model, position, token) => {
		return provider.provideDefinition(model, position, token);
	});
}

export function getImplementationsAtPosition(model: ITextModel, position: Position): TPromise<DefinitionLink[]> {
	return getDefinitions(model, position, ImplementationProviderRegistry, (provider, model, position, token) => {
		return provider.provideImplementation(model, position, token);
	});
}

export function getTypeDefinitionsAtPosition(model: ITextModel, position: Position): TPromise<DefinitionLink[]> {
	return getDefinitions(model, position, TypeDefinitionProviderRegistry, (provider, model, position, token) => {
		return provider.provideTypeDefinition(model, position, token);
	});
}

registerDefaultLanguageCommand('_executeDefinitionProvider', getDefinitionsAtPosition);
registerDefaultLanguageCommand('_executeImplementationProvider', getImplementationsAtPosition);
registerDefaultLanguageCommand('_executeTypeDefinitionProvider', getTypeDefinitionsAtPosition);
