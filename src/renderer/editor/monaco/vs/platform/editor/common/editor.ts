/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import URI from '../../../base/common/uri';

export interface IEditorModel {

	/**
	 * Dispose associated resources
	 */
	dispose(): void;
}

export interface IBaseResourceInput {

	/**
	 * Optional options to use when opening the text input.
	 */
	options?: ITextEditorOptions;
}

export interface IResourceInput extends IBaseResourceInput {

	/**
	 * The resource URL of the resource to open.
	 */
	resource: URI;
}

export interface IEditorOptions {

	/**
	 * Will reveal the editor if it is already opened (even when not visible) in any of the opened editor groups. Note
	 * that this option is just a hint that might be ignored if the user wants to open an editor explicitly
	 * to the side of another one or into a specific editor group.
	 */
	readonly revealIfOpened?: boolean;

	/**
	 * An editor that is pinned remains in the editor stack even when another editor is being opened.
	 * An editor that is not pinned will always get replaced by another editor that is not pinned.
	 */
	readonly pinned?: boolean;
}

export interface ITextEditorSelection {
}

export interface ITextEditorOptions extends IEditorOptions {

	/**
	 * Text editor selection.
	 */
	selection?: ITextEditorSelection;

	/**
	 * Option to scroll vertically or horizontally as necessary and reveal a range centered vertically only if it lies outside the viewport.
	 */
	revealInCenterIfOutsideViewport?: boolean;
}
