/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Event } from '../../../base/common/event';
import { createDecorator } from '../../../platform/instantiation/common/instantiation';
import { IDecorationRenderOptions } from '../../common/editorCommon';
import { IModelDecorationOptions } from '../../common/model';
import { ICodeEditor, IDiffEditor } from '../editorBrowser';
import { IResourceInput } from '../../../platform/editor/common/editor';
import { TPromise } from '../../../base/common/winjs.base';

export const ICodeEditorService = createDecorator<ICodeEditorService>('codeEditorService');

export interface ICodeEditorService {
	_serviceBrand: any;

	onCodeEditorAdd: Event<ICodeEditor>;

	addCodeEditor(editor: ICodeEditor): void;
	removeCodeEditor(editor: ICodeEditor): void;

	addDiffEditor(editor: IDiffEditor): void;
	removeDiffEditor(editor: IDiffEditor): void;
	listDiffEditors(): IDiffEditor[];

	/**
	 * Returns the current focused code editor (if the focus is in the editor or in an editor widget) or null.
	 */
	getFocusedCodeEditor(): ICodeEditor;

	registerDecorationType(key: string, options: IDecorationRenderOptions, parentTypeKey?: string): void;
	removeDecorationType(key: string): void;
	resolveDecorationOptions(typeKey: string, writable: boolean): IModelDecorationOptions;

	getActiveCodeEditor(): ICodeEditor;
	openCodeEditor(input: IResourceInput, source: ICodeEditor, sideBySide?: boolean): TPromise<ICodeEditor>;
}
