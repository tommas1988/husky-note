/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import URI from '../../../base/common/uri';
import * as paths from '../../../base/common/paths';
import { createDecorator } from '../../instantiation/common/instantiation';
import { TernarySearchTree } from '../../../base/common/map';
import { IStoredWorkspaceFolder } from '../../workspaces/common/workspaces';

export const IWorkspaceContextService = createDecorator<IWorkspaceContextService>('contextService');

export interface IWorkspaceContextService {
	_serviceBrand: any;

	/**
	 * Provides access to the workspace object the platform is running with.
	 */
	getWorkspace(): IWorkspace;

	/**
	 * Returns the folder for the given resource from the workspace.
	 * Can be null if there is no workspace or the resource is not inside the workspace.
	 */
	getWorkspaceFolder(resource: URI): IWorkspaceFolder;
}

export namespace IWorkspace {
	export function isIWorkspace(thing: any): thing is IWorkspace {
		return thing && typeof thing === 'object'
			&& typeof (thing as IWorkspace).id === 'string'
			&& typeof (thing as IWorkspace).name === 'string'
			&& Array.isArray((thing as IWorkspace).folders);
	}
}

export interface IWorkspace {

	/**
	 * the unique identifier of the workspace.
	 */
	readonly id: string;

	/**
	 * the name of the workspace.
	 */
	readonly name: string;

	/**
	 * Folders in the workspace.
	 */
	readonly folders: IWorkspaceFolder[];

	/**
	 * the location of the workspace configuration
	 */
	readonly configuration?: URI;
}

export interface IWorkspaceFolderData {
	/**
	 * The associated URI for this workspace folder.
	 */
	readonly uri: URI;

	/**
	 * The name of this workspace folder. Defaults to
	 * the basename its [uri-path](#Uri.path)
	 */
	readonly name: string;

	/**
	 * The ordinal number of this workspace folder.
	 */
	readonly index: number;
}

export namespace IWorkspaceFolder {
	export function isIWorkspaceFolder(thing: any): thing is IWorkspaceFolder {
		return thing && typeof thing === 'object'
			&& URI.isUri((thing as IWorkspaceFolder).uri)
			&& typeof (thing as IWorkspaceFolder).name === 'string'
			&& typeof (thing as IWorkspaceFolder).toResource === 'function';
	}
}

export interface IWorkspaceFolder extends IWorkspaceFolderData {

	/**
	 * Given workspace folder relative path, returns the resource with the absolute path.
	 */
	toResource: (relativePath: string) => URI;
}

export class Workspace implements IWorkspace {

	private _foldersMap: TernarySearchTree<WorkspaceFolder> = TernarySearchTree.forPaths<WorkspaceFolder>();
	private _folders: WorkspaceFolder[];

	constructor(
		private _id: string,
		private _name: string = '',
		folders: WorkspaceFolder[] = [],
		private _configuration: URI = null,
		private _ctime?: number
	) {
		this.folders = folders;
	}

	get folders(): WorkspaceFolder[] {
		return this._folders;
	}

	set folders(folders: WorkspaceFolder[]) {
		this._folders = folders;
		this.updateFoldersMap();
	}

	get id(): string {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	set name(name: string) {
		this._name = name;
	}

	get configuration(): URI {
		return this._configuration;
	}

	set configuration(configuration: URI) {
		this._configuration = configuration;
	}

	getFolder(resource: URI): IWorkspaceFolder {
		if (!resource) {
			return null;
		}

		return this._foldersMap.findSubstr(resource.toString());
	}

	private updateFoldersMap(): void {
		this._foldersMap = TernarySearchTree.forPaths<WorkspaceFolder>();
		for (const folder of this.folders) {
			this._foldersMap.set(folder.uri.toString(), folder);
		}
	}

	toJSON(): IWorkspace {
		return { id: this.id, folders: this.folders, name: this.name, configuration: this.configuration };
	}
}

export class WorkspaceFolder implements IWorkspaceFolder {

	readonly uri: URI;
	name: string;
	index: number;

	constructor(data: IWorkspaceFolderData,
		readonly raw?: IStoredWorkspaceFolder) {
		this.uri = data.uri;
		this.index = data.index;
		this.name = data.name;
	}

	toResource(relativePath: string): URI {
		return this.uri.with({ path: paths.join(this.uri.path, relativePath) });
	}

	toJSON(): IWorkspaceFolderData {
		return { uri: this.uri, name: this.name, index: this.index };
	}
}
