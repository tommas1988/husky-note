/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { IJSONSchema } from '../../../base/common/jsonSchema';
import * as platform from '../../registry/common/platform';
import { Emitter } from '../../../base/common/event';

export const Extensions = {
	JSONContribution: 'base.contributions.json'
};

export interface IJSONContributionRegistry {

	/**
	 * Register a schema to the registry.
	 */
	registerSchema(uri: string, unresolvedSchemaContent: IJSONSchema): void;
}



function normalizeId(id: string) {
	if (id.length > 0 && id.charAt(id.length - 1) === '#') {
		return id.substring(0, id.length - 1);
	}
	return id;
}



class JSONContributionRegistry implements IJSONContributionRegistry {

	private schemasById: { [id: string]: IJSONSchema };

	private readonly _onDidChangeSchema: Emitter<string> = new Emitter<string>();

	constructor() {
		this.schemasById = {};
	}

	public registerSchema(uri: string, unresolvedSchemaContent: IJSONSchema): void {
		this.schemasById[normalizeId(uri)] = unresolvedSchemaContent;
		this._onDidChangeSchema.fire(uri);
	}

}

const jsonContributionRegistry = new JSONContributionRegistry();
platform.Registry.add(Extensions.JSONContribution, jsonContributionRegistry);