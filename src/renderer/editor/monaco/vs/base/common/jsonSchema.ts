/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

export interface IJSONSchema {
	type?: string | string[];
	default?: any;
	description?: string;
	properties?: IJSONSchemaMap;
	patternProperties?: IJSONSchemaMap;
	additionalProperties?: boolean | IJSONSchema;
	items?: IJSONSchema | IJSONSchema[];
	minimum?: number;
	$ref?: string;
	anyOf?: IJSONSchema[];
	enum?: any[];
	format?: string; // VSCode extension
	errorMessage?: string; // VSCode extension
	deprecationMessage?: string; // VSCode extension
	enumDescriptions?: string[]; // VSCode extension
}

export interface IJSONSchemaMap {
	[name: string]: IJSONSchema;
}
