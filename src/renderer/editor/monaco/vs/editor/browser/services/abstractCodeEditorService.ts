/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Event, Emitter } from '../../../base/common/event';
import { IDecorationRenderOptions } from '../../common/editorCommon';
import { IModelDecorationOptions } from '../../common/model';
import { ICodeEditorService } from './codeEditorService';
import { ICodeEditor, IDiffEditor } from '../editorBrowser';
import { IResourceInput } from '../../../platform/editor/common/editor';
import { TPromise } from '../../../base/common/winjs.base';

export abstract class AbstractCodeEditorService implements ICodeEditorService {

	_serviceBrand: any;

	private readonly _onCodeEditorAdd: Emitter<ICodeEditor>;
	private readonly _onCodeEditorRemove: Emitter<ICodeEditor>;
	private _codeEditors: { [editorId: string]: ICodeEditor; };

	private readonly _onDiffEditorAdd: Emitter<IDiffEditor>;
	private readonly _onDiffEditorRemove: Emitter<IDiffEditor>;
	private _diffEditors: { [editorId: string]: IDiffEditor; };

	constructor() {
		this._codeEditors = Object.create(null);
		this._diffEditors = Object.create(null);
		this._onCodeEditorAdd = new Emitter<ICodeEditor>();
		this._onCodeEditorRemove = new Emitter<ICodeEditor>();
		this._onDiffEditorAdd = new Emitter<IDiffEditor>();
		this._onDiffEditorRemove = new Emitter<IDiffEditor>();
	}

	addCodeEditor(editor: ICodeEditor): void {
		this._codeEditors[editor.getId()] = editor;
		this._onCodeEditorAdd.fire(editor);
	}

	get onCodeEditorAdd(): Event<ICodeEditor> {
		return this._onCodeEditorAdd.event;
	}

	removeCodeEditor(editor: ICodeEditor): void {
		if (delete this._codeEditors[editor.getId()]) {
			this._onCodeEditorRemove.fire(editor);
		}
	}

	listCodeEditors(): ICodeEditor[] {
		return Object.keys(this._codeEditors).map(id => this._codeEditors[id]);
	}

	addDiffEditor(editor: IDiffEditor): void {
		this._diffEditors[editor.getId()] = editor;
		this._onDiffEditorAdd.fire(editor);
	}

	removeDiffEditor(editor: IDiffEditor): void {
		if (delete this._diffEditors[editor.getId()]) {
			this._onDiffEditorRemove.fire(editor);
		}
	}

	listDiffEditors(): IDiffEditor[] {
		return Object.keys(this._diffEditors).map(id => this._diffEditors[id]);
	}

	getFocusedCodeEditor(): ICodeEditor {
		let editorWithWidgetFocus: ICodeEditor = null;

		let editors = this.listCodeEditors();
		for (let i = 0; i < editors.length; i++) {
			let editor = editors[i];

			if (editor.hasTextFocus()) {
				// bingo!
				return editor;
			}

			if (editor.hasWidgetFocus()) {
				editorWithWidgetFocus = editor;
			}
		}

		return editorWithWidgetFocus;
	}

	abstract registerDecorationType(key: string, options: IDecorationRenderOptions, parentTypeKey?: string): void;
	abstract removeDecorationType(key: string): void;
	abstract resolveDecorationOptions(decorationTypeKey: string, writable: boolean): IModelDecorationOptions;

	abstract getActiveCodeEditor(): ICodeEditor;
	abstract openCodeEditor(input: IResourceInput, source: ICodeEditor, sideBySide?: boolean): TPromise<ICodeEditor>;
}
