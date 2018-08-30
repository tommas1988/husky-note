/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { onUnexpectedExternalError } from './..\..\..\base\common\errors';
import { TPromise } from './..\..\..\base\common\winjs.base';
import { ITextModel } from './..\..\common\model';
import { registerDefaultLanguageCommand } from './..\..\browser\editorExtensions';
import LanguageFeatureRegistry from './..\..\common\modes\languageFeatureRegistry';
import { DefinitionProviderRegistry, ImplementationProviderRegistry, TypeDefinitionProviderRegistry, Location } from './..\..\common\modes';
import { CancellationToken } from './..\..\..\base\common\cancellation';
import { asWinJsPromise } from './..\..\..\base\common\async';
import { Position } from './..\..\common\core\position';
import { flatten } from './..\..\..\base\common\arrays';

function getDefinitions<T>(
	model: ITextModel,
	position: Position,
	registry: LanguageFeatureRegistry<T>,
	provide: (provider: T, model: ITextModel, position: Position, token: CancellationToken) => Location | Location[] | PromiseLike<Location | Location[]>
): TPromise<Location[]> {
	const provider = registry.ordered(model);

	// get results
	const promises = provider.map((provider, idx): TPromise<Location | Location[]> => {
		return asWinJsPromise((token) => {
			return provide(provider, model, position, token);
		}).then(undefined, err => {
			onUnexpectedExternalError(err);
			return null;
		});
	});
	return TPromise.join(promises)
		.then(flatten)
		.then(references => references.filter(x => !!x));
}


export function getDefinitionsAtPosition(model: ITextModel, position: Position): TPromise<Location[]> {
	return getDefinitions(model, position, DefinitionProviderRegistry, (provider, model, position, token) => {
		return provider.provideDefinition(model, position, token);
	});
}

export function getImplementationsAtPosition(model: ITextModel, position: Position): TPromise<Location[]> {
	return getDefinitions(model, position, ImplementationProviderRegistry, (provider, model, position, token) => {
		return provider.provideImplementation(model, position, token);
	});
}

export function getTypeDefinitionsAtPosition(model: ITextModel, position: Position): TPromise<Location[]> {
	return getDefinitions(model, position, TypeDefinitionProviderRegistry, (provider, model, position, token) => {
		return provider.provideTypeDefinition(model, position, token);
	});
}

registerDefaultLanguageCommand('_executeDefinitionProvider', getDefinitionsAtPosition);
registerDefaultLanguageCommand('_executeImplementationProvider', getImplementationsAtPosition);
registerDefaultLanguageCommand('_executeTypeDefinitionProvider', getTypeDefinitionsAtPosition);
